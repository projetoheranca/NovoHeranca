import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
}

export const EmailVerificadoEmail: React.FC<TemplateProps> = ({ name }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✅ Email Verificado!</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div className="success-box">
            <strong>🎉 Parabéns!</strong> Seu email foi verificado com sucesso.
        </div>
        <p>Sua conta está quase pronta. Próximos passos:</p>
        <ol>
            <li>Verificar seu telefone</li>
            <li>Escolher forma de pagamento</li>
            <li>Começar a adicionar memórias</li>
        </ol>
        <p style={{ textAlign: 'center' }}>
            <a href="https://seuapp.com/dashboard" className="button">Ir para o App</a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Se você tiver qualquer dúvida, nossa equipe está pronta para ajudar.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const EmailVerificadoText = ({ name }: TemplateProps): string => `
✅ Email Verificado com Sucesso!
Olá ${name},

🎉 Parabéns! Seu email foi verificado com sucesso.
Sua conta está quase pronta. Próximos passos:
1. Verificar seu telefone
2. Escolher forma de pagamento
3. Começar a adicionar memórias

Acesse o app: https://seuapp.com/dashboard
Se você tiver qualquer dúvida, nossa equipe está pronta para ajudar.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
