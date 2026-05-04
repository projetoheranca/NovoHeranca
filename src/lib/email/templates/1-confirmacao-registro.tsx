
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  verification_link: string;
}

export const ConfirmacaoRegistroEmail: React.FC<TemplateProps> = ({ name, verification_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✉️ Confirme seu Email</h1>}>
      <p>Olá <strong>{name}</strong>,</p>
      <p>Bem-vindo ao <strong>Minha Herança Digital</strong>! Ficamos felizes em ajudar você a proteger seu legado.</p>
      <p>Para garantir a segurança das suas memórias e ativar seu cofre digital, clique no botão abaixo para verificar seu endereço de email:</p>
      <p style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href={verification_link} className="button">Confirmar e Ativar Minha Conta</a>
      </p>
      <div className="alert-box" style={{ marginTop: '30px' }}>
        <strong>⏰ Importante:</strong> Após confirmar seu e-mail, você poderá prosseguir com a configuração do seu plano e acessar seu cofre.
      </div>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
        Se você não criou esta conta, por favor, ignore este e-mail.
      </p>
    </EmailContainer>
  </BaseLayout>
);

export const ConfirmacaoRegistroText = ({ name, verification_link }: TemplateProps): string => `
Confirme seu Email - Minha Herança Digital
Olá ${name},

Bem-vindo ao Minha Herança Digital! Estamos felizes em ter você conosco.
Para garantir a segurança das suas memórias, precisamos verificar seu email.

Clique no link abaixo para confirmar sua conta:
${verification_link}

⏰ IMPORTANTE: Após a confirmação, você poderá acessar seu painel.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
