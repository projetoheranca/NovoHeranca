
import { NextResponse } from 'next/server';
import { cleanupExpiredTokens } from '@/lib/token-actions';

export const dynamic = 'force-dynamic';

const CRON_SECRET = "150973";

/**
 * Endpoint de API para acionar a limpeza de tokens expirados ou usados.
 * Protegido pela mesma chave do Cron Job.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const receivedToken = authHeader.replace('Bearer ', '').trim();

  if (receivedToken !== CRON_SECRET) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const result = await cleanupExpiredTokens();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        removedCount: result.removedCount,
      }, { status: 200 });
    } else {
      // Se a própria action falhar, lança um erro para ser capturado abaixo
      throw new Error(result.message);
    }

  } catch (error: any) {
    console.error('[API /cleanup-tokens] Erro ao executar a limpeza de tokens:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao processar a limpeza.',
      error: error.message,
    }, { status: 500 });
  }
}
