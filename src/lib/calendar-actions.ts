
'use server';

import 'dotenv/config';
import type { Memory, Recipient, ScheduledMemory, UserProfile } from '@/lib/types';
import { sendEmail, getMockDataForTemplate, type TemplatePayloads } from '@/lib/email/send-email';
import type admin from 'firebase-admin';
import { getAdminServices } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';


interface DeliverMemoryNowPayload {
  userId: string;
  memoryId: string;
  recipientId: string;
  customMessage?: string;
  templateType?: ScheduledMemory['templateType'];
}

export async function deliverMemoryNow(payload: DeliverMemoryNowPayload): Promise<{ success: boolean; message: string; }> {
    console.log("[SERVER_ACTION] 'deliverMemoryNow' chamada com payload:", payload);
    try {
        const { db, storage } = await getAdminServices();
        const { userId, memoryId, recipientId, customMessage, templateType = 'padrão' } = payload;

        const memoryRef = db.ref(`users/${userId}/memories/${memoryId}`);
        const memorySnapshot = await memoryRef.get();
        if (!memorySnapshot.exists()) throw new Error("Memória não encontrada.");
        
        const memory: Memory = { id: memorySnapshot.key!, ...memorySnapshot.val() };
        
        const recipientRef = db.ref(`users/${userId}/recipients/${recipientId}`);
        const recipientSnapshot = await recipientRef.get();
        if (!recipientSnapshot.exists()) throw new Error(`Destinatário ${recipientId} não encontrado.`);

        const recipient: Recipient = { id: recipientSnapshot.key!, ...recipientSnapshot.val() };

        const userProfileRef = db.ref(`users/${userId}/document`);
        const userSnapshot = await userProfileRef.get();
        const userProfile: UserProfile | null = userSnapshot.exists() ? userSnapshot.val() : null;
        const userName = userProfile?.name || "Um ente querido";
        
        const FILE_SIZE_LIMIT_BYTES = 19 * 1024 * 1024; // 19MB para ter margem de segurança.
        let attachments: { filename: string; content: Buffer }[] = [];
        let downloadLink: string | undefined = undefined;

        if (memory.type !== 'texto' && memory.fileUrl) {
            if (memory.fileSize && memory.fileSize > FILE_SIZE_LIMIT_BYTES) {
                console.log(`[DELIVERY_LARGE_FILE] Arquivo ${memory.title} (${memory.fileSize} bytes) excede o limite. Gerando token de download.`);
                const token = randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 dias de validade
                const tokenData = {
                    userId,
                    memoryId,
                    recipientId,
                    status: 'valid',
                    createdAt: new Date().toISOString(),
                    expiresAt,
                };
                const tokenRef = db.ref(`deliveryTokens/${token}`);
                await tokenRef.set(tokenData);
                downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL}/download/${token}`;
                console.log(`[DELIVERY_LARGE_FILE] Token ${token} gerado e salvo. Link: ${downloadLink}`);
            } else {
                 try {
                    const url = new URL(memory.fileUrl);
                    const bucket = storage.bucket();
                    let fileBuffer: Buffer;
                    
                    if (url.hostname === 'firebasestorage.googleapis.com' && url.pathname.includes(bucket.name)) {
                        const filePathParts = url.pathname.split(`/b/${bucket.name}/o/`);
                        if (filePathParts.length < 2) {
                            throw new Error(`URL do Firebase Storage inválida ou mal formatada: ${memory.fileUrl}`);
                        }
                        const filePath = decodeURIComponent(filePathParts[1]);
                        console.log(`[DELIVERY_DOWNLOAD_ADMIN] Baixando anexo do Firebase Storage: ${filePath}`);
                        const fileRef = bucket.file(filePath);
                        const [exists] = await fileRef.exists();
                        if (!exists) {
                            throw new Error(`Arquivo da memória não encontrado no Firebase Storage: ${filePath}`);
                        }
                        [fileBuffer] = await fileRef.download();
                    } else {
                        console.log(`[DELIVERY_DOWNLOAD_EXTERNAL] Baixando anexo de URL externa: ${memory.fileUrl}`);
                        const response = await fetch(memory.fileUrl);
                        if (!response.ok) {
                            throw new Error(`Falha ao buscar o arquivo da URL externa. Status: ${response.status}`);
                        }
                        const arrayBuffer = await response.arrayBuffer();
                        fileBuffer = Buffer.from(arrayBuffer);
                    }

                    const filename = memory.fileUrl.split('/').pop()?.split('?')[0] || "memoria_digital";
                    attachments.push({
                        filename: filename,
                        content: fileBuffer,
                    });
                    console.log(`[DELIVERY_DOWNLOAD] Anexo ${filename} baixado e preparado com sucesso.`);
                    
                } catch (fetchError: any) {
                    console.error(`[DELIVERY_ATTACHMENT_ERROR] Falha ao baixar anexo para ${recipient.email}:`, fetchError);
                    throw new Error(`Falha ao processar o anexo para a memória "${memory.title}". Detalhe: ${fetchError.message}`);
                }
            }
        }
        
        console.log(`[SERVER_ACTION] Enviando e-mail para ${recipient.email} sobre a memória ${memory.title} usando o template '${templateType}'.`);
        
        const templateKey = `delivery.${templateType}` as const;
        
        const emailResult = await sendEmail({
            to: recipient.email,
            template: templateKey,
            data: {
                heir_name: recipient.name,
                user_name: userName,
                access_link: memory.fileUrl || "#", 
                download_link: downloadLink,
                custom_message: customMessage || memory.description || '',
                user_avatar: userProfile?.photoURL || null,
            },
            attachments
        });

        if (!emailResult.success) {
            throw new Error(`Falha no serviço de e-mail ao enviar para ${recipient.email}: ${emailResult.message}`);
        }
        
        const deliveredToRef = db.ref(`users/${userId}/memories/${memoryId}/deliveredTo`);
        const newDeliveryRecord = {
          recipientId: recipient.id,
          name: recipient.name,
          email: recipient.email,
          deliveredAt: new Date().toISOString(),
        };
        await deliveredToRef.push(newDeliveryRecord);
        console.log(`[SERVER_ACTION] Registro de entrega adicionado para ${recipient.name}.`);

        const deliveredToSnapshot = await deliveredToRef.get();
        const deliveredCount = deliveredToSnapshot.exists() ? deliveredToSnapshot.numChildren() : 0;
        if (deliveredCount >= (memory.recipients?.length || 0)) {
            await memoryRef.update({ isDelivered: true, deliveredAt: new Date().toISOString() });
            console.log(`[SERVER_ACTION] Memória ${memoryId} marcada como totalmente entregue.`);
        }

        return { success: true, message: "Memória enviada com sucesso." };

    } catch (error: any) {
        console.error("[DELIVERY_FATAL_ERROR] Erro na ação 'deliverMemoryNow':", error);
        return { success: false, message: error.message || "Falha crítica no servidor ao tentar entregar a memória." };
    }
}

export async function deliverScheduledMemory(payload: { userId: string; scheduleId: string; }): Promise<{ success: boolean; message?: string }> {
    console.log(`[CALENDAR_ACTION] deliverScheduledMemory chamada para:`, payload);
    
    const { db } = await getAdminServices();
    const { userId, scheduleId } = payload;
    const scheduleRef = db.ref(`users/${userId}/scheduledMemories/${scheduleId}`);
    
    try {
        const scheduleSnapshot = await scheduleRef.get();

        if (!scheduleSnapshot.exists()) {
            throw new Error(`Agendamento ${scheduleId} não encontrado.`);
        }

        const schedule: ScheduledMemory = { id: scheduleId, ...scheduleSnapshot.val() };
        
        if (schedule.status === 'sent') {
             return { success: true, message: `Agendamento ${scheduleId} já foi enviado anteriormente.` };
        }

        const result = await deliverMemoryNow({
            userId: userId,
            memoryId: schedule.memoryId,
            recipientId: schedule.recipientId,
            customMessage: schedule.message,
            templateType: schedule.templateType || 'padrão',
        });

        if (result.success) {
            await scheduleRef.update({ status: 'sent', sentAt: new Date().toISOString(), errorMessage: null });
            console.log(`[CALENDAR_ACTION] Agendamento ${scheduleId} enviado com sucesso.`);
            return { success: true, message: `Envio para ${schedule.recipientId} bem-sucedido.` };
        } else {
            await scheduleRef.update({ status: 'failed', errorMessage: result.message });
            throw new Error(result.message);
        }

    } catch (error: any) {
        console.error(`[CALENDAR_ACTION_ERROR] Falha ao entregar memória agendada ${scheduleId}:`, error);
        await scheduleRef.update({ status: 'failed', errorMessage: error.message });
        return { success: false, message: error.message };
    }
}

export async function checkAndDeliverScheduledMemories(userId: string): Promise<{ processedCount: number; logs: string[] }> {
    const { db } = await getAdminServices();
    const logs: string[] = [];
    try {
        const todayString = new Date().toISOString().split('T')[0];
        const scheduledMemoriesRef = db.ref(`users/${userId}/scheduledMemories`);
        
        const scheduledSnapshot = await scheduledMemoriesRef
            .orderByChild('status')
            .equalTo('scheduled')
            .get();

        if (!scheduledSnapshot.exists()) {
            return { processedCount: 0, logs };
        }

        const allScheduled = scheduledSnapshot.val();
        let processedCount = 0;

        for (const scheduleId in allScheduled) {
            const schedule: ScheduledMemory = { id: scheduleId, ...allScheduled[scheduleId] };
            
            if (schedule.date <= todayString) {
                logs.push(`Encontrado agendamento ${scheduleId} para ${schedule.date}. Iniciando entrega...`);
                deliverScheduledMemory({ userId, scheduleId });
                processedCount++;
            }
        }
        
        return { processedCount, logs };

    } catch (error: any) {
        logs.push(`[ERROR] Falha ao verificar agendamentos para ${userId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        console.error(`[CALENDAR_ACTION_ERROR] Erro ao verificar agendamentos para ${userId}:`, error);
        return { processedCount: 0, logs };
    }
}


export async function triggerAllScheduledDeliveriesForUser(payload: { userId: string }): Promise<{
  success: boolean;
  message: string;
  results: { scheduleId: string; success: boolean; message?: string }[];
}> {
  const { userId } = payload;
  console.log(`[CUCO_ACTIVATED] para o usuário: ${userId}`);
  
  const results: { scheduleId: string; success: boolean; message?: string }[] = [];
  
  try {
    const { db } = await getAdminServices();
    console.log('[CUCO_LOG] Conexão com o DB estabelecida.');

    const scheduledMemoriesRef = db.ref(`users/${userId}/scheduledMemories`);
    const scheduledSnapshot = await scheduledMemoriesRef.orderByChild('status').equalTo('scheduled').get();

    if (!scheduledSnapshot.exists()) {
      console.log('[CUCO_LOG] Nenhum agendamento pendente encontrado.');
      return { success: true, message: "Nenhum agendamento pendente ('scheduled') foi encontrado para este usuário.", results };
    }

    const scheduledMemories = scheduledSnapshot.val();
    const scheduleIds = Object.keys(scheduledMemories);
    console.log(`[CUCO_LOG] Encontrados ${scheduleIds.length} agendamentos pendentes para processar.`);

    for (const scheduleId of scheduleIds) {
      console.log(`[CUCO_LOG] Processando agendamento: ${scheduleId}`);
      const result = await deliverScheduledMemory({ userId, scheduleId });
      results.push({ scheduleId, ...result });
      if(result.success) {
        console.log(`[CUCO_SUCCESS] Agendamento ${scheduleId} enviado com sucesso.`);
      } else {
        console.error(`[CUCO_ERROR] Falha ao enviar agendamento ${scheduleId}: ${result.message}`);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const finalMessage = `Processamento concluído. ${successCount} de ${scheduleIds.length} agendamentos foram enviados com sucesso.`;
    console.log(`[CUCO_FINISHED] ${finalMessage}`);
    
    return { success: true, message: finalMessage, results };

  } catch (error: any) {
    console.error("[CUCO_FATAL_ERROR] Erro crítico ao ativar o cuco:", error);
    return { success: false, message: `Erro fatal no servidor: ${error.message}`, results };
  }
}

export async function retryFailedScheduledMemory(payload: { userId: string; scheduleId: string; }): Promise<{ success: boolean; message?: string }> {
    console.log(`[CALENDAR_ACTION_RETRY] Retentativa de envio para:`, payload);
    
    try {
        const { userId, scheduleId } = payload;
        
        const result = await deliverScheduledMemory({ userId, scheduleId });

        if (result.success) {
            console.log(`[CALENDAR_ACTION_RETRY] Agendamento ${scheduleId} reenviado com sucesso.`);
            return { success: true, message: "Reenvio bem-sucedido." };
        } else {
            throw new Error(result.message);
        }

    } catch (error: any) {
        console.error(`[CALENDAR_ACTION_RETRY_ERROR] Falha ao reenviar ${payload.scheduleId}:`, error);
        return { success: false, message: error.message };
    }
}
