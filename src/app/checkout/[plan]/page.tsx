
"use client";

import { useParams, useRouter } from "next/navigation";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { MOCK_SUBSCRIPTION_PLANS } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, Loader2, Check, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useSession } from "@/context/session-provider";
import Link from "next/link";
import { pushToDataLayer } from "@/lib/analytics";

const planToPriceId: { [key: string]: string | undefined } = {
    'mensal': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MENSAL,
    'anual': process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANUAL,
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { session, isLoading: isSessionLoading, logout } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  
  const planName = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const email = session?.email || "";

  useEffect(() => {
    if (isSessionLoading) return;
    if (!session) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para realizar uma compra.",
        variant: "destructive",
      });
      router.push(`/login?redirect=/checkout/${planName}`);
    }
  }, [session, isSessionLoading, router, planName, toast]);

  const plan = MOCK_SUBSCRIPTION_PLANS.find(
    (p) => p.name.toLowerCase() === planName
  );

  useEffect(() => {
    if (session && plan && !hasTracked) {
        pushToDataLayer('begin_checkout', { plan_selected: plan.name, is_trial: plan.name.toLowerCase() === 'mensal' });
        setHasTracked(true);
    }
  }, [session, plan, hasTracked]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.uid) {
      toast({
        title: "Sessão inválida",
        description: "Sua sessão de usuário não foi encontrada.",
        variant: "destructive",
      });
      return;
    }

    if (!plan) {
      toast({ title: "Plano inválido", variant: "destructive" });
      return;
    }
    
    const priceId = planToPriceId[plan.name.toLowerCase()];
    if (!priceId) {
        toast({
            title: "Erro de Configuração",
            description: `O plano '${plan.name}' não está configurado.`,
            variant: "destructive",
        });
        return;
    }

    pushToDataLayer('add_payment_info', { payment_type: 'stripe', plan_selected: plan.name });
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          userId: session.uid,
          planName: plan.name.toLowerCase(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Não foi possível iniciar o pagamento.");
      }
    } catch (error: any) {
      toast({
        title: "Erro no Checkout",
        description: error.message || "Erro ao processar pagamento.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handleCancelPurchase = () => {
    logout();
    router.push('/login');
  };

  if (isSessionLoading || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col min-h-screen">
        <LandingHeader />
        <main className="flex-1 flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold">Plano não encontrado</h1>
            <Button asChild className="mt-4">
              <Link href="/pricing">Ver Planos</Link>
            </Button>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }
  
  const isMonthlyTrial = plan.name.toLowerCase() === 'mensal';
  const price = plan.priceYearly !== "N/A" ? plan.priceYearly : plan.priceMonthly;
  const period = plan.priceYearly !== "N/A" ? "/ano" : "/mês";
  const cardButtonText = isMonthlyTrial ? 'Iniciar Proteção Gratuita (14 dias)' : 'Ir para Ativação Segura';
  const cardDescription = isMonthlyTrial
    ? "Cadastre seu cartão para iniciar seu período de segurança. Você terá 14 dias gratuitos para proteger suas informações mais preciosas, e nenhuma cobrança é feita hoje."
    : "Você será redirecionado para a ativação segura de sua conta.";

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center pt-32 pb-12 px-4">
        <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Configuração da sua Proteção
              </CardTitle>
              <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail da Conta</Label>
                  <Input id="email" type="email" value={email} required disabled />
                </div>
                
                <div className="p-4 rounded-md border border-dashed text-center text-sm text-muted-foreground">
                    Os dados do cartão serão preenchidos em nosso portal de pagamento seguro do Stripe.
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <Button type="submit" className="w-full button-glow" size="lg" disabled={isLoading}>
                       {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                       {cardButtonText}
                    </Button>
                    {isMonthlyTrial && <p className="text-xs text-muted-foreground mt-1">R$ 24,90/mês após o teste</p>}
                    
                    <div className="w-full flex flex-col items-center mt-2">
                        <Button asChild variant="outline" className="w-full" style={{ 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            borderColor: '#059669', 
                            boxShadow: '0 0 10px #10b981',
                            textShadow: '0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black'
                        }}>
                            <Link href={`/pix-checkout/${planName}`} onClick={() => pushToDataLayer('add_payment_info', { payment_type: 'pix', plan_selected: plan.name })}>
                                <DollarSign className="mr-2 h-4 w-4" /> Ativar Cofre com PIX
                            </Link>
                        </Button>
                         <p className="text-xs text-muted-foreground mt-1">Ativação instantânea do seu cofre de memórias, sem precisar de cartão</p>
                    </div>

                    <Button onClick={handleCancelPurchase} type="button" variant="link" size="sm" className="text-muted-foreground mt-2">
                        Desistir da compra
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Resumo do Pedido</h2>
            <Card className="bg-background">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>Resumo do plano escolhido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Armazenamento</span>
                  <span className="font-semibold">{plan.storage}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="text-muted-foreground">Total Hoje</span>
                  <span className="font-bold text-2xl tracking-tighter">
                    {isMonthlyTrial ? "R$0,00" : price}
                    {!isMonthlyTrial && <span className="text-sm font-normal text-muted-foreground">{period}</span>}
                  </span>
                </div>
                 {isMonthlyTrial && (
                   <div className="text-xs text-muted-foreground text-center pt-2 space-y-1">
                      <p><strong>Com Cartão:</strong> Você protege suas memórias gratuitamente hoje. A assinatura de R$ 24,90 só inicia daqui a 14 dias.</p>
                      <p><strong>Com PIX:</strong> Ativação imediata do seu legado por {price} (sem necessidade de cadastrar cartão).</p>
                   </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
