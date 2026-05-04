
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { CheckCircle2, AlertTriangle, Gift } from "lucide-react";
import Link from "next/link";
import React from 'react';

export default function LegacyDeliveredPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const userName = searchParams.get('name');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        {error ? (
          <div className="max-w-md w-full animate-fade-in-up">
            <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
            <h1 className="mt-6 text-3xl font-extrabold tracking-tighter text-glow">
              Ocorreu um Erro
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Não foi possível processar sua solicitação. O link pode ser inválido, ter expirado ou um erro inesperado ocorreu. Por favor, contate o suporte se o problema persistir.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/">
                  Voltar para a Página Inicial
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full">
              <div className="animate-fade-in-up">
                  <Gift className="mx-auto h-20 w-20 text-primary icon-glow" />
                  <h1 className="mt-6 text-3xl font-extrabold tracking-tighter text-glow">
                      O Legado de {userName || 'seu ente querido'} está a caminho.
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground">
                      As memórias e mensagens foram enviadas para os guardiões designados. Eles receberão os e-mails em breve. Este é um momento de lembrança e celebração.
                  </p>
              </div>
              <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                   <Button asChild size="lg" className="w-full sm:w-auto button-glow">
                      <Link href="/">
                          Ir para Minha Herança Digital
                      </Link>
                  </Button>
              </div>
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
