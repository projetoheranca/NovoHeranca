
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    console.warn("[MERCADOPAGO WEBHOOK] The /api/webhooks/mercadopago-pix endpoint has been deprecated and is no longer in use. User activation is now handled manually via the checkout page.");
    // Return a 410 Gone status to indicate that this endpoint is permanently unavailable.
    return new NextResponse('This webhook is no longer in use and has been deprecated.', { status: 410 });
}
