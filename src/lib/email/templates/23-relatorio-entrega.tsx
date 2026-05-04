import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  contact_name: string;
  user_name: string;
  delivery_date: string;
  heirs_count: number;
  accessed_count: number;
}

export const RelatorioEntregaEmail: React.FC<TemplateProps> = ({ contact_name, user_name, delivery_date, heirs_count, accessed_count }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>📊 Relatório de Entrega de Legado</h1>}>
        <p>Olá <strong>{contact_name}</strong>,</p>
        <p>Como Contato de Verificação de <strong>{user_name}</strong>, gostaríamos de informar que o processo de entrega do seu legado digital foi concluído.</p>
        <p><strong>Resumo da Entrega:</strong></p>
        <ul>
            <li>Data da entrega: {delivery_date}</li>
            <li>Herdeiros notificados: {heirs_count}</li>
            <li>Herdeiros que já acessaram: {accessed_count}</li>
        </ul>
        <div className="success-box">
            <strong>✅ Missão cumprida:</strong> As memórias e informações de {user_name} foram entregues com segurança aos seus entes queridos, conforme sua vontade.
        </div>
        <p>Sua ajuda neste processo foi fundamental para garantir que tudo acontecesse no momento certo. Agradecemos por sua responsabilidade e confiança.</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Nossos sentimentos e respeito pela memória de {user_name}.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const RelatorioEntregaText = ({ contact_name, user_name, delivery_date, heirs_count, accessed_count }: TemplateProps): string => `
📊 Relatório de Entrega de Legado - ${user_name}
Olá ${contact_name},

Como Contato de Verificação de ${user_name}, gostaríamos de informar que o processo de entrega do seu legado digital foi concluído.

RESUMO DA ENTREGA:
- Data da entrega: ${delivery_date}
- Herdeiros notificados: ${heirs_count}
- Herdeiros que já acessaram: ${accessed_count}

✅ MISSÃO CUMPRIDA: As memórias e informações de ${user_name} foram entregues com segurança aos seus entes queridos, conforme sua vontade.
Sua ajuda neste processo foi fundamental para garantir que tudo acontecesse no momento certo. Agradecemos por sua responsabilidade e confiança.

Nossos sentimentos e respeito pela memória de ${user_name}.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
