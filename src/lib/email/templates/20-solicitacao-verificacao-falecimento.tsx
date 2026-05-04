import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  contact_name: string;
  user_name: string;
  confirm_yes_link: string;
  confirm_no_link: string;
}

export const SolicitacaoVerificacaoFalecimentoEmail: React.FC<TemplateProps> = ({ contact_name, user_name, confirm_yes_link, confirm_no_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🚨 Solicitação de Verificação Urgente</h1>} headerClass="header-danger">
        <p>Olá <strong>{contact_name}</strong>,</p>
        <p>Você está recebendo este e-mail porque é um <strong>Contato de Verificação</strong> de <strong>{user_name}</strong> no Minha Herança Digital.</p>
        <div className="danger-box">
            <strong>🚨 Situação:</strong> O sistema detectou uma ausência prolongada de {user_name} e não conseguimos contato. Precisamos da sua ajuda para confirmar a situação.
        </div>
        <p><strong>Por favor, responda com responsabilidade e cuidado:</strong></p>
        <p style={{ textAlign: 'center', margin: '40px 0' }}>
            <a href={confirm_yes_link} className="button button-danger" style={{ margin: '10px' }}>Sim, confirmo a ausência permanente de {user_name}</a>
            <br/><br/>
            <a href={confirm_no_link} className="button button-success" style={{ margin: '10px' }}>Não, está tudo bem com {user_name}</a>
        </p>
        <div className="alert-box">
            <strong>💡 Não tem certeza?</strong> Por favor, tente entrar em contato com familiares de {user_name} antes de responder. Sua confirmação é um passo crucial.
        </div>
        <p><strong>O que acontece depois:</strong></p>
        <ul>
            <li>A confirmação de múltiplos contatos é necessária para liberar o legado digital.</li>
            <li>Sua resposta é confidencial.</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Agradecemos sua ajuda e sensibilidade neste momento.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const SolicitacaoVerificacaoFalecimentoText = ({ contact_name, user_name, confirm_yes_link, confirm_no_link }: TemplateProps): string => `
🚨 Solicitação de Verificação Urgente sobre ${user_name}
Olá ${contact_name},

Você está recebendo este e-mail porque é um Contato de Verificação de ${user_name}.
🚨 SITUAÇÃO: O sistema detectou uma ausência prolongada de ${user_name} e não conseguimos contato. Precisamos da sua ajuda para confirmar a situação.

Por favor, responda com responsabilidade e cuidado:

SIM, confirmo a ausência permanente: ${confirm_yes_link}
NÃO, está tudo bem: ${confirm_no_link}

💡 NÃO TEM CERTEZA? Por favor, tente entrar em contato com familiares de ${user_name} antes de responder. Sua confirmação é um passo crucial.

O que acontece depois:
- A confirmação de múltiplos contatos é necessária para liberar o legado digital.
- Sua resposta é confidencial.

Agradecemos sua ajuda e sensibilidade neste momento.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
