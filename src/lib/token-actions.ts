'use server';

import 'dotenv/config';
import { getAdminServices } from '@/lib/firebase-admin'; // <-- USA O PORTEIRO CHEFE

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Scans the 'deliveryTokens' collection and removes any tokens that are either
 * expired or have already been used.
 * @returns {Promise<{success: boolean, removedCount: number, message: string}>}
 */
export async function cleanupExpiredTokens(): Promise<{ success: boolean; removedCount: number; message: string; }> {
    console.log("[TOKEN_CLEANUP] Iniciando a limpeza de tokens de entrega...");
    try {
        const { db } = getAdminServices();
        const tokensRef = db.ref('deliveryTokens');
        const snapshot = await tokensRef.get();

        if (!snapshot.exists()) {
            console.log('[TOKEN_CLEANUP] Nenhum token encontrado para verificar.');
            return { success: true, removedCount: 0, message: 'Nenhum token encontrado.' };
        }

        const tokens = snapshot.val();
        const now = new Date();
        let removedCount = 0;
        const promises: Promise<void>[] = [];

        for (const tokenId in tokens) {
            const tokenData = tokens[tokenId];
            const expiryDate = new Date(tokenData.expiresAt);

            if (tokenData.status === 'used' || now > expiryDate) {
                console.log(`[TOKEN_CLEANUP] Removendo token inútil: ${tokenId}`);
                promises.push(tokensRef.child(tokenId).remove());
                removedCount++;
            }
        }
        
        await Promise.all(promises);

        const message = `Limpeza concluída. ${removedCount} token(s) inútil(is) removido(s).`;
        console.log(`[TOKEN_CLEANUP] ${message}`);
        return { success: true, removedCount, message };

    } catch (error: any) {
        console.error("[TOKEN_CLEANUP_ERROR] Erro ao limpar tokens:", error);
        return { success: false, removedCount: 0, message: `Erro no servidor: ${error.message}` };
    }
}
