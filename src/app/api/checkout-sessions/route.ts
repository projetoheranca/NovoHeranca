
import dotenv from 'dotenv';
dotenv.config();

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminServices } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { db } = await getAdminServices();

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('[API Checkout] Erro: STRIPE_SECRET_KEY não está definida.');
      throw new Error('A funcionalidade de pagamento não está configurada corretamente no servidor.');
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    const { priceId, userId, planName } = await req.json();

    if (!priceId || !userId || !planName) {
      return NextResponse.json({ error: 'Price ID, User ID e Plan Name são obrigatórios.' }, { status: 400 });
    }

    const userProfileRef = db.ref(`users/${userId}/document`);
    const snapshot = await userProfileRef.get();
    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const userProfile = snapshot.val();

    // --- BLOQUEIO PREVENTIVO DE ABUSO ---
    if (userProfile.trialAbuseDetected) {
        return NextResponse.json({ error: 'Detectamos que seus dados já foram utilizados para um bônus. Por favor, assine um plano pago para continuar.' }, { status: 403 });
    }

    // LÓGICA DE ELIGIBILIDADE DE TRIAL: 14 dias
    const isEligibleForTrial = planName.toLowerCase() === 'mensal' && 
                               userProfile.lastPaymentStatus !== 'Pago' && 
                               userProfile.accountStatus !== 'expired' &&
                               !userProfile.trialAbuseDetected;

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
        subscription_data: isEligibleForTrial ? { trial_period_days: 14 } : undefined,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error("Não foi possível criar a sessão de checkout do Stripe.");
    }
    
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("[API /api/checkout-sessions] Erro:", error);
    return NextResponse.json({ error: error.message || "Erro inesperado ao criar sessão de pagamento." }, { status: 500 });
  }
}
