
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  amount: string;
  update_payment_link: string;
}

export const PagamentoFalhouEmail: React.FC<TemplateProps> = ({ name, amount, update_payment_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🤔 Problema com sua Assinatura</h1>} headerClass="header-warning">
        <p>Olá <strong>{name}</strong>,</p>
        <p>Esperamos que esteja tudo bem. Identificamos que não foi possível processar a renovação da sua assinatura.</p>
        <p>Isso geralmente acontece por alguns motivos simples:</p>
        <ul>
            <li>O cartão de crédito expirou.</li>
            <li>Não havia saldo ou limite suficiente no momento da cobrança.</li>
            <li>Os dados do cartão precisam ser atualizados.</li>
        </ul>
        <p>Para manter seu legado digital sempre protegido e ativo, que tal dar uma olhadinha nos seus dados de pagamento? É rápido e fácil!</p>
        <p style={{ textAlign: 'center' }}>
            <a href={update_payment_link} className="button">Verificar Dados de Pagamento</a>
        </p>
        <div className="alert-box">
            <strong>Fique tranquilo:</strong> Suas memórias e informações continuam seguras conosco. Tentaremos a cobrança novamente em alguns dias.
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Se precisar de qualquer ajuda ou tiver alguma dúvida, é só responder a este e-mail. Nossa equipe está pronta para te ajudar!
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const PagamentoFalhouText = ({ name, amount, update_payment_link }: TemplateProps): string => `
🤔 Problema com sua Assinatura - Minha Herança Digital
Olá ${name},

Esperamos que esteja tudo bem. Identificamos que não foi possível processar a renovação da sua assinatura.

Isso geralmente acontece por alguns motivos simples:
- O cartão de crédito expirou.
- Não havia saldo ou limite suficiente no momento da cobrança.
- Os dados do cartão precisam ser atualizados.

Para manter seu legado digital sempre protegido e ativo, que tal dar uma olhadinha nos seus dados de pagamento? É rápido e fácil!
Acesse o link abaixo para verificar:
${update_payment_link}

Fique tranquilo: Suas memórias e informações continuam seguras conosco. Tentaremos a cobrança novamente em alguns dias.

Se precisar de qualquer ajuda, é só responder a este e-mail.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
