
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

const CRON_SECRET = "150973";

/**
 * ROTA DE TESTE: Simula a lógica anti-fraude do Webhook do Stripe.
 * Permite testar o bloqueio de fingerprints repetidos sem usar o Stripe real.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const receivedToken = authHeader.replace('Bearer ', '').trim();

  if (receivedToken !== CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { userId, fingerprint, isTrial } = await req.json();

    if (!userId || !fingerprint) {
      return NextResponse.json({ error: 'userId e fingerprint são obrigatórios' }, { status: 400 });
    }

    const { db } = await getAdminServices();
    const userRef = db.ref(`users/${userId}/document`);
    const fingerprintRef = db.ref(`cardFingerprints/${fingerprint}`);
    
    const fingerprintSnapshot = await fingerprintRef.get();
    const isAlreadyUsed = fingerprintSnapshot.exists();

    // LÓGICA ANTI-FRAUDE: Bloqueia APENAS se for uma nova tentativa de trial com cartão usado.
    if (isTrial && isAlreadyUsed) {
      console.warn(`[TEST_ANTI_FRAUD] Abuso detectado para o usuário ${userId} com cartão ${fingerprint}`);
      
      await userRef.update({
        status: 'suspended',
        lastPaymentStatus: 'Inadimplente',
        trialAbuseDetected: true,
        notes: 'Bloqueado por teste de reutilização de cartão.'
      });

      return NextResponse.json({ 
        success: false, 
        message: 'Tentativa de abuso detectada e bloqueada. Usuário precisará assinar um plano pago para liberar.',
        action: 'Account Suspended' 
      });
    }

    // Se passou ou se é pagamento real, registra/atualiza o fingerprint
    await fingerprintRef.set({
      userId: userId,
      lastUsedAt: new Date().toISOString(),
      usedForTrial: isTrial || (isAlreadyUsed ? fingerprintSnapshot.val().usedForTrial : false)
    });

    // Simula ativação da conta
    await userRef.update({
      status: 'active',
      subscriptionStatus: isTrial ? 'trialing' : 'Mensal',
      lastPaymentStatus: 'Pago',
      trialAbuseDetected: false // Limpa flag se ele pagou
    });

    return NextResponse.json({ 
      success: true, 
      message: isTrial ? 'Trial ativado com sucesso.' : 'Pagamento real processado com sucesso.',
      fingerprintStatus: isAlreadyUsed ? 'Updated' : 'New'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
