
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

export const NotificacaoEntregaDataComemorativaEmail: React.FC<TemplateProps> = ({ heir_name, user_name, access_link, custom_message, user_avatar, download_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🎁 Mensagem Especial</h1>} headerClass="" userAvatar={user_avatar}>
        <p>Olá <strong>{heir_name}</strong>,</p>
        <p>Nesta data especial, <strong>{user_name}</strong> queria compartilhar um momento com você.</p>
        <p>Antes de partir, {user_name} deixou uma mensagem agendada para hoje, para que você soubesse que está em seus pensamentos.</p>
        
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
            As melhores lembranças são os presentes mais valiosos.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const NotificacaoEntregaDataComemorativaText = ({ heir_name, user_name, access_link, custom_message, download_link }: TemplateProps): string => `
🎁 Mensagem especial de ${user_name}
Olá ${heir_name},

Nesta data especial, ${user_name} queria compartilhar um momento com você.
Antes de partir, ${user_name} deixou uma mensagem agendada para hoje, para que você soubesse que está em seus pensamentos.
${custom_message ? `\nMENSAGEM DE ${user_name}:\n${custom_message.replace(/<[^>]+>/g, '')}\n` : ''}

${download_link ? 
`Esta memória é muito grande para ser anexada ao e-mail, mas você pode baixá-la com segurança através do link abaixo:\n${download_link}` :
'A memória (seja um vídeo, áudio, foto ou texto) está anexada a este e-mail para que você possa guardá-la para sempre.'
}

As melhores lembranças são os presentes mais valiosos.
---
Herança Digital
© 2025 Herança Digital. Todos os direitos reservados.
`.trim();
