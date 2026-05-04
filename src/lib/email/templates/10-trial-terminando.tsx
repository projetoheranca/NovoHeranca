
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  trial_end: string;
  price: string;
  cancel_link: string;
  days: number;
}

export const TrialTerminandoEmail: React.FC<TemplateProps> = ({ name, trial_end, price, cancel_link, days }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>⏰ Trial Terminando em {days === 1 ? 'AMANHÃ' : `${days} Dias`}</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <p>Esperamos que esteja aproveitando o Minha Herança Digital! 😊</p>
        <div className="alert-box">
            <strong>⏰ Lembrete:</strong> Seu trial de 14 dias termina em <strong>{days === 1 ? 'AMANHÃ' : `${days} dias`}</strong> ({trial_end}).
        </div>
        <p><strong>O que acontece depois:</strong></p>
        <ul>
            <li>Em {trial_end}, cobraremos <strong>R$ {price}</strong> no seu cartão</li>
            <li>Sua assinatura continuará automaticamente</li>
            <li>Você manterá acesso a todos os recursos</li>
        </ul>
        <p><strong>Não quer continuar?</strong></p>
        <p>Sem problema! Você pode cancelar a qualquer momento antes de {trial_end} e não será cobrado.</p>
        <p style={{ textAlign: 'center' }}>
            <a href={cancel_link} style={{ color: '#dc3545', textDecoration: 'underline' }}>Cancelar Assinatura</a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            <strong>Está gostando?</strong> Não precisa fazer nada! Sua assinatura continuará automaticamente.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const TrialTerminandoText = ({ name, trial_end, price, cancel_link, days }: TemplateProps): string => `
⏰ Seu Trial Termina em ${days === 1 ? 'AMANHÃ' : `${days} Dias`}
Olá ${name},

Esperamos que esteja aproveitando o Minha Herança Digital! 😊
⏰ LEMBRETE: Seu trial de 14 dias termina em ${days === 1 ? 'AMANHÃ' : `${days} dias`} (${trial_end}).

O QUE ACONTECE DEPOIS:
- Em ${trial_end}, cobraremos R$ ${price} no seu cartão
- Sua assinatura continuará automaticamente
- Você manterá acesso a todos os recursos

NÃO QUER CONTINUAR?
Sem problema! Você pode cancelar a qualquer momento antes de ${trial_end} e não será cobrado.
Cancelar assinatura: ${cancel_link}

ESTÁ GOSTANDO? Não precisa fazer nada! Sua assinatura continuará automaticamente.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
