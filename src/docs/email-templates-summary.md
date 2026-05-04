# Guia Completo dos Templates de E-mail (Metodologia Resend)

Este documento é o guia definitivo sobre a arquitetura de envio de e-mails da plataforma Minha Herança Digital. Ele detalha não apenas cada template, mas também a metodologia usada para garantir um sistema robusto, seguro e fácil de manter.

## 1. Arquitetura e Conceitos Principais

A arquitetura de e-mail foi projetada com base no princípio de **separação de concorrências** para maximizar a clareza e a manutenibilidade.

-   **`src/lib/email/send-email.ts` (O Orquestrador):**
    -   Este é o **único** arquivo que interage diretamente com a API da Resend.
    -   Funciona como um ponto de entrada único para todos os e-mails transacionais.
    -   Utiliza a diretiva `'use server'`, garantindo que a chave de API da Resend nunca seja exposta no lado do cliente.

-   **`src/lib/email/templates/` (O Estúdio de Design):**
    -   Este diretório contém os componentes React para a versão HTML de cada e-mail e as funções que geram a versão em texto puro.
    -   `base-layout.tsx` é o template mestre, garantindo consistência visual (logo, rodapé, cores) em todos os e-mails.
    -   Cada arquivo de template (ex: `1-confirmacao-registro.tsx`) é responsável apenas pela aparência de um e-mail específico.

-   **Server Actions (Os "Gatilhos"):**
    -   Funções em arquivos como `src/lib/actions.ts` e `src/lib/auth-actions.ts`.
    -   Elas determinam **quando** um e-mail deve ser enviado (ex: após um cadastro, falha de pagamento, etc.).
    -   Elas chamam a função `sendEmail` com os dados corretos, sem se preocupar com os detalhes de como o e-mail é montado ou enviado.

## 2. O Coração do Sistema: `send-email.ts`

Este arquivo é o motor do sistema. Vamos detalhar suas partes cruciais:

### A. `TemplatePayloads` (O Contrato de Dados)

```typescript
export type TemplatePayloads = {
  'auth.confirmation': { name: string; verification_link: string; ... };
  'payment.succeeded': { name: string; amount: string; date: string; ... };
  // ... e todos os outros templates
};
```

Esta é a parte mais importante para a segurança e estabilidade do sistema. O tipo `TemplatePayloads` funciona como um **contrato estrito**. Ele define, para cada "chave" de template (ex: `'auth.confirmation'`), exatamente quais dados (o `payload`) são necessários. Se você tentar enviar um e-mail de confirmação sem o `verification_link`, o TypeScript acusará um erro antes mesmo de o código ser executado.

### B. `templateMap` (O Registro Central)

```javascript
const templateMap = {
    'auth.confirmation': { 
        subject: "Confirme seu email...",
        component: ConfirmacaoRegistroEmail, 
        text: ConfirmacaoRegistroText 
    },
    // ... todos os outros templates registrados
};
```

Este objeto mapeia a chave de texto de um template para seus três componentes essenciais:
1.  `subject`: O assunto do e-mail. Pode ser uma string ou uma função para assuntos dinâmicos (ex: "Seu trial termina em 3 dias").
2.  `component`: O componente React (do diretório `templates/`) para a versão HTML.
3.  `text`: A função (do mesmo arquivo de template) que retorna a versão em texto puro.

### C. A Função `sendEmail` (O Executor)

```typescript
export async function sendEmail<T extends keyof TemplatePayloads>(
  payload: SendEmailPayload<T>
): Promise<{ success: boolean, message: string }>
```

Esta é a única função pública do módulo. Seu funcionamento é o seguinte:
1.  **Assinatura Genérica:** A assinatura ` <T extends keyof TemplatePayloads>` garante que, se você passar `template: 'payment.succeeded'`, o `data` dentro do payload *deve* corresponder ao formato definido em `TemplatePayloads['payment.succeeded']`. Isso é o que garante a segurança de tipos.
2.  **Busca no Mapa:** Ela usa a `chave do template` para encontrar o componente, a função de texto e o assunto corretos no `templateMap`.
3.  **Renderização:** Usa a biblioteca `@react-email/render` para transformar o componente React em uma string HTML.
4.  **Envio:** Chama `resend.emails.send()` com todos os dados necessários: `from`, `to`, `subject`, `html`, `text` e quaisquer `attachments`.
5.  **Tratamento de Erro:** Captura qualquer erro da API da Resend e retorna uma resposta padronizada `{ success: false, message: ... }`.

