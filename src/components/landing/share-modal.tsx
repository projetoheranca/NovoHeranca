
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


export function ShareContent({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Link de afiliado dinâmico
  const referralLink = `https://minhaherancadigital.com/signup?ref=${userId}`;

  // Templates de compartilhamento com o link dinâmico
  const shareTemplates = {
    instagram: `👨‍👩‍👧‍👦 Proteja o futuro da sua família!
  Descobri o @MinhaHerancaDigital, uma plataforma para guardar senhas, documentos e vídeos para serem entregues aos seus herdeiros.
  Você não controla quando vai partir, mas pode garantir que nada se perca.
  Use meu link para ganhar um bônus: ${referralLink}
  #legadodigital #planejamentofamiliar #heranca`,

    facebook: `E se você não estivesse aqui amanhã? Suas informações mais importantes (senhas de banco, códigos de crypto, vídeos de família) chegariam às pessoas certas?
  Descobri o Minha Herança Digital, um cofre digital que garante a entrega segura do seu legado. É a paz de espírito que toda família precisa.
  Saiba mais e ganhe um bônus com meu link: ${referralLink}`,

    youtube: `Título: O QUE SUA FAMÍLIA PERDERIA SE VOCÊ PARTISSE HOJE? (Herança Digital)
  Descrição:
  Neste vídeo, falo sobre um assunto sério, mas essencial: planejamento de legado digital. Muita gente perde acesso a informações vitais, como senhas de banco e códigos de criptomoedas, quando um ente querido parte.
  Eu encontrei uma solução incrível chamada Minha Herança Digital, que resolve esse problema. É um cofre digital seguro que entrega suas informações automaticamente para quem você escolher.
  Garanta o futuro da sua família: ${referralLink}`,

    linkedin: `Como líder e profissional, pensamos em planejamento de carreira, financeiro, mas e o planejamento de legado? Informações críticas de negócios, acessos e até patrimônios digitais podem se perder sem a devida preparação.
  Conheci a plataforma Minha Herança Digital, uma solução robusta de "digital vault" e "dead man's switch" com criptografia de ponta-a-ponta, que resolve essa questão com segurança e profissionalismo. Uma ferramenta essencial para a governança de ativos digitais pessoais e de pequenos negócios.
  Recomendo a análise: ${referralLink}
  #digitallegacy #assetprotection #businesscontinuity #estateplanning`,
  };


  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copiado!",
        description: "O texto e o link foram copiados para a área de transferência.",
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="referral-link">Seu Link de Afiliado Pessoal</Label>
          <div className="flex gap-2">
            <Input id="referral-link" value={referralLink} readOnly />
            <Button size="icon" onClick={() => handleCopyToClipboard(referralLink)}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Ou compartilhe com um texto pronto:</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="transition-colors duration-300 hover:border-[#E1306C] hover:shadow-[0_0_10px_#E1306C]"
              onClick={() => handleCopyToClipboard(shareTemplates.instagram)}
            >
              <Instagram className="mr-2 h-4 w-4 text-[#E1306C]" /> Instagram
            </Button>
            <Button
              variant="outline"
               className="transition-colors duration-300 hover:border-[#1877F2] hover:shadow-[0_0_10px_#1877F2]"
              onClick={() => handleCopyToClipboard(shareTemplates.facebook)}
            >
              <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" /> Facebook
            </Button>
            <Button
              variant="outline"
               className="transition-colors duration-300 hover:border-[#FF0000] hover:shadow-[0_0_10px_#FF0000]"
              onClick={() => handleCopyToClipboard(shareTemplates.youtube)}
            >
              <Youtube className="mr-2 h-4 w-4 text-[#FF0000]" /> YouTube
            </Button>
            <Button
              variant="outline"
               className="transition-colors duration-300 hover:border-[#0A66C2] hover:shadow-[0_0_10px_#0A66C2]"
              onClick={() => handleCopyToClipboard(shareTemplates.linkedin)}
            >
              <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" /> LinkedIn
            </Button>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">
          O crédito de 1 mês será aplicado automaticamente na sua conta quando um novo usuário assinar um plano pago através do seu link.
        </p>
      </div>
    </>
  );
}
