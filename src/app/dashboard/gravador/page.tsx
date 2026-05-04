
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Video, Mic, StopCircle, Save, AlertTriangle, Loader2, CheckCircle2, VideoIcon, RefreshCw, AudioWaveform } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/context/session-provider';
import { createMemory } from '@/lib/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from '@/components/ui/progress';
import { useDatabase } from '@/firebase';
import { ref, push } from 'firebase/database';
import { cn } from '@/lib/utils';
import { storage } from "@/firebase/config";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";


type RecordingState = "idle" | "recording" | "stopped" | "saving";
type RecordingMode = "video" | "audio";
type PermissionState = "pending" | "granted" | "denied";

function uploadFile(
  userId: string,
  memoryId: string,
  file: File | Blob,
  memoryType: 'video' | 'audio',
  options: { onProgress: (progress: number) => void; }
): Promise<{ fileUrl: string, fileSize: number }> {

  console.log("[UPLOAD_START] Iniciando o processo de upload de gravação.");
  console.log(`[UPLOAD_DATA] UserID: ${userId}, MemoryID: ${memoryId}, MemoryType: ${memoryType}`);
  console.log(`[UPLOAD_FILE_INFO] Tamanho: ${file.size} bytes, Tipo: ${file.type}`);

  return new Promise((resolve, reject) => {
    const subdirectory = memoryType === 'video' ? 'videos' : 'audios';
    console.log(`[UPLOAD_LOGIC] Subpasta de destino definida como: '${subdirectory}'`);
    
    // Padroniza a extensão para .webm para garantir compatibilidade
    const fileExtension = memoryType === 'video' ? 'webm' : 'webm';
    const fileName = `${memoryId}.${fileExtension}`;
    const filePath = `users/${userId}/memories/${subdirectory}/${fileName}`;
    console.log(`[UPLOAD_PATH] Caminho completo do arquivo no Storage: ${filePath}`);
    const fileRef = storageRef(storage, filePath);
    
    const metadata = { contentType: file.type };
    console.log("[UPLOAD_METADATA] Metadados definidos:", metadata);

    const uploadTask = uploadBytesResumable(fileRef, file, metadata);
    console.log("[UPLOAD_TASK] Tarefa de upload iniciada.");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (progress > 0 && progress < 100) {
            console.log(`[UPLOAD_PROGRESS] ${progress.toFixed(2)}% concluído.`);
        }
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
           case "storage/unknown":
            userMessage = "Ocorreu um erro no servidor durante o upload. Tente novamente. Se o problema persistir, pode ser um problema de rede ou do servidor do Firebase.";
            break;
          default:
             userMessage = `Um erro inesperado ocorreu durante o upload. Código: ${error.code}.`;
             break;
        }
        console.error(`[UPLOAD_FEEDBACK] Mensagem de erro para o usuário: ${userMessage}`);
        reject(new Error(userMessage));
      },
      async () => {
        console.log("[UPLOAD_SUCCESS] Upload concluído com sucesso. Obtendo URL de download...");
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(`[UPLOAD_URL] URL de download obtida: ${downloadURL}`);
          resolve({ fileUrl: downloadURL, fileSize: file.size });
        } catch (error) {
           console.error("[DOWNLOAD_URL_FAILURE] Falha ao obter URL de download:", error);
           reject(new Error("Não foi possível obter a URL do arquivo após o upload."));
        }
      }
    );
  });
}

