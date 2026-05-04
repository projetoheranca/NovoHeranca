
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "@/context/session-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MemoryForm, memoryFormSchema } from "@/components/dashboard/memory-form";
import { createMemory } from "@/lib/actions";
import { useDatabase } from "@/firebase";
import { ref as dbRef, push } from "firebase/database";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { storage } from "@/firebase/config";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function uploadFile(
  userId: string,
  memoryId: string,
  file: File,
  memoryType: 'image' | 'video' | 'audio',
  options: { onProgress: (progress: number) => void; }
): Promise<{ fileUrl: string, fileSize: number }> {
  console.log('[UPLOAD_START] Iniciando o processo de upload.');
  console.log(`[UPLOAD_DATA] UserID: ${userId}, MemoryID: ${memoryId}, MemoryType: ${memoryType}`);
  console.log(`[UPLOAD_FILE_INFO] Nome: ${file.name}, Tamanho: ${file.size} bytes, Tipo: ${file.type}`);

  return new Promise((resolve, reject) => {
    let subdirectory: string;
    switch (memoryType) {
      case 'image': subdirectory = 'images'; break;
      case 'video': subdirectory = 'videos'; break;
      case 'audio': subdirectory = 'audios'; break;
      default:
        console.error(`[UPLOAD_ERROR] Tipo de memória inválido: ${memoryType}`);
        return reject(new Error(`Tipo de memória inválido para upload: ${memoryType}`));
    }
    console.log(`[UPLOAD_LOGIC] Subpasta de destino definida como: '${subdirectory}'`);

    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${memoryId}.${fileExtension}`;
    const filePath = `users/${userId}/memories/${subdirectory}/${fileName}`;
    console.log(`[UPLOAD_PATH] Caminho completo do arquivo no Storage: ${filePath}`);
    
    const metadata = { contentType: file.type };
    console.log("[UPLOAD_METADATA] Metadados definidos:", metadata);
    const uploadTask = uploadBytesResumable(storageRef(storage, filePath), file, metadata);
    console.log("[UPLOAD_TASK] Tarefa de upload iniciada.");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if(progress > 0 && progress < 100) console.log(`[UPLOAD_PROGRESS] Progresso: ${progress.toFixed(2)}%`);
        options.onProgress(progress);
      },
      (error) => {
        console.error("[UPLOAD_FAILURE] A API do Firebase Storage retornou um ERRO:", error);
        let userMessage = `Falha no upload: ${error.message}`;
        switch (error.code) {
          case "storage/unauthorized":
            userMessage = "Permissão negada. Verifique as regras de segurança do seu Firebase Storage.";
            break;
          case "storage/canceled":
            userMessage = "O upload foi cancelado.";
            break;
          case 'storage/retry-limit-exceeded':
            userMessage = "Limite de tentativas excedido. Verifique sua conexão com a internet.";
            break;
          case 'storage/unknown':
             userMessage = "Ocorreu um erro no servidor durante o upload. Tente novamente. Se o problema persistir, pode ser um problema de rede ou do servidor do Firebase.";
             break;
          default:
             userMessage = `Erro inesperado no upload: ${error.code}.`;
             break;
        }
        console.error(`[UPLOAD_FEEDBACK] Mensagem de erro para o usuário: ${userMessage}`);
        reject(new Error(userMessage));
      },
      async () => {
        console.log("[UPLOAD_SUCCESS] Upload concluído. Obtendo URL...");
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("[UPLOAD_URL] URL obtida:", downloadURL);
          resolve({ fileUrl: downloadURL, fileSize: file.size });
        } catch (error) {
           console.error("[DOWNLOAD_URL_FAILURE] Falha ao obter URL de download:", error);
           reject(new Error("Não foi possível obter a URL do arquivo após o upload."));
        }
      }
    );
  });
}


export default function NewMemoryPage() {
  const router = useRouter();
  const { session } = useSession();
  const { toast } = useToast();
  const database = useDatabase();

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof memoryFormSchema>>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "texto",
      content: "",
      file: null,
      recipients: [],
    },
  });

  const handleSubmit = async (values: z.infer<typeof memoryFormSchema>) => {
    console.log("[handleSubmit] Formulário submetido.", { values });
    setIsSaving(true);
    setUploadProgress(0);

    if (!session?.uid || !database) {
      toast({ variant: "destructive", title: "Erro de Autenticação", description: "Sessão inválida. Faça login novamente." });
      setIsSaving(false);
      return;
    }

    try {
      const memoriesListRef = dbRef(database, `users/${session.uid}/memories`);
      const newMemoryRef = push(memoriesListRef);
      const memoryId = newMemoryRef.key;
      if (!memoryId) throw new Error("Não foi possível gerar um ID para a nova memória.");
      console.log(`[handleSubmit] ID da memória gerado: ${memoryId}`);

      if (values.type === 'texto') {
        console.log("[handleSubmit] Salvando memória de texto...");
        const result = await createMemory({
          userId: session.uid,
          memoryId: memoryId,
          title: values.title,
          description: values.description || "",
          type: values.type,
          content: values.content || "",
          recipients: values.recipients || [],
        });
        if (!result?.success) {
            throw new Error(result?.message || "Falha ao salvar memória de texto no servidor.");
        }
        toast({ title: "Memória de texto criada!", description: `"${values.title}" foi salva.` });
        router.push("/dashboard/memories");
        return;
      }
      
      console.log(`[handleSubmit] Iniciando upload para memória tipo: ${values.type}.`);
      const fileToUpload = values.file?.[0];
      if (!fileToUpload) {
        throw new Error("Você precisa selecionar um arquivo para este tipo de memória.");
      }
      
      const { fileUrl, fileSize } = await uploadFile(
        session.uid,
        memoryId,
        fileToUpload,
        values.type as 'image' | 'video' | 'audio',
        { onProgress: setUploadProgress }
      );

      console.log("[handleSubmit] Salvando metadados da memória...");
      const result = await createMemory({
        userId: session.uid,
        memoryId: memoryId,
        title: values.title,
        description: values.description || "",
        type: values.type,
        fileUrl,
        fileSize,
        recipients: values.recipients || [],
      });

      if (!result?.success) {
        throw new Error(result?.message || "Falha ao salvar metadados da memória no servidor.");
      }

      toast({
        title: "Memória criada com sucesso!",
        description: `A memória "${values.title}" foi adicionada.`,
      });
      router.push("/dashboard/memories");

    } catch (error) {
      console.error("[handleSubmit] Erro capturado no fluxo de criação:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      toast({
        variant: "destructive",
        title: "Falha ao Criar Memória",
        description: errorMessage,
        duration: 10000,
      });
    } finally {
      console.log("[handleSubmit] Processo finalizado.");
      setIsSaving(false);
      setUploadProgress(0);
    }
  };
  
  const isUploading = isSaving && form.watch('type') !== 'texto';
  const isSubmitDisabled = isSaving;


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Nova Memória</h1>
      </div>
      
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Memória</CardTitle>
            <CardDescription>
              Preencha os detalhes abaixo para criar uma nova memória digital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in-up text-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <h3 className="text-lg font-semibold">Salvando sua memória...</h3>
                <div className="space-y-2 w-full max-w-sm mx-auto">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Enviando... {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
            ) : (
              <MemoryForm
                form={form}
                onSubmit={handleSubmit}
                isSaving={isSubmitDisabled}
              />
            )}
          </CardContent>
        </Card>
    </main>
  );
}
