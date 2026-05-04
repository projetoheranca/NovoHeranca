
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  plan: string;
  next_billing: string;
  price: string;
}

export const AssinaturaPixAtivadaEmail: React.FC<TemplateProps> = ({ name, plan, next_billing, price }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✅ Assinatura Ativada!</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div className="success-box">
            <strong>🎉 Bem-vindo!</strong> Seu pagamento via PIX foi confirmado e sua assinatura está ativa.
        </div>
        <p><strong>Detalhes da sua assinatura:</strong></p>
        <ul>
            <li>Plano: <strong>{plan}</strong></li>
            <li>Valor pago: <strong>R$ {price}</strong></li>
            <li>Próxima cobrança: <strong>{next_billing}</strong></li>
            <li>Método: <strong>PIX</strong></li>
        </ul>
        <p><strong>Recursos disponíveis:</strong></p>
        <ul>
            <li>✅ Memórias ilimitadas</li>
            <li>✅ Herdeiros ilimitados</li>
            <li>✅ 50GB de armazenamento (ou 100GB no plano Anual)</li>
            <li>✅ Dead Man's Switch</li>
            <li>✅ Suporte prioritário</li>
        </ul>
        <p style={{ textAlign: 'center' }}>
            <a href="https://minhaherancadigital.com/dashboard" className="button">Acessar o App</a>
        </p>
        <div className="alert-box">
            <strong>🛡️ Garantia de Reembolso de 7 Dias</strong><br/>
            Conforme o Código de Defesa do Consumidor, você tem 7 dias corridos a partir de hoje para solicitar o reembolso integral. Para isso, basta enviar um e-mail para help@minhaherancadigital.com com o assunto "Solicitação de Reembolso", informando seu nome e e-mail de cadastro. O prazo de processamento é de até 7 dias úteis.
        </div>
    </EmailContainer>
  </BaseLayout>
);

export const AssinaturaPixAtivadaText = ({ name, plan, next_billing, price }: TemplateProps): string => `
✅ Assinatura Ativada - Bem-vindo!
Olá ${name},

🎉 BEM-VINDO! Seu pagamento via PIX foi confirmado e sua assinatura está ativa.
DETALHES DA SUA ASSINATURA:
- Plano: ${plan}
- Valor pago: R$ ${price}
- Próxima cobrança: ${next_billing}
- Método: PIX

RECURSOS DISPONÍVEIS:
✅ Memórias ilimitadas
✅ Herdeiros ilimitados
✅ 50GB de armazenamento (ou 100GB no plano Anual)
✅ Dead Man's Switch
✅ Suporte prioritário

Acessar o app: https://minhaherancadigital.com/dashboard

🛡️ GARANTIA DE REEMBOLSO
Você possui 7 dias corridos a partir de hoje para solicitar reembolso integral. Para isso, envie um e-mail para help@minhaherancadigital.com com o assunto "Solicitação de Reembolso", informando seu nome e e-mail de cadastro. O prazo de processamento é de até 7 dias úteis.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
