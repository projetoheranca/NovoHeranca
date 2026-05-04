
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE
import { getCheckInStatus } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';


export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization') || '';
    const CRON_SECRET = "150973";
    const receivedToken = authHeader.replace('Bearer ', '').trim();

    if (receivedToken !== CRON_SECRET) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'userId é obrigatório no corpo da requisição.' }, { status: 400 });
        }

        const { db } = await getAdminServices();
        const userRef = db.ref(`users/${userId}/document`);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists()) {
            return NextResponse.json({ error: `Usuário com ID ${userId} não encontrado.` }, { status: 404 });
        }

        const userProfile: UserProfile = userSnapshot.val();

        const { status, daysRemaining, nextCheckInDate } = getCheckInStatus(
            userProfile.lastCheckIn,
            userProfile.checkInFrequency,
            userProfile.deliveryGracePeriod
        );
        
        return NextResponse.json({
            userId,
            status,
            daysRemaining,
            lastCheckIn: userProfile.lastCheckIn,
            nextCheckInDate: nextCheckInDate?.toISOString(),
            checkInFrequency: userProfile.checkInFrequency,
            deliveryGracePeriod: userProfile.deliveryGracePeriod,
        });

    } catch (error: any) {
        console.error('[API /test-status] Erro:', error);
        return NextResponse.json({ success: false, message: 'Erro interno do servidor.', error: error.message }, { status: 500 });
    }
}
