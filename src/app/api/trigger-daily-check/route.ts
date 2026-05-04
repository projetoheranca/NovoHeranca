
import { NextResponse } from 'next/server';
import { handleInactiveUserCheck } from '@/lib/actions';

export const dynamic = 'force-dynamic';

const CRON_SECRET = "150973";

/**
 * Endpoint de API para acionar manualmente a verificação diária completa do sistema.
 * Este endpoint é projetado para testes e depuração.
 *
 * Exemplo de uso com curl:
 * curl -X GET "https://<SUA_URL>/api/trigger-daily-check" -H "Authorization: Bearer <SUA_CHAVE_SECRETA>"
 */
export async function GET(request: Request) {
  // 1. Validar a chave de segurança para garantir que a requisição é legítima.
  const authHeader = request.headers.get('authorization') || '';
  const receivedToken = authHeader.replace('Bearer ', '').trim();

  if (receivedToken !== CRON_SECRET) {
    console.warn(`[API /trigger-daily-check] Tentativa de acesso não autorizado.`);
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    // 2. Chamar a server action principal que executa toda a lógica de verificação.
    console.log('[API /trigger-daily-check] Gatilho manual recebido. Iniciando verificação completa...');
    const result = await handleInactiveUserCheck();

    if (result.success) {
      console.log(`[API /trigger-daily-check] Verificação concluída. Usuários checados: ${result.checked}, ações processadas: ${result.processed}`);
      return NextResponse.json({
        success: true,
        message: 'Verificação diária executada com sucesso.',
        checkedUsers: result.checked,
        processedActions: result.processed,
        logs: result.logs, // Retorna os logs detalhados
      }, { status: 200 });
    } else {
      // Se a action falhar, lança o erro para ser capturado abaixo.
      throw new Error(result.message || "Falha na execução da verificação.");
    }

  } catch (error: any) {
    console.error('[API /trigger-daily-check] Erro ao executar a verificação manual:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao processar a verificação.',
      error: error.message,
    }, { status: 500 });
  }
}
