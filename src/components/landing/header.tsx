"use client"

import { useState, useEffect } from 'react';
import Link from "next/link"
import { Moon, Sun, Menu, LogIn } from "lucide-react"
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { usePathname } from 'next/navigation';

export function LandingHeader() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    if (!isHomePage) {
      setHasScrolled(true);
    } else {
      handleScroll();
    }
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const navLinks = (
    <>
      <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4 text-glow" onClick={() => setIsMobileMenuOpen(false)}>
        Recursos
      </Link>
      <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4 text-glow" onClick={() => setIsMobileMenuOpen(false)}>
        Planos
      </Link>
      <Link href="/pricing#faq" className="text-sm font-medium hover:underline underline-offset-4 text-glow" onClick={() => setIsMobileMenuOpen(false)}>
        Dúvidas
      </Link>
       <Dialog>
        <DialogTrigger asChild>
           <Button variant="link" className="text-sm font-medium hover:underline underline-offset-4 text-glow p-0 h-auto">
            Compartilhe e Ganhe!
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Indique um Amigo e Ganhe!</DialogTitle>
                <DialogDescription>
                Gosta do nosso serviço? Compartilhe com seus amigos e, para cada novo assinante que vier através do seu link, você ganha <strong className="text-primary text-glow">1 mês grátis</strong> na sua assinatura!
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <h4 className="font-semibold mb-2">Como funciona:</h4>
                <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Crie sua conta ou faça login no Minha Herança Digital.</li>
                    <li>No seu painel, acesse a seção "Indique e Ganhe".</li>
                    <li>Copie seu link pessoal e compartilhe nas redes sociais.</li>
                    <li>Ganhe 1 mês grátis para cada amigo que se tornar um assinante pago!</li>
                </ol>
            </div>
            <DialogFooter>
                 <Button asChild className="w-full">
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Fazer Login para Participar
                    </Link>
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  const showText = !isHomePage || hasScrolled;
  const headerTextColor = isHomePage && !hasScrolled ? 'text-white' : 'text-foreground';

  return (
    <header className={cn(
      "px-4 lg:px-6 h-20 flex items-center fixed top-0 left-0 right-0 z-50 transition-all duration-300",
       hasScrolled ? "bg-card/80 backdrop-blur-sm border-b shadow-lg" : "bg-transparent border-b-transparent",
       headerTextColor
    )}>
      <div className="container mx-auto flex items-center justify-between w-full">
        
        {/* Left Section */}
        <div className="flex-1 flex items-center justify-start gap-2">
           <Link href="/" className="flex items-center justify-center" onClick={() => setIsMobileMenuOpen(false)}>
            <Image src="/img/logo1.png" alt="Minha Herança Digital Logo" width={48} height={48} className="icon-glow" />
            <span className={cn("ml-2 text-lg font-semibold whitespace-nowrap text-glow transition-opacity duration-300 hidden sm:inline", showText ? "opacity-100" : "opacity-0 md:opacity-100")}>Minha Herança Digital</span>
          </Link>
        </div>

        {/* Center Section - Desktop Nav & Mobile Login */}
        <div className="flex-1 flex items-center justify-center gap-6">
           <div className="hidden md:flex gap-6">
             {navLinks}
           </div>
           {/* Botão Entrar para mobile */}
           <div className="md:hidden flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                    <Link href="/signup">Cadastre-se!</Link>
                </Button>
                <Button asChild size="sm" className="button-glow">
                    <Link href="/login">Entrar</Link>
                </Button>
           </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary button-glow">
                    <Link href="/signup">Cadastre-se!</Link>
                </Button>
                <Button asChild className="button-glow">
                    <Link href="/login">Entrar</Link>
                </Button>
            </div>
            <div className="hidden md:flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    aria-label="Toggle theme"
                    className="hover:bg-transparent hover:text-primary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary))]"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
            </div>
            
            {/* Mobile Menu */}
            <div className="flex md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <nav className="flex flex-col items-center justify-center h-full gap-8">
                    <div className="flex flex-col items-center gap-6 text-xl">
                        {navLinks}
                    </div>
                    {/* Botão de entrar removido do menu lateral, já que agora está no topo */}
                    <div className="absolute bottom-6">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            aria-label="Toggle theme"
                            className="flex items-center justify-center gap-2"
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span>Mudar Tema</span>
                        </Button>
                    </div>
                </nav>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </div>
    </header>
  )
}
