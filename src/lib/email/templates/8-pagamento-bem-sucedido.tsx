
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  amount: string;
  date: string;
  next_billing: string;
  invoice_link: string;
}

export const PagamentoBemSucedidoEmail: React.FC<TemplateProps> = ({ name, amount, date, next_billing, invoice_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✅ Pagamento Confirmado</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div className="success-box">
            <strong>✅ Recebido!</strong> Seu pagamento foi processado com sucesso.
        </div>
        <p><strong>Detalhes do pagamento:</strong></p>
        <ul>
            <li>Valor: <strong>R$ {amount}</strong></li>
            <li>Data: <strong>{date}</strong></li>
            <li>Próxima cobrança: <strong>{next_billing}</strong></li>
        </ul>
        <p style={{ textAlign: 'center' }}>
            <a href={invoice_link} className="button">Baixar Nota Fiscal</a>
        </p>
        <div className="alert-box">
            <strong>🛡️ Garantia de Reembolso de 7 Dias</strong><br/>
            Conforme o Código de Defesa do Consumidor, você tem 7 dias corridos a partir da data de pagamento para solicitar o reembolso integral. Para isso, basta enviar um e-mail para help@minhaherancadigital.com com o assunto "Solicitação de Reembolso", informando seu nome e e-mail de cadastro. O prazo de processamento é de até 7 dias úteis.
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Obrigado por confiar suas memórias ao Minha Herança Digital. Estamos aqui para preservar o que é mais importante para você.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const PagamentoBemSucedidoText = ({ name, amount, date, next_billing, invoice_link }: TemplateProps): string => `
✅ Pagamento Confirmado - Obrigado!
Olá ${name},

✅ RECEBIDO! Seu pagamento foi processado com sucesso.
DETALHES DO PAGAMENTO:
- Valor: R$ ${amount}
- Data: ${date}
- Próxima cobrança: ${next_billing}

Baixar nota fiscal: ${invoice_link}

🛡️ GARANTIA DE REEMBOLSO
Você possui 7 dias corridos a partir da data de pagamento para solicitar reembolso integral. Para isso, envie um e-mail para help@minhaherancadigital.com com o assunto "Solicitação de Reembolso", informando seu nome e e-mail de cadastro. O prazo de processamento é de até 7 dias úteis.

Obrigado por confiar suas memórias ao Minha Herança Digital. Estamos aqui para preservar o que é mais importante para você.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
