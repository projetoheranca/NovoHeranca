
import { NextResponse } from 'next/server';
import { deliverAllMemories } from '@/lib/actions'; // A lógica foi movida para actions.ts
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  console.log(`[API /deliver-legacy] Recebido token: ${token}`);

  try {
    const { db } = await getAdminServices();
    const tokenRef = db.ref(`deliveryTokens/${token}`);
    const tokenSnapshot = await tokenRef.get();

    if (!tokenSnapshot.exists()) {
      console.error(`[API /deliver-legacy] Token inválido ou não encontrado: ${token}`);
      const errorUrl = new URL('/legacy-delivered', request.url);
      errorUrl.searchParams.set('error', 'token_invalid');
      return NextResponse.redirect(errorUrl.toString());
    }

    const tokenData = tokenSnapshot.val();
    const now = new Date();
    const expiryDate = new Date(tokenData.expiresAt);

    if (now > expiryDate || tokenData.status !== 'pending') {
      console.warn(`[API /deliver-legacy] Token expirado ou já utilizado: ${token}`);
      const errorUrl = new URL('/legacy-delivered', request.url);
      errorUrl.searchParams.set('error', 'token_expired');
      return NextResponse.redirect(errorUrl.toString());
    }
    
    await tokenRef.update({ status: 'used', usedAt: now.toISOString() });
    
    const { userId } = tokenData;
    console.log(`[API /deliver-legacy] Token válido para o usuário ${userId}. Iniciando entrega...`);
    
    const deliveryResult = await deliverAllMemories(userId);

    if (!deliveryResult.success) {
        throw new Error(deliveryResult.message || "Falha ao entregar o legado.");
    }
    
    const userProfileRef = db.ref(`users/${userId}/document`);
    const userSnapshot = await userProfileRef.get();
    const userName = userSnapshot.exists() ? userSnapshot.val().name : "seu ente querido";

    const successUrl = new URL('/legacy-delivered', request.url);
    successUrl.searchParams.set('name', userName);

    return NextResponse.redirect(successUrl.toString());

  } catch (error: any) {
    console.error(`[API /deliver-legacy] Erro crítico ao processar token ${token}:`, error);
    const errorUrl = new URL('/legacy-delivered', request.url);
    errorUrl.searchParams.set('error', 'internal_error');
    return NextResponse.redirect(errorUrl.toString());
  }
}
