
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

export const NotificacaoEntregaHerdeiroEmail: React.FC<TemplateProps> = ({ heir_name, user_name, access_link, custom_message, user_avatar, download_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>💌 Mensagem Especial de {user_name}</h1>} headerClass="header-muted" userAvatar={user_avatar}>
        <p>Olá <strong>{heir_name}</strong>,</p>
        <p>Este é um momento de recordação. Em sua ausência, <strong>{user_name}</strong> quis garantir que uma parte de seu legado chegasse até você.</p>
        <p>Com o Minha Herança Digital, {user_name} preparou memórias e mensagens importantes, e designou você para receber este conteúdo especial.</p>
        
        {custom_message && (
          <div style={{
            border: '1px solid #eee',
            borderRadius: '5px',
            padding: '20px',
            margin: '20px 0',
            backgroundColor: '#f9f9f9'
          }}>
            <p style={{marginTop: 0}}><strong>Mensagem de {user_name} para você:</strong></p>
            <div dangerouslySetInnerHTML={{ __html: custom_message }} />
          </div>
        )}

        {download_link ? (
          <>
            <p>Esta memória é muito grande para ser anexada ao e-mail, mas você pode baixá-la com segurança através do link abaixo:</p>
            <p style={{ textAlign: 'center' }}>
                <a href={download_link} className="button">Baixar Memória Agora</a>
            </p>
          </>
        ) : (
          <p>A memória (seja um vídeo, áudio, foto ou texto) está <strong>anexada a este e-mail</strong> para que você possa guardá-la para sempre.</p>
        )}
        
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Que as boas lembranças possam trazer conforto e celebrar a vida de quem amamos.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const NotificacaoEntregaHerdeiroText = ({ heir_name, user_name, access_link, custom_message, download_link }: TemplateProps): string => `
💌 Mensagem Especial de ${user_name}
Olá ${heir_name},

Este é um momento de recordação. Em sua ausência, ${user_name} quis garantir que uma parte de seu legado chegasse até você.
Com o Minha Herança Digital, ${user_name} preparou memórias e mensagens importantes, e designou você para receber este conteúdo especial.
${custom_message ? `\nMENSAGEM DE ${user_name}:\n${custom_message.replace(/<[^>]+>/g, '')}\n` : ''}

${download_link ? 
`Esta memória é muito grande para ser anexada ao e-mail, mas você pode baixá-la com segurança através do link abaixo:\n${download_link}` :
'A memória (seja um vídeo, áudio, foto ou texto) está anexada a este e-mail para que você possa guardá-la para sempre.'
}

Que as boas lembranças possam trazer conforto e celebrar a vida de quem amamos.
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
