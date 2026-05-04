
import 'dotenv/config';
import { NextResponse } from 'next/server';
import { deliverScheduledMemory } from '@/lib/calendar-actions';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    try {
        const { db } = getAdminServices();
        const usersRef = db.ref('users');
        const usersSnapshot = await usersRef.get();
        if (!usersSnapshot.exists()) {
            return NextResponse.json({ message: 'Nenhum usuário encontrado.' }, { status: 200 });
        }

        const users = usersSnapshot.val();
        let sentCount = 0;
        const results: { scheduleId: string; success: boolean; message?: string }[] = [];

        for (const userId in users) {
            const scheduledMemoriesRef = db.ref(`users/${userId}/scheduledMemories`);
            const scheduledSnapshot = await scheduledMemoriesRef.orderByChild('status').equalTo('scheduled').get();

            if (scheduledSnapshot.exists()) {
                const scheduledMemories = scheduledSnapshot.val();
                for (const scheduleId in scheduledMemories) {
                    
                    const result = await deliverScheduledMemory({
                        userId: userId,
                        scheduleId: scheduleId
                    });
                    
                    results.push({ scheduleId, ...result });
                    if (result.success) {
                        sentCount++;
                    }
                }
            }
        }

        if (results.length > 0) {
            return NextResponse.json({ 
                success: sentCount > 0, 
                message: `Teste concluído. ${sentCount} de ${results.length} e-mail(s) agendado(s) foram processados.`, 
                details: results 
            });
        } else {
            return NextResponse.json({ success: true, message: 'Nenhuma memória agendada com status "scheduled" encontrada para enviar.' });
        }

    } catch (error: any) {
        console.error('[API /test-scheduled-delivery] Erro:', error);
        return NextResponse.json({ success: false, message: 'Erro interno do servidor.', error: error.message }, { status: 500 });
    }
}
