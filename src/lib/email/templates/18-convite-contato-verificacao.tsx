
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  user_name: string;
  contact_name: string;
  accept_link: string;
  decline_link: string;
}

export const ConviteContatoVerificacaoEmail: React.FC<TemplateProps> = ({ user_name, contact_name, accept_link, decline_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🤝 Pedido de Confiança</h1>}>
        <p>Olá <strong>{contact_name}</strong>,</p>
        <p><strong>{user_name}</strong> está usando o <strong>Minha Herança Digital</strong> para preservar memórias importantes e garantir que elas cheguem às pessoas certas.</p>
        <p>Por confiar em você, {user_name} o convidou para ser um de seus <strong>Contatos de Verificação</strong>.</p>
        <p><strong>Qual é o seu papel?</strong></p>
        <p>Caso o sistema detecte uma ausência prolongada de {user_name}, entraremos em contato com você para confirmar se está tudo bem. Sua resposta nos ajudará a garantir que o legado de {user_name} seja entregue apenas no momento certo.</p>
        <div className="alert-box">
            <strong>💡 Importante:</strong> Esta é uma medida de segurança para evitar a entrega acidental de memórias. A confirmação de múltiplos contatos é necessária antes de qualquer ação ser tomada.
        </div>
        <p>Você aceita essa responsabilidade e essa demonstração de confiança?</p>
        <p style={{ textAlign: 'center' }}>
            <a href={accept_link} className="button">Sim, Aceito Ajudar</a>
        </p>
        <p style={{ textAlign: 'center' }}>
            <a href={decline_link} style={{ color: '#6c757d', textDecoration: 'underline' }}>Não, prefiro não participar</a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Se você recusar, {user_name} será notificado de forma discreta para que possa escolher outra pessoa de confiança.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const ConviteContatoVerificacaoText = ({ user_name, contact_name, accept_link, decline_link }: TemplateProps): string => `
🤝 Pedido de Confiança de ${user_name}
Olá ${contact_name},

${user_name} está usando o Minha Herança Digital para preservar memórias importantes e garantir que elas cheguem às pessoas certas.
Por confiar em você, ${user_name} o convidou para ser um de seus Contatos de Verificação.

Qual é o seu papel?
Caso o sistema detecte uma ausência prolongada de ${user_name}, entraremos em contato com você para confirmar se está tudo bem. Sua resposta nos ajudará a garantir que o legado de ${user_name} seja entregue apenas no momento certo.

💡 IMPORTANTE: Esta é uma medida de segurança para evitar a entrega acidental de memórias. A confirmação de múltiplos contatos é necessária antes de qualquer ação ser tomada.

Você aceita essa responsabilidade?

Sim, Aceito Ajudar: ${accept_link}
Não, prefiro não participar: ${decline_link}

Se você recusar, ${user_name} será notificado de forma discreta para que possa escolher outra pessoa de confiança.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
