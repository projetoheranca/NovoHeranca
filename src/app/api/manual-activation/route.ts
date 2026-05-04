
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email/send-email';

// Mapeia o Price ID do Stripe para o nome do nosso plano e seu limite de armazenamento
const planIdToPlanInfo: { [key: string]: { name: 'Mensal' | 'Anual'; storageLimit: number, price: string } } = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MENSAL!]: { name: 'Mensal', storageLimit: 50, price: '24,90' },
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANUAL!]: { name: 'Anual', storageLimit: 100, price: '209,30' },
};

/**
 * Rota de utilidade para testes e suporte. 
 * Permite ativar uma assinatura manualmente sem passar pelo Stripe.
 */
export async function POST(req: Request) {
  try {
    const { userId, priceId } = await req.json();

    if (!userId || !priceId) {
      return NextResponse.json({ message: 'ID do usuário e ID do plano são obrigatórios.' }, { status: 400 });
    }
    
    const planInfo = planIdToPlanInfo[priceId];
    if (!planInfo) {
      return NextResponse.json({ message: `Plano com ID '${priceId}' não reconhecido nas configurações do ambiente.` }, { status: 400 });
    }

    const { db } = await getAdminServices();
    const userRef = db.ref(`users/${userId}/document`);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists()) {
      return NextResponse.json({ message: 'Usuário não encontrado no banco de dados.' }, { status: 404 });
    }

    const userProfile = userSnapshot.val();
    const now = new Date();
    const nextBillingDate = new Date();
    
    if (planInfo.name === 'Mensal') {
        nextBillingDate.setMonth(now.getMonth() + 1);
    } else {
        nextBillingDate.setFullYear(now.getFullYear() + 1);
    }

    // Ativa a conta simulando um pagamento aprovado
    await userRef.update({
      subscriptionStatus: planInfo.name,
      storageLimit: planInfo.storageLimit,
      lastPaymentStatus: 'Pago',
      status: 'active',
      subscriptionStartDate: now.toISOString(),
      lastPaymentMethod: 'manual_test', 
      trialAbuseDetected: false,
      cancellationRequested: false, // Limpa o pedido de cancelamento na ativação manual
    });

    // Envia e-mail de confirmação para validar o template
    await sendEmail({
        to: userProfile.email,
        template: 'payment.succeeded',
        data: {
            name: userProfile.name || 'Usuário',
            amount: planInfo.price,
            date: now.toLocaleDateString('pt-BR'),
            next_billing: nextBillingDate.toLocaleDateString('pt-BR'),
            invoice_link: "#"
        }
    });

    return NextResponse.json({ 
        success: true, 
        message: `Usuário ${userId} ativado manualmente no plano ${planInfo.name}. E-mail de confirmação enviado.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API /manual-activation] Erro:', error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
