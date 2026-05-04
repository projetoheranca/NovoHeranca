import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  heir_name: string;
  user_name: string;
  access_date: string;
}

export const ConfirmacaoAcessoHerdeiroEmail: React.FC<TemplateProps> = ({ heir_name, user_name, access_date }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✅ Acesso Confirmado</h1>}>
        <p>Olá <strong>{heir_name}</strong>,</p>
        <div className="success-box">
            <strong>✅ Confirmado:</strong> Você acessou as memórias de {user_name} em {access_date}.
        </div>
        <p><strong>Lembre-se:</strong></p>
        <ul>
            <li>Você pode acessar as memórias a qualquer momento</li>
            <li>Pode fazer download de todos os arquivos</li>
            <li>As memórias ficarão disponíveis por tempo indeterminado</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Se você tiver qualquer dúvida ou precisar de ajuda, nossa equipe está disponível.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const ConfirmacaoAcessoHerdeiroText = ({ heir_name, user_name, access_date }: TemplateProps): string => `
✅ Acesso Confirmado
Olá ${heir_name},

✅ CONFIRMADO: Você acessou as memórias de ${user_name} em ${access_date}.

LEMBRE-SE:
- Você pode acessar as memórias a qualquer momento
- Pode fazer download de todos os arquivos
- As memórias ficarão disponíveis por tempo indeterminado

Se você tiver qualquer dúvida ou precisar de ajuda, nossa equipe está disponível.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
