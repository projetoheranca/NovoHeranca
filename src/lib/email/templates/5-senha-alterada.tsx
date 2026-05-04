import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  date: string;
  ip: string;
}

export const SenhaAlteradaEmail: React.FC<TemplateProps> = ({ name, date, ip }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🔒 Senha Alterada</h1>}>
      <p>Olá <strong>{name}</strong>,</p>
      <div className="success-box">
        <strong>✅ Confirmação:</strong> A senha da sua conta foi alterada com sucesso.
      </div>
      <p><strong>Detalhes da alteração:</strong></p>
      <ul>
        <li>Data e hora: {date}</li>
        <li>Endereço IP: {ip}</li>
      </ul>
      <div className="danger-box">
        <strong>⚠️ Você não fez esta alteração?</strong><br/>
        Se você não alterou sua senha, sua conta pode estar comprometida. Entre em contato conosco imediatamente.
      </div>
      <p style={{ textAlign: 'center' }}>
        <a href="https://seuapp.com/suporte" className="button button-danger">Reportar Problema</a>
      </p>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
        <strong>Dicas de segurança:</strong>
      </p>
      <ul style={{ fontSize: '14px', color: '#666' }}>
        <li>Use uma senha forte e única</li>
        <li>Ative a autenticação de dois fatores (2FA)</li>
        <li>Nunca compartilhe sua senha com ninguém</li>
      </ul>
    </EmailContainer>
  </BaseLayout>
);

export const SenhaAlteradaText = ({ name, date, ip }: TemplateProps): string => `
✅ Sua Senha Foi Alterada
Olá ${name},

✅ CONFIRMAÇÃO: A senha da sua conta foi alterada com sucesso.
Detalhes da alteração:
- Data e hora: ${date}
- Endereço IP: ${ip}

⚠️ VOCÊ NÃO FEZ ESTA ALTERAÇÃO?
Se você não alterou sua senha, sua conta pode estar comprometida. Entre em contato conosco imediatamente:
https://seuapp.com/suporte

DICAS DE SEGURANÇA:
- Use uma senha forte e única
- Ative a autenticação de dois fatores (2FA)
- Nunca compartilhe sua senha com ninguém
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
