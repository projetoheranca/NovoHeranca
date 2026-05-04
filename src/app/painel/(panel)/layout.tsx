
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from "@/components/dashboard/header";
import { Loader2 } from 'lucide-react';
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
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSession } from '@/context/session-provider';
import { NavLinks } from '@/components/admin/admin-nav-links';
import Image from "next/image";

// E-mail explícito do administrador para verificação
const ADMIN_EMAIL = "martinho@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading, logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!session || session.email !== ADMIN_EMAIL) {
        router.replace('/painel/login');
      }
    }
  }, [isLoading, session, router]);


  const handleLogout = () => {
    logout();
    router.push('/painel/login');
  };
  
  if (isLoading || !session || session.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
            href="/painel"
            className="flex items-center gap-2.5 text-sidebar-foreground transition-colors hover:text-sidebar-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sidebar-primary-foreground">
              <Image src="/img/logo1.png" alt="Logo" width={24} height={24} className="icon-glow" style={{ height: 'auto', width: 'auto' }} />
            </div>
            <span className="text-lg font-semibold text-glow group-data-[collapsible=icon]:hidden">Admin</span>
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
              <p className="truncate text-sm font-medium">{session.email.split('@')[0] || 'Admin'}</p>
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
          <main className="flex-1 bg-muted/40 p-4 md:p-6">
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
