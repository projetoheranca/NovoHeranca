
'use server';

import 'dotenv/config';
import type { Memory, UserProfile, Recipient, CheckIn, ScheduledMemory, CancellationRequest, CustomEmailTemplate } from '@/lib/types';
import type { Reference } from 'firebase-admin/database';
import JSZip from 'jszip';
import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { sendEmail, getMockDataForTemplate, type TemplatePayloads, getTemplateHtml } from '@/lib/email/send-email';
import { checkAndDeliverScheduledMemories, deliverMemoryNow } from '@/lib/calendar-actions';
import { getCheckInStatus } from './utils';
import { getAdminServices } from '@/lib/firebase-admin';
import type admin from 'firebase-admin';


async function updateUserStorage(userId: string, fileSizeChange: number) {
    if (fileSizeChange === 0) return;
    console.log(`[SERVER_ACTION] 'updateUserStorage' chamada para o usuário ${userId} com alteração de ${fileSizeChange} bytes.`);
    
    const { db } = await getAdminServices();
    const userProfileRef: Reference = db.ref(`users/${userId}/document`);
    
    try {
        const userSnapshot = await userProfileRef.get();

        if (userSnapshot.exists()) {
            const currentData = userSnapshot.val();
            const currentStorageUsed = currentData.storageUsed || 0;
            const newStorageUsed = currentStorageUsed + fileSizeChange;
            console.log(`[SERVER_ACTION] Armazenamento atual: ${currentStorageUsed}, Novo armazenamento: ${newStorageUsed}`);
            
            const storageLimitGB = currentData.storageLimit || 0;
            const storageLimitBytes = storageLimitGB * 1024 * 1024 * 1024;

            if (newStorageUsed < 0) {
                 console.log(`[SERVER_ACTION] Novo armazenamento é negativo, resetando para 0.`);
                 await userProfileRef.update({ storageUsed: 0 });
                 return;
            }

            if (newStorageUsed > storageLimitBytes && fileSizeChange > 0) {
                console.error(`[SERVER_ACTION_ERROR] Limite de armazenamento excedido para o usuário ${userId}.`);
                throw new Error(`Limite de armazenamento excedido.`);
            }
            
            console.log(`[SERVER_ACTION] Atualizando o armazenamento do usuário ${userId} para ${newStorageUsed}.`);
            await userProfileRef.update({ storageUsed: newStorageUsed });
            console.log(`[SERVER_ACTION] Armazenamento do usuário ${userId} atualizado com sucesso.`);
        } else {
            console.warn(`[SERVER_ACTION_WARN] Perfil do usuário ${userId} não encontrado para atualizar armazenamento.`);
        }
    } catch(error) {
        console.error(`Falha ao atualizar armazenamento para o usuário ${userId}:`, error);
    }
}

interface CreateMemoryPayload {
    userId: string;
    memoryId: string;
    title: string;
    description: string;
    type: 'texto' | 'image' | 'video' | 'audio';
    content?: string;
    fileUrl?: string;
    fileSize?: number;
    recipients?: string[];
}


export async function createMemory(payload: CreateMemoryPayload): Promise<{ success: boolean; message?: string }> {
    console.log("[SERVER_ACTION] 'createMemory' chamada com payload:", payload);
    try {
        const { db } = await getAdminServices();
        const { userId, memoryId, title, description, type, content, fileUrl, fileSize, recipients } = payload;
        if (!userId || !memoryId) throw new Error("ID do usuário e da memória são obrigatórios.");

        const memoryData: Partial<Omit<Memory, 'id'>> = {
            title,
            description,
            type,
            createdAt: new Date().toISOString(),
            isDelivered: false,
            deliveredTo: [],
            content: content || "",
            fileUrl: fileUrl || "",
            fileSize: fileSize || 0,
            recipients: recipients || [],
        };

        const memoryRef: Reference = db.ref(`users/${userId}/memories/${memoryId}`);
        console.log(`[SERVER_ACTION] Preparando para salvar memória ${memoryId} no banco de dados.`);
        await memoryRef.set(memoryData);
        console.log(`[SERVER_ACTION] Memória ${memoryId} salva no banco de dados com sucesso.`);

        if (fileSize && fileSize > 0) {
            await updateUserStorage(userId, fileSize);
        }

        revalidatePath('/dashboard/memories');
        revalidatePath('/dashboard');
        console.log("[SERVER_ACTION] 'createMemory' concluída com sucesso.");
        return { success: true, message: "Memória criada com sucesso." };
    } catch (error: any) {
        console.error("[ERRO NA SERVER ACTION - createMemory]:", error);
        return { success: false, message: `Falha no servidor ao criar memória: ${error.message}` };
    }
}

