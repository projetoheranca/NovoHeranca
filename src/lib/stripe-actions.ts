'use server';

import Stripe from 'stripe';

/**
 * @fileOverview Ações de servidor para interagir com a API da Stripe com busca exaustiva de fingerprint.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY não configurada no ambiente.");
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

/**
 * Recupera os detalhes completos de uma sessão de checkout para fins de depuração.
 * Tenta encontrar o fingerprint no SetupIntent, PaymentIntent ou na própria Subscription.
 */
export async function getStripeSessionDetails(sessionId: string) {
  try {
    console.log(`[STRIPE_DEBUG] Iniciando consulta exaustiva da sessão: ${sessionId}`);
    
    // Busca a sessão expandindo os campos principais para evitar múltiplas chamadas
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['setup_intent', 'payment_intent', 'subscription.default_payment_method']
    });

    let fingerprint = 'NÃO LOCALIZADO';
    let source = 'Nenhum';

    // 1. Tenta extrair do SetupIntent (Comum em Trial)
    if (session.setup_intent) {
        const si = typeof session.setup_intent === 'string' 
            ? await stripe.setupIntents.retrieve(session.setup_intent, { expand: ['payment_method'] })
            : session.setup_intent as Stripe.SetupIntent;
        
        const pm = si.payment_method as Stripe.PaymentMethod;
        if (pm?.card?.fingerprint) {
            fingerprint = pm.card.fingerprint;
            source = 'SetupIntent';
        }
    } 
    
    // 2. Se não achou, tenta extrair do PaymentIntent (Comum em Pagamento Imediato)
    if (fingerprint === 'NÃO LOCALIZADO' && session.payment_intent) {
        const pi = typeof session.payment_intent === 'string'
            ? await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['payment_method'] })
            : session.payment_intent as Stripe.PaymentIntent;

        const pm = pi.payment_method as Stripe.PaymentMethod;
        if (pm?.card?.fingerprint) {
            fingerprint = pm.card.fingerprint;
            source = 'PaymentIntent';
        }
    }

    // 3. Fallback: Tenta extrair diretamente da Assinatura
    if (fingerprint === 'NÃO LOCALIZADO' && session.subscription) {
        const sub = typeof session.subscription === 'string'
            ? await stripe.subscriptions.retrieve(session.subscription, { expand: ['default_payment_method'] })
            : session.subscription as Stripe.Subscription;
        
        const pm = sub.default_payment_method as Stripe.PaymentMethod;
        if (pm?.card?.fingerprint) {
            fingerprint = pm.card.fingerprint;
            source = 'Subscription';
        }
    }

    return {
      success: true,
      fingerprint,
      source,
      raw: session,
    };
  } catch (error: any) {
    console.error(`[STRIPE_DEBUG_ERROR] Falha na consulta profunda:`, error);
    return { success: false, message: error.message };
  }
}
