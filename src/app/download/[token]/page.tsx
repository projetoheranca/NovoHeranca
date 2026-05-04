'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Video, FileText, Image as ImageIcon, Mic, HardDrive, Calendar, Clock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getDownloadTokenDetails } from '@/lib/actions';
import type { Memory } from '@/lib/types';


// Helper function to format bytes into a readable string
function formatBytes(bytes: number | undefined, decimals = 2) {
  if (bytes === undefined || bytes === 0) return null;
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper function to format seconds into MM:SS
function formatDuration(seconds: number | undefined) {
    if (seconds === undefined || seconds === 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
}

// Map memory types to icons and labels
const memoryTypeDetails = {
    video: { icon: Video, label: 'Vídeo' },
    image: { icon: ImageIcon, label: 'Foto' },
    audio: { icon: Mic, label: 'Áudio' },
    texto: { icon: FileText, label: 'Documento' },
};


export default function DownloadLegacyPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState("Seu ente querido"); 
    const [memoryTitle, setMemoryTitle] = useState("uma memória especial");
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

    // New state for metadata
    const [memoryType, setMemoryType] = useState<keyof typeof memoryTypeDetails | undefined>();
    const [memoryFileSize, setMemoryFileSize] = useState<number | undefined>();
    const [memoryCreatedAt, setMemoryCreatedAt] = useState<string | undefined>();
    const [memoryDuration, setMemoryDuration] = useState<number | undefined>();

    useEffect(() => {
        async function fetchDetails() {
            if (!token) {
                setError("Token de download inválido.");
                setIsLoadingPage(false);
                return;
            }
            const result = await getDownloadTokenDetails(token);
            if (result.success) {
                setUserName(result.userName || "Seu ente querido");
                setMemoryTitle(result.memoryTitle || "uma memória especial");
                setFileName(result.fileName);
                setFileUrl(result.fileUrl);
                // Set new metadata state
                setMemoryType(result.memoryType);
                setMemoryFileSize(result.memoryFileSize);
                setMemoryCreatedAt(result.memoryCreatedAt);
                setMemoryDuration(result.memoryDuration);
            } else {
                setError(result.message || "Não foi possível carregar os detalhes do legado.");
            }
            setIsLoadingPage(false);
        }
        fetchDetails();
    }, [token]);

    // Icon and label for the current memory type
    const CurrentIcon = memoryType ? memoryTypeDetails[memoryType].icon : FileText;
    const typeLabel = memoryType ? memoryTypeDetails[memoryType].label : 'Arquivo';

    if (isLoadingPage) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      )
    }

    if (error) {
      return (
          <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
              <Card className="w-full max-w-lg card-glow border-destructive">
                  <CardHeader className="text-center">
                      <Image src="/img/logo1.png" alt="Logo" width={64} height={64} className="mx-auto mb-4 icon-glow" />
                      <CardTitle className="text-2xl font-black text-destructive">Link Inválido ou Expirado</CardTitle>
                      <CardDescription>
                          {error}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button onClick={() => router.push('/')} className="w-full">
                          Voltar à Página Inicial
                      </Button>
                  </CardContent>
              </Card>
          </main>
      );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg text-center card-glow">
                <CardHeader>
                    <Image src="/img/logo1.png" alt="Logo" width={64} height={64} className="mx-auto mb-4 icon-glow" />
                    <CardTitle className="mt-4 text-3xl font-black text-glow">Um Presente de {userName}</CardTitle>
                    <CardDescription className="text-lg">
                        Uma memória foi deixada para você.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">MEMÓRIA</p>
                            <p className="text-xl font-semibold">{memoryTitle}</p>
                        </div>
                        
                        {/* New Metadata Section */}
                        {(memoryType && memoryType !== 'texto') && (
                             <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <span className="flex items-center gap-1.5"><CurrentIcon className="h-4 w-4" /> {typeLabel}</span>
                                    {formatBytes(memoryFileSize) && <span className="flex items-center gap-1.5"><HardDrive className="h-4 w-4" /> {formatBytes(memoryFileSize)}</span>}
                                    {formatDuration(memoryDuration) && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(memoryDuration)}</span>}
                                </div>
                                {memoryCreatedAt && <div className="flex items-center justify-center gap-1.5 pt-2"><Calendar className="h-4 w-4" /> Enviado em: {new Date(memoryCreatedAt).toLocaleDateString('pt-BR')}</div>}
                            </div>
                        )}

                        {fileUrl ? (
                            <div className="border-t pt-4">
                                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                                    CLIQUE NO BOTÃO ABAIXO PARA EXECUTAR O DOWNLOAD DO SEU ARQUIVO
                                </p>
                                <Button asChild size="lg" className="mt-4 button-glow w-full">
                                    <a
                                        href={fileUrl}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        download={fileName}
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Baixar {fileName}
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <div className="border-t pt-4">
                               <p className="text-sm text-muted-foreground">Esta memória é um texto e o seu conteúdo será enviado no corpo do e-mail, não havendo arquivo para baixar.</p>
                            </div>
                        )}

                    </div>
                     <div className="mt-6 text-xs text-center text-muted-foreground space-y-1">
                        <p className="flex items-center justify-center gap-1.5"><AlertTriangle className="h-3 w-3 text-amber-500" /> Este link expira após o primeiro download ou em 7 dias.</p>
                        <p>Salve o arquivo em um local seguro após baixar.</p>
                        <p className="pt-2">Dúvidas? Entre em contato: <a href="mailto:help@minhaherancadigital.com" className="underline">help@minhaherancadigital.com</a></p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}