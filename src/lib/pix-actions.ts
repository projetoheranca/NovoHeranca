'use server';

import 'dotenv/config';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE
import { Payment } from 'mercadopago';
import { mercadopagoClient } from './mercadopago-config'; // Importa o cliente já configurado

const planToPrice: { [key: string]: { amount: number; name: string } } = {
    'mensal': { amount: 24.90, name: 'Plano Mensal' },
    'anual': { amount: 209.30, name: 'Plano Anual' },
};

interface CreatePixCheckoutPayload {
    userId: string;
    plan: string;
}

export async function createPixCheckoutSession(payload: CreatePixCheckoutPayload): Promise<{ success: boolean; qrCodeBase64?: string; qrCode?: string; message?: string; paymentId?: number }> {
    try {
        const { db } = await getAdminServices();
        const { userId, plan } = payload;
        
        const client = mercadopagoClient;
        if (!client) {
             throw new Error('O cliente do Mercado Pago não está configurado corretamente.');
        }

        const userProfileRef = db.ref(`users/${userId}/document`);
        const snapshot = await userProfileRef.get();
        if (!snapshot.exists()) {
            throw new Error('Usuário não encontrado.');
        }
        
        const planDetails = planToPrice[plan];
        if (!planDetails) {
            throw new Error('Plano inválido.');
        }

        const paymentRequestBody = {
            transaction_amount: planDetails.amount,
            description: planDetails.name,
            payment_method_id: 'pix',
            payer: {
                email: "noreply@minhaherancadigital.com",
                first_name: "Minha",
                last_name: "Heranca Digital",
                identification: {
                    type: "CNPJ",
                    number: "51144507000150" // CNPJ da empresa
                },
            },
            external_reference: userId,
        };

        const payment = new Payment(client);
        const result = await payment.create({ body: paymentRequestBody });
        
        if (!result.point_of_interaction?.transaction_data) {
            const errorInfo = result ? JSON.stringify(result) : "Resposta vazia.";
            console.error("[PIX_API_ERROR] Resposta da API do MP não contém os dados do QR Code:", errorInfo);
            throw new Error("Resposta inesperada da API do Mercado Pago ao criar pagamento PIX.");
        }

        return { 
            success: true, 
            qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
            qrCode: result.point_of_interaction.transaction_data.qr_code,
            paymentId: result.id,
        };

    } catch (error: any) {
        console.error("[PIX_ACTION_ERROR] Erro ao criar sessão PIX:", error.cause || error);
        return { success: false, message: error.message || "Erro desconhecido." };
    }
}


export async function verifyPixPayment(payload: { paymentId: number }): Promise<{ success: boolean; isApproved: boolean; message?: string }> {
    try {
        const { db } = await getAdminServices();
        const { paymentId } = payload;

        const client = mercadopagoClient;
        if (!client) {
            throw new Error('O cliente do Mercado Pago não está configurado corretamente.');
        }

        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: paymentId });

        if (paymentDetails.status === 'approved') {
            const firebaseUID = paymentDetails.external_reference;
            const planDescription = paymentDetails.description;

            if (!firebaseUID || !planDescription) {
                 return { success: false, isApproved: false, message: "Dados do pagamento incompletos." };
            }

            const planInfo = Object.values(planToPrice).find(p => p.name === planDescription);
            if (!planInfo) {
                return { success: false, isApproved: false, message: "Plano não reconhecido." };
            }
            
            const planName = planInfo.name === 'Plano Anual' ? 'Anual' : 'Mensal';

            const userRef = db.ref(`users/${firebaseUID}/document`);
            const userSnapshot = await userRef.get();

            if (!userSnapshot.exists()) {
                return { success: false, isApproved: false, message: "Usuário não encontrado no banco de dados." };
            }
            
            const userProfile = userSnapshot.val();

            // IDEMPOTENCY CHECK: If user is already active, just confirm success without another DB write.
            if(userProfile.status === 'active') {
                console.log(`[VERIFY_PIX] Pagamento para ${firebaseUID} já processado (status='active'). Retornando sucesso.`);
                return { success: true, isApproved: true };
            }

            await userRef.update({
                subscriptionStatus: planName,
                storageLimit: planName === 'Anual' ? 100 : 50,
                lastPaymentStatus: 'Pago',
                status: 'active',
                subscriptionStartDate: new Date().toISOString(),
            });

            return { success: true, isApproved: true };
        } else {
            return { success: true, isApproved: false, message: 'Pagamento ainda pendente.' };
        }

    } catch (error: any) {
        console.error("[VERIFY_PIX_ERROR] Erro ao verificar pagamento PIX:", error.message);
        return { success: false, isApproved: false, message: error.message || "Erro ao verificar pagamento." };
    }
}
