"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Copy,
  Check,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


export function ShareContent({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://minhaherancadigital.com/signup?ref=${userId}`;

  const shareTemplates = {
    instagram: `Poste uma foto ou vídeo que represente seu legado e use esta legenda:

"Qual legado você deixará para trás? 👨‍👩‍👧‍👦

Descobri o @MinhaHerancaDigital, uma plataforma para guardar senhas, documentos e vídeos para serem entregues aos seus herdeiros. Você não controla quando vai partir, mas pode garantir que nada se perca.

Use meu link para começar a proteger sua família também: ${referralLink}

#legadodigital #planejamentofamiliar #herança #segurança"`,

    facebook: `E se você não estivesse aqui amanhã? Suas informações mais importantes (senhas de banco, códigos de crypto, vídeos de família) chegariam às pessoas certas?

Descobri o Minha Herança Digital, um cofre digital que garante a entrega segura do seu legado. É a paz de espírito que toda família precisa.

Saiba mais e comece a proteger seu legado hoje: ${referralLink}`,

    youtube: `🚨 URGENTE: O que sua família perderia se você partisse hoje?

Milhões são perdidos todos os anos porque informações cruciais (senhas de banco, códigos de crypto, localização de bens) desaparecem com quem partiu.

Assista a este vídeo e descubra como garantir que seu legado chegue seguro às mãos de quem você ama:
https://youtu.be/SEU_VIDEO_ID_AQUI

Proteja o futuro da sua família agora mesmo com o Minha Herança Digital. Comece por aqui: ${referralLink}`,

    linkedin: `Como líder e profissional, pensamos em planejamento de carreira e financeiro, mas e o planejamento de legado digital? Informações críticas de negócios, acessos e até patrimônios digitais podem se perder sem a devida preparação.

Conheci a plataforma Minha Herança Digital, uma solução robusta de "digital vault" e "dead man's switch" com criptografia de ponta-a-ponta, que resolve essa questão com segurança e profissionalismo. Uma ferramenta essencial para a governança de ativos digitais pessoais e de pequenos negócios.

Recomendo a análise: ${referralLink}

#digitallegacy #assetprotection #businesscontinuity #estateplanning`,
  };


  const handleCopyToClipboard = (textToCopy: string, isLinkOnly: boolean = false) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copiado!",
        description: isLinkOnly ? "Seu link de indicação exclusivo foi copiado." : "O texto da postagem foi copiado com sucesso.",
      });
      if (isLinkOnly) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-muted/30 p-6 rounded-xl border border-primary/10 shadow-inner">
            <Label htmlFor="referral-link" className="text-base font-bold mb-3 block text-center">
                Seu Link de Indicação Exclusivo
            </Label>
            <div className="flex gap-2">
                <Input 
                    id="referral-link" 
                    value={referralLink} 
                    readOnly 
                    className="bg-background font-mono text-xs md:text-sm border-primary/20 focus-visible:ring-neon-blue"
                />
                <Button 
                    size="icon" 
                    onClick={() => handleCopyToClipboard(referralLink, true)}
                    className={cn(
                        "shrink-0 transition-all duration-300",
                        copied ? "bg-green-500 hover:bg-green-600" : "button-glow"
                    )}
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
                Compartilhe este link diretamente para ganhar seu <span className="text-neon-blue font-bold">Mês Grátis</span>.
            </p>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Compartilhar Textos Prontos</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="justify-start h-12 transition-all duration-300 hover:border-[#E1306C] hover:bg-[#E1306C]/5 group"
                    onClick={() => handleCopyToClipboard(shareTemplates.instagram)}
                >
                    <Instagram className="mr-3 h-5 w-5 text-[#E1306C] group-hover:scale-110 transition-transform" />
                    <span>Copiar Legenda Instagram</span>
                </Button>
                <Button
                    variant="outline"
                    className="justify-start h-12 transition-all duration-300 hover:border-[#1877F2] hover:bg-[#1877F2]/5 group"
                    onClick={() => handleCopyToClipboard(shareTemplates.facebook)}
                >
                    <Facebook className="mr-3 h-5 w-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
                    <span>Copiar Post Facebook</span>
                </Button>
                <Button
                    variant="outline"
                    className="justify-start h-12 transition-all duration-300 hover:border-[#FF0000] hover:bg-[#FF0000]/5 group"
                    onClick={() => handleCopyToClipboard(shareTemplates.youtube)}
                >
                    <Youtube className="mr-3 h-5 w-5 text-[#FF0000] group-hover:scale-110 transition-transform" />
                    <span>Roteiro para YouTube</span>
                </Button>
                <Button
                    variant="outline"
                    className="justify-start h-12 transition-all duration-300 hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 group"
                    onClick={() => handleCopyToClipboard(shareTemplates.linkedin)}
                >
                    <Linkedin className="mr-3 h-5 w-5 text-[#0A66C2] group-hover:scale-110 transition-transform" />
                    <span>Copiar Post LinkedIn</span>
                </Button>
            </div>
        </div>

        <div className="pt-4 border-t border-dashed">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-neon-blue/5 border border-neon-blue/20">
                <div className="h-2 w-2 rounded-full bg-neon-blue mt-1.5 animate-pulse shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Como funciona o bônus:</strong> Quando um novo usuário assina qualquer plano pago através do seu link, creditamos automaticamente <span className="text-neon-blue font-bold">30 dias extras</span> na sua assinatura atual. Sem limites de indicações!
                </p>
            </div>
        </div>
    </div>
  );
}