import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  contact_name: string;
  user_name: string;
}

export const ConfirmacaoAceiteEmail: React.FC<TemplateProps> = ({ contact_name, user_name }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✅ Obrigado!</h1>}>
        <p>Olá <strong>{contact_name}</strong>,</p>
        <div className="success-box">
            <strong>✅ Confirmado!</strong> Você aceitou ser Contato de Verificação de {user_name}.
        </div>
        <p>Obrigado por aceitar esta responsabilidade. {user_name} confia em você para ajudar a garantir que suas memórias sejam entregues apenas no momento certo.</p>
        <p><strong>O que esperar:</strong></p>
        <ul>
            <li>Você SÓ será contatado se {user_name} ficar inativo por 90 dias</li>
            <li>Receberá um email pedindo confirmação</li>
            <li>Sua resposta será confidencial</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Esperamos nunca precisar entrar em contato com você para este fim. 🙏
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const ConfirmacaoAceiteText = ({ contact_name, user_name }: TemplateProps): string => `
✅ Obrigado por Aceitar!
Olá ${contact_name},

✅ CONFIRMADO! Você aceitou ser Contato de Verificação de ${user_name}.
Obrigado por aceitar esta responsabilidade. ${user_name} confia em você para ajudar a garantir que suas memórias sejam entregues apenas no momento certo.

O QUE ESPERAR:
- Você SÓ será contatado se ${user_name} ficar inativo por 90 dias
- Receberá um email pedindo confirmação
- Sua resposta será confidencial

Esperamos nunca precisar entrar em contato com você para este fim. 🙏
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