## 3. Guia Passo a Passo: Como Adicionar um Novo E-mail

Para criar e enviar um novo tipo de e-mail (ex: um lembrete de "carrinho abandonado"), siga estes passos:

### Passo 1: Definir o Contrato de Dados

Vá para `src/lib/email/send-email.ts` e adicione uma nova entrada no tipo `TemplatePayloads`.

```typescript
// Em src/lib/email/send-email.ts

export type TemplatePayloads = {
  // ... outros templates
  'cart.abandoned': { name: string; cart_items: string[]; checkout_link: string; };
};
```

### Passo 2: Criar o Arquivo do Template

Crie um novo arquivo em `src/lib/email/templates/`, por exemplo, `26-carrinho-abandonado.tsx`. Dentro dele, defina o componente React e a função de texto.

```tsx
// Em src/lib/email/templates/26-carrinho-abandonado.tsx

import React from 'react';
import { BaseLayout, EmailContainer } from './base-layout';

// O tipo das props DEVE corresponder ao que você definiu no TemplatePayloads
interface TemplateProps {
  name: string;
  cart_items: string[];
  checkout_link: string;
}

// O componente React para o HTML
export const CarrinhoAbandonadoEmail: React.FC<TemplateProps> = ({ name, cart_items, checkout_link }) => (
  <BaseLayout>
    <EmailContainer headerContent={<h1>🛒 Você esqueceu algo?</h1>}>
      <p>Olá <strong>{name}</strong>,</p>
      <p>Notamos que você deixou alguns itens no seu carrinho:</p>
      <ul>
        {cart_items.map(item => <li key={item}>{item}</li>)}
      </ul>
      <p>Finalize sua compra agora!</p>
      <a href={checkout_link} className="button">Finalizar Compra</a>
    </EmailContainer>
  </BaseLayout>
);

// A função para o texto puro
export const CarrinhoAbandonadoText = ({ name, cart_items, checkout_link }: TemplateProps): string => `
Olá ${name},
Você esqueceu estes itens: ${cart_items.join(', ')}.
Finalize sua compra aqui: ${checkout_link}
`.trim();
```

### Passo 3: Registrar o Novo Template

Vá para `src/lib/email/send-email.ts`, importe seu novo template e adicione-o ao `templateMap`.

```javascript
// Em src/lib/email/send-email.ts

// 1. Importe o novo template
import { CarrinhoAbandonadoEmail, CarrinhoAbandonadoText } from './templates/26-carrinho-abandonado';

// 2. Adicione ao mapa
const templateMap = {
  // ... outros templates
  'cart.abandoned': {
    subject: "Você esqueceu algo no seu carrinho!",
    component: CarrinhoAbandonadoEmail,
    text: CarrinhoAbandonadoText
  },
};
```

### Passo 4: Chamar o Envio a partir de uma Server Action

Agora, em qualquer Server Action, você pode disparar este e-mail.

```typescript
// Em algum arquivo de actions, ex: src/lib/actions.ts

'use server';

import { sendEmail } from '@/lib/email/send-email';

export async function handleAbandonedCart(userId: string, userEmail: string) {
  // ...lógica para buscar os itens do carrinho...
  
  await sendEmail({
    to: userEmail,
    template: 'cart.abandoned', // A chave que você registrou
    data: {
      name: "Cliente",
      cart_items: ["Plano Anual", "Consultoria de Legado"],
      checkout_link: "https://minhaherancadigital.com/checkout"
    }
  });
}
```

Seguindo esta metodologia, o sistema de e-mails permanece organizado, seguro e fácil de expandir, com o benefício da verificação de tipos em tempo de desenvolvimento para prevenir erros.

---
## Resumo dos Templates de E-mail do Minha Herança Digital

Este documento detalha o propósito e o conteúdo exato de cada e-mail automático enviado pela plataforma, organizado por categorias funcionais.

