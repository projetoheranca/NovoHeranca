
"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Send, Clock, Loader2, UserCheck, UserX, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllUserProfiles } from "@/hooks/use-all-user-profiles";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatabase } from "@/firebase";
import { ref, update, remove } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { AddUserForm } from "@/components/admin/add-user-form";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { deliverAllMemories, handleInactiveUserCheck } from "@/lib/actions";
import type { UserProfile } from "@/lib/types";
import { getCheckInStatus } from "@/lib/utils";

const planToStorageLimit: { [key: string]: number } = {
  'Teste': 1,
  'Mensal': 5,
  'Anual': 100,
};

function formatBytes(bytes: number | undefined, decimals = 2) {
  if (!bytes || bytes === 0) return '0 GB';
  const k = 1024;
  const gb = bytes / (k * k * k);
  return `${gb.toFixed(decimals)} GB`;
}


export default function UsersPage() {
  const { userProfiles, isLoading, mutate } = useAllUserProfiles();
  const database = useDatabase();
  const { toast } = useToast();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCheckingInactivity, setIsCheckingInactivity] = useState(false);

  const handleChangePlan = async (userId: string, newPlan: string, userName: string) => {
    if (!database) return;
    const userRef = ref(database, `users/${userId}/document`);
    const newStorageLimit = planToStorageLimit[newPlan];

    if (typeof newStorageLimit === 'undefined') {
       toast({
        variant: "destructive",
        title: "Plano Inválido",
        description: `O plano selecionado "${newPlan}" não é válido.`,
      });
      return;
    }
    
    await update(userRef, { 
      subscriptionStatus: newPlan,
      storageLimit: newStorageLimit,
      subscriptionStartDate: new Date().toISOString(), // Reset subscription date on plan change
      lastPaymentStatus: 'Pago', // Assume payment is made on plan change
      status: 'active', // Ensure user is active when plan changes
    });
    
    toast({
      title: "Plano do usuário atualizado!",
      description: `O plano de ${userName} foi alterado para ${newPlan} com um limite de ${newStorageLimit} GB.`,
    });
    mutate(); // Re-fetch user data
  };

  const handleToggleBlockUser = async (userId: string, userName: string, currentStatus: UserProfile['status']) => {
    if (!database) return;
    const userRef = ref(database, `users/${userId}/document`);
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await update(userRef, { status: newStatus });
    toast({
      title: `Status do usuário alterado`,
      description: `${userName} foi ${newStatus === 'suspended' ? 'suspenso' : 'reativado'}.`,
    });
    mutate();
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!database) return;
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
    // Note: This does not remove the user from Firebase Auth, only from RTDB.
    toast({
      title: 'Usuário Excluído',
      description: `${userName} foi removido permanentemente.`,
    });
    mutate();
  }
  
  const handleDeliverLegacy = async (userId: string, userName: string) => {
    toast({
      title: "Iniciando Entrega do Legado",
      description: `O processo de envio para ${userName} foi iniciado. Isso pode levar alguns minutos.`,
    });

    try {
      const result = await deliverAllMemories(userId);
      if (result.success) {
        toast({
          title: "Legado Entregue com Sucesso!",
          description: `Todas as memórias de ${userName} foram enviadas.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha na Entrega do Legado",
        description: error.message || "Ocorreu um erro desconhecido.",
        duration: 9000,
      });
    } finally {
        mutate();
    }
  };

  const handleManualInactivityCheck = async () => {
    setIsCheckingInactivity(true);
    toast({
      title: "Iniciando Verificação",
      description: "Verificando a inatividade de todos os usuários. Isso pode levar um momento...",
    });
    try {
      const result = await handleInactiveUserCheck();
      if (result.success) {
        toast({
          title: "Verificação Concluída",
          description: `Usuários checados: ${result.checked}. Ações (alerta/entrega) iniciadas para ${result.processed} usuário(s).`,
          duration: 9000,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha na Verificação",
        description: error.message || "Ocorreu um erro desconhecido durante a verificação.",
      });
    } finally {
      setIsCheckingInactivity(false);
      mutate(); // Revalida os dados da tabela
    }
  };


  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell colSpan={6}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
  
  const getPaymentStatusVariant = (status?: 'Pago' | 'Inadimplente' | 'Pendente') => {
    switch (status) {
      case 'Pago':
        return 'default';
      case 'Inadimplente':
        return 'destructive';
      case 'Pendente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCheckInStatusVariant = (status?: 'ok' | 'risco' | 'inativo') => {
    switch (status) {
        case 'ok': return 'default';
        case 'risco': return 'secondary'; // using secondary for yellow-ish
        case 'inativo': return 'destructive';
        default: return 'outline';
    }
  };
  
  const getCheckInStatusLabel = (status?: 'ok' | 'risco' | 'inativo') => {
    const labels = { ok: 'OK', risco: 'Risco', inativo: 'Inativo' };
    return labels[status!] || 'N/D';
  };
  
  const getStatusIcon = (status: UserProfile['status']) => {
    switch (status) {
        case 'active': return <UserCheck className="mr-2 h-4 w-4" />;
        case 'suspended': return <UserX className="mr-2 h-4 w-4" />;
        default: return <UserCog className="mr-2 h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: UserProfile['status']) => {
    const labels = {
        active: 'Ativo',
        suspended: 'Suspenso',
        inactive: 'Inativo (Pós-entrega)',
        archived: 'Arquivado',
    };
    return labels[status] || 'Desconhecido';
  };


  const plans = ["Teste", "Mensal", "Anual"];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleManualInactivityCheck} variant="outline" disabled={isCheckingInactivity}>
                {isCheckingInactivity ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                Verificar Inatividade
            </Button>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Usuário
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para criar uma nova conta de usuário.
                    </DialogDescription>
                    </DialogHeader>
                    <AddUserForm onSuccess={() => {
                        setIsAddUserOpen(false);
                        mutate(); // Re-fetch users after adding a new one
                    }} />
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
           <CardDescription>
            Visualize e gerencie todos os usuários da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">Plano</TableHead>
                <TableHead className="hidden md:table-cell text-center">Status Check-in</TableHead>
                <TableHead className="hidden md:table-cell text-center">Pagamento</TableHead>
                <TableHead className="hidden lg:table-cell">Última Compra</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => renderSkeleton(i))
                : userProfiles?.filter(user => user && user.email).map((user) => {
                    const { status: checkInStatus } = getCheckInStatus(user.lastCheckIn, user.checkInFrequency, user.deliveryGracePeriod);
                    return (
                      <TableRow key={user.id} className="transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                               <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar" />
                              <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">
                              <p className="truncate max-w-[150px] sm:max-w-none">{user.name || user.email.split('@')[0]}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">{user.email}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 md:hidden mt-2 text-xs">
                                  <div><span className="font-semibold">Plano:</span> {user.subscriptionStatus}</div>
                                  <div><span className="font-semibold">Check-in:</span> <Badge variant={getCheckInStatusVariant(checkInStatus)} className="px-1.5 py-0 text-[10px]">{getCheckInStatusLabel(checkInStatus)}</Badge></div>
                                  <div><span className="font-semibold">Pgto:</span> <Badge variant={getPaymentStatusVariant(user.lastPaymentStatus)} className="px-1.5 py-0 text-[10px]">{user.lastPaymentStatus || 'N/A'}</Badge></div>
                                  <div><span className="font-semibold">Uso:</span> {formatBytes(user.storageUsed)}</div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col">
                              <span>{user.subscriptionStatus}</span>
                              <span className="text-xs text-muted-foreground">{formatBytes(user.storageUsed)} de {user.storageLimit}GB</span>
                          </div>
                        </TableCell>
                         <TableCell className="hidden md:table-cell text-center">
                           <Badge variant={getCheckInStatusVariant(checkInStatus)}>{getCheckInStatusLabel(checkInStatus)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge variant={getPaymentStatusVariant(user.lastPaymentStatus)}>{user.lastPaymentStatus || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          {user.subscriptionStartDate 
                            ? new Date(user.subscriptionStartDate).toLocaleDateString('pt-BR') 
                            : new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="outline"
                                className="border-none bg-transparent hover:bg-transparent"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Alternar menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                 {getStatusIcon(user.status)} {getStatusLabel(user.status)}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Mudar Plano</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    {plans.map((plan) => (
                                      <DropdownMenuItem key={plan} onSelect={() => handleChangePlan(user.id, plan, user.name || user.email)}>
                                        {plan}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                               <DropdownMenuSeparator />
                               <DeleteConfirmationDialog
                                  onConfirm={() => handleDeliverLegacy(user.id, user.name || user.email)}
                                  itemName={`o legado de ${user.name || user.email}`}
                                  itemType="legado"
                                  triggerComponent={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-amber-500">
                                      <Send className="mr-2 h-4 w-4" />
                                      Enviar Legado Agora
                                    </DropdownMenuItem>
                                  }
                                  confirmActionText="Sim, enviar legado"
                                  title="Confirmar Entrega do Legado?"
                                  description="Esta ação é irreversível. Todas as memórias deste usuário serão enviadas aos seus destinatários imediatamente. Você tem certeza que deseja continuar?"
                                />
                               <DropdownMenuSeparator />
                               <DropdownMenuItem onSelect={() => handleToggleBlockUser(user.id, user.name || user.email, user.status)}>
                                {user.status === 'active' ? "Suspender" : "Reativar"}
                              </DropdownMenuItem>
                              <DeleteConfirmationDialog 
                                onConfirm={() => handleDeleteUser(user.id, user.name || user.email)} 
                                itemName={user.name || user.email} 
                                itemType="usuário"
                                triggerComponent={
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    Excluir
                                  </DropdownMenuItem>
                                }
                              >
                              </DeleteConfirmationDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
