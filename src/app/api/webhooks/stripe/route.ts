
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email/send-email';
import { calculateNewSubscriptionStartDate } from '@/lib/utils';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY não configurada.');
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

/**
 * Lógica de Recompensa: Adiciona 30 dias ao indicador quando o indicado realiza um pagamento real.
 */
async function handleReferralReward(db: any, referredBy: string) {
    if (!referredBy) return;
    try {
        console.log(`[REFERRAL-CARD] Aplicando bônus para o indicador: ${referredBy}`);
        const referrerRef = db.ref(`users/${referredBy}/document`);
        const snapshot = await referrerRef.get();

        if (snapshot.exists()) {
            const profile = snapshot.val();
            const { newSubscriptionStartDate } = calculateNewSubscriptionStartDate({
                subscriptionStartDate: profile.subscriptionStartDate,
                createdAt: profile.createdAt,
                subscriptionStatus: profile.subscriptionStatus || 'Mensal',
                daysToAdd: 30,
            });
            
            await referrerRef.update({ subscriptionStartDate: newSubscriptionStartDate });
            console.log(`[REFERRAL-SUCCESS] 30 dias adicionados ao usuário ${referredBy}`);
        }
    } catch (error) {
        console.error(`[REFERRAL_ERROR] Falha ao premiar indicador:`, error);
    }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
      console.error('[WEBHOOK] Chave STRIPE_WEBHOOK_SECRET não configurada.');
      return new NextResponse('Webhook secret missing.', { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[WEBHOOK_ERROR] Assinatura inválida: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const firebaseUID = session.metadata?.firebaseUID;

    if (!firebaseUID) {
        console.error('[WEBHOOK] firebaseUID ausente nos metadados da sessão.');
        return new NextResponse('Metadata missing.', { status: 400 });
    }

    try {
        const { db } = await getAdminServices();
        const userRef = db.ref(`users/${firebaseUID}/document`);
        const userSnapshot = await userRef.get();
        
        if (!userSnapshot.exists()) return new NextResponse('User not found.', { status: 404 });
        
        const userProfile = userSnapshot.val();
        const isTrialStart = session.amount_total === 0;

        // --- ATIVAÇÃO DA CONTA NO BANCO DE DADOS ---
        await userRef.update({
          status: 'active',
          lastPaymentStatus: 'Pago',
          lastPaymentMethod: 'card',
          subscriptionStatus: isTrialStart ? 'Trial' : (userProfile.subscriptionStatus || 'Mensal'),
          subscriptionStartDate: new Date().toISOString(),
          lastPaymentFailedAt: null,
          trialAbuseDetected: false // Limpa qualquer bloqueio anterior
        });

        console.log(`[STRIPE_SUCCESS] Usuário ${firebaseUID} ativado. Tipo: ${isTrialStart ? 'Trial' : 'Pago'}`);

        // --- LÓGICA DE INDICAÇÃO ---
        // Se foi um pagamento real (não trial), premiamos o indicador agora.
        if (!isTrialStart && userProfile.referredBy) {
            await handleReferralReward(db, userProfile.referredBy);
        }

        // --- ENVIO DE EMAILS OBRIGATÓRIOS ---
        await sendEmail({ to: userProfile.email, template: 'marketing.welcome', data: { name: userProfile.name } });
        
        if (isTrialStart) {
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 14);
          await sendEmail({
              to: userProfile.email,
              template: 'payment.trialStarted',
              data: { 
                  name: userProfile.name, 
                  trial_end: trialEndDate.toLocaleDateString('pt-BR'), 
                  plan: "Mensal", 
                  price: "24,90" 
              }
          });
        } else {
            // Se for pagamento direto (ex: Anual), envia o recibo
            await sendEmail({
                to: userProfile.email,
                template: 'payment.succeeded',
                data: {
                    name: userProfile.name,
                    amount: session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00",
                    date: new Date().toLocaleDateString('pt-BR'),
                    next_billing: "Conforme plano",
                    invoice_link: "#"
                }
            });
        }

    } catch (error: any) {
        console.error('[WEBHOOK_FATAL_ERROR]:', error.message);
        return new NextResponse('Internal error.', { status: 500 });
    }
  }

  return new NextResponse('OK', { status: 200 });
}
