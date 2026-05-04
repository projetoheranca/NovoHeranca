
'use server';

import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';

// Categoria 1: Autenticação
import { ConfirmacaoRegistroEmail, ConfirmacaoRegistroText } from './templates/1-confirmacao-registro';
import { EmailVerificadoEmail, EmailVerificadoText } from './templates/2-email-verificado';
import { TelefoneVerificadoEmail, TelefoneVerificadoText } from './templates/3-telefone-verificado';
import { RecuperacaoSenhaEmail, RecuperacaoSenhaText } from './templates/4-recuperacao-senha';
import { SenhaAlteradaEmail, SenhaAlteradaText } from './templates/5-senha-alterada';

// Categoria 2: Pagamentos
import { TrialIniciadoEmail, TrialIniciadoText } from './templates/6-trial-iniciado';
import { AssinaturaPixAtivadaEmail, AssinaturaPixAtivadaText } from './templates/7-assinatura-pix-ativada';
import { PagamentoBemSucedidoEmail, PagamentoBemSucedidoText } from './templates/8-pagamento-bem-sucedido';
import { PagamentoFalhouEmail, PagamentoFalhouText } from './templates/9-pagamento-falhou';
import { TrialTerminandoEmail, TrialTerminandoText } from './templates/10-trial-terminando';
import { PixRenovacaoAvisoEmail, PixRenovacaoAvisoText } from './templates/11-pix-renewal-notice';

// Categoria 3: Check-ins
import { CheckinLembreteEmail, CheckinLembreteText } from './templates/13-checkin-lembrete';
import { CheckinConfirmadoEmail, CheckinConfirmadoText } from './templates/16-checkin-confirmado';
import { ProcessoVerificacaoIniciadoEmail, ProcessoVerificacaoIniciadoText } from './templates/17-processo-verificacao-iniciado';

// Categoria 4: Contatos de Verificação
import { ConviteContatoVerificacaoEmail, ConviteContatoVerificacaoText } from './templates/18-convite-contato-verificacao';
import { ConfirmacaoAceiteEmail, ConfirmacaoAceiteText } from './templates/19-confirmacao-aceite';
import { SolicitacaoVerificacaoFalecimentoEmail, SolicitacaoVerificacaoFalecimentoText } from './templates/20-solicitacao-verificacao-falecimento';

// Categoria 5: Entrega de Memórias
import { NotificacaoEntregaHerdeiroEmail, NotificacaoEntregaHerdeiroText } from './templates/21-notificacao-entrega-herdeiro';
import { NotificacaoEntregaAniversarioEmail, NotificacaoEntregaAniversarioText } from './templates/21.1-notificacao-entrega-aniversario';
import { NotificacaoEntregaCasamentoEmail, NotificacaoEntregaCasamentoText } from './templates/21.2-notificacao-entrega-casamento';
import { NotificacaoEntregaDataComemorativaEmail, NotificacaoEntregaDataComemorativaText } from './templates/21.3-notificacao-entrega-data-comemorativa';
import { ConfirmacaoAcessoHerdeiroEmail, ConfirmacaoAcessoHerdeiroText } from './templates/22-confirmacao-acesso-herdeiro';
import { RelatorioEntregaEmail, RelatorioEntregaText } from './templates/23-relatorio-entrega';

// Categoria 6: Marketing/Engajamento
import { BemVindoEmail, BemVindoText } from './templates/24-bem-vindo';
import { DicasDeUsoEmail, DicasDeUsoText } from './templates/25-dicas-de-uso';
import { CustomMarketingEmail, CustomMarketingText } from './templates/26-custom-marketing';


// --- Definição dos Payloads de Dados para cada Template ---

type DeliveryPayload = { 
  heir_name: string; 
  user_name: string; 
  access_link: string; 
  custom_message?: string; 
  user_avatar?: string | null; 
  download_link?: string;
};

