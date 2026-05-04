import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

interface TemplateProps {
  name: string;
  memories_count: number;
}

export const DicasDeUsoEmail: React.FC<TemplateProps> = ({ name, memories_count }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>💡 Dicas de Uso</h1>}>
        <p>Olá <strong>{name}</strong>,</p>
        <p>Você está usando o Minha Herança Digital há uma semana! 🎉</p>
        {memories_count > 0 ? (
            <p>Você já adicionou <strong>{memories_count} memória(s)</strong>. Parabéns! 👏</p>
        ) : (
            <p>Notamos que você ainda não adicionou nenhuma memória. Que tal começar hoje?</p>
        )}
        <p><strong>Dicas para aproveitar melhor:</strong></p>
        <p><strong>1. Organize por categorias</strong></p>
        <p>Use tags para organizar suas memórias (ex: "família", "viagens", "trabalho")</p>
        <p><strong>2. Adicione contexto</strong></p>
        <p>Escreva descrições explicando quando e onde cada memória foi criada. Seus herdeiros vão adorar!</p>
        <p><strong>3. Grave mensagens pessoais</strong></p>
        <p>Vídeos e áudios são as memórias mais emocionantes. Fale diretamente com cada herdeiro.</p>
        <p><strong>4. Configure o Dead Man's Switch</strong></p>
        <p>Adicione 3 Contatos de Verificação para garantir que suas memórias sejam entregues apenas no momento certo.</p>
        <p><strong>5. Revise periodicamente</strong></p>
        <p>Adicione novas memórias regularmente. A vida está sempre criando momentos especiais!</p>
        <p style={{ textAlign: 'center' }}>
            <a href="https://seuapp.com/dashboard" className="button">Adicionar Memória</a>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
            Precisa de inspiração? Confira nosso <a href="https://seuapp.com/blog">blog</a> com histórias e ideias de outros usuários.
        </p>
    </EmailContainer>
  </BaseLayout>
);

export const DicasDeUsoText = ({ name, memories_count }: TemplateProps): string => `
💡 Dicas para Aproveitar Melhor o Minha Herança Digital
Olá ${name},

Você está usando o Minha Herança Digital há uma semana! 🎉
${memories_count > 0 ? `Você já adicionou ${memories_count} memória(s). Parabéns! 👏` : 'Notamos que você ainda não adicionou nenhuma memória. Que tal começar hoje?'}

DICAS PARA APROVEITAR MELHOR:
1. ORGANIZE POR CATEGORIAS
Use tags para organizar suas memórias (ex: "família", "viagens", "trabalho")
2. ADICIONE CONTEXTO
Escreva descrições explicando quando e onde cada memória foi criada. Seus herdeiros vão adorar!
3. GRAVE MENSAGENS PESSOAIS
Vídeos e áudios são as memórias mais emocionantes. Fale diretamente com cada herdeiro.
4. CONFIGURE O DEAD MAN'S SWITCH
Adicione 3 Contatos de Verificação para garantir que suas memórias sejam entregues apenas no momento certo.
5. REVISE PERIODICAMENTE
Adicione novas memórias regularmente. A vida está sempre criando momentos especiais!

Adicionar memória: https://seuapp.com/dashboard

Precisa de inspiração? Confira nosso blog com histórias e ideias de outros usuários:
https://seuapp.com/blog
---
Minha Herança Digital
© 2025 Minha Herança Digital. Todos os direitos reservados.
`.trim();
