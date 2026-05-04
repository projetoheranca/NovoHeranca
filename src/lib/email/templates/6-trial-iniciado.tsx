
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  trial_end: string;
  plan: string;
  price: string;
}

export const TrialIniciadoEmail: React.FC<TemplateProps> = ({ name, trial_end, plan, price }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🎉 Trial Iniciado!</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div className="success-box">
            <strong>✅ Sucesso!</strong> Seu período de teste de 14 dias começou. Aproveite todos os recursos!
        </div>
        <p><strong>Detalhes da sua assinatura:</strong></p>
        <ul>
            <li>Plano: <strong>{plan}</strong></li>
            <li>Trial até: <strong>{trial_end}</strong></li>
            <li>Primeira cobrança: <strong>R$ {price}</strong> em {trial_end}</li>
        </ul>
        <p><strong>O que você pode fazer agora:</strong></p>
        <ul>
            <li>✅ Adicionar memórias (vídeos, fotos, áudios, textos)</li>
            <li>✅ Cadastrar seus herdeiros digitais</li>
            <li>✅ Configurar o sistema de inatividade</li>
        </ul>
        <p style={{ textAlign: 'center' }}>
            <a href="https://minhaherancadigital.com/dashboard" className="button">Acessar Meu Painel</a>
        </p>
        <div className="alert-box">
            <strong>💡 Lembrete:</strong> Você pode cancelar a qualquer momento antes de {trial_end} diretamente no seu painel. Nenhuma cobrança será feita se você cancelar dentro do prazo.
        </div>
    </EmailContainer>
  </BaseLayout>
);

export const TrialIniciadoText = ({ name, trial_end, plan, price }: TemplateProps): string => `
🎉 Seu Período de Teste de 14 Dias Começou!
Olá ${name},

✅ SUCESSO! Seu período de teste de 14 dias começou. Aproveite todos os recursos ilimitados!
DETALHES DA SUA ASSINATURA:
- Plano: ${plan}
- Trial até: ${trial_end}
- Primeira cobrança: R$ ${price} em ${trial_end}

Acesse o app: https://minhaherancadigital.com/dashboard

💡 LEMBRETE: Você pode cancelar a qualquer momento antes do término do período de teste. Não haverá cobrança se cancelar antes de ${trial_end}.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
