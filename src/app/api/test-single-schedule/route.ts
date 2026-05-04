
'use server';

import 'dotenv/config';
import { NextResponse } from 'next/server';
import { deliverScheduledMemory } from '@/lib/calendar-actions';

const CRON_SECRET = "150973";

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization') || '';
    const receivedToken = authHeader.replace('Bearer ', '').trim();
    if (receivedToken !== CRON_SECRET) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    try {
        const { userId, scheduleId } = await request.json();

        if (!userId || !scheduleId) {
            return NextResponse.json({ error: 'userId e scheduleId são obrigatórios no corpo da requisição.' }, { status: 400 });
        }

        const result = await deliverScheduledMemory({ userId, scheduleId });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Tentativa de envio para o agendamento ${scheduleId} do usuário ${userId} concluída.`,
                details: result,
            });
        } else {
             return NextResponse.json({
                success: false,
                message: `Falha ao processar o agendamento ${scheduleId}.`,
                errorDetails: result.message,
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[API /test-single-schedule] Erro:', error);
        return NextResponse.json({ success: false, message: 'Erro interno do servidor.', error: error.message }, { status: 500 });
    }
}
