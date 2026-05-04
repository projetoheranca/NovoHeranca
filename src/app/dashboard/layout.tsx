"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-provider';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  // --- TRAVA DE SEGURANÇA: AGUARDANDO WEBHOOK ---
  // Se o pagamento ainda está pendente, não deixa entrar no painel real.
  if (session.lastPaymentStatus === 'Pendente') {
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
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
