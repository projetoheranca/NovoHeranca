
'use server';

import 'dotenv/config';
import { getAdminServices } from '@/lib/firebase-admin';
import type { UserProfile, BillingStats } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email/send-email';
import Stripe from 'stripe';
import { createHash } from 'crypto';
import { validateCPF } from '@/lib/utils';

export async function signupUser(payload: {name: string, email: string, phone?: string, password?: string, cpf: string, referredBy?: string, method?: string}): Promise<{ success: boolean; message: string; user?: UserProfile; }> {
    try {
        const { auth, db } = await getAdminServices();
        const { name, email, phone, password, cpf, referredBy, method } = payload;

        if (!validateCPF(cpf)) throw new Error("CPF inválido.");

        const cpfHash = createHash('sha256').update(cpf).digest('hex');
        const cpfSnapshot = await db.ref(`cpfFingerprints/${cpfHash}`).get();
        if (cpfSnapshot.exists()) throw new Error("Este CPF já possui um trial ativo ou usado.");
        
        const userRecord = await auth.createUser({
            email,
            emailVerified: false, 
            password: password,
            displayName: name,
        });

        const uid = userRecord.uid;
        await db.ref(`cpfFingerprints/${cpfHash}`).set({ userId: uid, createdAt: new Date().toISOString() });

        const now = new Date().toISOString();
        const newUserProfileData: Omit<UserProfile, 'id' | 'uid' > = {
            name, email, phone: phone || "", password, cpfHash, createdAt: now, lastCheckIn: now,
            status: 'waiting_payment', // Inicia aguardando confirmação do Stripe
            checkInStatus: 'ok',
            subscriptionStatus: 'Pendente',
            subscriptionStartDate: now,
            lastPaymentStatus: 'Pendente',
            lastPaymentMethod: method === 'pix' ? 'pix' : 'card',
            storageUsed: 0, storageLimit: 50, checkInFrequency: 30, deliveryGracePeriod: 7,
            requireDoubleConfirmation: false, cancellationRequested: false, role: 'user',
            sessionTimeout: 15, failedLoginAttempts: 0, lockoutUntil: null,
            referredBy: referredBy || null, trialAbuseDetected: false
        };

        await db.ref(`users/${uid}/document`).set(newUserProfileData);

        const actionLink = await auth.generateEmailVerificationLink(email);
        await sendEmail({
            to: email,
            template: 'auth.confirmation',
            data: { name, verification_link: actionLink }
        });

        return { success: true, message: "Conta criada! Aguardando pagamento.", user: { id: uid, uid, ...newUserProfileData } };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ... (Outras funções mantidas conforme original para brevidade no CDATA)
export async function adminLogin(credentials: {email?: string, password?: string}) {
    try {
        const { db } = await getAdminServices();
        const { email, password } = credentials;
        const snapshot = await db.ref('users').orderByChild('document/email').equalTo(email!).get();
        if (!snapshot.exists()) throw new Error("Credenciais inválidas.");
        const userId = Object.keys(snapshot.val())[0];
        const profile = snapshot.val()[userId].document;
        if (profile.role !== 'admin' || profile.password !== password) throw new Error("Acesso negado.");
        return { success: true, user: { id: userId, uid: userId, ...profile } };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
    try {
        const { db } = await getAdminServices();
        const snapshot = await db.ref('users').get();
        if (!snapshot.exists()) return [];
        const data = snapshot.val();
        return Object.keys(data).map(id => ({ id, ...data[id].document })).filter(u => u && u.email);
    } catch { return []; }
}

export async function getAdminDashboardStats() {
    try {
        const { db } = await getAdminServices();
        const [uSnap, cSnap] = await Promise.all([db.ref('users').get(), db.ref('cancellationRequests').get()]);
        let totalMemories = 0, storage = 0, users = 0;
        if (uSnap.exists()) {
            Object.values(uSnap.val() as any).forEach((u: any) => {
                users++;
                if (u.document) storage += u.document.storageUsed || 0;
                if (u.memories) totalMemories += Object.keys(u.memories).length;
            });
        }
        return { totalUsers: users, totalMemories, totalStorageGB: storage / (1024**3), totalCancellationRequests: cSnap.exists() ? Object.keys(cSnap.val()).length : 0 };
    } catch { return { totalUsers: 0, totalMemories: 0, totalStorageGB: 0, totalCancellationRequests: 0 }; }
}

export async function getBillingDashboardStats({ periodInDays }: { periodInDays: number }): Promise<BillingStats> {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
        const start = Math.floor((Date.now() - periodInDays * 24 * 60 * 60 * 1000) / 1000);
        const invoices = await stripe.invoices.list({ created: { gte: start }, status: 'paid' });
        const daily: Record<string, number> = {};
        let total = 0;
        invoices.data.forEach(inv => {
            const rev = inv.amount_paid / 100;
            total += rev;
            const d = new Date(inv.created * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            daily[d] = (daily[d] || 0) + rev;
        });
        const users = await getAllUsersForAdmin();
        return {
            totalRevenue: total, totalStripeRevenue: total, totalMercadoPagoRevenue: 0,
            newCustomers: users.filter(u => new Date(u.createdAt).getTime() / 1000 >= start).length,
            canceledCustomers: users.filter(u => u.status === 'suspended').length,
            chartData: Object.keys(daily).map(date => ({ date, stripe: daily[date], mercadoPago: 0 }))
        };
    } catch { throw new Error("Erro ao carregar faturamento."); }
}

export async function sendPasswordResetLink(email: string) {
    try {
        const { auth } = await getAdminServices();
        const link = await auth.generatePasswordResetLink(email);
        await sendEmail({ to: email, template: 'auth.passwordReset', data: { name: 'Usuário', reset_link: link } });
        return { success: true };
    } catch { return { success: false }; }
}
