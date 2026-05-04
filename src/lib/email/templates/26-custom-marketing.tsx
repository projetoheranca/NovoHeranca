
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  subject: string;
  content: string;
}

export const CustomMarketingEmail: React.FC<TemplateProps> = ({ name, content }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>Minha Herança Digital</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div style={{ lineHeight: '1.8', fontSize: '16px' }} dangerouslySetInnerHTML={{ __html: content }} />
    </EmailContainer>
  </BaseLayout>
);

export const CustomMarketingText = ({ name, content }: TemplateProps): string => `
Olá ${name},

${content.replace(/<[^>]+>/g, '')}

---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
