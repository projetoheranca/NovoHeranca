
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, CheckCircle, Users, HardDrive, Loader2, AlertTriangle, ShieldCheck, Clock, MailWarning } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/context/session-provider";
import { useDatabase, useList, useMemoFirebase } from "@/firebase";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { Memory, Recipient } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn, getCheckInStatus } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleUserCheckIn, resendVerificationEmail } from "@/lib/actions";
import { ref } from "firebase/database";

function formatStorage(bytes: number, limitInGB: number): string {
    if (bytes === 0) return `0 GB / ${limitInGB} GB`;
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 1) {
        const mb = gb * 1024;
        return `${mb.toFixed(0)} MB / ${limitInGB} GB`;
    }
    return `${gb.toFixed(2)} GB / ${limitInGB} GB`;
}

export default function DashboardPage() {
  const { session } = useSession();
  const database = useDatabase();
  const { userProfile, isLoading: isProfileLoading, mutate } = useUserProfile();
  const { toast } = useToast();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const memoriesQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/memories`);
  }, [session, database]);

  const recipientsQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/recipients`);
  }, [session, database]);

  const { data: memories, isLoading: isMemoriesLoading } = useList<Memory>(memoriesQuery);
  const { data: recipients, isLoading: isRecipientsLoading } = useList<Recipient>(recipientsQuery);

  const isLoading = isProfileLoading || isMemoriesLoading || isRecipientsLoading;

  const handleCheckIn = async () => {
    if (!session?.uid || !userProfile?.email || !userProfile?.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para fazer check-in.",
      });
      return;
    }
    setIsCheckingIn(true);
    try {
        const result = await handleUserCheckIn({
            userId: session.uid,
            userEmail: userProfile.email,
            userName: userProfile.name,
            checkInFrequency: userProfile.checkInFrequency || 30,
        });
        if (result.success) {
            toast({ title: "Check-in realizado!", description: "Sua conta foi marcada como ativa." });
            mutate();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Erro no Check-in",
            description: error.message || "Não foi possível completar o check-in.",
        });
    } finally {
        setIsCheckingIn(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!session?.uid) return;
    setIsResendingEmail(true);
    try {
      const result = await resendVerificationEmail({ userId: session.uid });
      if (result.success) {
        toast({ title: "E-mail enviado!", description: "Verifique sua caixa de entrada." });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha ao reenviar", description: error.message });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const { status: checkInStatus, daysRemaining, nextCheckInDate } = getCheckInStatus(
    userProfile?.lastCheckIn,
    userProfile?.checkInFrequency,
    userProfile?.deliveryGracePeriod
  );
  
  const isTrialing = userProfile?.subscriptionStatus === 'trialing' || userProfile?.status === 'trialing';
  let trialExpirationDate: Date | null = null;
  let trialDaysRemaining: number | null = null;
  let isTrialExpired = false;

  if (isTrialing && userProfile?.createdAt) {
    const createdAtDate = new Date(userProfile.createdAt);
    trialExpirationDate = new Date(createdAtDate);
    trialExpirationDate.setDate(createdAtDate.getDate() + 14);
    const now = new Date();
    const diffTime = trialExpirationDate.getTime() - now.getTime();
    trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isTrialExpired = diffTime < 0;
  }

  const greetingName = userProfile?.name || session?.email?.split('@')[0] || 'Usuário';

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full lg:col-span-2" />
          </div>
      </main>
    );
  }

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {!session?.emailVerified && (
          <Alert variant="destructive" className="card-glow border-yellow-500 text-yellow-500">
            <MailWarning className="h-4 w-4" />
            <AlertTitle className="font-bold">Confirme seu E-mail</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p>Verifique seu e-mail para garantir o acesso a todos os recursos.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerificationEmail}
                disabled={isResendingEmail}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
              >
                {isResendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reenviar E-mail
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-black tracking-tighter text-glow">Bem-vindo de volta, {greetingName}!</h1>
          <Button onClick={handleCheckIn} disabled={isCheckingIn} className="button-glow">
            {isCheckingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Fazer Check-in
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memórias</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memories?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destinatários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipients?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatStorage(userProfile?.storageUsed ?? 0, userProfile?.storageLimit ?? 1)}</div>
              <Progress value={((userProfile?.storageUsed ?? 0) / ((userProfile?.storageLimit ?? 1) * 1024 * 1024 * 1024)) * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {isTrialing && trialExpirationDate && isClient && (
          <Card className={cn("card-glow", isTrialExpired ? "border-destructive" : "border-primary")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className={cn("h-6 w-6", isTrialExpired ? "text-destructive" : "text-primary")} />
                <span>Status do Período de Teste</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTrialExpired ? (
                <p className="text-2xl font-black text-destructive animate-pulse">TESTE EXPIROU!</p>
              ) : (
                <>
                  <p className="text-lg font-semibold">Expira em: {trialExpirationDate.toLocaleDateString("pt-BR")}</p>
                  <p className="text-sm text-muted-foreground">Restam {trialDaysRemaining} dia(s).</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={cn("card-glow", checkInStatus === 'risco' && "border-yellow-500", checkInStatus === 'inativo' && "border-destructive")}>
          <CardHeader>
             <CardTitle className="flex items-center gap-3">
                {checkInStatus === 'ok' && <ShieldCheck className="h-6 w-6 text-green-500" />}
                {checkInStatus !== 'ok' && <AlertTriangle className={cn("h-6 w-6", checkInStatus === 'risco' ? "text-yellow-500" : "text-destructive")} />}
              <span>Status do Check-in: {checkInStatus.charAt(0).toUpperCase() + checkInStatus.slice(1)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile?.lastCheckIn && isClient ? (
              <>
                <p className="text-lg font-semibold">Próximo check-in necessário até:</p>
                 <p className={cn("text-xl font-bold text-glow", checkInStatus === 'risco' ? "text-yellow-400" : checkInStatus === 'inativo' ? "text-destructive" : "text-primary")}>
                  {nextCheckInDate?.toLocaleDateString("pt-BR")}
                </p>
              </>
            ) : (
               <p className="text-sm text-muted-foreground">Configure a frequência de check-in para ativar o monitoramento.</p>
            )}
          </CardContent>
        </Card>
      </main>
  );
}