export type TemplatePayloads = {
  'auth.confirmation': { name: string; verification_link: string };
  'auth.verified': { name: string };
  'auth.phoneVerified': { name: string; phone: string };
  'auth.passwordReset': { name: string; reset_link: string };
  'auth.passwordChanged': { name: string; date: string; ip: string };

  'payment.trialStarted': { name: string; trial_end: string; plan: string; price: string };
  'payment.pixActivated': { name: string; plan: string; next_billing: string; price: string };
  'payment.succeeded': { name: string; amount: string; date: string; next_billing: string; invoice_link: string };
  'payment.failed': { name: string; amount: string; update_payment_link: string };
  'payment.trialEnding': { name: string; trial_end: string; price: string; cancel_link: string; days: number };
  'payment.pixRenewalNotice': { name: string; plan: string; renewal_link: string; days: number };

  'checkin.reminder': { name: string; checkin_link: string; days: number };
  'checkin.confirmed': { name: string; next_checkin: string };
  'checkin.verificationStarted': { name: string; stop_link: string };

  'verification.invite': { user_name: string; contact_name: string; accept_link: string; decline_link: string };
  'verification.accepted': { contact_name: string; user_name: string };
  'verification.request': { contact_name: string; user_name: string; confirm_yes_link: string; confirm_no_link: string };

  'delivery.padrão': DeliveryPayload;
  'delivery.aniversário': DeliveryPayload;
  'delivery.casamento': DeliveryPayload;
  'delivery.data_comemorativa': DeliveryPayload;
  'delivery.accessed': { heir_name: string; user_name: string; access_date: string };
  'delivery.report': { contact_name: string; user_name: string; delivery_date: string; heirs_count: number; accessed_count: number };

  'marketing.welcome': { name: string };
  'marketing.tips': { name: string; memories_count: number };
  'marketing.custom': { name: string; subject: string; content: string };
};

// --- Mapeamento de Chave de Template para Componente, Texto e Assunto ---

const templateMap = {
    'auth.confirmation': { 
        subject: "Confirme seu email - Minha Herança Digital",
        component: ConfirmacaoRegistroEmail, 
        text: ConfirmacaoRegistroText 
    },
    'auth.verified': { 
        subject: "✅ Email verificado com sucesso!",
        component: EmailVerificadoEmail, 
        text: EmailVerificadoText 
    },
    'auth.phoneVerified': { 
        subject: "✅ Telefone verificado com sucesso!",
        component: TelefoneVerificadoEmail, 
        text: TelefoneVerificadoText 
    },
    'auth.passwordReset': { 
        subject: "Redefinir sua senha - Minha Herança Digital",
        component: RecuperacaoSenhaEmail, 
        text: RecuperacaoSenhaText 
    },
    'auth.passwordChanged': { 
        subject: "✅ Sua senha foi alterada",
        component: SenhaAlteradaEmail, 
        text: SenhaAlteradaText 
    },
    'payment.trialStarted': { 
        subject: "Bem-vindo! Seus 14 dias de teste grátis começaram 🚀",
        component: TrialIniciadoEmail, 
        text: TrialIniciadoText 
    },
    'payment.pixActivated': { 
        subject: "Pagamento confirmado! Sua herança digital está segura.",
        component: AssinaturaPixAtivadaEmail, 
        text: AssinaturaPixAtivadaText 
    },
    'payment.succeeded': { 
        subject: "✅ Pagamento Confirmado - Obrigado!",
        component: PagamentoBemSucedidoEmail, 
        text: PagamentoBemSucedidoText 
    },
    'payment.failed': { 
        subject: "🤔 Problema com sua Assinatura",
        component: PagamentoFalhouEmail, 
        text: PagamentoFalhouText 
    },
    'payment.trialEnding': { 
        subject: (data: TemplatePayloads['payment.trialEnding']) => `⏰ Seu trial termina em ${data.days === 1 ? 'AMANHÃ' : `${data.days} dias`}`,
        component: TrialTerminandoEmail, 
        text: TrialTerminandoText 
    },
    'payment.pixRenewalNotice': {
        subject: (data: TemplatePayloads['payment.pixRenewalNotice']) => `🔔 Sua assinatura expira em ${data.days} dia(s)`,
        component: PixRenovacaoAvisoEmail, 
        text: PixRenovacaoAvisoText
    },
    'checkin.reminder': { 
        subject: (data: TemplatePayloads['checkin.reminder']) => {
            if (data.days <= 3) return `🚨 URGENTE: Faça seu check-in`;
            if (data.days <= 7) return `⚠️ Lembrete de Check-in`;
            return `👋 Você está bem? (Check-in Minha Herança Digital)`;
        },
        component: CheckinLembreteEmail, 
        text: CheckinLembreteText 
    },
    'checkin.confirmed': { 
        subject: "✅ Check-in confirmado - Obrigado!",
        component: CheckinConfirmadoEmail, 
        text: CheckinConfirmadoText 
    },
    'checkin.verificationStarted': { 
        subject: "⚠️ Processo de verificação iniciado",
        component: ProcessoVerificacaoIniciadoEmail, 
        text: ProcessoVerificacaoIniciadoText 
    },
    'verification.invite': { 
        subject: (data: TemplatePayloads['verification.invite']) => `${data.user_name} adicionou você como Contato de Verificação`,
        component: ConviteContatoVerificacaoEmail, 
        text: ConviteContatoVerificacaoText 
    },
    'verification.accepted': { 
        subject: "✅ Obrigado por aceitar!",
        component: ConfirmacaoAceiteEmail, 
        text: ConfirmacaoAceiteText 
    },
    'verification.request': { 
        subject: (data: TemplatePayloads['verification.request']) => `🚨 URGENTE: Confirmação necessária sobre ${data.user_name}`,
        component: SolicitacaoVerificacaoFalecimentoEmail, 
        text: SolicitacaoVerificacaoFalecimentoText 
    },
    'delivery.padrão': { 
        subject: (data: TemplatePayloads['delivery.padrão']) => `💌 Mensagem especial de ${data.user_name}`,
        component: NotificacaoEntregaHerdeiroEmail, 
        text: NotificacaoEntregaHerdeiroText 
    },
    'delivery.aniversário': { 
        subject: (data: TemplatePayloads['delivery.aniversário']) => `🎉 Presente de aniversário de ${data.user_name}`,
        component: NotificacaoEntregaAniversarioEmail, 
        text: NotificacaoEntregaAniversarioText 
    },
    'delivery.casamento': { 
        subject: (data: TemplatePayloads['delivery.casamento']) => `👰🤵 Presente de casamento de ${data.user_name}`,
        component: NotificacaoEntregaCasamentoEmail, 
        text: NotificacaoEntregaCasamentoText
    },
    'delivery.data_comemorativa': { 
        subject: (data: TemplatePayloads['delivery.data_comemorativa']) => `🎁 Mensagem especial de ${data.user_name}`,
        component: NotificacaoEntregaDataComemorativaEmail, 
        text: NotificacaoEntregaDataComemorativaText
    },
    'delivery.accessed': { 
        subject: "✅ Acesso confirmado",
        component: ConfirmacaoAcessoHerdeiroEmail, 
        text: ConfirmacaoAcessoHerdeiroText 
    },
    'delivery.report': { 
        subject: (data: TemplatePayloads['delivery.report']) => `📊 Relatório de entrega - ${data.user_name}`,
        component: RelatorioEntregaEmail, 
        text: RelatorioEntregaText 
    },
    'marketing.welcome': { 
        subject: "🎉 Bem-vindo ao Minha Herança Digital!",
        component: BemVindoEmail, 
        text: BemVindoText 
    },
    'marketing.tips': { 
        subject: "💡 Dicas para aproveitar melhor o Minha Herança Digital",
        component: DicasDeUsoEmail, 
        text: DicasDeUsoText 
    },
    'marketing.custom': {
        subject: (data: TemplatePayloads['marketing.custom']) => data.subject,
        component: CustomMarketingEmail,
        text: CustomMarketingText
    }
};


