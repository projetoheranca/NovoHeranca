
import dotenv from 'dotenv';
dotenv.config();

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE
import { sendEmail } from '@/lib/email/send-email';

// --- Rota da API ---
export async function POST(req: Request) {
  try {
    const { db } = await getAdminServices();

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('[API Checkout] Erro: STRIPE_SECRET_KEY não está definida no ambiente.');
      throw new Error('A funcionalidade de pagamento não está configurada corretamente no servidor.');
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    const { priceId, userId, planName, cardToken } = await req.json();

    if (!priceId || !userId || !planName) {
      return NextResponse.json({ error: 'Price ID, User ID e Plan Name são obrigatórios.' }, { status: 400 });
    }

    const isTrial = planName.toLowerCase() === 'mensal';

    // --- LÓGICA DE PREVENÇÃO DE ABUSO DE TRIAL ---
    if (isTrial && cardToken) {
        try {
            const tokenObject = await stripe.tokens.retrieve(cardToken);
            if (tokenObject.card?.fingerprint) {
                const fingerprint = tokenObject.card.fingerprint;
                const fingerprintRef = db.ref(`cardFingerprints/${fingerprint}`);
                const snapshot = await fingerprintRef.get();
                if (snapshot.exists()) {
                    console.warn(`[TRIAL_ABUSE_ATTEMPT] Tentativa de novo trial com cartão já utilizado. Fingerprint: ${fingerprint}, UserID: ${userId}`);
                    return NextResponse.json({ error: 'Este cartão já foi utilizado para um período de teste gratuito. Por favor, utilize um cartão diferente ou assine diretamente.' }, { status: 403 });
                }
            }
        } catch (tokenError) {
            console.error('[API Checkout] Erro ao verificar o token do cartão no Stripe:', tokenError);
            // Prosseguir sem a verificação se o token for inválido, mas logar o erro.
        }
    }


    const userProfileRef = db.ref(`users/${userId}/document`);
    const snapshot = await userProfileRef.get();
    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const userProfile = snapshot.val();

    let stripeCustomerId = userProfile.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email,
        name: userProfile.name,
        metadata: { firebaseUID: userId },
      });
      stripeCustomerId = customer.id;
      await userProfileRef.update({ stripeCustomerId: stripeCustomerId });
    }

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002";
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        customer: stripeCustomerId,
        line_items: [ { price: priceId, quantity: 1 } ],
        metadata: { firebaseUID: userId, priceId: priceId },
        success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&priceId=${priceId}`,
        cancel_url: `${siteUrl}/pricing`,
        mode: 'subscription',
        subscription_data: isTrial ? { trial_period_days: 14 } : undefined,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (isTrial) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        
        await sendEmail({
            to: userProfile.email,
            template: 'payment.trialStarted',
            data: {
                name: userProfile.name,
                trial_end: trialEndDate.toLocaleDateString('pt-BR'),
                plan: "Mensal",
                price: "24,90",
            }
        });
    }

    if (!session.url) {
      throw new Error("Não foi possível criar a sessão de checkout do Stripe.");
    }
    
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("[API /api/checkout-sessions] Erro:", error);
    return NextResponse.json({ error: error.message || "Um erro inesperado ocorreu ao criar a sessão de pagamento." }, { status: 500 });
  }
}
