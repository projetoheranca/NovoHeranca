
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "@/context/session-provider";
import { useDatabase, useObjectValue, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MemoryForm, memoryFormSchema } from "@/components/dashboard/memory-form";
import type { Memory } from "@/lib/types";
import { updateMemory } from "@/lib/actions";
import { Loader2 } from "lucide-react";

type MemoryFormValues = z.infer<typeof memoryFormSchema>;

export default function EditMemoryPage() {
  const router = useRouter();
  const params = useParams();
  const memoryId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { session } = useSession();
  const database = useDatabase();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);

  const memoryQueryRef = useMemoFirebase(() => {
    if (!session?.uid || !database || !memoryId) return null;
    return ref(database, `users/${session.uid}/memories/${memoryId}`);
  }, [session, database, memoryId]);

  const { data: memory, isLoading: isLoadingMemory } = useObjectValue<Omit<Memory, 'id'>>(memoryQueryRef);

  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "texto", // Default type
      content: "",
      file: null,
      recipients: [],
    },
  });

  useEffect(() => {
    if (memory) {
      form.reset({
        title: memory.title,
        description: memory.description || "",
        type: memory.type,
        content: memory.content || "",
        recipients: memory.recipients || [],
      });
    }
  }, [memory, form]);

  const handleSubmit = async (values: MemoryFormValues) => {
    if (!session?.uid || !memoryId) return;

    setIsSaving(true);
    
    // NOTE: This flow does not handle file changes. It only updates metadata.
    // A full implementation would require checking if a new file is present,
    // deleting the old one from storage, uploading the new one, and then updating
    // the fileUrl and fileSize in the database.

    try {
      const result = await updateMemory({
        userId: session.uid,
        memoryId: memoryId,
        title: values.title,
        description: values.description || "",
        recipients: values.recipients || [],
      });

      if (!result?.success) {
        throw new Error(result?.message || "Falha ao atualizar no servidor.");
      }

      toast({
        title: "Memória atualizada!",
        description: `A memória "${values.title}" foi atualizada.`,
      });
      router.push("/dashboard/memories");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha ao atualizar", description: error.message });
      console.error("Falha ao atualizar memória:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingMemory) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Editar Memória</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Editar Memória</CardTitle>
            <CardDescription>
              Atualize os detalhes da sua memória digital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memory && memoryId ? (
              <MemoryForm
                form={form}
                onSubmit={handleSubmit}
                isSaving={isSaving}
                initialData={{ ...memory, id: memoryId }}
              />
            ) : (
               <div className="flex items-center justify-center p-8">
                <p>Memória não encontrada ou ID inválido.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
  );
}
