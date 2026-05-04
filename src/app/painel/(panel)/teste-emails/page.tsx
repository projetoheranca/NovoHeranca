
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Zap, Clock, Info, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendSingleTestEmail, handleInactiveUserCheck } from "@/lib/actions";
import { type TemplatePayloads } from "@/lib/email/send-email";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Agrupar os templates por categoria para melhor organização na UI
const emailTriggers: { category: string; triggers: { key: keyof TemplatePayloads; description: string; days?: number; }[] }[] = [
    {
        category: "Autenticação",
        triggers: [
            { key: 'auth.confirmation', description: 'Enviado ao criar uma nova conta para verificação de e-mail.' },
            { key: 'auth.passwordReset', description: 'Enviado quando o usuário solicita a redefinição de senha.' },
        ]
    },
    {
        category: "Pagamentos e Assinatura",
        triggers: [
            { key: 'payment.trialStarted', description: 'Enviado quando o usuário inicia o período de teste de 30 dias.' },
            { key: 'payment.pixActivated', description: 'Confirmação de assinatura ativada após pagamento com PIX.' },
            { key: 'payment.succeeded', description: 'Confirmação de pagamento recorrente (mensal/anual).' },
            { key: 'payment.failed', description: 'Alerta sobre falha no pagamento da assinatura.' },
            { key: 'payment.trialEnding', description: 'Lembrete enviado 3 dias antes do fim do período de teste.' },
            { key: 'payment.pixRenewalNotice', description: 'Aviso de renovação PIX (7 dias).', days: 7 },
            { key: 'payment.pixRenewalNotice', description: 'Aviso de renovação PIX (3 dias).', days: 3 },
            { key: 'payment.pixRenewalNotice', description: 'Aviso de renovação PIX (1 dia).', days: 1 },
        ]
    },
    {
        category: "Check-in (Dead Man's Switch)",
        triggers: [
            { key: 'checkin.reminder', description: 'Lembrete para o usuário fazer o check-in.' },
            { key: 'checkin.confirmed', description: 'Confirmação enviada após o usuário fazer o check-in.' },
        ]
    },
    {
        category: "Verificação e Entrega",
        triggers: [
            { key: 'checkin.verificationStarted', description: 'Alerta URGENTE para o usuário quando o processo de verificação de inatividade começa.' },
            { key: 'verification.request', description: 'E-mail para o contato secundário solicitando confirmação de falecimento.' },
            { key: 'delivery.padrão', description: 'E-mail principal com a memória enviada para o herdeiro.' },
        ]
    }
];