// --- Nova Função de Envio de Email ---

type SendEmailPayload<T extends keyof TemplatePayloads> = {
  to: string;
  template: T;
  data: TemplatePayloads[T];
  attachments?: { filename: string; content: Buffer }[];
};

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail<T extends keyof TemplatePayloads>(
  payload: SendEmailPayload<T>
): Promise<{ success: boolean, message: string }> {
  
    if (!resend) {
        const errorMsg = "[EMAIL_ERROR] A chave de API da Resend (RESEND_API_KEY) não está configurada.";
        console.error(errorMsg);
        return { success: false, message: "O serviço de e-mail não está configurado no servidor." };
    }

    const { to, template, data, attachments } = payload;
    const templateConfig = templateMap[template];

    if (!templateConfig) {
        const errorMsg = `[EMAIL_ERROR] Template "${template}" não encontrado.`;
        console.error(errorMsg);
        return { success: false, message: errorMsg };
    }

    const { component: EmailComponent, text: TextComponent, subject } = templateConfig;

    const subjectText = typeof subject === 'function' ? subject(data as any) : subject;
    const emailHtml = render(React.createElement(EmailComponent as React.FC<any>, data));
    const emailText = TextComponent(data as any);
    
    // Process attachments to fetch from web URL if content is a URL
    const processedAttachments = await Promise.all((attachments || []).map(async (att) => {
        // Se o conteúdo já for um Buffer, use diretamente.
        if (Buffer.isBuffer(att.content)) {
            return att;
        }
        // Se for uma string (URL), busque o conteúdo.
        if (typeof att.content === 'string' && att.content.startsWith('http')) {
            try {
                const response = await fetch(att.content);
                if (!response.ok) {
                    throw new Error(`Failed to fetch attachment from ${att.content}, status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                return {
                    filename: att.filename,
                    content: Buffer.from(arrayBuffer),
                };
            } catch (fetchError: any) {
                console.error(`[EMAIL_ATTACHMENT_ERROR] Failed to fetch attachment: ${fetchError.message}`);
                // Retorna nulo para filtrar este anexo e não quebrar o envio do e-mail.
                return null;
            }
        }
        // Se não for nem Buffer nem URL válida, ignore.
        return null;
    }));

    // Filtra anexos que falharam no download.
    const validAttachments = processedAttachments.filter(att => att !== null) as { filename: string; content: Buffer }[];


    try {
        const { data: responseData, error } = await resend.emails.send({
            from: 'Minha Herança Digital <help@minhaherancadigital.com>',
            to: [to],
            subject: subjectText,
            html: emailHtml,
            text: emailText,
            attachments: validAttachments,
            headers: {
                'List-Unsubscribe': '<mailto:unsubscribe@minhaherancadigital.com?subject=Unsubscribe>'
            },
        });

        if (error) {
            console.error(`[RESEND_API_ERROR] Resend retornou um erro para ${to}:`, error);
            throw new Error(error.message);
        }

        if (!responseData || !responseData.id) {
            console.error(`[RESEND_API_FAILURE] Resend não retornou um ID de e-mail para ${to}, indicando uma falha silenciosa.`);
            throw new Error('O serviço de e-mail aceitou a requisição mas não retornou um ID de confirmação.');
        }

        console.log(`[EMAIL_SUCCESS] E-mail do tipo "${template}" enviado para ${to}. ID da Resend: ${responseData.id}`);
        return { success: true, message: "E-mail enviado com sucesso." };
        
    } catch (error: any) {
        console.error(`[EMAIL_ERROR] Falha ao enviar e-mail do tipo "${template}" para ${to}:`, error.message);
        return { success: false, message: error.message };
    }
}

/**
 * Retorna o HTML renderizado de um template específico para pré-visualização.
 */
export async function getTemplateHtml<T extends keyof TemplatePayloads>(
    template: T,
    data: TemplatePayloads[T]
): Promise<string> {
    const templateConfig = templateMap[template];
    if (!templateConfig) throw new Error(`Template "${template}" não encontrado.`);
    return render(React.createElement(templateConfig.component as React.FC<any>, data));
}

// --- Funções Auxiliares para a Ferramenta de Teste ---

export async function getMockDataForTemplate(template: keyof TemplatePayloads, days?: number): Promise<TemplatePayloads[keyof TemplatePayloads]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 14); // Corrigido para 14 dias
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://minhaherancadigital.com';
    
    const commonData = {
        name: "Usuário de Teste",
        user_name: "Usuário de Teste",
        contact_name: "Contato de Teste",
        heir_name: "Herdeiro de Teste",
        verification_link: `${baseUrl}/auth/action?mode=verifyEmail&oobCode=MOCK_CODE`,
        reset_link: `${baseUrl}/forgot-password`,
        date: now.toLocaleString('pt-BR'),
        ip: "192.168.1.1",
        trial_end: futureDate.toLocaleDateString('pt-BR'),
        plan: "Plano Mensal",
        price: "24,90",
        next_billing: futureDate.toLocaleDateString('pt-BR'),
        amount: "24,90",
        invoice_link: `${baseUrl}/dashboard/subscription`,
        update_payment_link: `${baseUrl}/dashboard/subscription`,
        cancel_link: `${baseUrl}/dashboard/subscription`,
        renewal_link: `${baseUrl}/pricing`,
        checkin_link: `${baseUrl}/dashboard`,
        stop_link: `${baseUrl}/login`,
        accept_link: `${baseUrl}/`,
        decline_link: `${baseUrl}/`,
        confirm_yes_link: `${baseUrl}/`,
        confirm_no_link: `${baseUrl}/`,
        access_link: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        custom_message: "Lembre-se sempre dos nossos momentos felizes. Esta é uma memória especial para você.",
        access_date: now.toLocaleString('pt-BR'),
        delivery_date: now.toLocaleDateString('pt-BR'),
        heirs_count: 3,
        accessed_count: 1,
        memories_count: 5,
        phone: "(11) 99999-8888",
        user_avatar: "https://minhaherancadigital.com/img/logo1.png",
        download_link: `${baseUrl}/download/mock-token`,
        subject: "Assunto de Teste",
        content: "<p>Este é um conteúdo de teste para marketing.</p>"
    };

    switch (template) {
        case 'payment.trialEnding':
            return { ...commonData, days: days || 3 };
        case 'checkin.reminder':
            return { ...commonData, days: days || 3 };
        case 'payment.pixRenewalNotice':
            return { ...commonData, days: days || 7 };
        default:
            return commonData;
    }
}
