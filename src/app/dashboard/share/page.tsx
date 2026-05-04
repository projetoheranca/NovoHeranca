"use client";

import { useSession } from "@/context/session-provider";
import { ShareContent } from "@/components/landing/share-content";
import { Loader2, Gift } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from 'next/image';

export default function SharePage() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return (
            <main className="flex flex-1 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </main>
        );
    }
    
    if (!session?.uid) {
        return (
            <main className="flex flex-1 items-center justify-center">
                <p>Você precisa estar logado para ver seu link de indicação.</p>
            </main>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center">
                <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Indique e Ganhe</h1>
            </div>
            
            <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
                <div className="relative h-56 w-full">
                    <Image
                        src="/img/MUHAE.jpg"
                        alt="Banner Indique e Ganhe"
                        fill
                        className="object-cover brightness-75"
                        data-ai-hint="happy people celebrating"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex flex-col items-center justify-end pb-8">
                         <div className="flex items-center gap-2 mb-2">
                            <Gift className="h-8 w-8 text-neon-blue animate-pulse" />
                            <h2 className="text-4xl font-black tracking-tighter text-white text-glow">Ganhe Recompensas</h2>
                         </div>
                         <p className="text-white font-medium text-lg text-center px-4">
                            Sua confiança vale muito para nós!
                         </p>
                    </div>
                </div>
                <CardHeader className="text-center pt-8">
                    <CardDescription className="text-lg leading-relaxed">
                        Indique o <strong className="text-foreground">Minha Herança Digital</strong> para seus amigos e familiares.<br />
                        Para cada novo assinante que usar seu link, você ganha <br />
                        <span className="text-2xl font-black text-neon-blue inline-block mt-2">1 MÊS GRÁTIS</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-12">
                    <ShareContent userId={session.uid} />
                </CardContent>
            </Card>
        </main>
    );
}