
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


// Mapeia o Price ID do Stripe para o nome do nosso plano e seu limite de armazenamento
const planIdToPlanInfo: { [key: string]: { name: 'Mensal' | 'Anual'; storageLimit: number, price: string } } = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MENSAL!]: { name: 'Mensal', storageLimit: 50, price: '24,90' },
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANUAL!]: { name: 'Anual', storageLimit: 100, price: '209,30' },
};

async function handleReferralReward(db: admin.database.Database, referredBy: string) {
    if (!referredBy) return;

    try {
        console.log(`[REFERRAL] Usuário foi indicado por ${referredBy}. Aplicando recompensa.`);
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

            console.log(`[REFERRAL] Recompensa de 30 dias aplicada para o afiliado ${referredBy}. Nova data de renovação efetiva: ${newExpirationDate.toLocaleDateString('pt-BR')}`);
            
            // Opcional: Enviar e-mail de notificação para o afiliado sobre a recompensa.
            // await sendEmail({ to: referrerProfile.email, template: '...', data: {...} });

        } else {
            console.warn(`[REFERRAL] Afiliado com ID ${referredBy} não encontrado. Nenhuma recompensa aplicada.`);
        }
    } catch (error) {
        console.error(`[REFERRAL_ERROR] Falha ao aplicar recompensa para o afiliado ${referredBy}:`, error);
    }
}


export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
      console.error('[WEBHOOK] A chave secreta do Webhook do Stripe (STRIPE_WEBHOOK_SECRET) não está configurada.');
      return new NextResponse('Webhook secret não configurado.', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[WEBHOOK] Erro na verificação da assinatura: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // --- checkout.session.completed ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Processa tanto inícios de trial quanto pagamentos diretos bem-sucedidos
    if (session.payment_status === 'paid' || session.mode === 'subscription') {
      const firebaseUID = session.metadata?.firebaseUID;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      if (!firebaseUID || !priceId) {
        console.error('[WEBHOOK] Metadados firebaseUID ou priceId faltando na sessão do Stripe.');
        return new NextResponse('Metadados ausentes na sessão.', { status: 400 });
      }

      const planInfo = planIdToPlanInfo[priceId];
      if (!planInfo) {
        console.error(`[WEBHOOK] priceId '${priceId}' não mapeado para um nome de plano.`);
        return new NextResponse('Plano não reconhecido.', { status: 400 });
      }

      try {
        const { db } = await getAdminServices();
        const userRef = db.ref(`users/${firebaseUID}/document`);
        const userSnapshot = await userRef.get();
        if (!userSnapshot.exists()) {
             console.error(`[WEBHOOK] Usuário com UID ${firebaseUID} não encontrado no banco de dados.`);
             return new NextResponse('Usuário não encontrado.', { status: 404 });
        }
        const userProfile = userSnapshot.val();
        
        await userRef.update({
          subscriptionStatus: planInfo.name,
          storageLimit: planInfo.storageLimit,
          lastPaymentStatus: 'Pago',
          lastPaymentMethod: 'card', // Adiciona o método de pagamento
          status: 'active',
          subscriptionStartDate: new Date().toISOString(),
          lastPaymentFailedAt: null, 
          delinquencyNotifiedAt: null,
          accountStatus: 'active'
        });

        console.log(`[WEBHOOK] Assinatura do usuário ${firebaseUID} atualizada para o plano ${planInfo.name}.`);

        // --- LÓGICA DE RECOMPENSA DE AFILIADO ---
        if (userProfile.referredBy) {
            await handleReferralReward(db, userProfile.referredBy);
        }

        // --- LÓGICA DE PREVENÇÃO DE ABUSO DE TRIAL ---
        if (session.mode === 'subscription' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
                expand: ['default_payment_method']
            });
            const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;
            
            if (paymentMethod && paymentMethod.card && paymentMethod.card.fingerprint) {
                const fingerprint = paymentMethod.card.fingerprint;
                const fingerprintRef = db.ref(`cardFingerprints/${fingerprint}`);
                await fingerprintRef.set({
                    userId: firebaseUID,
                    createdAt: new Date().toISOString()
                });
                console.log(`[TRIAL_ABUSE_PREVENTION] Fingerprint do cartão ${fingerprint} salvo para o usuário ${firebaseUID}.`);
            }
        }
        
        const now = new Date();
        const isTrial = session.mode === 'subscription' && session.subscription && session.payment_status !== 'paid';

        // Envia o e-mail de Boas-vindas para o Trial
        if (isTrial) {
          const trialEndDate = new Date();
          trialEndDate.setDate(now.getDate() + 14);
          
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
        // Envia o e-mail de Pagamento Bem-sucedido para compras diretas
        else if (session.payment_status === 'paid') {
           const invoice = await stripe.invoices.retrieve(session.invoice as string);
           const nextBillingDate = new Date();
           if (planInfo.name === 'Mensal') {
               nextBillingDate.setMonth(now.getMonth() + 1);
           } else {
               nextBillingDate.setFullYear(now.getFullYear() + 1);
           }
           await sendEmail({
               to: userProfile.email,
               template: 'payment.succeeded',
               data: {
                   name: userProfile.name,
                   amount: planInfo.price,
                   date: now.toLocaleDateString('pt-BR'),
                   next_billing: nextBillingDate.toLocaleDateString('pt-BR'),
                   invoice_link: invoice.hosted_invoice_url || "#"
               }
           });
        }

      } catch (error) {
        console.error(`[WEBHOOK] Erro ao atualizar o usuário ${firebaseUID} no Firebase:`, error);
        return new NextResponse('Erro interno ao atualizar dados do usuário.', { status: 500 });
      }
    }
  }

  // --- invoice.payment_failed ---
  if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      try {
          const { db } = await getAdminServices();
          const usersRef = db.ref('users');
          
          const snapshot = await usersRef.orderByChild('document/stripeCustomerId').equalTo(customerId).once('value');
          
          if (snapshot.exists()) {
              const users = snapshot.val();
              const userId = Object.keys(users)[0];
              const userRef = db.ref(`users/${userId}/document`);
              const userSnapshot = await userRef.get();
              const userProfile = userSnapshot.val();

              if (userProfile.lastPaymentStatus !== 'Inadimplente') {
                  await userRef.update({
                      lastPaymentStatus: 'Inadimplente',
                      lastPaymentFailedAt: new Date().toISOString(),
                      delinquencyNotifiedAt: null,
                  });
                   console.log(`[WEBHOOK] Usuário ${userId} marcado como inadimplente devido à falha no pagamento da fatura ${invoice.id}.`);
              }
          } else {
              console.warn(`[WEBHOOK] Recebido evento de falha de pagamento para o cliente Stripe ${customerId}, mas nenhum usuário correspondente foi encontrado no Firebase.`);
          }
      } catch (error) {
          console.error(`[WEBHOOK] Erro ao lidar com invoice.payment_failed para o cliente ${customerId}:`, error);
          return new NextResponse('Erro interno ao processar falha de pagamento.', { status: 500 });
      }
  }
  
  return new NextResponse('Webhook processado com sucesso.', { status: 200 });
}
