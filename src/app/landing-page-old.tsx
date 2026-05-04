

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, Zap, Lock, Users, UploadCloud, Send } from "lucide-react";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Ana P.",
    role: "Usuária Verificada",
    avatar: "https://i.pravatar.cc/150?img=1",
    text: "Saber que minhas palavras e memórias chegarão aos meus filhos, mesmo que eu não esteja mais aqui, me traz uma paz indescritível. A interface é simples e a segurança é robusta. Recomendo de olhos fechados."
  },
  {
    name: "Carlos M.",
    role: "Usuário Verificado",
    avatar: "https://i.pravatar.cc/150?img=3",
    text: "A funcionalidade de 'calculadora' é genial. Ninguém imagina que por trás de algo tão simples, guardo o acesso ao meu legado digital. É a discrição que eu precisava."
  },
  {
    name: "Sofia L.",
    role: "Usuária Verificada",
    avatar: "https://i.pravatar.cc/150?img=5",
    text: "O processo de 'Dead Man's Switch' foi o que me convenceu. É a garantia de que minhas mensagens mais importantes serão entregues. Um serviço essencial para o mundo de hoje."
  },
]


export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative w-full h-[75vh] flex items-center justify-center text-center text-white overflow-hidden"
        >
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(/img/img1.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/30 z-10"></div>
          <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center gap-6 p-4">
            <h1 
              className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up [animation-delay:200ms] text-glow"
            >
              Preserve Seu Legado Digital
            </h1>
            <p 
              className="mt-4 text-lg md:text-xl animate-fade-in-up [animation-delay:400ms] font-medium"
            >
              O Herança Digital é o seu cofre de herança digital, projetado para guardar e entregar suas memórias mais importantes com segurança e discrição.
            </p>
            <div className="mt-6 animate-fade-in-up [animation-delay:600ms] flex flex-col sm:flex-row gap-4">
               <Button size="lg" asChild className="button-glow">
                <Link href="/pricing">Ver Planos</Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                <Link href="/features">Conhecer Recursos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Section 1: Image Left, Text Right */}
        <section className="w-full py-20 md:py-24 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="animate-fade-in-up group">
                         <div className="image-glow rounded-xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Cofre digital disfarçado"
                                width={600}
                                height={400}
                                className="rounded-xl shadow-2xl object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                                data-ai-hint="digital privacy"
                            />
                        </div>
                    </div>
                    <div className="animate-fade-in-up [animation-delay:200ms]">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold text-primary mb-4">Discrição Absoluta</div>
                        <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl text-glow">Invisível aos Olhos, Seguro no Coração</h2>
                        <p className="mt-4 text-muted-foreground text-lg">
                            O Herança Digital opera sob a fachada de uma calculadora comum. Suas memórias, cartas e vídeos ficam protegidos por uma camada de segurança que só você conhece. Ninguém saberá da existência do seu cofre, garantindo privacidade total até que o momento certo chegue.
                        </p>
                        <ul className="mt-6 space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary"/>
                                <span>Acesso secreto via código na calculadora.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary"/>
                                <span>Nenhum ícone ou notificação suspeita.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* Feature Section 2: Text Left, Image Right */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-card">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="md:order-2 animate-fade-in-up group">
                         <div className="image-glow rounded-xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Entrega de legado digital"
                                width={600}
                                height={400}
                                className="rounded-xl shadow-2xl object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                                data-ai-hint="sharing memories"
                            />
                        </div>
                    </div>
                    <div className="md:order-1 animate-fade-in-up [animation-delay:200ms]">
                         <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold text-primary mb-4">Seu Legado, Entregue</div>
                        <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl text-glow">Garantia de Entrega no Futuro</h2>
                        <p className="mt-4 text-muted-foreground text-lg">
                            Nossa tecnologia de "Dead Man's Switch" é a promessa de que seu legado será entregue. Através de check-ins periódicos, monitoramos sua atividade. Caso um longo período de inatividade seja detectado, o protocolo de entrega é iniciado automaticamente para os guardiões que você escolheu.
                        </p>
                        <ul className="mt-6 space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-primary"/>
                                <span>Protocolo de entrega automática configurável.</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <Lock className="h-5 w-5 text-primary"/>
                                <span>Criptografia de ponta-a-ponta para todos os dados.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-20 md:py-24 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold text-primary">Simples e Seguro</div>
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Como Funciona em 3 Passos</h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                        Projetamos um processo intuitivo para que você possa configurar seu legado digital em minutos.
                    </p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-12 mt-16 sm:grid-cols-3">
                    <div className="grid gap-4 text-center">
                        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                            <UploadCloud className="h-12 w-12 text-primary" />
                            <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">1</div>
                        </div>
                        <h3 className="text-xl font-bold">Guarde suas Memórias</h3>
                        <p className="text-muted-foreground">Faça o upload de vídeos, fotos, áudios e documentos. Organize seu cofre digital da maneira que preferir.</p>
                    </div>
                    <div className="grid gap-4 text-center">
                         <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-12 w-12 text-primary" />
                            <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">2</div>
                        </div>
                        <h3 className="text-xl font-bold">Defina seus Guardiões</h3>
                        <p className="text-muted-foreground">Escolha as pessoas de confiança que receberão suas memórias e escreva mensagens personalizadas para cada uma.</p>
                    </div>
                    <div className="grid gap-4 text-center">
                         <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                            <Send className="h-12 w-12 text-primary" />
                            <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">3</div>
                        </div>
                        <h3 className="text-xl font-bold">Descanse em Paz</h3>
                        <p className="text-muted-foreground">Nosso sistema monitora sua atividade. Seu legado será entregue automaticamente conforme suas instruções.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-card">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">A Confiança de Nossos Usuários</h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                        Veja o que as pessoas estão dizendo sobre a paz de espírito que o Herança Digital proporciona.
                    </p>
                </div>
                <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.name} className="flex flex-col justify-between rounded-lg border bg-background p-6 shadow-md">
                            <blockquote className="text-muted-foreground italic">"{testimonial.text}"</blockquote>
                            <div className="mt-4 flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Call to action section */}
        <section className="w-full py-20 md:py-24 lg:py-28">
           <div className="container mx-auto px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
               <div className="space-y-3">
                 <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold text-primary">Próximo Passo</div>
                 <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Pronto para Proteger Suas Memórias?</h2>
                 <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                   Seu legado é precioso. Dê o primeiro passo para garantir que ele seja preservado e compartilhado com as pessoas que você ama, da maneira que você desejar.
                 </p>
               </div>
               <div className="mt-6">
                  <Button size="lg" asChild className="button-glow">
                    <Link href="/pricing">Começar Agora</Link>
                  </Button>
                </div>
             </div>
           </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
