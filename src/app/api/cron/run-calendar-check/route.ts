import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Esta rota foi descontinuada e sua lógica unificada com a verificação diária principal.
  // Isso evita problemas de registro de rota e centraliza as tarefas de cron.
  console.warn('[DEPRECATION_WARNING] A rota /api/cron/run-calendar-check foi acionada, mas está descontinuada.');
  
  return NextResponse.json({
    status: 410, // HTTP Status Code para "Gone" (Recurso Removido)
    success: false,
    message: "Esta rota (/api/cron/run-calendar-check) foi descontinuada.",
    instructions: "Para testar TODOS os agendamentos pendentes, por favor, use a rota: GET /api/test-scheduled-delivery. Para simular a rotina diária completa, use GET /api/trigger-daily-check."
  }, { status: 410 });
}
