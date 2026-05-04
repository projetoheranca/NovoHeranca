import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { Home } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";


type HeaderProps = {
  title?: string;
  breadcrumb?: { href: string; label: string }[];
};

export function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hidden md:flex" />
        {title && (
            <div className="hidden md:block">
            <Breadcrumb>
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                    <Link href="/dashboard"><Home className="h-4 w-4" /></Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumb && breadcrumb.map(item => (
                    <React.Fragment key={item.href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    </React.Fragment>
                ))}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            </div>
        )}
      </div>


      <div className="flex-1">
        {title && <h1 className="text-lg font-semibold md:hidden">{title}</h1>}
      </div>
      
      <UserNav />
    </header>
  );
}
