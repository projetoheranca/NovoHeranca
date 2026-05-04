
"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Archive, Users, Settings, Shield, PanelLeft, Video, Mic, CalendarClock, ShieldCheck, Camera, Smartphone, Gift } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar"; // Importar o hook
import { useIsMobile } from "@/hooks/use-mobile";

type LinkItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  isSpecial?: boolean;
};

const links: LinkItem[] = [
  { href: "/dashboard", label: "Painel", icon: PanelLeft, exact: true },
  { href: "/dashboard/memories", label: "Memórias", icon: Archive },
  { href: "/dashboard/gravador", label: "Gravar Recordação", icon: Camera, desktopOnly: true },
  { href: "/dashboard/mobile-record", label: "Gravação Celular", icon: Smartphone, mobileOnly: true },
  { href: "/dashboard/calendar", label: "Agendamentos", icon: CalendarClock },
  { href: "/dashboard/recipients", label: "Herdeiros Digitais", icon: Users },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
  { href: "/dashboard/2factor", label: "2Factor", icon: ShieldCheck },
  { href: "/dashboard/subscription", label: "Assinatura", icon: Shield },
  { href: "/dashboard/share", label: "Indique e Ganhe", icon: Gift, isSpecial: true },
];

export function NavLinks() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar(); // Usar o hook para controlar o menu mobile
  const isMobile = useIsMobile();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        
        if (isMobile && link.desktopOnly) return null;
        if (!isMobile && link.mobileOnly) return null;
        
        return (
            <SidebarMenuItem key={link.href} data-active={isActive}>
                <SidebarMenuButton
                    asChild
                    tooltip={{ children: link.label }}
                    onClick={() => setOpenMobile(false)} // Fechar o menu ao clicar
                >
                    <Link href={link.href}>
                    {link.isSpecial ? (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x font-bold">
                            <link.icon className="text-primary"/>
                            <span>{link.label}</span>
                        </div>
                    ) : (
                        <>
                            <link.icon />
                            <span>{link.label}</span>
                        </>
                    )}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
