
"use client";

import React, { useState, useEffect } from "react";
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
import { doubleConfirmationWithLLM } from "@/ai/flows/double-confirmation-with-llm";
import type { Memory, Recipient } from "@/lib/types";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DoubleConfirmationDialogProps {
  memory: Memory;
  recipient: Recipient;
  disabled?: boolean;
}

export function DoubleConfirmationDialog({
  memory,
  recipient,
  disabled = false,
}: DoubleConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isCancelled = false;

    const fetchConfirmation = async () => {
      if (isOpen && !confirmationMessage && !isLoading && recipient) {
        setIsLoading(true);
        try {
          const result = await doubleConfirmationWithLLM({
            recipientName: recipient.name,
            memoryTitle: memory.title,
            memoryType: memory.type,
            deliveryDate: "após inatividade da conta",
          });
          if (!isCancelled) {
            setConfirmationMessage(result.confirmationMessage);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error("Erro ao buscar confirmação:", error);
            setConfirmationMessage(
              "Por favor, revise os detalhes para agendar a entrega desta memória."
            );
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      }
    };

    if (recipient) {
      fetchConfirmation();
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, confirmationMessage, isLoading, memory, recipient]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmationMessage("");
      setIsLoading(false);
      setIsSending(false);
    }
  };

  const handleConfirm = async () => {
    setIsSending(true);
    
    // Simulate scheduling
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Memória Agendada!",
      description: `"${memory.title}" foi agendada para entrega a ${recipient.name} após o período de inatividade.`,
    });
    
    setIsSending(false);
    setIsOpen(false);
  };

  const dialogDescription = "Esta ação agendará a entrega da memória para ocorrer após o período de inatividade configurado.";


  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild disabled={disabled}>
        <div onClick={(e) => { e.preventDefault()}} className="w-full">
            <span className={cn("relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", disabled && "text-muted-foreground cursor-not-allowed")}>
                <Send className="mr-2 h-4 w-4" />
                Agendar
            </span>
        </div>
      </AlertDialogTrigger>
      {recipient && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Agendamento de Memória</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="font-medium">Detalhes da Memória:</div>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Título:</span> {memory.title}
              </li>
              <li>
                <span className="font-semibold text-foreground">Tipo:</span> {memory.type}
              </li>
              <li>
                <span className="font-semibold text-foreground">Destinatário:</span> {recipient.name}
              </li>
            </ul>
            <div className="mt-4 rounded-md border bg-accent/50 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Gerando confirmação...</span>
                </div>
              ) : (
                <p className="text-accent-foreground">{confirmationMessage}</p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading || isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSending ? "Agendando..." : "Confirmar e Agendar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
