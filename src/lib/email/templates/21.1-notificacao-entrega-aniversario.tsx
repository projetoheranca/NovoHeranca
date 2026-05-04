
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

export const NotificacaoEntregaAniversarioEmail: React.FC<TemplateProps> = ({ heir_name, user_name, access_link, custom_message, user_avatar, download_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🎉 Feliz Aniversário!</h1>} headerClass="" userAvatar={user_avatar}>
        <p>Olá <strong>{heir_name}</strong>,</p>
        <p>Hoje é um dia especial, e <strong>{user_name}</strong> não se esqueceu.</p>
        <p>Em sua ausência, {user_name} programou uma mensagem especial para chegar até você neste dia. É um presente de memória, um lembrete do carinho que sempre existirá.</p>
        
        {custom_message && (
          <div style={{
            border: '1px solid #eee',
            borderRadius: '5px',
            padding: '20px',
            margin: '20px 0',
            backgroundColor: '#f9f9f9'
          }}>
            <p style={{marginTop: 0}}><strong>Uma mensagem de {user_name} para o seu aniversário:</strong></p>
            <div dangerouslySetInnerHTML={{ __html: custom_message }} />
          </div>
        )}

        {download_link ? (
          <>
            <p>Este presente é muito grande para ser anexado ao e-mail, mas você pode baixá-lo com segurança através do link abaixo:</p>
            <p style={{ textAlign: 'center' }}>
                <a href={download_link} className="button">Baixar Presente Agora</a>
            </p>
          </>
        ) : (
          <p>O presente (seja um vídeo, áudio, foto ou texto) está <strong>anexado a este e-mail</strong> para que você possa guardá-lo para sempre.</p>
        )}
        
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Celebrando você e as memórias que duram para sempre.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const NotificacaoEntregaAniversarioText = ({ heir_name, user_name, access_link, custom_message, download_link }: TemplateProps): string => `
🎉 Presente de aniversário de ${user_name}
Olá ${heir_name},

Hoje é um dia especial, e ${user_name} não se esqueceu.
Em sua ausência, ${user_name} programou uma mensagem especial para chegar até você neste dia. É um presente de memória, um lembrete do carinho que sempre existirá.
${custom_message ? `\nMENSAGEM DE ${user_name}:\n${custom_message.replace(/<[^>]+>/g, '')}\n` : ''}

${download_link ? 
`Este presente é muito grande para ser anexado ao e-mail, mas você pode baixá-lo com segurança através do link abaixo:\n${download_link}` :
'O presente (seja um vídeo, áudio, foto ou texto) está anexado a este e-mail para que você possa guardá-lo para sempre.'
}

Celebrando você e as memórias que duram para sempre.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