---

### Categoria 1: Autenticação e Segurança da Conta

*Estes e-mails são essenciais para o gerenciamento e a segurança da conta do usuário.*

#### **`auth.confirmation` (Confirmação de Registro)**
*   **Propósito:** Enviado imediatamente após o usuário criar uma nova conta.
*   **O que faz:** Pede ao usuário para verificar seu endereço de e-mail clicando em um link. É um passo crucial para ativar a conta.
*   **Conteúdo do Texto:**
    ```
    Confirme seu Email - Herança Digital
    Olá [Nome],
    
    Bem-vindo ao Herança Digital! Estamos felizes em ter você conosco.
    Para garantir a segurança das suas memórias mais preciosas, precisamos verificar seu email.
    
    Clique no link para verificar:
    [LINK]
    
    Se você não criou esta conta, ignore este email. Nenhuma ação adicional é necessária.
    ---
    Herança Digital
    Preservando memórias, conectando gerações
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`auth.passwordReset` (Recuperação de Senha)**
*   **Propósito:** Enviado quando o usuário clica em "Esqueci minha senha".
*   **O que faz:** Fornece um link seguro e temporário para que o usuário possa criar uma nova senha de acesso.
*   **Conteúdo do Texto:**
    ```
    Redefinir sua Senha - Herança Digital
    Olá [Nome],

    Recebemos uma solicitação para redefinir a senha da sua conta no Herança Digital.
    Clique no link abaixo para criar uma nova senha:
    [LINK]

    ⏰ ATENÇÃO: Este link expira em 1 hora por motivos de segurança.

    NÃO SOLICITOU ESTA ALTERAÇÃO?
    Se você não pediu para redefinir sua senha, ignore este email. Sua senha permanecerá inalterada e sua conta está segura.
    Por segurança, recomendamos que você ative a autenticação de dois fatores (2FA) nas configurações da sua conta.
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

---

### Categoria 2: Pagamentos e Assinaturas

*E-mails transacionais relacionados à gestão financeira da assinatura do usuário.*

