
'use server';

import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE
import { sendEmail } from '@/lib/email/send-email';
import { calculateNewSubscriptionStartDate } from '@/lib/utils';
import type admin from 'firebase-admin';

// --- Inicialização do Stripe ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('A chave secreta do Stripe (STRIPE_SECRET_KEY) não está configurada.');
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

// Mapeia o nome do plano para o limite de armazenamento e preço
const planNameToPlanInfo: { [key: string]: { name: 'Mensal' | 'Anual'; storageLimit: number, price: string } } = {
  'mensal': { name: 'Mensal', storageLimit: 50, price: '24,90' },
  'anual': { name: 'Anual', storageLimit: 100, price: '209,30' },
};

async function handleReferralReward(db: admin.database.Database, referredBy: string) {
    if (!referredBy) return;

    try {
        console.log(`[REFERRAL-PIX] Usuário foi indicado por ${referredBy}. Aplicando recompensa.`);
        const referrerRef = db.ref(`users/${referredBy}/document`);
        const referrerSnapshot = await referrerRef.get();

        if (referrerSnapshot.exists()) {
            const referrerProfile = referrerSnapshot.val();
            
            const { newSubscriptionStartDate, newExpirationDate } = calculateNewSubscriptionStartDate({
                subscriptionStartDate: referrerProfile.subscriptionStartDate,
                createdAt: referrerProfile.createdAt,
                subscriptionStatus: referrerProfile.subscriptionStatus,
                daysToAdd: 30, // Adiciona 30 dias de recompensa
            });

            await referrerRef.update({ 
                subscriptionStartDate: newSubscriptionStartDate
            });

            console.log(`[REFERRAL-PIX] Recompensa de 30 dias aplicada para o afiliado ${referredBy}. Nova data de renovação efetiva: ${newExpirationDate.toLocaleDateString('pt-BR')}`);
        } else {
            console.warn(`[REFERRAL-PIX] Afiliado com ID ${referredBy} não encontrado.`);
        }
    } catch (error: any) {
        console.error(`[REFERRAL_ERROR-PIX] Falha ao aplicar recompensa para o afiliado ${referredBy}:`, error);
    }
}


export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_PIX;

  if (!webhookSecret) {
      console.error('[PIX WEBHOOK] A chave secreta do Webhook do Stripe PIX (STRIPE_WEBHOOK_SECRET_PIX) não está configurada.');
      return new NextResponse('Webhook secret não configurado.', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[PIX WEBHOOK] Erro na verificação da assinatura: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;

    const firebaseUID = session.metadata?.firebaseUID;
    const planName = session.metadata?.plan;

    if (!firebaseUID || !planName) {
      console.error('[PIX WEBHOOK] Metadados firebaseUID ou plan faltando na sessão do Stripe.');
      return new NextResponse('Metadados ausentes na sessão.', { status: 400 });
    }

    const planInfo = planNameToPlanInfo[planName];
    if (!planInfo) {
      console.error(`[PIX WEBHOOK] Nome do plano '${planName}' não mapeado para informações de plano.`);
      return new NextResponse('Plano não reconhecido.', { status: 400 });
    }

    try {
      const { db } = await getAdminServices();
      const userRef = db.ref(`users/${firebaseUID}/document`);
      
      const userSnapshot = await userRef.get();
      if (!userSnapshot.exists()) {
          console.error(`[PIX WEBHOOK] Usuário com UID ${firebaseUID} não encontrado no banco de dados.`);
          return new NextResponse('Usuário não encontrado.', { status: 404 });
      }
      const userProfile = userSnapshot.val();
      
      await userRef.update({
        subscriptionStatus: planInfo.name,
        storageLimit: planInfo.storageLimit,
        lastPaymentStatus: 'Pago',
        status: 'active',
        subscriptionStartDate: new Date().toISOString(),
        lastPaymentFailedAt: null,
        delinquencyNotifiedAt: null,
      });

      console.log(`[PIX WEBHOOK] Assinatura do usuário ${firebaseUID} ativada para o plano ${planInfo.name} via PIX.`);
      
      // --- LÓGICA DE RECOMPENSA DE AFILIADO ---
      if (userProfile.referredBy) {
          await handleReferralReward(db, userProfile.referredBy);
      }

      const now = new Date();
      const nextBillingDate = new Date();
      if (planInfo.name === 'Mensal') {
          nextBillingDate.setMonth(now.getMonth() + 1);
      } else {
          nextBillingDate.setFullYear(now.getFullYear() + 1);
      }

      await sendEmail({
          to: userProfile.email,
          template: 'payment.pixActivated',
          data: {
              name: userProfile.name,
              plan: planInfo.name,
              next_billing: nextBillingDate.toLocaleDateString('pt-BR'),
              price: planInfo.price,
          }
      });


    } catch (error) {
      console.error(`[PIX WEBHOOK] Erro ao atualizar o usuário ${firebaseUID} no Firebase:`, error);
      return new NextResponse('Erro interno ao atualizar dados do usuário.', { status: 500 });
    }
  }

  return new NextResponse('Webhook PIX processado com sucesso.', { status: 200 });
}
