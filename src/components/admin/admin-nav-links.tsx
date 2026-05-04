
"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  PanelLeft, 
  DollarSign, 
  CalendarClock, 
  AlertTriangle, 
  Mail, 
  Zap, 
  Clock, 
  Gift, 
  XCircle, 
  BarChart3, 
  Target,
  ChevronRight,
  FileCode,
  Send
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const links = [
  { href: "/painel", label: "Painel", icon: PanelLeft, exact: true },
  { href: "/painel/crm", label: "CRM Inteligente", icon: BarChart3 },
  { href: "/painel/leads", label: "Leads Capturados", icon: Target },
  { href: "/painel/users", label: "Usuários", icon: Users },
  { href: "/painel/referrals", label: "Indicações", icon: Gift },
  { href: "/painel/faturamento", label: "Faturamento", icon: DollarSign },
  { href: "/painel/cancelamentos", label: "Cancelamentos", icon: XCircle },
  { href: "/painel/trials", label: "Trials", icon: Clock },
  { href: "/painel/inadiplencia", label: "Inadimplência", icon: CalendarClock },
  { href: "/painel/talvez-falecidos", label: "Talvez Falecidos", icon: AlertTriangle },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {/* Primeiros itens: Painel e CRM */}
      {links.slice(0, 2).map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={link.exact ? pathname === link.href : pathname.startsWith(link.href)}
            tooltip={{ children: link.label }}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      {/* Menu Cascata: Email Marketing (Agora posicionado após o CRM) */}
      <Collapsible asChild defaultOpen={pathname.includes("/email-marketing")} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip="Email Marketing" isActive={pathname.includes("/email-marketing")}>
              <Mail />
              <span>Email Marketing</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === "/painel/email-marketing"}>
                  <Link href="/painel/email-marketing">
                    <Send className="h-4 w-4 mr-2" />
                    <span>Envio de Emails</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === "/painel/email-marketing/templates"}>
                  <Link href="/painel/email-marketing/templates">
                    <FileCode className="h-4 w-4 mr-2" />
                    <span>Templates de Emails</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>

      {/* Restante dos itens do menu */}
      {links.slice(2).map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={link.exact ? pathname === link.href : pathname.startsWith(link.href)}
            tooltip={{ children: link.label }}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      {/* Gatilhos de Teste ao final */}
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === "/painel/teste-emails"}
          tooltip="Gatilhos de Teste"
        >
          <Link href="/painel/teste-emails">
            <Zap />
            <span>Gatilhos de Teste</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
