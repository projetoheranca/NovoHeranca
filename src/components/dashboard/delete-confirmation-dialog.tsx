
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface DeleteConfirmationDialogProps {
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType: string;
  children?: React.ReactNode; // Tornando 'children' opcional
  triggerComponent?: React.ReactNode; // Novo para um gatilho customizado
  title?: string;
  description?: string;
  confirmActionText?: string;
}

export function DeleteConfirmationDialog({
  onConfirm,
  itemName,
  itemType,
  children,
  triggerComponent,
  title = "Você tem certeza?",
  description, // Descrição padrão será gerada se não for fornecida
  confirmActionText = "Sim, excluir",
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      // O toast é movido para a função que chama o onConfirm para maior controle
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Erro ao executar ação`,
        description:
          error instanceof Error
            ? error.message
            : `Não foi possível completar a ação para "${itemName}".`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultDescription = `Esta ação não pode ser desfeita. Isso irá processar permanentemente o(a) ${itemType} "${itemName}".`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {triggerComponent || children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Processando..." : confirmActionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
