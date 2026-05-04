
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPixCheckoutSession } from "@/lib/pix-actions";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PixData = {
  qrCodeBase64: string;
  qrCode: string;
  paymentId: number;
};

export default function TestPixPage() {
  const [userId, setUserId] = useState("user_test_id"); // Default test user
  const [plan, setPlan] = useState("mensal");
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleGeneratePix = async () => {
    if (!userId || !plan) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, insira o ID do usuário e selecione um plano.",
      });
      return;
    }

    setIsLoading(true);
    setPixData(null);

    try {
      const result = await createPixCheckoutSession({ userId, plan });
      if (result.success && result.qrCodeBase64 && result.qrCode) {
        setPixData({
            qrCodeBase64: result.qrCodeBase64,
            qrCode: result.qrCode,
            paymentId: result.paymentId!,
        });
        toast({ title: "PIX Gerado!", description: "Aguardando pagamento." });
      } else {
        throw new Error(result.message || "Falha ao gerar o PIX.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Gerar PIX",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (pixData?.qrCode) {
        navigator.clipboard.writeText(pixData.qrCode);
        setIsCopied(true);
        toast({ title: 'Copiado!', description: 'O código PIX foi copiado.' });
        setTimeout(() => setIsCopied(false), 2000);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode /> Teste de Pagamento PIX (Mercado Pago)
          </CardTitle>
          <CardDescription>
            Simule a geração de um QR Code PIX para um usuário e plano específicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!pixData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">ID do Usuário</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Insira o ID do Firebase do usuário"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={plan} onValueChange={setPlan} disabled={isLoading}>
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Plano Mensal (R$ 24,90)</SelectItem>
                    <SelectItem value="anual">Plano Anual (R$ 209,30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGeneratePix} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : "Gerar PIX de Teste"}
              </Button>
            </div>
          ) : (
             <div className="space-y-4 text-center animate-fade-in-up">
                <Alert>
                    <AlertTitle className="font-bold">Webhook Ativo</AlertTitle>
                    <AlertDescription>
                        Ao pagar este PIX, o webhook em <code className="text-xs font-mono">/api/webhooks/mercadopago-pix</code> será acionado para ativar a conta do usuário.
                    </AlertDescription>
                </Alert>
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
                 <Button variant="outline" onClick={() => setPixData(null)}>
                    Gerar Novo PIX
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
