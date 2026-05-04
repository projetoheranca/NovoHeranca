
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipientForm } from "@/components/dashboard/recipient-form";
import { useDatabase, useObjectValue, useMemoFirebase } from "@/firebase";
import { ref, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import type { Recipient } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useSession } from "@/context/session-provider";

export default function EditRecipientPage() {
  const router = useRouter();
  const params = useParams();
  const recipientId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { session } = useSession();
  const database = useDatabase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const recipientRef = useMemoFirebase(() => {
    if (!session?.uid || !database || !recipientId) return null;
    return ref(database, `users/${session.uid}/recipients/${recipientId}`);
  }, [session, database, recipientId]);

  const { data: recipient, isLoading } = useObjectValue<Recipient>(recipientRef);

  const handleSubmit = async (data: any) => {
    if (!recipientRef) return;

    setIsSaving(true);
    try {
      await update(recipientRef, data);
      toast({
        title: "Destinatário atualizado!",
        description: `Os dados de ${data.name} foram atualizados.`,
      });
      router.push("/dashboard/recipients");
    } catch (error) {
      console.error("Erro ao atualizar destinatário:", error);
      toast({
        variant: "destructive",
        title: "Falha ao atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!recipient) {
     return (
      <main className="flex flex-1 items-center justify-center">
        <p>Destinatário não encontrado.</p>
      </main>
    );
  }
  
  const recipientWithId = { ...recipient, id: recipientId };


  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Editar Herdeiro Digital</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Editar Destinatário</CardTitle>
            <CardDescription>
              Atualize os dados do herdeiro da sua herança digital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipientForm
              initialData={recipientWithId}
              onSubmit={handleSubmit}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      </main>
  );
}
