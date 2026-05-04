import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  next_checkin: string;
}

export const CheckinConfirmadoEmail: React.FC<TemplateProps> = ({ name, next_checkin }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>✅ Check-in Confirmado!</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <div className="success-box">
            <strong>✅ Recebido!</strong> Obrigado por responder ao check-in.
        </div>
        <p>Suas memórias continuam seguras e protegidas.</p>
        <p><strong>Próximo check-in:</strong> {next_checkin}</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Você pode desativar os check-ins nas configurações, mas recomendamos mantê-los ativos para garantir que suas memórias sejam entregues apenas no momento certo.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const CheckinConfirmadoText = ({ name, next_checkin }: TemplateProps): string => `
✅ Check-in Confirmado - Obrigado!
Olá ${name},

✅ RECEBIDO! Obrigado por responder ao check-in.
Suas memórias continuam seguras e protegidas.
Próximo check-in: ${next_checkin}

Você pode desativar os check-ins nas configurações, mas recomendamos mantê-los ativos para garantir que suas memórias sejam entregues apenas no momento certo.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
