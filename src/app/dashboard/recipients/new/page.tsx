
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipientForm } from "@/components/dashboard/recipient-form";
import { useSession } from "@/context/session-provider";
import { useDatabase } from "@/firebase";
import { ref, push, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

export default function NewRecipientPage() {
  const router = useRouter();
  const { session } = useSession();
  const database = useDatabase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!session?.uid || !database) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar um destinatário.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const recipientsListRef = ref(database, `users/${session.uid}/recipients`);
      const newRecipientRef = push(recipientsListRef);
      
      await set(newRecipientRef, data);

      toast({
        title: "Destinatário adicionado!",
        description: `${data.name} foi adicionado(a) à sua lista.`,
      });
      router.push("/dashboard/recipients");
    } catch (error) {
      console.error("Erro ao adicionar destinatário:", error);
      toast({
        variant: "destructive",
        title: "Falha ao adicionar",
        description: "Não foi possível adicionar o destinatário. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Novo Herdeiro Digital</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Destinatário</CardTitle>
            <CardDescription>
              Preencha os dados da pessoa que receberá suas memórias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipientForm onSubmit={handleSubmit} isSaving={isSaving} />
          </CardContent>
        </Card>
      </main>
  );
}
