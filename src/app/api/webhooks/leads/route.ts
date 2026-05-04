
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';

/**
 * Webhook para Captura Externa de Leads.
 * Pode ser chamado por Zapier, Make, Google Ads Webhooks, etc.
 * Protegido por CRON_SECRET como API Key simples.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const CRON_SECRET = "150973";

  if (token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const { name, email, phone, source, medium, campaign } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório.' }, { status: 400 });
    }

    const { db } = await getAdminServices();
    const leadsRef = db.ref('leads');
    
    // Verifica duplicidade
    const existingLeadSnap = await leadsRef.orderByChild('email').equalTo(email).get();
    if (existingLeadSnap.exists()) {
        return NextResponse.json({ message: 'Lead já cadastrado.', isNew: false }, { status: 200 });
    }

    const newLeadRef = leadsRef.push();
    await newLeadRef.set({
      name: name || '',
      email: email,
      phone: phone || '',
      source: source || 'other',
      medium: medium || '',
      campaign: campaign || '',
      status: 'new',
      createdAt: new Date().toISOString()
    });

    console.log(`[WEBHOOK_LEAD] Novo lead capturado: ${email} via ${source}`);

    return NextResponse.json({ success: true, message: 'Lead capturado com sucesso.', isNew: true }, { status: 201 });

  } catch (error: any) {
    console.error('[WEBHOOK_LEAD_ERROR]', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
