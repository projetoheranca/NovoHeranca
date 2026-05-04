
import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  heir_name: string;
  user_name: string;
  access_link: string;
  custom_message?: string;
  user_avatar?: string | null;
  download_link?: string;
}

export const NotificacaoEntregaCasamentoEmail: React.FC<TemplateProps> = ({ heir_name, user_name, access_link, custom_message, user_avatar, download_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>👰🤵 Felicidades no Casamento!</h1>} headerClass="" userAvatar={user_avatar}>
        <p>Olá <strong>{heir_name}</strong>,</p>
        <p>Neste dia tão importante da sua vida, <strong>{user_name}</strong> quis se fazer presente de uma forma especial.</p>
        <p>Em sua ausência, {user_name} deixou uma mensagem programada para celebrar seu casamento. É um presente de amor e sabedoria para esta nova jornada.</p>
        
        {custom_message && (
          <div style={{
            border: '1px solid #eee',
            borderRadius: '5px',
            padding: '20px',
            margin: '20px 0',
            backgroundColor: '#f9f9f9'
          }}>
            <p style={{marginTop: 0}}><strong>Uma mensagem de {user_name} para o seu casamento:</strong></p>
            <div dangerouslySetInnerHTML={{ __html: custom_message }} />
          </div>
        )}

        {download_link ? (
          <>
            <p>Esta mensagem é muito grande para ser anexada ao e-mail, mas você pode baixá-la com segurança através do link abaixo:</p>
            <p style={{ textAlign: 'center' }}>
                <a href={download_link} className="button">Baixar Mensagem Agora</a>
            </p>
          </>
        ) : (
          <p>A mensagem (seja um vídeo, áudio, foto ou texto) está <strong>anexada a este e-mail</strong> para que você possa guardá-la para sempre.</p>
        )}
        
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Que o amor que vocês celebram hoje dure para sempre, assim como as memórias.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const NotificacaoEntregaCasamentoText = ({ heir_name, user_name, access_link, custom_message, download_link }: TemplateProps): string => `
👰🤵 Presente de casamento de ${user_name}
Olá ${heir_name},

Neste dia tão importante da sua vida, ${user_name} quis se fazer presente de uma forma especial.
Em sua ausência, ${user_name} deixou uma mensagem programada para celebrar seu casamento. É um presente de amor e sabedoria para esta nova jornada.
${custom_message ? `\nMENSAGEM DE ${user_name}:\n${custom_message.replace(/<[^>]+>/g, '')}\n` : ''}

${download_link ? 
`Esta mensagem é muito grande para ser anexada ao e-mail, mas você pode baixá-la com segurança através do link abaixo:\n${download_link}` :
'A mensagem (seja um vídeo, áudio, foto ou texto) está anexada a este e-mail para que você possa guardá-la para sempre.'
}

Que o amor que vocês celebram hoje dure para sempre, assim como as memórias.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
