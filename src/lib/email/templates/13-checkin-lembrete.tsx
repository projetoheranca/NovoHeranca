import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  checkin_link: string;
  days: number;
}

const getTitle = (days: number) => {
    if (days <= 3) return '🚨 URGENTE: Faça seu check-in';
    if (days <= 7) return '⚠️ Lembrete de Check-in';
    return '👋 Você está bem? (Check-in Minha Herança Digital)';
}

const getHeaderClass = (days: number) => {
    if (days <= 3) return 'header-danger';
    if (days <= 7) return 'header-warning';
    return '';
}

export const CheckinLembreteEmail: React.FC<TemplateProps> = ({ name, checkin_link, days }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>{getTitle(days)}</h1>} headerClass={getHeaderClass(days)}>
        <p>Olá <strong>{name}</strong>,</p>
        <p>Este é um lembrete do sistema <strong>Dead Man's Switch</strong>.</p>
        <p>Para garantir que suas memórias sejam entregues apenas no momento certo, precisamos confirmar que você está bem.</p>
        <p>Seu próximo check-in vence em <strong>{days} dia(s)</strong>.</p>
        <p style={{ textAlign: 'center' }}>
            <a href={checkin_link} className="button">✅ Estou Bem! (Fazer Check-in)</a>
        </p>
        <div className="alert-box">
            <strong>💡 Como funciona:</strong> Se você não fizer o check-in até o vencimento, iniciaremos o processo de verificação de inatividade antes de entregar as memórias aos herdeiros.
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Este é apenas um lembrete. Você pode fazer o check-in a qualquer momento.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const CheckinLembreteText = ({ name, checkin_link, days }: TemplateProps): string => {
    const subject = getTitle(days);

    return `
${subject}
Olá ${name},

Este é um lembrete do sistema Dead Man's Switch.
Para garantir que suas memórias sejam entregues apenas no momento certo, precisamos confirmar que você está bem.
Seu próximo check-in vence em ${days} dia(s).

Fazer Check-in: ${checkin_link}

💡 COMO FUNCIONA: Se você não fizer o check-in até o vencimento, iniciaremos o processo de verificação de inatividade antes de entregar as memórias aos herdeiros.
Este é apenas um lembrete. Você pode fazer o check-in a qualquer momento.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
}
