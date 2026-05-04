import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  plan: string;
  renewal_link: string;
  days: number;
}

export const PixRenovacaoAvisoEmail: React.FC<TemplateProps> = ({ name, plan, renewal_link, days }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🔔 Renove sua Assinatura</h1>} headerClass="header-warning">
        <p>Olá <strong>{name}</strong>,</p>
        <p>Sua assinatura do plano <strong>{plan}</strong> expira em <strong>{days} dia(s)</strong>. Para continuar protegendo seu legado digital sem interrupções, é hora de renovar.</p>
        <div className="alert-box">
            <strong>Lembrete:</strong> Como seu último pagamento foi via PIX, a renovação é feita através de um novo pagamento manual. É simples e rápido!
        </div>
        <p>Clique no botão abaixo para escolher seu plano e gerar um novo PIX:</p>
        <p style={{ textAlign: 'center' }}>
            <a href={renewal_link} className="button">Renovar Minha Assinatura</a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Suas memórias estão seguras, mas o acesso completo à sua conta e o monitoramento de inatividade (Dead Man's Switch) dependem de uma assinatura ativa.
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
            Agradecemos por sua confiança em nosso serviço.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const PixRenovacaoAvisoText = ({ name, plan, renewal_link, days }: TemplateProps): string => `
🔔 Renove sua assinatura ${plan}
Olá ${name},

Sua assinatura do plano ${plan} expira em ${days} dia(s). Para continuar protegendo seu legado digital sem interrupções, é hora de renovar.

Lembrete: Como seu último pagamento foi via PIX, a renovação é feita através de um novo pagamento manual. É simples e rápido!

Clique no link abaixo para escolher seu plano e gerar um novo PIX:
${renewal_link}

Suas memórias estão seguras, mas o acesso completo e o monitoramento de inatividade (Dead Man's Switch) dependem de uma assinatura ativa.

Agradecemos por sua confiança.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
