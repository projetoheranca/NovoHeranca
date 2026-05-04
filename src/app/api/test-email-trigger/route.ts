
'use server';

import 'dotenv/config';
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE
import { sendEmail, type TemplatePayloads } from '@/lib/email/send-email';
import type { UserProfile } from '@/lib/types';

const CRON_SECRET = "150973";

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization') || '';
    const receivedToken = authHeader.replace('Bearer ', '').trim();
    if (receivedToken !== CRON_SECRET) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    try {
        const { userId, template } = await request.json() as { userId: string, template: keyof TemplatePayloads };

        if (!userId || !template) {
            return NextResponse.json({ error: 'userId e template são obrigatórios no corpo da requisição.' }, { status: 400 });
        }

        const { db } = await getAdminServices();
        const userRef = db.ref(`users/${userId}/document`);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists()) {
            return NextResponse.json({ error: `Usuário com ID ${userId} não encontrado.` }, { status: 404 });
        }

        const userProfile: UserProfile = userSnapshot.val();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002";
        
        let data: any;

        // Monta os dados necessários para cada template de teste
        switch(template) {
            case 'checkin.verificationStarted':
                data = { name: userProfile.name || 'Usuário', stop_link: `${baseUrl}/login` };
                break;
            case 'checkin.reminder':
                 data = { name: userProfile.name || 'Usuário', days: 3, checkin_link: `${baseUrl}/login` };
                break;
            // Adicione outros casos de template aqui conforme necessário
            default:
                return NextResponse.json({ error: `Template '${template}' não suportado por esta rota de teste.` }, { status: 400 });
        }

        console.log(`[API TEST-EMAIL] Tentando enviar o template '${template}' para ${userProfile.email} com os dados:`, data);
        
        const result = await sendEmail({
            to: userProfile.email,
            template: template as any, // Cast para evitar erros de tipo complexos aqui
            data: data
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `E-mail de teste '${template}' enviado com sucesso para ${userProfile.email}.`,
                resendResponse: result,
            });
        } else {
             return NextResponse.json({
                success: false,
                message: `Falha ao enviar o e-mail de teste '${template}'.`,
                errorDetails: result.message,
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[API /test-email-trigger] Erro:', error);
        return NextResponse.json({ success: false, message: 'Erro interno do servidor.', error: error.message }, { status: 500 });
    }
}
