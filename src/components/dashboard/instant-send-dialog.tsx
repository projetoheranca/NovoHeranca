"use client";

import React, { useState } from "react";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deliverMemoryNow } from "@/lib/calendar-actions";
import type { Memory, Recipient } from "@/lib/types";
import { Loader2, Send, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/session-provider";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

type SendStatus = "pending" | "sending" | "sent" | "failed";

interface RecipientStatus extends Recipient {
  status: SendStatus;
  errorMessage?: string;
}

interface InstantSendDialogProps {
  memory: Memory;
  recipients: Recipient[];
  disabled?: boolean;
}

export function InstantSendDialog({
  memory,
  recipients,
  disabled = false,
}: InstantSendDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [recipientStatuses, setRecipientStatuses] = useState<RecipientStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const { session } = useSession();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (isSending) return;
    setIsOpen(open);
    if (open) {
      setRecipientStatuses(
        recipients.map(r => ({ ...r, status: "pending" }))
      );
    } else {
      setIsSending(false);
      setIsFinished(false);
      setRecipientStatuses([]);
      setProgress(0);
    }
  };
  
  const handleConfirm = async () => {
    if (!session?.uid) {
      toast({ variant: "destructive", title: "Erro de autenticação" });
      return;
    }

    setIsSending(true);
    setIsFinished(false);
    setProgress(0);

    let finalErrorCount = 0;
    const updatedStatuses = [...recipientStatuses];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      updatedStatuses[i] = { ...updatedStatuses[i], status: 'sending' };
      setRecipientStatuses([...updatedStatuses]);

      try {
        const result = await deliverMemoryNow({
          userId: session.uid,
          memoryId: memory.id,
          recipientId: recipient.id,
        });

        if (result.success) {
          updatedStatuses[i] = { ...updatedStatuses[i], status: 'sent' };
        } else {
          finalErrorCount++;
          updatedStatuses[i] = { ...updatedStatuses[i], status: 'failed', errorMessage: result.message };
        }
      } catch (error: any) {
        finalErrorCount++;
        updatedStatuses[i] = { ...updatedStatuses[i], status: 'failed', errorMessage: error.message };
      }
      
      setRecipientStatuses([...updatedStatuses]);

      const currentProgress = Math.round(((i + 1) / recipients.length) * 100);
      setProgress(currentProgress);
    }
    
    setIsSending(false);
    setIsFinished(true);

    if (finalErrorCount > 0) {
        toast({
            variant: "destructive",
            title: "Alguns envios falharam",
            description: `Houve falha no envio para ${finalErrorCount} destinatário(s). Verifique os detalhes no modal.`,
            duration: 9000,
        });
    } else {
        toast({
            title: "Memória Enviada!",
            description: `"${memory.title}" foi enviada com sucesso.`,
        });
    }
  };

  const recipientNames = recipients.map(r => r.name).join(', ');

  const StatusIcon = ({ status }: { status: SendStatus }) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Send className="h-4 w-4 text-muted-foreground/50" />; // Pending
    }
  };


  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild disabled={disabled}>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            if(!disabled) setIsOpen(true);
          }}
          className={cn(disabled && "text-muted-foreground cursor-not-allowed")}
          disabled={disabled}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar Agora
        </DropdownMenuItem>
      </AlertDialogTrigger>
      {recipients.length > 0 && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isFinished ? "Resultado do Envio" : isSending ? "Enviando Memória..." : "Enviar Memória Imediatamente?"}
            </AlertDialogTitle>
            {!isSending && !isFinished && (
              <AlertDialogDescription>
                Esta ação enviará a memória{" "}
                <strong className="text-foreground">"{memory.title}"</strong> para{" "}
                <strong className="text-foreground">{recipientNames}</strong>{" "}
                imediatamente. Isso não pode ser desfeito.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {isSending && (
            <div className="space-y-2 my-4">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">{progress}% concluído</p>
            </div>
          )}

          {(isSending || isFinished) ? (
            <div className="my-4 max-h-60 overflow-y-auto pr-4">
              <ul className="space-y-3">
                {recipientStatuses.map(rs => (
                  <li key={rs.id} className="flex items-start justify-between gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{rs.name}</span>
                      <span className="text-xs text-muted-foreground">{rs.email}</span>
                      {rs.status === 'failed' && rs.errorMessage && (
                        <p className="text-xs text-destructive mt-1">{rs.errorMessage}</p>
                      )}
                    </div>
                    <StatusIcon status={rs.status} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
             <div className="space-y-2 text-sm py-4">
                <p>A memória <strong className="text-foreground">{memory.title}</strong> será enviada individualmente para:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {recipients.map(r => (
                      <li key={r.id}>{r.name} ({r.email})</li>
                  ))}
                </ul>
            </div>
          )}

          <AlertDialogFooter>
            {isFinished ? (
              <Button onClick={() => setIsOpen(false)}>Fechar</Button>
            ) : (
              <>
                <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm} disabled={isSending}>
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSending ? "Enviando..." : "Confirmar e Enviar"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
    