#### **`payment.trialStarted` (Início do Período de Teste)**
*   **Propósito:** Enviado quando um novo usuário se cadastra em um plano com teste gratuito (via cartão de crédito).
*   **O que faz:** Confirma o início do período de teste de 30 dias, informa a data da primeira cobrança e reitera que o cancelamento pode ser feito a qualquer momento durante o teste.
*   **Conteúdo do Texto:**
    ```
    🎉 Seu Trial de 30 Dias Começou!
    Olá [Nome],

    ✅ SUCESSO! Seu trial de 30 dias começou. Aproveite todos os recursos ilimitados!
    DETALHES DA SUA ASSINATURA:
    - Plano: [Plano]
    - Trial até: [Data Fim Trial]
    - Primeira cobrança: R$ [Preço] em [Data Fim Trial]

    Começar agora: [LINK]

    💡 LEMBRETE: Você pode cancelar a qualquer momento antes do término do trial. Não haverá cobrança se cancelar antes de [Data Fim Trial].
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`payment.pixActivated` (Assinatura Ativada via PIX)**
*   **Propósito:** Enviado após a confirmação de um pagamento via PIX.
*   **O que faz:** Confirma que a assinatura está ativa, informa os detalhes do plano e a data da próxima renovação.
*   **Conteúdo do Texto:**
    ```
    ✅ Assinatura Ativada - Bem-vindo!
    Olá [Nome],

    🎉 BEM-VINDO! Seu pagamento via PIX foi confirmado e sua assinatura está ativa.
    DETALHES DA SUA ASSINATURA:
    - Plano: [Plano]
    - Valor pago: R$ [Preço]
    - Próxima cobrança: [Próxima Cobrança]
    - Método: PIX

    Acessar o app: [LINK]

    🛡️ GARANTIA DE REEMBOLSO
    Você possui 7 dias corridos a partir de hoje para solicitar reembolso integral, sem necessidade de justificativa, conforme Código de Defesa do Consumidor.
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`payment.succeeded` (Pagamento Bem-Sucedido)**
*   **Propósito:** Enviado após cada renovação de assinatura bem-sucedida (mensal ou anual).
*   **O que faz:** Funciona como um recibo, confirmando o valor pago e informando a data da próxima cobrança.
*   **Conteúdo do Texto:**
    ```
    ✅ Pagamento Confirmado - Obrigado!
    Olá [Nome],

    ✅ RECEBIDO! Seu pagamento foi processado com sucesso.
    DETALHES DO PAGAMENTO:
    - Valor: R$ [Valor]
    - Data: [Data]
    - Próxima cobrança: [Próxima Cobrança]

    Baixar nota fiscal: [LINK]
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`payment.failed` (Falha no Pagamento)**
*   **Propósito:** Enviado quando a cobrança recorrente no cartão de crédito falha.
*   **O que faz:** Alerta o usuário sobre o problema e fornece um link para atualizar as informações de pagamento.
*   **Conteúdo do Texto:**
    ```
    ⚠️ Problema com seu Pagamento
    Olá [Nome],

    ⚠️ ATENÇÃO: Não conseguimos processar seu pagamento de R$ [Valor].
    Atualize seus dados de pagamento para manter sua conta ativa.

    Atualizar pagamento: [LINK]

    ⏰ PRAZO: Se o pagamento não for resolvido em 7 dias, sua conta será suspensa.
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`payment.trialEnding` (Término do Período de Teste)**
*   **Propósito:** Enviado em intervalos (ex: 3 dias antes) do fim do período de teste gratuito.
*   **O que faz:** Lembra o usuário que o teste está acabando e que a primeira cobrança será realizada em breve.
*   **Conteúdo do Texto:**
    ```
    ⏰ Seu Trial Termina em [Dias] Dias
    Olá [Nome],

    Seu trial de 30 dias termina em [Dias] dias ([Data Fim Trial]).
    Após essa data, cobraremos R$ [Preço] no seu cartão.

    Não quer continuar? Cancele antes de [Data Fim Trial]:
    [LINK]
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```
#### **`payment.pixRenewalNotice` (Aviso de Renovação PIX)**
*   **Propósito:** Enviado antes do vencimento de uma assinatura paga com PIX.
*   **O que faz:** Alerta o usuário que a assinatura está para expirar e que uma nova ação de pagamento manual é necessária para renovar.
*   **Conteúdo do Texto:**
    ```
    🔔 Renove sua Assinatura
    Olá [Nome],

    Sua assinatura do plano [Plano] expira em [Dias] dia(s). Para continuar protegendo seu legado, renove seu plano.
    
    Clique no link para gerar um novo PIX:
    [LINK]
    ---
    Minha Herança Digital
    © 2025 Minha Herança Digital. Todos os direitos reservados.
    ```

---

### Categoria 3: Check-in (Monitoramento de Atividade)

*Esses e-mails formam o núcleo do sistema "Dead Man's Switch", garantindo que a entrega só ocorra quando necessário.*

#### **`checkin.reminder` (Lembrete de Check-in)**
*   **Propósito:** Enviado alguns dias antes do prazo de check-in do usuário expirar.
*   **O que faz:** Serve como um lembrete amigável para o usuário acessar a plataforma e confirmar que está tudo bem.
*   **Conteúdo do Texto:**
    ```
    [ASSUNTO URGENTE/LEMBRETE]
    Olá [Nome],

    Lembrete do sistema Dead Man's Switch.
    Seu próximo check-in vence em [Dias] dia(s).

    Fazer Check-in: [LINK]

    Se você não fizer o check-in, iniciaremos o processo de verificação de inatividade.
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`checkin.confirmed` (Check-in Confirmado)**
*   **Propósito:** Enviado imediatamente após o usuário realizar um check-in.
*   **O que faz:** Confirma que o sistema registrou a atividade.
*   **Conteúdo do Texto:**
    ```
    ✅ Check-in Confirmado - Obrigado!
    Olá [Nome],

    ✅ RECEBIDO! Obrigado por responder ao check-in.
    Suas memórias continuam seguras.
    Próximo check-in: [Próximo Check-in]
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

