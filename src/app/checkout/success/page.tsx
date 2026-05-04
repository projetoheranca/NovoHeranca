'use client';

import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { PartyPopper, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 pt-32 pb-20">
        <div className="max-w-md w-full animate-fade-in-up">
            <div className="relative inline-block mb-6">
                <PartyPopper className="h-20 w-20 text-primary icon-glow" />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-glow mb-4">
                Assinatura Processada!
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
                Seu cadastro foi validado com sucesso. Agora você pode entrar na sua conta para acessar seu cofre digital e começar seu legado.
            </p>
            
            <div className="flex flex-col gap-4">
                <Button asChild size="lg" className="button-glow w-full h-14 text-lg font-bold">
                    <Link href="/login">
                        <LogIn className="mr-2 h-5 w-5" />
                        Ir para Login
                    </Link>
                </Button>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
                Sua segurança é nossa prioridade. Todos os dados são criptografados de ponta-a-ponta.
            </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
