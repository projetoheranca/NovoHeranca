
'use server';

import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email/send-email';
import { calculateNewSubscriptionStartDate } from '@/lib/utils';

let stripeInstance: Stripe | null = null;
const getStripe = () => {
  if (stripeInstance) return stripeInstance;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }
  stripeInstance = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
  return stripeInstance;
};

/**
 * Lógica de Recompensa: Identifica que o indicado pagou e premia o indicador.
 */
async function handleReferralReward(db: any, referredBy: string) {
    if (!referredBy) return;
    try {
        console.log(`[REFERRAL-PIX] Processando bônus para o indicador: ${referredBy}`);
        const referrerRef = db.ref(`users/${referredBy}/document`);
        const snapshot = await referrerRef.get();

        if (snapshot.exists()) {
            const profile = snapshot.val();
            // Adiciona 30 dias de bônus na assinatura de quem indicou
            const { newSubscriptionStartDate } = calculateNewSubscriptionStartDate({
                subscriptionStartDate: profile.subscriptionStartDate,
                createdAt: profile.createdAt,
                subscriptionStatus: profile.subscriptionStatus || 'Mensal',
                daysToAdd: 30,
            });
            
            await referrerRef.update({ subscriptionStartDate: newSubscriptionStartDate });
            console.log(`[REFERRAL-SUCCESS] 30 dias de bônus creditados ao indicador ${referredBy}`);
        }
    } catch (error) {
        console.error(`[REFERRAL_PIX_ERROR] Falha ao premiar indicador:`, error);
    }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_PIX;

  if (!webhookSecret) {
      console.error('[PIX_WEBHOOK] Chave STRIPE_WEBHOOK_SECRET_PIX não configurada.');
      return new NextResponse('Webhook secret missing.', { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[PIX_WEBHOOK_SIGNATURE_ERROR]`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Evento disparado quando o PIX é confirmado na conta da Stripe
  if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    const firebaseUID = session.metadata?.firebaseUID;

    if (!firebaseUID) {
        console.error('[PIX_WEBHOOK_ERROR] Metadata firebaseUID ausente na sessão.');
        return new NextResponse('Metadata missing.', { status: 400 });
    }

    try {
      const { db } = await getAdminServices();
      const userRef = db.ref(`users/${firebaseUID}/document`);
      const userSnapshot = await userRef.get();
      
      if (!userSnapshot.exists()) {
          console.error(`[PIX_WEBHOOK_ERROR] Usuário ${firebaseUID} não encontrado.`);
          return new NextResponse('User not found.', { status: 404 });
      }
      
      const userProfile = userSnapshot.val();
      const isAnual = session.metadata?.plan === 'anual';
      
      // 1. ATIVAÇÃO DA CONTA DO NOVO USUÁRIO
      await userRef.update({
        subscriptionStatus: isAnual ? 'Anual' : 'Mensal',
        storageLimit: isAnual ? 100 : 50,
        lastPaymentStatus: 'Pago',
        lastPaymentMethod: 'pix',
        status: 'active',
        subscriptionStartDate: new Date().toISOString(),
      });

      console.log(`[PIX_SUCCESS] Usuário ${firebaseUID} ativado via PIX.`);

      // 2. LÓGICA DE INDICAÇÃO: Se este usuário foi indicado, o indicador ganha o bônus AGORA.
      if (userProfile.referredBy) {
          await handleReferralReward(db, userProfile.referredBy);
      }

      // 3. ENVIO DE EMAIL DE CONFIRMAÇÃO
      await sendEmail({
          to: userProfile.email,
          template: 'payment.pixActivated',
          data: {
              name: userProfile.name || 'Cliente',
              plan: isAnual ? 'Anual' : 'Mensal',
              next_billing: isAnual ? "Daqui a 1 ano" : "Próximo mês",
              price: isAnual ? "209,30" : "24,90",
          }
      });

    } catch (error: any) {
      console.error(`[PIX_WEBHOOK_FATAL_ERROR]`, error.message);
      return new NextResponse('Internal error.', { status: 500 });
    }
  }

  return new NextResponse('OK', { status: 200 });
}
