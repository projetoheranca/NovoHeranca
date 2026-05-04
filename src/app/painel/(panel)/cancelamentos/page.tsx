"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Trash2, Mail } from "lucide-react";
import { processCancellationRequest } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { useAllCancellationRequests } from "@/hooks/use-all-cancellation-requests";

export default function CancellationAdminPage() {
  const { requests, isLoading, mutate } = useAllCancellationRequests();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (requestId: string, action: 'archive' | 'confirm') => {
    setProcessingId(requestId);
    try {
        const result = await processCancellationRequest(requestId, action);
        if (result.success) {
            toast({ title: "Sucesso", description: result.message });
            mutate();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Falha ao processar", description: error.message });
    } finally {
        setProcessingId(null);
    }
  };

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos de Cancelamento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>
            Usuários que solicitaram o encerramento da conta e interrupção do serviço.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Data da Solicitação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => renderSkeleton(i))
              ) : requests && requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.userName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {req.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{req.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(req.requestedAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAction(req.id, 'archive')}
                            disabled={!!processingId}
                        >
                            {processingId === req.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                            Arquivar
                        </Button>
                        
                        <DeleteConfirmationDialog
                            onConfirm={() => handleAction(req.id, 'confirm')}
                            itemName={req.userName}
                            itemType="conta e assinatura"
                            title="Confirmar Cancelamento e Exclusão?"
                            description="Esta ação irá excluir permanentemente a conta do usuário e todos os seus dados, cumprindo o pedido de cancelamento. Você confirma?"
                            confirmActionText="Sim, Cancelar e Excluir"
                            triggerComponent={
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    disabled={!!processingId}
                                >
                                    {processingId === req.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                    Excluir Conta
                                </Button>
                            }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Nenhum pedido de cancelamento pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
