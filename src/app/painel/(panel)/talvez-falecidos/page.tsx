"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Send, UserCheck, AlertTriangle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllUserProfiles } from "@/hooks/use-all-user-profiles";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatabase } from "@/firebase";
import { ref, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { deliverAllMemories } from "@/lib/actions";
import { getCheckInStatus } from "@/lib/utils";

export default function TalvezFalecidosPage() {
  const { userProfiles, isLoading, mutate } = useAllUserProfiles();
  const database = useDatabase();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  
  const [modalState, setModalState] = useState({ isOpen: false, userId: '', userName: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const inactiveUsers = useMemo(() => {
    if (!isMounted || !userProfiles) return [];
    return userProfiles
      .filter(user => user.checkInStatus === 'risco' || user.checkInStatus === 'inativo')
      .map(user => {
        const { daysRemaining } = getCheckInStatus(user.lastCheckIn, user.checkInFrequency, user.deliveryGracePeriod);
        return {
          ...user,
          daysWithoutResponse: daysRemaining ? Math.abs(daysRemaining) : 0
        };
      })
      .sort((a, b) => b.daysWithoutResponse - a.daysWithoutResponse);
  }, [userProfiles, isMounted]);

  const handleCancelProcess = async (userId: string, userName: string) => {
    if (!database) return;
    const userRef = ref(database, `users/${userId}/document`);
    await update(userRef, { 
        checkInStatus: 'ok',
        lastCheckIn: new Date().toISOString()
     });
    toast({
      title: "Processo Cancelado",
      description: `O status de inatividade de ${userName} foi revertido e o check-in foi atualizado.`,
    });
    mutate();
  };

  const handleConfirmDeath = async () => {
    if (!modalState.userId) return;
    
    setIsProcessing(true);
    try {
        const result = await deliverAllMemories(modalState.userId);
        if (result.success) {
            toast({ title: "Legado Enviado!", description: `As memórias de ${modalState.userName} foram entregues.` });
            if (database) {
                await update(ref(database, `users/${modalState.userId}/document`), { status: 'inactive', checkInStatus: 'ok' });
            }
            mutate();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro na entrega", description: error.message });
    } finally {
        setIsProcessing(false);
        setModalState({ isOpen: false, userId: '', userName: '' });
    }
  };

  if (!isMounted) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;
  }

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell colSpan={6}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="text-destructive"/> Painel "Talvez Falecidos"</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuários em Processo de Inatividade</CardTitle>
          <CardDescription>
            Estes usuários não fazem check-in há algum tempo. Ações manuais podem ser necessárias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead className="hidden lg:table-cell">Email Secundário</TableHead>
                <TableHead className="hidden md:table-cell text-center">Último Check-in</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => renderSkeleton(i))
              ) : inactiveUsers.length > 0 ? (
                inactiveUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar" />
                          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || user.email.split('@')[0]}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.phone || "Não informado"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{user.secondaryEmail || "Não informado"}</TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      {user.lastCheckIn ? new Date(user.lastCheckIn).toLocaleDateString('pt-BR') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.checkInStatus === 'inativo' ? 'destructive' : 'secondary'}>
                        {user.checkInStatus === 'inativo' ? 'Ação Necessária' : 'Em Risco'}
                      </Badge>
                       <p className="text-xs text-muted-foreground">{user.daysWithoutResponse} dia(s) de atraso</p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu de ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onSelect={() => handleCancelProcess(user.id, user.name || user.email)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Cliente Confirmou Vida
                            </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem 
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setModalState({ isOpen: true, userId: user.id, userName: user.name || user.email });
                                }}
                                className="text-destructive"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Confirmar Falecimento
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum usuário em processo de inatividade.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={modalState.isOpen} onOpenChange={(open) => !open && !isProcessing && setModalState({ ...modalState, isOpen: false })}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Confirmar Falecimento de {modalState.userName}?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 pt-4">
                    <p>Esta é uma <strong>ação crítica e irreversível</strong>. Ao confirmar:</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Todas as memórias e senhas do usuário serão enviadas IMEDIATAMENTE aos herdeiros.</li>
                        <li>A conta será marcada como Inativa permanentemente.</li>
                        <li>Emails automáticos de entrega serão disparados agora.</li>
                    </ul>
                    <p className="font-bold">Você confirma que realizou todas as verificações manuais necessárias?</p>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleConfirmDeath} 
                    disabled={isProcessing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Sim, Confirmar e Entregar Legado
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}