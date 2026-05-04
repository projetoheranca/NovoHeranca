
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
import { Lock, Loader2, Check, AlertTriangle, Copy, CheckCircle2, Clock, RefreshCw, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useSession } from "@/context/session-provider";
import { createPixCheckoutSession, verifyPixPayment } from "@/lib/pix-actions";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type PixData = {
    qrCodeBase64: string;
    qrCode: string;
    paymentId: number;
}

export default function PixCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { session, isLoading: isSessionLoading, logout } = useSession();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const planName = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const email = session?.email || "";

  useEffect(() => {
    // Só executa a lógica DEPOIS que o carregamento da sessão terminar.
    if (isSessionLoading) return;

    // Se, após o carregamento, não houver sessão, aí sim redireciona.
    if (!session) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa se cadastrar ou fazer login para pagar com PIX.",
        variant: "destructive",
      });
      // Leva para o signup com o método PIX para iniciar o fluxo correto
      router.push(`/signup?plan=${planName}&method=pix`);
    }
  }, [session, isSessionLoading, router, planName, toast]);

  const plan = MOCK_SUBSCRIPTION_PLANS.find(
    (p) => p.name.toLowerCase() === planName
  );

  const handleCancelPurchase = () => {
    logout();
    router.push('/login');
  };

  const handlePixPayment = async () => {
    if (!session?.uid || !plan) {
      toast({
        title: "Sessão ou plano inválido",
        description: "Recarregue a página e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPixCheckoutSession({
        userId: session.uid,
        plan: plan.name.toLowerCase(),
      });

      if (result.success && result.qrCodeBase64 && result.qrCode && result.paymentId) {
        setPixData({
            qrCodeBase64: result.qrCodeBase64,
            qrCode: result.qrCode,
            paymentId: result.paymentId,
        });
      } else {
        throw new Error(result.message || "Não foi possível gerar o código PIX.");
      }
    } catch (error: any) {
      toast({
        title: "Erro no Checkout PIX",
        description: error.message || "Ocorreu um erro ao tentar processar seu pagamento.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!pixData?.paymentId) return;

    setIsVerifying(true);
    toast({ title: 'Verificando pagamento...', description: 'Aguarde um momento.' });

    try {
        const result = await verifyPixPayment({ paymentId: pixData.paymentId });
        if (result.success && result.isApproved) {
            toast({
                title: 'Pagamento Confirmado!',
                description: 'Sua assinatura está ativa. Redirecionando...',
                className: 'bg-green-500 text-black',
                duration: 5000,
            });
            router.push('/checkout/success?pix=true');
        } else {
             toast({
                variant: 'destructive',
                title: 'Pagamento não confirmado',
                description: result.message || 'O pagamento ainda não foi aprovado. Por favor, aguarde alguns instantes e tente novamente.',
            });
        }
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Erro na Verificação',
            description: error.message || 'Não foi possível verificar o pagamento.',
        });
    } finally {
        setIsVerifying(false);
    }
  };


  const copyToClipboard = () => {
    if (pixData?.qrCode) {
        navigator.clipboard.writeText(pixData.qrCode);
        setIsCopied(true);
        toast({ title: 'Copiado!', description: 'O código PIX foi copiado para a área de transferência.' });
        setTimeout(() => setIsCopied(false), 2000);
    }
  }

  // Enquanto a sessão estiver carregando ou se não houver sessão (e o useEffect ainda não redirecionou)
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
            <p className="text-muted-foreground">O plano que você está tentando acessar não existe.</p>
            <Button asChild className="mt-4">
              <a href="/pricing">Ver Planos</a>
            </Button>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }
  
  const price = plan.priceYearly !== "N/A" ? plan.priceYearly : plan.priceMonthly;
  const period = plan.name === 'Anual' ? "/ano" : (plan.name === 'Mensal' ? "/mês" : "");
  const planFeatures = plan.features.filter(
    (feature) => !feature.toLowerCase().includes("30 dias de teste")
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center pt-28 md:pt-32 pb-12 px-4">
        <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign />
                Pagamento com PIX
              </CardTitle>
               <CardDescription>
                {pixData ? "Escaneie o QR Code ou copie o código para pagar." : "Gere o código PIX para finalizar sua assinatura."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {pixData ? (
                    <div className="space-y-4 text-center animate-fade-in-up">
                        <Image 
                            src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`}
                            alt="PIX QR Code"
                            width={256}
                            height={256}
                            className="mx-auto rounded-lg border-4 border-primary image-glow"
                        />
                        <Label htmlFor="pix-code">Ou use o PIX Copia e Cola:</Label>
                        <div className="flex gap-2">
                            <Input id="pix-code" readOnly value={pixData.qrCode} className="text-xs" />
                            <Button size="icon" onClick={copyToClipboard}>
                                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Alert variant="default" className="border-primary/50 text-left">
                            <Clock className="h-4 w-4 text-primary" />
                            <AlertTitle>Aguardando Pagamento</AlertTitle>
                            <AlertDescription>
                                Após pagar, clique no botão abaixo para confirmar. Sua assinatura será ativada e você será redirecionado.
                            </AlertDescription>
                        </Alert>
                         <div className="flex flex-col gap-2">
                            <Button onClick={handleVerifyPayment} disabled={isVerifying} className="w-full">
                                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Realizei o pagamento
                            </Button>
                            <Button onClick={handlePixPayment} variant="outline" size="sm" disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Gerar Novo QR Code
                            </Button>
                            <Button onClick={handleCancelPurchase} type="button" variant="link" size="sm" className="text-muted-foreground mt-2">
                                Cancelar compra
                            </Button>
                         </div>
                    </div>
                ) : (
                    <>
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Atenção: Pagamento Imediato</AlertTitle>
                            <AlertDescription>
                                Ao escolher PIX, você será cobrado imediatamente e <strong>não terá</strong> o período de teste gratuito de 30 dias. O acesso é liberado após a confirmação.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                        <Label htmlFor="email">E-mail da Conta</Label>
                        <Input id="email" type="email" value={email} required disabled />
                        </div>
                        
                        <div className="text-xs text-muted-foreground pt-2 text-center">
                            <p>✅ <strong>Garantia de 7 dias:</strong> Você pode solicitar reembolso integral em até 7 dias após o pagamento, conforme o Código de Defesa do Consumidor.</p>
                        </div>
                        
                        <Button onClick={handlePixPayment} className="w-full button-glow" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <Lock className="mr-2 h-4 w-4" />
                            )}
                        Gerar PIX para Pagamento
                        </Button>
                        <Button onClick={handleCancelPurchase} type="button" variant="link" size="sm" className="text-muted-foreground mt-2 w-full">
                            Cancelar compra
                        </Button>
                    </>
                )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Resumo do Pedido</h2>
            <Card className="bg-background">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
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
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-2xl tracking-tighter">
                    {price}
                    <span className="text-sm font-normal text-muted-foreground">{period}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
            <div className="p-4 border rounded-lg bg-background">
                <h3 className="font-semibold mb-2">Recursos Incluídos:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {planFeatures.map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
