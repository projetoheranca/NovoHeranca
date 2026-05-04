import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
}

export const BemVindoEmail: React.FC<TemplateProps> = ({ name }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🎉 Bem-vindo!</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <p>Bem-vindo ao <strong>Minha Herança Digital</strong>! Estamos muito felizes em ter você conosco. 😊</p>
        <p>Você tomou uma decisão importante: preservar suas memórias mais preciosas e garantir que elas cheguem às pessoas certas no momento certo.</p>
        <p><strong>Primeiros passos:</strong></p>
        <ol>
            <li><strong>Adicione sua primeira memória</strong> - Pode ser um vídeo, foto, áudio ou texto</li>
            <li><strong>Cadastre seus herdeiros</strong> - As pessoas que receberão suas memórias</li>
            <li><strong>Configure o Dead Man's Switch</strong> - Adicione 3 Contatos de Verificação</li>
        </ol>
        <p style={{ textAlign: 'center' }}>
            <a href="https://seuapp.com/dashboard" className="button">Começar Agora</a>
        </p>
        <p><strong>Recursos disponíveis:</strong></p>
        <ul>
            <li>✅ Memórias ilimitadas</li>
            <li>✅ Armazenamento de 50GB</li>
            <li>✅ Criptografia de ponta a ponta</li>
            <li>✅ Dead Man's Switch automático</li>
            <li>✅ Suporte prioritário</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            <strong>Precisa de ajuda?</strong> Nossa <a href="https://seuapp.com/ajuda">Central de Ajuda</a> tem tutoriais e respostas para as dúvidas mais comuns.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const BemVindoText = ({ name }: TemplateProps): string => `
🎉 Bem-vindo ao Minha Herança Digital!
Olá ${name},

Bem-vindo ao Minha Herança Digital! Estamos muito felizes em ter você conosco. 😊
Você tomou uma decisão importante: preservar suas memórias mais preciosas e garantir que elas cheguem às pessoas certas no momento certo.

PRIMEIROS PASSOS:
1. Adicione sua primeira memória - Pode ser um vídeo, foto, áudio ou texto
2. Cadastre seus herdeiros - As pessoas que receberão suas memórias
3. Configure o Dead Man's Switch - Adicione 3 Contatos de Verificação

Começar agora: https://seuapp.com/dashboard

RECURSOS DISPONÍVEIS:
✅ Memórias ilimitadas
✅ Armazenamento de 50GB
✅ Criptografia de ponta a ponta
✅ Dead Man's Switch automático
✅ Suporte prioritário

PRECISA DE AJUDA? Nossa Central de Ajuda tem tutoriais e respostas para as dúvidas mais comuns:
https://seuapp.com/ajuda
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
