
"use client";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
} from "firebase/storage";
import { storage } from "./config"; // Use the initialized storage

type UploadFileOptions = {
  onProgress?: (progress: number) => void;
};

// =================================================================================
// ATENÇÃO: ESTA FUNÇÃO COMPARTILHADA ESTÁ OBSOLETA E NÃO É MAIS USADA.
// A lógica de upload foi movida para ser local em cada página que a utiliza
// (`record/page.tsx` e `memories/new/page.tsx`) para evitar conflitos de
// implementação e garantir que cada fluxo seja autocontido e funcional.
// NENHUM NOVO CÓDIGO DEVE USAR ESTE ARQUIVO.
// =================================================================================
export function uploadFile(
  userId: string,
  memoryId: string,
  file: File,
  memoryType: 'image' | 'video' | 'audio' | 'texto',
  options: UploadFileOptions = {}
): Promise<{ fileUrl: string, fileSize: number }> {
  
  return new Promise((resolve, reject) => {
    // 1. Determine subdirectory based solely on memoryType
    let subdirectory: string;
    switch (memoryType) {
      case 'image':
        subdirectory = 'images';
        break;
      case 'video':
        subdirectory = 'videos';
        break;
      case 'audio':
        subdirectory = 'audios';
        break;
      default:
        return reject(new Error("Tipo de memória inválido para upload de arquivo."));
    }

    // Usando o ID da memória como nome do arquivo para garantir unicidade e facilitar a exclusão.
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${memoryId}.${fileExtension}`;
    const filePath = `users/${userId}/memories/${subdirectory}/${fileName}`;
    const fileRef = ref(storage, filePath);
    
    // Utilize o tipo de arquivo real para os metadados
    const metadata = { contentType: file.type || "application/octet-stream" };

    const uploadTask: UploadTask = uploadBytesResumable(fileRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
      (error) => {
        console.error("[uploadFile] FALHA NO UPLOAD:", error);
        let userMessage = "Ocorreu um erro desconhecido durante o upload.";
        switch (error.code) {
          case "storage/unauthorized":
            userMessage = "Você não tem permissão para fazer este upload. Verifique as regras de segurança do Storage.";
            break;
          case "storage/canceled":
            userMessage = "O upload foi cancelado.";
            break;
          case "storage/unknown":
            userMessage = "Ocorreu um erro desconhecido no servidor. Tente novamente mais tarde.";
            break;
        }
        reject(new Error(userMessage));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ fileUrl: downloadURL, fileSize: file.size });
        } catch (error) {
           console.error("[uploadFile] Falha ao obter URL de download:", error);
           reject(new Error("Não foi possível obter a URL do arquivo após o upload."));
        }
      }
    );
  });
}
