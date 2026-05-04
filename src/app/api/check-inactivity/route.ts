
import { NextResponse } from 'next/server';
import { handleInactiveUserCheck } from '@/lib/actions';

export const dynamic = 'force-dynamic';

// O segredo do Cron Job é fixado aqui para garantir consistência.
const CRON_SECRET = "150973";

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  
  // Limpa o token de "Bearer " e espaços em branco para uma comparação robusta.
  const receivedToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (receivedToken !== CRON_SECRET) {
    console.error(`[CRON JOB] Falha na autenticação: O token recebido não corresponde ao segredo esperado.`);
    // Retorna 401 Unauthorized para sinalizar a falha de autenticação ao Cloud Scheduler.
    return new Response('Acesso não autorizado.', { status: 401 });
  }

  // A partir daqui, a autenticação foi bem-sucedida.
  console.log("[CRON JOB] Autenticação bem-sucedida. Iniciando verificação de inatividade...");

  try {
    const result = await handleInactiveUserCheck();
    
    if (result.success) {
      console.log(`[CRON JOB] Verificação concluída. ${result.checked} usuários checados, ${result.processed} ações processadas.`);
      return NextResponse.json(result, { status: 200 });
    } else {
      console.error(`[CRON JOB] Erro na lógica de verificação: ${result.message}`);
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error: any) {
    // Captura erros inesperados (ex: falha de conexão com o DB).
    console.error('[CRON JOB] Erro fatal na rota de verificação:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor ao executar a verificação.',
      error: error.message,
    }, { status: 500 });
  }
}
