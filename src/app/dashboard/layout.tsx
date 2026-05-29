"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-provider';
import { cn } from '@/lib/utils';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { NavLinks } from "@/components/dashboard/nav-links";
import { Header } from '@/components/dashboard/header';
import Image from "next/image";
import { Card, CardContent } from '@/components/ui/card';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading, logout } = useSession();
  const router = useRouter();

  // --- CONTROLE DE EXPIRAÇÃO DE TRIAL ---
  useEffect(() => {
    if (isLoading || !session) return;

    if (session.accountStatus === 'trial' && session.trialEndDate) {
      const hasExpired = new Date(session.trialEndDate) < new Date();
      if (hasExpired) {
        import('@/firebase/config').then(({ database }) => {
          import('firebase/database').then(({ ref, update }) => {
            const userRef = ref(database, `users/${session.uid}/document`);
            update(userRef, { accountStatus: 'expired' });
          });
        });
      }
    }
  }, [session, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace('/login');
      return;
    }
  }, [session, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  if (isLoading || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // --- TELA DE BLOQUEIO POR EXPIRAÇÃO ---
  if (session.accountStatus === 'expired') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <Card className="max-w-md w-full card-glow border-destructive/50 animate-fade-in-up">
                <CardContent className="pt-10 pb-10 space-y-6">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full animate-pulse animate-duration-1000" />
                        <Clock className="h-16 w-16 text-destructive mx-auto relative z-10" />
                    </div>
                    <h1 className="text-2xl font-black text-glow text-destructive">Proteja o seu legado digital hoje</h1>
                    <p className="text-muted-foreground text-sm">
                        O seu período de testes terminou. Mantenha suas senhas, memórias e documentos mais preciosos seguros e prontos para quem você ama. Escolha como deseja continuar sua proteção:
                    </p>
                    <div className="space-y-3 pt-4">
                        <Button asChild className="w-full button-glow font-bold" size="lg">
                            <Link href="/checkout/mensal">
                                Ativar Proteção por Cartão (R$ 24,90/mês)
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full font-bold border-green-600/50 hover:bg-green-500/10 text-green-500" size="lg">
                            <Link href="/pix-checkout/mensal">
                                Ativar Proteção por Pix (R$ 24,90/mês)
                            </Link>
                        </Button>
                        <hr className="border-border my-4" />
                        <Button variant="ghost" onClick={handleLogout} className="w-full">
                            Sair da conta
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <p className="mt-8 text-xs text-muted-foreground">Seus dados e memórias cadastrados estão preservados com segurança.</p>
        </div>
      );
  }

  // --- TRAVA DE SEGURANÇA: AGUARDANDO WEBHOOK ---
  if (session.lastPaymentStatus === 'Pendente' && session.accountStatus !== 'trial') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <Card className="max-w-md w-full card-glow">
                <CardContent className="pt-10 pb-10 space-y-6">
                    <div className="relative inline-block">
                        <Clock className="h-16 w-16 text-primary animate-pulse mx-auto" />
                    </div>
                    <h1 className="text-2xl font-black text-glow">Aguardando Confirmação</h1>
                    <p className="text-muted-foreground">
                        Estamos processando seu pagamento com a Stripe. <br/>
                        Isso costuma levar apenas alguns segundos.
                    </p>
                    <div className="space-y-4 pt-4">
                        <Button onClick={() => window.location.reload()} className="w-full">
                            Já paguei, atualizar tela
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="w-full">
                            Sair e tentar mais tarde
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <p className="mt-8 text-xs text-muted-foreground">Você receberá um e-mail de boas-vindas assim que for confirmado.</p>
        </div>
      );
  }
  
  const userInitials = session.email?.charAt(0).toUpperCase() || '?';

  // --- COMPONENTE DO BANNER DE CONTAGEM REGRESSIVA DO TRIAL ---
  let bannerElement = null;
  if (session.accountStatus === 'trial' && session.trialEndDate) {
    const trialEndDate = new Date(session.trialEndDate);
    const diffTime = trialEndDate.getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const isUrgent = daysRemaining <= 3;

    let bannerMessage = `Seu teste gratuito termina em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}.`;
    if (daysRemaining === 0) {
      bannerMessage = `Seu teste termina HOJE. Assine para não perder acesso.`;
    }

    bannerElement = (
      <div className={cn(
        "w-full px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-bold border-b transition-all duration-300 z-20",
        isUrgent
          ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse dark:bg-red-500/5"
          : "bg-primary/10 border-primary/20 text-primary"
      )}>
        <div className="flex items-center gap-2">
          <Clock className={cn("h-4 w-4 shrink-0", isUrgent ? "text-red-500" : "text-primary")} />
          <span>{bannerMessage}</span>
        </div>
        <Button asChild size="sm" variant={isUrgent ? "destructive" : "default"} className="font-bold shrink-0 rounded-full h-7 px-3 text-xs button-glow">
          <Link href="/dashboard/subscription">Assinar Agora</Link>
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
         <SidebarRail />
        <SidebarHeader className="flex items-center justify-between p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-sidebar-foreground transition-colors hover:text-sidebar-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sidebar-primary-foreground">
              <Image src="/img/logo1.png" alt="Logo" width={24} height={24} className="icon-glow" style={{ height: 'auto', width: 'auto' }} />
            </div>
            <span className="text-lg font-semibold text-glow group-data-[collapsible=icon]:hidden">Minha Herança Digital</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <NavLinks />
        </SidebarContent>
        <SidebarFooter>
           <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{session.name || 'Usuário'}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {session.email}
              </p>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="h-8 w-8 group-data-[collapsible=icon]:hidden" title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
       <SidebarInset>
        {bannerElement}
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