#### **`checkin.verificationStarted` (Processo de Verificação Iniciado)**
*   **Propósito:** E-mail de alerta enviado quando o prazo de check-in do usuário expira.
*   **O que faz:** Informa ao usuário que o sistema detectou inatividade e iniciou o protocolo de verificação, oferecendo um link para interromper o processo.
*   **Conteúdo do Texto:**
    ```
    ⚠️ Ação Necessária na Sua Conta
    Olá [Nome],

    ⚠️ ATENÇÃO: Detectamos inatividade na sua conta e iniciamos nosso protocolo de verificação.

    Se você está recebendo este e-mail, CLIQUE NO LINK ABAIXO para interromper o processo:
    [LINK]

    Se nenhuma ação for tomada, continuaremos com o protocolo de segurança.
    ---
    Herança Digital
    © 2025 Herança Digital. Todos os direitos reservados.
    ```

---

### Categoria 4: Entrega do Legado

*Os e-mails mais importantes do sistema, responsáveis por entregar as memórias aos herdeiros.*

#### **`delivery.padrão` (Notificação de Entrega Padrão)**
*   **Propósito:** E-mail principal enviado ao herdeiro quando o legado é liberado.
*   **O que faz:** Informa ao herdeiro que o usuário deixou um conteúdo especial e fornece o anexo ou um link para acesso.
*   **Conteúdo do Texto:**
    ```
    💌 Uma Mensagem Especial de [Nome do Usuário]
    Olá [Nome do Herdeiro],

    Em sua ausência, [Nome do Usuário] deixou uma mensagem especial para você.
    
    [MENSAGEM PERSONALIZADA (se houver)]

    A memória está anexada a este e-mail ou pode ser acessada no link abaixo.
    [LINK]

    Que as boas lembranças possam trazer conforto.
    ---
    Minha Herança Digital
    © 2025 Minha Herança Digital. Todos os direitos reservados.
    ```

#### **`delivery.aniversário` (Notificação de Entrega de Aniversário)**
*   **Propósito:** E-mail agendado para o aniversário do herdeiro.
*   **O que faz:** Envia uma mensagem com tema de aniversário.
*   **Conteúdo do Texto:**
    ```
    🎉 Um presente de aniversário de [Nome do Usuário]
    Olá [Nome do Herdeiro],

    Hoje é um dia especial, e [Nome do Usuário] programou uma mensagem para você.
    
    [MENSAGEM PERSONALIZADA (se houver)]

    Acesse seu presente no link abaixo.
    [LINK]

    Celebrando você e as memórias que duram para sempre.
    ---
    Minha Herança Digital
    © 2025 Minha Herança Digital. Todos os direitos reservados.
    ```

#### **`delivery.casamento` (Notificação de Entrega de Casamento)**
*   **Propósito:** E-mail agendado para a data do casamento do herdeiro.
*   **O que faz:** Envia uma mensagem com tema de casamento.
*   **Conteúdo do Texto:**
    ```
    👰🤵 Um presente de casamento de [Nome do Usuário]
    Olá [Nome do Herdeiro],

    Neste dia importante, [Nome do Usuário] deixou uma mensagem para celebrar seu casamento.
    
    [MENSAGEM PERSONALIZADA (se houver)]

    Acesse a mensagem no link abaixo.
    [LINK]

    Que o amor que vocês celebram hoje dure para sempre.
    ---
    Minha Herança Digital
    © 2025 Minha Herança Digital. Todos os direitos reservados.
    ```
    
#### **`delivery.data_comemorativa` (Notificação para Datas Especiais)**
*   **Propósito:** E-mail genérico para outras datas comemorativas (Natal, Páscoa, etc.).
*   **O que faz:** Envia uma mensagem celebrando a ocasião.
*   **Conteúdo do Texto:**
    ```
    🎁 Uma mensagem especial de [Nome do Usuário]
    Olá [Nome do Herdeiro],

    Nesta data especial, [Nome do Usuário] deixou uma mensagem para você.

    [MENSAGEM PERSONALIZADA (se houver)]

    Acesse a memória no link abaixo.
    [LINK]
    
    As melhores lembranças são os presentes mais valiosos.
    ---
    Minha Herança Digital
    © 2025 Minha Herança Digital. Todos os direitos reservados.
    ```
