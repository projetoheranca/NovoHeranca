import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  reset_link: string;
}

export const RecuperacaoSenhaEmail: React.FC<TemplateProps> = ({ name, reset_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🔒 Redefinir Senha</h1>}>
      <p>Olá <strong>{name}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no Minha Herança Digital.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <p style={{ textAlign: 'center' }}>
        <a href={reset_link} className="button">Redefinir Senha</a>
      </p>
      <div className="alert-box">
        <strong>⏰ Atenção:</strong> Este link expira em 1 hora por motivos de segurança.
      </div>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
        <strong>Não solicitou esta alteração?</strong><br/>
        Se você não pediu para redefinir sua senha, ignore este email. Sua senha permanecerá inalterada e sua conta está segura.
      </p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Por segurança, recomendamos que você ative a autenticação de dois fatores (2FA) nas configurações da sua conta.
      </p>
    </EmailContainer>
  </BaseLayout>
);

export const RecuperacaoSenhaText = ({ name, reset_link }: TemplateProps): string => `
Redefinir sua Senha - Minha Herança Digital
Olá ${name},

Recebemos uma solicitação para redefinir a senha da sua conta no Minha Herança Digital.
Clique no link abaixo para criar uma nova senha:
${reset_link}

⏰ ATENÇÃO: Este link expira em 1 hora por motivos de segurança.

NÃO SOLICITOU ESTA ALTERAÇÃO?
Se você não pediu para redefinir sua senha, ignore este email. Sua senha permanecerá inalterada e sua conta está segura.
Por segurança, recomendamos que você ative a autenticação de dois fatores (2FA) nas configurações da sua conta.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
