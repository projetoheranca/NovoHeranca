
"use client";

import { MOCK_SUBSCRIPTION_PLANS } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Gem, Loader2, Shield, CreditCard, Repeat, DollarSign, XCircle, AlertCircle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/use-user-profile";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { requestCancellation } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const subscriptionStatusToPlanName: { [key: string]: string } = {
  mensal: "Mensal",
  trialing: "Mensal",
  anual: "Anual",
  teste: "Teste",
};

const planIcons: { [key: string]: React.ElementType } = {
  "Teste": Rocket,
  "Mensal": Shield,
  "Anual": Gem,
};

export default function SubscriptionPage() {
  const { userProfile, isLoading, mutate } = useUserProfile();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestCancellation = async () => {
    if (!userProfile) return;
    setIsRequesting(true);
    try {
        const result = await requestCancellation({
            userId: userProfile.uid,
            userName: userProfile.name || userProfile.email,
            userEmail: userProfile.email,
            plan: userProfile.subscriptionStatus,
        });
        if (result.success) {
            toast({ title: "Solicitação Enviada", description: result.message });
            mutate();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro na solicitação", description: error.message });
    } finally {
        setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
       <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }
  
  const currentPlanName = userProfile?.subscriptionStatus
    ? subscriptionStatusToPlanName[userProfile.subscriptionStatus.toLowerCase()] || userProfile.subscriptionStatus
    : "Nenhum";

  const paymentMethod = userProfile?.lastPaymentMethod;

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tighter text-glow">Sua Assinatura</h1>
          <p className="text-muted-foreground">
            Garanta seu legado com um plano que atenda às suas necessidades.
          </p>
        </div>

        {/* Notificação de Cancelamento Pendente */}
        {userProfile?.cancellationRequested && (
            <div className="mx-auto max-w-4xl w-full">
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center gap-3 text-amber-500 mb-6 animate-fade-in-up">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">Você possui uma solicitação de cancelamento em análise. Responderemos em breve.</p>
                </div>
            </div>
        )}

        <div className="mx-auto grid max-w-4xl items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlanName.toLowerCase();
            const planNameLower = plan.name.toLowerCase();
            const cardCheckoutLink = `/checkout/${planNameLower}`;
            const pixCheckoutLink = `/pix-checkout/${planNameLower}`;

            const Icon = planIcons[plan.name] || Shield;
            
            return (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col relative",
                  isCurrent && "border-primary ring-2 ring-primary shadow-lg"
                )}
              >
                <CardHeader className="items-center">
                  {isCurrent && (
                    <div className="absolute -top-3 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground font-black tracking-tighter">
                      Plano Atual
                    </div>
                  )}
                  <Icon className="mb-2 h-8 w-8 text-accent" />
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.priceYearly !== "N/A"
                      ? `${plan.priceYearly}/ano`
                      : `${plan.priceMonthly}/mês`}
                  </CardDescription>
                  {plan.discount && (
                    <p className="text-xs font-bold text-accent">
                      {plan.discount}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-center text-4xl font-bold">
                    {plan.storage}
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {isCurrent ? (
                     <div className="w-full flex flex-col gap-3">
                        <Button className="w-full" disabled variant="outline">
                            Você está neste plano
                        </Button>
                        {paymentMethod && (
                            <Badge variant="secondary" className="mx-auto">
                                {paymentMethod === 'card' ? 'Pago com Cartão' : 'Pago com PIX'}
                            </Badge>
                        )}
                        
                        {/* Seção de Cancelamento */}
                        {!userProfile.cancellationRequested && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Solicitar Cancelamento
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Deseja cancelar sua proteção?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Ao cancelar, o monitoramento de inatividade (Dead Man's Switch) será desativado e seu legado não será entregue em caso de imprevistos. Sua solicitação será enviada para nossa equipe de auditoria para exclusão dos dados.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Continuar Protegido</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={handleRequestCancellation} 
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {isRequesting ? <Loader2 className="animate-spin" /> : "Confirmar Solicitação"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                     </div>
                  ) : (
                    <>
                      {plan.name !== 'Teste' && (
                        <>
                          <Button asChild className="w-full button-glow">
                            <Link href={cardCheckoutLink}>
                               <CreditCard className="mr-2 h-4 w-4" /> Assinar com Cartão
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full">
                            <Link href={pixCheckoutLink} className="flex items-center gap-2">
                               <DollarSign className="mr-2 h-4 w-4" /> Pagar com PIX
                            </Link>
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
  );
}
