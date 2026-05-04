import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  stop_link: string;
}

export const ProcessoVerificacaoIniciadoEmail: React.FC<TemplateProps> = ({ name, stop_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>⚠️ Ação Necessária na Sua Conta</h1>} headerClass="header-warning">
        <p>Olá <strong>{name}</strong>,</p>
        <div className="alert-box">
            <strong>⚠️ Atenção:</strong> Notamos que você não acessa sua conta há algum tempo. Por segurança, iniciamos nosso protocolo de verificação de atividade.
        </div>
        <p><strong>O que isso significa?</strong></p>
        <p>Nosso sistema está simplesmente garantindo que tudo está bem antes de tomar qualquer medida sobre seu legado digital.</p>
        <p><strong>Se você está recebendo este e-mail, por favor, clique no botão abaixo para interromper o processo imediatamente.</strong></p>
        <p style={{ textAlign: 'center' }}>
            <a href={stop_link} className="button button-success">✅ Estou Bem, Interromper Verificação</a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Se nenhuma ação for tomada, nosso sistema continuará com as próximas etapas do protocolo de segurança para garantir que suas memórias sejam entregues conforme sua vontade.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const ProcessoVerificacaoIniciadoText = ({ name, stop_link }: TemplateProps): string => `
⚠️ Ação Necessária na Sua Conta
Olá ${name},

⚠️ ATENÇÃO: Notamos que você não acessa sua conta há algum tempo. Por segurança, iniciamos nosso protocolo de verificação de atividade.

O que isso significa?
Nosso sistema está simplesmente garantindo que tudo está bem antes de tomar qualquer medida sobre seu legado digital.

Se você está recebendo este e-mail, por favor, clique no link abaixo para INTERROMPER o processo imediatamente:
${stop_link}

Se nenhuma ação for tomada, nosso sistema continuará com as próximas etapas do protocolo de segurança para garantir que suas memórias sejam entregues conforme sua vontade.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