interface UpdateMemoryPayload {
    userId: string;
    memoryId: string;
    title: string;
    description: string;
    recipients: string[];
}

export async function updateMemory(payload: UpdateMemoryPayload): Promise<{ success: boolean; message?: string }> {
    console.log("[SERVER_ACTION] 'updateMemory' chamada com payload:", payload);
    try {
        const { db } = await getAdminServices();
        const { userId, memoryId, title, description, recipients } = payload;
        if (!userId || !memoryId) throw new Error("ID do usuário e da memória são obrigatórios.");
        
        const memoryRef: Reference = db.ref(`users/${userId}/memories/${memoryId}`);

        const updates: Partial<Memory> = {
            title,
            description,
            recipients,
        };

        console.log(`[SERVER_ACTION] Preparando para atualizar a memória ${memoryId}.`);
        await memoryRef.update(updates);
        console.log(`[SERVER_ACTION] Memória ${memoryId} atualizada com sucesso.`);
        
        revalidatePath('/dashboard/memories');
        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/memories/${memoryId}/edit`);
        return { success: true, message: "Memória atualizada com sucesso." };
    } catch (error: any) {
        console.error("[ERRO NA SERVER ACTION - updateMemory]:", error);
        return { success: false, message: `Falha no servidor ao atualizar memória: ${error.message}` };
    }
}

export async function deliverAllMemories(userId: string): Promise<{ success: boolean; message: string; }> {
    console.log(`[SERVER_ACTION] 'deliverAllMemories' chamada para o usuário: ${userId}`);
    try {
        const { db } = await getAdminServices();
        const userMemoriesRef = db.ref(`users/${userId}/memories`);
        const memoriesSnapshot = await userMemoriesRef.get();
        if (!memoriesSnapshot.exists()) {
            return { success: true, message: "Nenhuma memória encontrada para entregar." };
        }

        const allRecipientsRef = db.ref(`users/${userId}/recipients`);
        const recipientsSnapshot = await allRecipientsRef.get();
        if (!recipientsSnapshot.exists()) {
            return { success: true, message: "Nenhum destinatário encontrado para este usuário." };
        }
        const allRecipients = recipientsSnapshot.val();
        
        const memories = memoriesSnapshot.val();
        let allSucceeded = true;

        for (const memoryId in memories) {
            const memory: Memory = { id: memoryId, ...memories[memoryId] };
            if (!memory.isDelivered && memory.recipients && memory.recipients.length > 0) {
                 for (const recipientId of memory.recipients) {
                    if (allRecipients[recipientId]) {
                        try {
                             const result = await deliverMemoryNow({ userId, memoryId, recipientId });
                             if (!result.success) {
                                allSucceeded = false;
                                console.error(`Falha ao entregar memória ${memoryId} para ${recipientId}: ${result.message}`);
                             }
                        } catch (error) {
                            console.error(`Erro crítico ao processar memória ${memoryId} para o usuário ${userId}:`, error);
                            allSucceeded = false;
                        }
                    } else {
                        console.warn(`Destinatário ${recipientId} da memória ${memoryId} não encontrado. Pulando.`);
                    }
                 }
            }
        }
        
        if (allSucceeded) {
            return { success: true, message: "Todas as memórias foram entregues com sucesso." };
        } else {
            return { success: false, message: "Falha ao entregar uma ou mais memórias. Verifique os logs do servidor." };
        }
    } catch (error: any) {
        console.error(`[ERRO NA SERVER ACTION - deliverAllMemories para o usuário ${userId}]:`, error);
        return { success: false, message: error.message };
    }
}


export async function handleInactiveUserCheck(): Promise<{
  success: boolean;
  checked: number;
  processed: number;
  logs: string[];
  message?: string;
  error?: string;
}> {
    console.log("[CRON_LOGIC] 'handleInactiveUserCheck' iniciada.");
    try {
        const { db } = await getAdminServices();
        const usersRef = db.ref('users');
        const snapshot = await usersRef.get();

        if (!snapshot.exists()) {
            return { success: true, checked: 0, processed: 0, logs: [] };
        }

        const usersData = snapshot.val();
        const now = new Date();
        const actionLogs: string[] = [];
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002";
        const userIds = Object.keys(usersData);

        for (const userId of userIds) {
            const userProfile: UserProfile = usersData[userId].document;
            const userIdentifier = userProfile?.email || `ID:${userId}`;
            
            if (!userProfile) {
                actionLogs.push(`[WARN] [${userIdentifier}] Perfil 'document' não encontrado, pulando.`);
                continue;
            }

            if (userProfile.lastPaymentStatus === 'Inadimplente' && userProfile.lastPaymentFailedAt) {
                 const failedAt = new Date(userProfile.lastPaymentFailedAt);
                const daysSinceFailure = Math.floor((now.getTime() - failedAt.getTime()) / (1000 * 60 * 60 * 24));
                const dunningDays = [1, 3, 5, 7];

                const notifiedAt = userProfile.delinquencyNotifiedAt ? new Date(userProfile.delinquencyNotifiedAt) : null;
                const alreadyNotifiedToday = notifiedAt ? now.toDateString() === notifiedAt.toDateString() : false;

                if (dunningDays.includes(daysSinceFailure) && !alreadyNotifiedToday) {
                     await sendEmail({
                        to: userProfile.email,
                        template: 'payment.failed',
                        data: { name: userProfile.name, amount: 'da sua assinatura', update_payment_link: `${baseUrl}/dashboard/subscription` },
                    });
                    const userDocRef = db.ref(`users/${userId}/document`);
                    await userDocRef.update({ delinquencyNotifiedAt: now.toISOString() });
                    actionLogs.push(`[SUCCESS] [${userIdentifier}] Usuário inadimplente: E-mail de cobrança ('payment.failed') enviado.`);
                }

                if (daysSinceFailure > 10 && userProfile.status !== 'suspended') {
                    const userDocRef = db.ref(`users/${userId}/document`);
                    await userDocRef.update({ status: 'suspended' });
                    actionLogs.push(`[ACTION] [${userIdentifier}] Conta suspensa por inadimplência prolongada (10+ dias).`);
                }
            }

            if (userProfile.lastPaymentMethod === 'pix' && userProfile.status === 'active' && userProfile.subscriptionStartDate) {
                const planDurationInDays = userProfile.subscriptionStatus === 'Anual' ? 365 : 30;
                const startDate = new Date(userProfile.subscriptionStartDate);
                const expirationDate = new Date(startDate);
                expirationDate.setDate(startDate.getDate() + planDurationInDays);

                const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const renewalReminderDays = [7, 3, 1];

                if (renewalReminderDays.includes(daysUntilExpiration)) {
                    const renewalNotifiedAt = userProfile.renewalNotifiedAt ? new Date(userProfile.renewalNotifiedAt) : null;
                    const alreadyNotifiedToday = renewalNotifiedAt ? now.toDateString() === renewalNotifiedAt.toDateString() : false;

                    if (!alreadyNotifiedToday) {
                        await sendEmail({
                            to: userProfile.email,
                            template: 'payment.pixRenewalNotice',
                            data: { name: userProfile.name, plan: userProfile.subscriptionStatus, renewal_link: `${baseUrl}/pricing`, days: daysUntilExpiration }
                        });
                        const userDocRef = db.ref(`users/${userId}/document`);
                        await userDocRef.update({ renewalNotifiedAt: now.toISOString() });
                        actionLogs.push(`[SUCCESS] [${userIdentifier}] Lembrete de renovação PIX enviado (${daysUntilExpiration} dias restantes).`);
                    }
                }
            }

            if (userProfile.status === 'active') {
                const { status: calculatedStatus, daysRemaining } = getCheckInStatus(userProfile.lastCheckIn, userProfile.checkInFrequency, userProfile.deliveryGracePeriod);
                const userDocRef = db.ref(`users/${userId}/document`);
                
                if (calculatedStatus === 'inativo' && userProfile.checkInStatus !== 'inativo') {
                    await userDocRef.update({ checkInStatus: 'inativo' });
                    actionLogs.push(`[ACTION] [${userIdentifier}] INATIVIDADE CRÍTICA: Usuário marcado como 'inativo'. Verificação manual necessária no painel "Talvez Falecidos".`);
                
                } else if (calculatedStatus === 'risco' && userProfile.checkInStatus !== 'risco') {
                    await userDocRef.update({ checkInStatus: 'risco' });
                    await sendEmail({
                        to: userProfile.email,
                        template: 'checkin.verificationStarted',
                        data: { name: userProfile.name || 'usuário', stop_link: `${baseUrl}/login` }
                    });
                    actionLogs.push(`[WARN] [${userIdentifier}] Usuário em risco de inatividade. E-mail de alerta ('checkin.verificationStarted') enviado.`);
                
                } else if (calculatedStatus === 'ok') {
                     if (userProfile.checkInStatus && userProfile.checkInStatus !== 'ok') {
                        await userDocRef.update({ checkInStatus: 'ok' });
                        actionLogs.push(`[INFO] [${userIdentifier}] Status de inatividade do usuário foi redefinido para 'OK'.`);
                    }
                    const reminderDays = [7, 3, 1];
                    if (daysRemaining !== null && reminderDays.includes(daysRemaining)) {
                        await sendEmail({
                            to: userProfile.email,
                            template: 'checkin.reminder',
                            data: { name: userProfile.name || 'usuário', days: daysRemaining, checkin_link: `${baseUrl}/login` },
                        });
                        actionLogs.push(`[INFO] [${userIdentifier}] Lembrete de check-in amigável enviado (${daysRemaining} dias restantes).`);
                    }
                }
            }
             
             const calendarResult = await checkAndDeliverScheduledMemories(userId);
             if (calendarResult.processedCount > 0) {
                 actionLogs.push(`[INFO] [${userIdentifier}] [CALENDÁRIO] ${calendarResult.processedCount} agendamentos encontrados para envio.`);
                 actionLogs.push(...calendarResult.logs.map(log => `  -> [CALENDÁRIO] ${log}`));
             }
        }
        
        revalidatePath('/painel/users');
        revalidatePath('/painel/inadiplencia');
        revalidatePath('/dashboard/calendar');
        revalidatePath('/dashboard');
        
        const processedCount = actionLogs.filter(log => !log.startsWith('[INFO]')).length;
        const finalMessage = `Verificação diária concluída. ${processedCount} ações processadas.`;
        
        return { success: true, checked: userIds.length, processed: processedCount, logs: actionLogs, message: finalMessage };
    } catch (error: any) {
        console.error("[CRON_FATAL_ERROR] Erro fatal em 'handleInactiveUserCheck':", error);
        return { success: false, checked: 0, processed: 0, logs: [`[ERROR] ${error.message}`], message: `Erro interno do servidor ao processar a verificação de inatividade.`, error: error.message };
    }
}


export async function exportUserData(payload: {userId: string}): Promise<{ success: boolean; zipBase64?: string; message?: string; }> {
    console.log("[SERVER_ACTION] 'exportUserData' chamada com payload:", payload);
    try {
        const { db, storage } = await getAdminServices();
        const { userId } = payload;
        
        const userRef = db.ref(`users/${userId}`);
        const userSnapshot = await userRef.get();
        if (!userSnapshot.exists()) {
            throw new Error("Usuário não encontrado.");
        }

        const userData = userSnapshot.val();
        const zip = new JSZip();

        // Remove a senha do documento antes de salvar no JSON
        if (userData.document) {
            const profileToSave = { ...userData.document };
            delete profileToSave.password;
            zip.file("profile.json", JSON.stringify(profileToSave, null, 2));
        }
        
        if (userData.memories) {
            zip.file("memories.json", JSON.stringify(userData.memories, null, 2));
            const mediaFolder = zip.folder("media");
            if (mediaFolder) {
                for (const memoryId in userData.memories) {
                    const memory: Memory = userData.memories[memoryId];
                    if (memory.fileUrl) {
                        try {
                            const bucket = storage.bucket();
                            const filePath = decodeURIComponent(new URL(memory.fileUrl).pathname.split(`/b/${bucket.name}/o/`)[1]);
                            const fileRef = bucket.file(filePath);
                            const [exists] = await fileRef.exists();
                            if (exists) {
                                const [fileBuffer] = await fileRef.download();
                                const fileName = fileRef.name.split('/').pop() || `${memoryId}_file`;
                                mediaFolder.file(fileName, fileBuffer);
                            }
                        } catch (fileError) {
                            console.error(`Erro ao baixar o arquivo para a memória "${memory.title}":`, fileError);
                        }
                    }
                }
            }
        }
        
        const zipBase64 = await zip.generateAsync({ type: "base64" });
        return { success: true, zipBase64 };

    } catch (error: any) {
        console.error("[ERRO NA SERVER ACTION - exportUserData]:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteUserAccount(payload: {userId: string}): Promise<{ success: boolean; message?: string }> {
    console.log("[SERVER_ACTION] 'deleteUserAccount' chamada com payload:", payload);
    try {
        const { db, auth, storage } = await getAdminServices();
        const { userId } = payload;

        // 1. Busca o perfil antes de apagar para pegar o hash do CPF
        const userRtdbRef = db.ref(`users/${userId}`);
        const userSnap = await userRtdbRef.get();
        
        if (userSnap.exists()) {
            const profile = userSnap.val().document;
            if (profile?.cpfHash) {
                // APAGA A DIGITAL DO CPF: Permite re-cadastro/testes com o mesmo CPF
                await db.ref(`cpfFingerprints/${profile.cpfHash}`).remove();
                console.log(`[CLEANUP] CPF hash ${profile.cpfHash} removido para o usuário ${userId}.`);
            }
        }

        // 2. Apaga os dados no RTDB
        await userRtdbRef.remove();

        // 3. Apaga os arquivos no Storage
        const bucket = storage.bucket();
        await bucket.deleteFiles({ prefix: `users/${userId}/` });

        // 4. Apaga o usuário no Auth
        try {
            await auth.deleteUser(userId);
        } catch (authError: any) {
             if (authError.code === 'auth/user-not-found') {
                console.warn(`Usuário ${userId} não encontrado no Firebase Auth. Pode já ter sido excluído.`);
            } else {
                throw authError;
            }
        }
        
        return { success: true, message: "Conta excluída com sucesso." };

    } catch (error: any) {
        console.error("[ERRO NA SERVER ACTION - deleteUserAccount]:", error);
        return { success: false, message: `Falha no servidor ao excluir a conta: ${error.message}` };
    }
}

export async function createUserFromAdmin(payload: {name: string, email: string, password?: string}): Promise<{ success: boolean; message: string; }> {
    console.log("[SERVER_ACTION] 'createUserFromAdmin' chamada com payload:", payload);
    try {
        const { db, auth } = await getAdminServices();
        const { name, email, password } = payload;
        
        const userRecord = await auth.createUser({
            email,
            emailVerified: true,
            password: password,
            displayName: name,
            disabled: false,
        });

        const uid = userRecord.uid;
        const userDocRef = db.ref(`users/${uid}/document`);
        
        const now = new Date().toISOString();
        const newUserProfileData: Omit<UserProfile, 'id' | 'uid' > = {
            name: name,
            email: email,
            password: password, 
            createdAt: now,
            lastCheckIn: now,
            status: 'active',
            checkInStatus: 'ok',
            subscriptionStatus: 'Teste',
            subscriptionStartDate: now,
            lastPaymentStatus: 'Pago',
            storageUsed: 0,
            storageLimit: 1,
            checkInFrequency: 30,
            deliveryGracePeriod: 15,
            requireDoubleConfirmation: false,
            cancellationRequested: false, // Inicializado como falso
            role: 'user',
            sessionTimeout: 15,
            failedLoginAttempts: 0,
            lockoutUntil: null,
        };

        await userDocRef.set(newUserProfileData);

        revalidatePath('/painel/users');

        return { success: true, message: `Usuário ${name} criado com sucesso.` };
    } catch (error: any) {
        console.error("[ERRO NA SERVER ACTION - createUserFromAdmin]:", error);
        let userMessage = "Não foi possível criar o usuário.";
        if (error.code === 'auth/email-already-exists') {
            userMessage = "Este e-mail já está em uso por outra conta.";
        } else if (error.code === 'auth/invalid-password') {
            userMessage = "A senha deve ter pelo menos 6 caracteres.";
        }
        return { success: false, message: userMessage };
    }
}

/**
 * Dispara um único e-mail de teste para um destinatário.
 */
export async function sendSingleTestEmail(payload: {
  to: string;
  template: keyof TemplatePayloads;
  days?: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    await getAdminServices(); // Ensure SDK is initialized
    const { to, template, days } = payload;

    const mockData = await getMockDataForTemplate(template, days);
    const result = await sendEmail({ to, template, data: mockData as any });

    if (result.success) {
      return {
        success: true,
        message: `E-mail de teste '${template}' enviado para ${to}.`,
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error: any) {
    console.error(`[ERRO NA SERVER ACTION - sendSingleTestEmail para ${payload.template}]:`, error);
    return { success: false, message: error.message };
  }
}

export async function handleUserCheckIn(payload: {
  userId: string;
  userName: string;
  userEmail: string;
  checkInFrequency: number;
}): Promise<{ success: boolean; message?: string }> {
  console.log(`[SERVER_ACTION] 'handleUserCheckIn' chamada para the usuário ${payload.userId}`);
  try {
    const { db } = await getAdminServices();
    const { userId, userName, userEmail, checkInFrequency } = payload;
    
    const now = new Date();
    const userProfileRef = db.ref(`users/${userId}/document`);
    const checkInsRef = db.ref(`users/${userId}/checkIns`);

    const newCheckInRef = checkInsRef.push();
    const checkInData: Omit<CheckIn, 'id'> = {
      timestamp: now.toISOString(),
      method: 'manual',
      userId: userId,
    };

    await newCheckInRef.set(checkInData);
    
    await userProfileRef.update({ 
      lastCheckIn: now.toISOString(),
      checkInStatus: 'ok' 
    });

    const nextCheckinDate = new Date(now);
    nextCheckinDate.setDate(now.getDate() + checkInFrequency);

    await sendEmail({
        to: userEmail,
        template: 'checkin.confirmed',
        data: {
            name: userName,
            next_checkin: nextCheckinDate.toLocaleDateString('pt-BR'),
        }
    });
    
    revalidatePath('/dashboard');
    console.log(`[SERVER_ACTION] 'handleUserCheckIn' concluída para ${userId}`);
    return { success: true, message: "Check-in realizado com sucesso." };
  } catch (error: any) {
    console.error("[ERRO NA SERVER ACTION - handleUserCheckIn]:", error);
    return { success: false, message: `Falha no servidor ao realizar check-in: ${error.message}` };
  }
}

export async function getMemoriesForUser(payload: { userId: string }): Promise<{ memories: Memory[], recipients: Recipient[] }> {
    try {
        const { db } = await getAdminServices();
        const { userId } = payload;

        const memoriesRef = db.ref(`users/${userId}/memories`);
        const recipientsRef = db.ref(`users/${userId}/recipients`);

        const [memoriesSnapshot, recipientsSnapshot] = await Promise.all([
            memoriesRef.get(),
            recipientsRef.get(),
        ]);

        const memories: Memory[] = [];
        if (memoriesSnapshot.exists()) {
            memoriesSnapshot.forEach(snap => {
                memories.push({ id: snap.key!, ...snap.val() });
            });
        }
        
        const recipients: Recipient[] = [];
        if (recipientsSnapshot.exists()) {
            recipientsSnapshot.forEach(snap => {
                recipients.push({ id: snap.key!, ...snap.val() });
            });
        }
        
        return { memories, recipients };
        
    } catch (error: any) {
        console.error(`[ERRO NA SERVER ACTION - getMemoriesForUser para ${payload.userId}]:`, error);
        return { memories: [], recipients: [] };
    }
}

export async function resendVerificationEmail(payload: { userId: string }): Promise<{ success: boolean; message: string; }> {
    console.log("[SERVER_ACTION] 'resendVerificationEmail' chamada com payload:", payload);
    try {
        const { auth } = await getAdminServices();
        const { userId } = payload;
        
        const userRecord = await auth.getUser(userId);
        const email = userRecord.email;

        if (!email) {
            throw new Error("Usuário não tem um e-mail para verificar.");
        }
        
        // This link uses the default template configured in Firebase Console, which should have the correct, whitelisted domain.
        const actionLink = await auth.generateEmailVerificationLink(email);

        // Re-use the existing confirmation email template
        await sendEmail({
            to: email,
            template: 'auth.confirmation', 
            data: {
                name: userRecord.displayName || 'Usuário',
                verification_link: actionLink,
            }
        });

        return { success: true, message: "E-mail de verificação reenviado com sucesso." };
    } catch (error: any) {
        console.error('[SERVER_ACTION_ERROR] resendVerificationEmail:', error);
        let userMessage = 'Falha ao reenviar e-mail de verificação.';
        if (error.code === 'auth/user-not-found') {
            userMessage = 'Usuário não encontrado.';
        }
        return { success: false, message: userMessage };
    }
}

export async function getDownloadTokenDetails(token: string): Promise<{
  success: boolean;
  message?: string;
  userName?: string;
  memoryTitle?: string;
  fileName?: string;
  fileUrl?: string;
  memoryType?: 'video' | 'audio' | 'texto' | 'image';
  memoryFileSize?: number;
  memoryCreatedAt?: string;
  memoryDuration?: number;
}> {
  console.log(`[SERVER_ACTION] 'getDownloadTokenDetails' called for token: ${token}`);
  try {
    const { db } = await getAdminServices();
    const tokenRef = db.ref(`deliveryTokens/${token}`);
    const tokenSnapshot = await tokenRef.get();

    if (!tokenSnapshot.exists()) {
      throw new Error("Link de download inválido ou expirado.");
    }
    const tokenData = tokenSnapshot.val();

    if (tokenData.status !== 'valid' || new Date(tokenData.expiresAt) < new Date()) {
      await tokenRef.update({ status: 'used' }); // Mark as used even if expired
      throw new Error("Este link já foi usado ou expirou.");
    }
    
    // Invalidate the token now to make it single-use
    await tokenRef.update({ status: 'used' });

    const { userId, memoryId } = tokenData;

    const userRef = db.ref(`users/${userId}/document/name`);
    const memoryRef = db.ref(`users/${userId}/memories/${memoryId}`);

    const [userSnapshot, memorySnapshot] = await Promise.all([userRef.get(), memoryRef.get()]);

    const userName = userSnapshot.exists() ? userSnapshot.val() : "Seu ente querido";
    
    let memoryTitle = "uma memória especial";
    let fileName: string | undefined = undefined;
    let fileUrl: string | undefined = undefined;
    let memoryType: Memory['type'] | undefined = undefined;
    let memoryFileSize: number | undefined = undefined;
    let memoryCreatedAt: string | undefined = undefined;
    let memoryDuration: number | undefined = undefined;

    if (memorySnapshot.exists()) {
        const memory: Memory = memorySnapshot.val();
        memoryTitle = memory.title;
        fileUrl = memory.fileUrl;
        memoryType = memory.type;
        memoryFileSize = memory.fileSize;
        memoryCreatedAt = memory.createdAt;
        memoryDuration = memory.duration;

        if (memory.fileUrl) {
            try {
                const url = new URL(memory.fileUrl);
                const pathParts = decodeURIComponent(url.pathname).split('/');
                fileName = pathParts.pop() || 'arquivo_memoria';
            } catch {
                fileName = memory.fileUrl.split('/').pop()?.split('?')[0] || 'arquivo_memoria';
            }
        }
    }
    
    return { success: true, userName, memoryTitle, fileName, fileUrl, memoryType, memoryFileSize, memoryCreatedAt, memoryDuration };

  } catch (error: any) {
    console.error(`[ERRO NA SERVER ACTION - getDownloadTokenDetails]:`, error);
    return { success: false, message: error.message };
  }
}

/**
 * Registra um pedido de cancelamento de assinatura para análise administrativa.
 */
export async function requestCancellation(payload: { userId: string, userName: string, userEmail: string, plan: string }): Promise<{ success: boolean; message: string }> {
    try {
        const { db } = await getAdminServices();
        const { userId, userName, userEmail, plan } = payload;

        const requestRef = db.ref('cancellationRequests').push();
        const requestData: Omit<CancellationRequest, 'id'> = {
            userId,
            userName,
            userEmail,
            plan,
            requestedAt: new Date().toISOString(),
            status: 'pending'
        };

        await requestRef.set(requestData);
        
        // Marca o perfil do usuário como tendo um pedido pendente
        await db.ref(`users/${userId}/document`).update({ cancellationRequested: true });

        revalidatePath('/dashboard/subscription');
        return { success: true, message: "Sua solicitação foi enviada e será analisada em até 48h." };
    } catch (error: any) {
        console.error('[CANCELLATION_REQUEST_ERROR]', error);
        return { success: false, message: error.message || "Falha ao enviar solicitação." };
    }
}

/**
 * Recupera todas as solicitações de cancelamento pendentes.
 */
export async function getAllCancellationRequests(): Promise<CancellationRequest[]> {
    try {
        const { db } = await getAdminServices();
        const requestsRef = db.ref('cancellationRequests');
        const snapshot = await requestsRef.get();

        if (!snapshot.exists()) {
            return [];
        }

        const data = snapshot.val();
        return Object.keys(data).map(id => ({
            id,
            ...data[id]
        }));
    } catch (error) {
        console.error("[ERROR] getAllCancellationRequests:", error);
        return [];
    }
}

/**
 * Remove ou processa um pedido de cancelamento no painel administrativo.
 */
export async function processCancellationRequest(requestId: string, action: 'archive' | 'confirm'): Promise<{ success: boolean; message: string }> {
    try {
        const { db } = await getAdminServices();
        const requestRef = db.ref(`cancellationRequests/${requestId}`);
        const snapshot = await requestRef.get();

        if (!snapshot.exists()) throw new Error("Pedido não encontrado.");
        
        const request: CancellationRequest = snapshot.val();

        if (action === 'confirm') {
            // Se confirmar, executamos a exclusão total da conta usando a action já existente
            const deleteResult = await deleteUserAccount({ userId: request.userId });
            if (!deleteResult.success) throw new Error(deleteResult.message);
        }

        // Remove o pedido da lista de pendentes
        await requestRef.remove();
        
        // Limpa a flag no documento do usuário (se ele ainda existir)
        if (action === 'archive') {
            await db.ref(`users/${request.userId}/document`).update({ cancellationRequested: false });
        }

        revalidatePath('/painel/cancelamentos');
        return { success: true, message: action === 'confirm' ? "Assinatura cancelada e conta excluída." : "Solicitação arquivada." };
    } catch (error: any) {
        console.error('[CANCELLATION_PROCESS_ERROR]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Dispara e-mails em massa para uma lista de usuários.
 */
export async function sendBulkCustomEmail(payload: { 
    recipients: { email: string, name: string }[], 
    subject: string, 
    content: string,
    templateKey?: keyof TemplatePayloads 
}): Promise<{ success: boolean; sentCount: number; message: string }> {
    console.log(`[BULK_EMAIL] Iniciando disparo para ${payload.recipients.length} destinatários.`);
    
    try {
        const { recipients, subject, content, templateKey } = payload;
        let sentCount = 0;

        for (const recipient of recipients) {
            try {
                // Se for um template transacional mapeado (ex: marketing.welcome)
                if (templateKey && templateKey !== 'marketing.custom') {
                    const mockData = await getMockDataForTemplate(templateKey);
                    await sendEmail({
                        to: recipient.email,
                        template: templateKey,
                        data: { ...mockData, name: recipient.name } as any
                    });
                } else {
                    // Senão, usa o template customizado de marketing
                    await sendEmail({
                        to: recipient.email,
                        template: 'marketing.custom',
                        data: { 
                            name: recipient.name,
                            subject: subject,
                            content: content
                        }
                    });
                }
                sentCount++;
                // Delay para evitar rate limiting agressivo (Resend Free Tier)
                await new Promise(r => setTimeout(r, 500));
            } catch (err) {
                console.error(`[BULK_EMAIL_ERROR] Falha ao enviar para ${recipient.email}:`, err);
            }
        }

        return { 
            success: true, 
            sentCount, 
            message: `Processamento concluído. ${sentCount} de ${recipients.length} e-mails foram enviados.` 
        };
    } catch (error: any) {
        console.error('[BULK_EMAIL_FATAL_ERROR]', error);
        return { success: false, sentCount: 0, message: error.message };
    }
}

/**
 * Retorna o HTML de um template para pré-visualização.
 */
export async function getTemplatePreviewHtml(templateKey: string, days?: number): Promise<{ success: boolean; html?: string; message?: string }> {
    try {
        const mockData = await getMockDataForTemplate(templateKey as keyof TemplatePayloads, days);
        const html = await getTemplateHtml(templateKey as keyof TemplatePayloads, mockData as any);
        return { success: true, html };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Salva um novo template personalizado no banco de dados.
 */
export async function saveCustomTemplate(payload: Omit<CustomEmailTemplate, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    try {
        const { db } = await getAdminServices();
        const templatesRef = db.ref('emailTemplates');
        const newTemplateRef = templatesRef.push();
        
        await newTemplateRef.set({
            ...payload,
            createdAt: new Date().toISOString()
        });

        revalidatePath('/painel/email-marketing/templates');
        return { success: true, message: "Template personalizado salvo com sucesso!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Recupera todos os templates personalizados.
 */
export async function getCustomTemplates(): Promise<CustomEmailTemplate[]> {
    try {
        const { db } = await getAdminServices();
        const templatesRef = db.ref('emailTemplates');
        const snapshot = await templatesRef.get();

        if (!snapshot.exists()) return [];

        const data = snapshot.val();
        return Object.keys(data).map(id => ({
            id,
            ...data[id]
        }));
    } catch (error) {
        console.error("[ERROR] getCustomTemplates:", error);
        return [];
    }
}

/**
 * Exclui um template personalizado.
 */
export async function deleteCustomTemplate(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const { db } = await getAdminServices();
        await db.ref(`emailTemplates/${id}`).remove();
        revalidatePath('/painel/email-marketing/templates');
        return { success: true, message: "Template excluído." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