export default function RecordPage() {
  const { session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const database = useDatabase();

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mode, setMode] = useState<RecordingMode>("video");
  const [permission, setPermission] = useState<PermissionState>("pending");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
            track.stop();
        });
    }
    streamRef.current = null;
    setIsStreamReady(false);
  }, []);

  const getPermissionsAndDevices = useCallback(async () => {
    if (permission === 'granted') return;
    setPermission("pending");
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      tempStream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      if (videoInputs.length > 0) {
        setVideoDevices(videoInputs);
        if (!currentDeviceId) {
            const frontCamera = videoInputs.find(d => d.label.toLowerCase().includes('front'));
            setCurrentDeviceId(frontCamera ? frontCamera.deviceId : videoInputs[0].deviceId);
        }
      }
      setPermission("granted");
    } catch (error) {
      setPermission("denied");
      toast({
        variant: "destructive",
        title: "Acesso à Mídia Negado",
        description: "Por favor, permita o acesso à câmera e microfone nas configurações do seu navegador.",
        duration: 9000,
      });
    }
  }, [permission, currentDeviceId, toast]);

  const getStream = useCallback(async () => {
    cleanupStream();

    if (permission !== 'granted' || (!currentDeviceId && mode === 'video')) return;

    const constraints: MediaStreamConstraints = {
        video: mode === 'video' ? { deviceId: { exact: currentDeviceId } } : false,
        audio: true,
    };
    try {
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = newStream;
        if (videoRef.current) {
            videoRef.current.srcObject = newStream;
            videoRef.current.src = ""; // Clear any previous blob URL
            videoRef.current.load(); // Required for srcObject to take effect
            setIsStreamReady(true);
        }
    } catch (error) {
        setPermission('denied');
        setIsStreamReady(false);
    }
  }, [cleanupStream, permission, currentDeviceId, mode]);

  useEffect(() => {
    getPermissionsAndDevices();
    return () => {
      cleanupStream();
    };
  }, [getPermissionsAndDevices, cleanupStream]);

  useEffect(() => {
    if (recordingState === 'idle' && !recordedBlob && permission === 'granted') {
        getStream();
    }
  }, [recordingState, recordedBlob, permission, getStream]);

  const startRecording = () => {
    if (!streamRef.current || !isStreamReady) {
        toast({ variant: 'destructive', title: 'Câmera não está pronta', description: 'Aguarde a câmera inicializar antes de gravar.'});
        return;
    }
    
    setRecordedBlob(null);
    setRecordingState("recording");

    const chunks: Blob[] = [];
    const options = { mimeType: mode === 'video' ? 'video/webm' : 'audio/webm' };
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: options.mimeType });
      setRecordedBlob(blob);
      setRecordingState("stopped");
      if (timerRef.current) clearInterval(timerRef.current);
      
      // We stop the stream *after* the blob is created and ready
      cleanupStream();

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(blob);
        videoRef.current.load();
      }
    };

    mediaRecorderRef.current.start();
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };
  
  const resetStateForNewRecording = useCallback(() => {
    setRecordingState('idle');
    setRecordedBlob(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
    setIsSaveSuccess(false);
    if(videoRef.current) {
        videoRef.current.src = '';
        videoRef.current.srcObject = null;
        videoRef.current.muted = true;
    }
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;

    if (!title || !recordedBlob || !session?.uid || !database) {
      toast({ variant: 'destructive', title: 'Informações faltando', description: 'Título e gravação são obrigatórios.' });
      setRecordingState('stopped');
      return;
    }
    
    setRecordingState('saving');
    setUploadProgress(0);
    
    try {
        const memoriesListRef = ref(database, `users/${session.uid}/memories`);
        const newMemoryRef = push(memoriesListRef);
        const memoryId = newMemoryRef.key;

        if (!memoryId) throw new Error("Não foi possível gerar um ID para a nova memória.");

        const { fileUrl, fileSize } = await uploadFile(
          session.uid,
          memoryId,
          recordedBlob,
          mode as 'video' | 'audio',
          { onProgress: setUploadProgress }
        );

        const result = await createMemory({
            userId: session.uid,
            memoryId: memoryId,
            title,
            description: `Gravação de ${mode} feita em ${new Date().toLocaleDateString('pt-BR')}`,
            type: mode,
            fileUrl,
            fileSize,
            content: '',
            recipients: [],
        });

        if (result && result.success) {
            setIsSaveSuccess(true);
            setRecordedBlob(null);
        } else {
            throw new Error(result?.message || "A resposta do servidor foi inválida ou a operação falhou.");
        }

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Falha ao Salvar', description: error.message, duration: 10000 });
        setRecordingState('stopped');
    } finally {
        setUploadProgress(0);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  const isRecordingDisabled = !isStreamReady || permission !== 'granted' || recordingState === 'saving' || recordingState === 'recording';
  
  const frontCamera = videoDevices.find(d => d.label.toLowerCase().includes('front'));
  const backCamera = videoDevices.find(d => d.label.toLowerCase().includes('back'));

  if (isSaveSuccess) {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-6 text-center animate-fade-in-up">
            <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-white opacity-20 blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
                <CheckCircle2 className="h-24 w-24 text-green-500 icon-glow relative" style={{ filter: 'drop-shadow(0 0 10px white)' }}/>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-glow">Memória Salva com Sucesso!</h1>
            <p className="text-green-400" style={{ textShadow: '0 0 8px rgba(52, 211, 153, 0.7)'}}>Acesse suas memórias para visualizá-la</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button onClick={resetStateForNewRecording}>
                    <Video className="mr-2 h-4 w-4" />
                    Gravar Nova Memória
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/memories">
                       Ver Memórias
                    </Link>
                </Button>
            </div>
        </main>
    );
  }


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Gravar Memória</h1>
        <Select value={mode} onValueChange={(value) => { setMode(value as RecordingMode); resetStateForNewRecording(); }} disabled={recordingState === 'recording'}>
          <SelectTrigger className="w-full max-w-[180px]">
            <SelectValue placeholder="Modo de Gravação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">
                <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Vídeo</div>
            </SelectItem>
            <SelectItem value="audio">
                <div className="flex items-center gap-2"><Mic className="h-4 w-4" /> Áudio</div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera />
            Gravador
          </CardTitle>
          <CardDescription>
            Grave uma mensagem de vídeo ou áudio para guardar. O único limite é o seu espaço de armazenamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className={cn("relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center")}>
            <video 
                ref={videoRef}
                playsInline
                autoPlay={!recordedBlob}
                muted={!recordedBlob}
                controls={!!recordedBlob}
                className={cn("w-full h-full object-cover",
                    mode === 'audio' && "hidden" // Always hide video element for audio mode
                )}
            />
             
            {permission === 'denied' && (
              <Alert variant="destructive" className="m-4 max-w-md absolute">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Permissão Necessária</AlertTitle>
                  <AlertDescription>
                   Para gravar, você precisa permitir o acesso à câmera e microfone nas configurações do seu navegador e recarregar a página.
                  </AlertDescription>
              </Alert>
             )}

            {permission === 'pending' && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <p className="mt-4 text-lg">Aguardando permissão...</p>
                </div>
            )}
             
            {mode === 'audio' && permission === 'granted' && !recordedBlob && recordingState !== 'recording' && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted">
                    <AudioWaveform className="h-24 w-24" />
                    <p className="mt-4 text-lg">Pronto para gravar áudio</p>
                </div>
            )}
            
            {recordingState === 'recording' && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
          
          {mode === 'video' && videoDevices.length > 1 && frontCamera && backCamera && (
            <div className="flex justify-center gap-4">
                <Button
                    variant={currentDeviceId === frontCamera.deviceId ? "default" : "outline"}
                    onClick={() => setCurrentDeviceId(frontCamera.deviceId)}
                    disabled={recordingState === 'recording'}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Frontal
                </Button>
                <Button
                    variant={currentDeviceId === backCamera.deviceId ? "default" : "outline"}
                    onClick={() => setCurrentDeviceId(backCamera.deviceId)}
                    disabled={recordingState === 'recording'}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Traseira
                </Button>
            </div>
          )}
          
          {recordingState !== 'saving' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {recordingState === 'idle' && (
                    <Button onClick={startRecording} disabled={isRecordingDisabled} size="lg" className="button-glow">
                        {!isStreamReady ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando câmera...</>
                        ) : (
                            <><VideoIcon className="mr-2 h-4 w-4" /> Iniciar Gravação</>
                        )}
                    </Button>
                )}

                {recordingState === 'recording' && (
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                        <StopCircle className="mr-2 h-4 w-4" />
                        Parar Gravação
                    </Button>
                )}

                {recordingState === 'stopped' && (
                    <div className="w-full space-y-4 animate-fade-in-up">
                        <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="h-8 w-8 text-green-400 icon-glow mx-auto" />
                            <p className="mt-2 text-lg font-semibold text-foreground">Gravação capturada com sucesso!</p>
                            <p className="text-sm text-muted-foreground">Dê um título à sua memória abaixo para salvá-la.</p>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título da Memória</Label>
                                <Input id="title" name="title" placeholder="Ex: Mensagem para o futuro" required />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" disabled={!recordedBlob} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Memória
                                </Button>
                                <Button type="button" variant="outline" onClick={resetStateForNewRecording} className="w-full sm:w-auto">
                                    Gravar Novamente
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
          )}

          {recordingState === 'saving' && (
             <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-lg font-semibold text-center">Salvando sua memória...</h3>
                 <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      Enviando... {uploadProgress.toFixed(0)}%
                    </p>
                  </div>
            </div>
          )}

        </CardContent>
      </Card>
    </main>
  );
}