export default function GatilhosDeEmailPage() {
  const [targetEmail, setTargetEmail] = useState("");
  const [isSending, setIsSending] = useState<string | null>(null);
  const [isCheckingLogic, setIsCheckingLogic] = useState(false);
  const [report, setReport] = useState<{ logs: string[], checked: number, processed: number } | null>(null);
  const { toast } = useToast();

  const handleSendEmail = async (template: keyof TemplatePayloads, days?: number) => {
    if (!targetEmail) {
      toast({
        variant: "destructive",
        title: "E-mail necessário",
        description: "Por favor, insira um e-mail de destino.",
      });
      return;
    }

    const sendingId = `${template}-${days || ''}`;
    setIsSending(sendingId);
    toast({
      title: "Iniciando envio...",
      description: `Enviando gatilho de teste '${template}' para ${targetEmail}.`,
    });

    try {
      const result = await sendSingleTestEmail({ to: targetEmail, template, days });
      if (result.success) {
        toast({
          title: "Envio Concluído!",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Envio",
        description:
          error.message || "Ocorreu um erro ao tentar enviar o e-mail.",
      });
    } finally {
      setIsSending(null);
    }
  };

  const handleRunDailyCheck = async () => {
    setIsCheckingLogic(true);
    setReport(null); // Clear previous report
    toast({
        title: "Iniciando Simulação",
        description: "Executando a lógica diária para todos os usuários. Isso pode levar um momento.",
    });

    try {
        const result = await handleInactiveUserCheck();
        if (result.success) {
            setReport({ logs: result.logs, checked: result.checked, processed: result.processed });
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Erro na Simulação",
            description: error.message || "Ocorreu um erro ao executar a lógica diária.",
        });
    } finally {
        setIsCheckingLogic(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Gatilhos de E-mail
        </h1>
      </div>
      
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Teste de Lógica Completa (Simulação do Timer Diário)</CardTitle>
          <CardDescription>
            Este botão executa a mesma função que o "relógio" diário do sistema (`handleInactiveUserCheck`). Ele verificará todos os usuários e disparará as ações necessárias (lembretes, verificações, envios, etc.) com base em suas configurações atuais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunDailyCheck} disabled={isCheckingLogic}>
            {isCheckingLogic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Disparar Verificação Diária Completa
          </Button>
        </CardContent>
      </Card>


      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Teste de Aparência dos Templates</CardTitle>
          <CardDescription>
            Use esta ferramenta para testar individualmente a aparência de cada e-mail transacional do sistema. Insira um e-mail de destino e clique no gatilho que deseja testar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-8 max-w-md">
            <Label htmlFor="email">Email de Destino</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu-email-de-teste@exemplo.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              required
              disabled={!!isSending || isCheckingLogic}
            />
          </div>
          
          <div className="space-y-8">
            {emailTriggers.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.triggers.map((trigger) => {
                    const sendingId = `${trigger.key}-${trigger.days || ''}`;
                    return (
                      <Card key={sendingId} className="flex flex-col">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base">{trigger.key}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-sm text-muted-foreground">{trigger.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => handleSendEmail(trigger.key as keyof TemplatePayloads, trigger.days)}
                            disabled={!!isSending || isCheckingLogic}
                            className="w-full"
                          >
                            {isSending === sendingId ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="mr-2 h-4 w-4" />
                            )}
                            Testar Gatilho
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
       <Dialog open={!!report} onOpenChange={(isOpen) => !isOpen && setReport(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Relatório da Verificação Diária</DialogTitle>
            <DialogDescription>
              {`Verificação concluída. ${report?.checked ?? 0} usuários checados, ${report?.processed ?? 0} ações processadas.`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4 border rounded-md p-2 bg-muted/20">
             <div className="space-y-2 text-sm font-mono">
              {report?.logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mb-2 text-green-500"/>
                    <p className="font-sans font-semibold">Tudo em ordem!</p>
                    <p className="font-sans text-xs">Nenhuma ação foi necessária para os usuários verificados.</p>
                </div>
              ) : (
                report?.logs.map((log, index) => {
                    const match = log.match(/^\[(SUCCESS|WARN|ERROR|ACTION|INFO)\]\s(?:\[(.*?)\]\s)?(.*)$/);
                    
                    let status = 'INFO';
                    let userIdentifier = '';
                    let message = log;

                    if (match) {
                    status = match[1];
                    userIdentifier = match[2] || '';
                    message = match[3];
                    }

                    const isError = status === 'ERROR';
                    const isWarn = status === 'WARN';
                    const isSuccess = status === 'SUCCESS';

                    const Icon = isError ? XCircle :
                                isWarn ? AlertTriangle :
                                isSuccess ? CheckCircle :
                                Info;
                    
                    const colorClass = isError ? 'text-destructive' :
                                    isWarn ? 'text-yellow-500' :
                                    isSuccess ? 'text-green-500' :
                                    'text-muted-foreground';

                    return (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 font-sans">
                        <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", colorClass)} />
                        <div className="flex-1">
                        {userIdentifier && (
                            <span className="font-semibold text-primary/90 mr-2 break-all">{userIdentifier}</span>
                        )}
                        <span className="text-muted-foreground break-words">{message}</span>
                        </div>
                    </div>
                    );
                })
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setReport(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
