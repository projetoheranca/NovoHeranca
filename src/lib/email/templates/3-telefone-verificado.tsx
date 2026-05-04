import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  phone: string;
}

export const TelefoneVerificadoEmail: React.FC<TemplateProps> = ({ name, phone }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>📱 Telefone Verificado!</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div className="success-box">
            <strong>✅ Sucesso!</strong> Seu telefone <strong>{phone}</strong> foi verificado.
        </div>
        <p>Agora você tem acesso completo a todos os recursos de segurança:</p>
        <ul>
            <li>✅ Autenticação de dois fatores (2FA)</li>
            <li>✅ Recuperação de conta via SMS</li>
            <li>✅ Alertas de segurança</li>
            <li>✅ Check-ins do Dead Man's Switch</li>
        </ul>
        <p>Próximo passo: <strong>Escolher sua forma de pagamento</strong></p>
        <p style={{ textAlign: 'center' }}>
            <a href="https://seuapp.com/pagamento" className="button">Escolher Plano</a>
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const TelefoneVerificadoText = ({ name, phone }: TemplateProps): string => `
📱 Telefone Verificado com Sucesso!
Olá ${name},

✅ Sucesso! Seu telefone ${phone} foi verificado.
Agora você tem acesso completo a todos os recursos de segurança:
- Autenticação de dois fatores (2FA)
- Recuperação de conta via SMS
- Alertas de segurança
- Check-ins do Dead Man's Switch

Próximo passo: Escolher sua forma de pagamento
https://seuapp.com/pagamento
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
