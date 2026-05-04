
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, PlusCircle, Video, Mic, FileText, Image as ImageIcon, Send, FileWarning } from "lucide-react";
import Image from "next/image";
import { DoubleConfirmationDialog } from "@/components/dashboard/double-confirmation-dialog";
import { useSession } from "@/context/session-provider";
import { useDatabase, useList, useMemoFirebase } from "@/firebase";
import { ref, remove } from "firebase/database";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import type { Memory, Recipient } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { InstantSendDialog } from "@/components/dashboard/instant-send-dialog";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key in Memory['type']]: React.ElementType } = {
  video: Video,
  audio: Mic,
  texto: FileText,
  image: ImageIcon,
};

const typeTranslations: { [key in Memory['type']]: string } = {
  video: "Vídeo",
  audio: "Áudio",
  texto: "Texto",
  image: "Imagem",
};

function formatBytes(bytes: number | undefined, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


export default function MemoriesPage() {
  const { session } = useSession();
  const database = useDatabase();
  const router = useRouter();
  const { toast } = useToast();

  const memoriesQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/memories`);
  }, [session, database]);

  const recipientsQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/recipients`);
  }, [session, database]);

  const { data: memories, isLoading: isLoadingMemories } = useList<Memory>(memoriesQuery);
  const { data: recipients, isLoading: isLoadingRecipients } = useList<Recipient>(recipientsQuery);
  
  const recipientMap = useMemo(() => {
    if (!recipients) return new Map<string, Recipient>();
    return new Map(recipients.map(r => [r.id, r]));
  }, [recipients]);

  const isLoading = isLoadingMemories || isLoadingRecipients;
  
  const handleDeleteMemory = async (memory: Memory) => {
    if (!session?.uid || !database) {
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: "Não foi possível excluir a memória. Tente fazer login novamente.",
      });
      return;
    }

    // 1. Apagar o arquivo do Storage, se ele existir
    if (memory.fileUrl) {
      try {
        const storage = getStorage();
        // Cria uma referência para o arquivo a partir da URL de download
        const fileRef = storageRef(storage, memory.fileUrl);
        await deleteObject(fileRef);
        console.log(`Arquivo ${memory.fileUrl} excluído do Storage.`);
      } catch (error: any) {
        // Se o arquivo não existir mais, não é um erro crítico. Apenas loga.
        if (error.code === 'storage/object-not-found') {
          console.warn(`Arquivo ${memory.fileUrl} não encontrado no Storage, mas prosseguindo com a exclusão do banco de dados.`);
        } else {
          // Para outros erros, informa o usuário e interrompe o processo.
          console.error("Erro ao excluir arquivo do Storage:", error);
          toast({
            variant: "destructive",
            title: "Erro no Storage",
            description: "Não foi possível excluir o arquivo associado. A memória não foi apagada.",
          });
          return; // Interrompe a exclusão
        }
      }
    }

    // 2. Apagar o registro do Realtime Database
    const memoryDbRef = ref(database, `users/${session.uid}/memories/${memory.id}`);
    await remove(memoryDbRef);
  };

  const handleRowClick = (memoryId: string) => {
    router.push(`/dashboard/memories/${memoryId}/edit`);
  };

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-12 w-12 rounded-full" />
      </TableCell>
      <TableCell><Skeleton className="h-4 w-2/3" /></TableCell>
      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-1/3" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-3/4" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
    </TableRow>
  );

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Seu Legado Digital</h1>
          <Button asChild>
            <Link href="/dashboard/memories/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Nova Memória
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Memórias</CardTitle>
            <CardDescription>
              Uma coleção de suas memórias digitais armazenadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Prévia
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Destinatários</TableHead>
                   <TableHead className="hidden lg:table-cell">Tamanho</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Criação
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => renderSkeleton(i))}
                  </>
                ) : memories && memories.length > 0 ? (
                  memories.map((memory) => {
                    const Icon = iconMap[memory.type] || FileText;
                    const previewSrc = memory.type === 'image' && memory.fileUrl ? memory.fileUrl : (memory.image?.src);
                    const badgeVariant = memory.type;
                    
                    const memoryRecipients = (memory.recipients || [])
                      .map(id => recipientMap.get(id))
                      .filter((r): r is Recipient => r !== undefined);
                    
                    const hasRecipient = memoryRecipients.length > 0;
                    const isLargeFile = (memory.fileSize || 0) > 20 * 1024 * 1024;

                    return (
                      <TableRow 
                        key={memory.id} 
                        className="cursor-pointer"
                        onClick={() => handleRowClick(memory.id)}
                      >
                        <TableCell className="hidden sm:table-cell">
                           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            {previewSrc ? (
                               <Image
                                alt={memory.title}
                                className="aspect-square rounded-full object-cover"
                                height={48}
                                src={previewSrc}
                                width={48}
                                data-ai-hint={memory.image?.hint}
                              />
                            ) : (
                              <Icon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                              <span className="font-semibold">{memory.title}</span>
                              {isLargeFile && (
                                  <TooltipProvider>
                                      <Tooltip>
                                          <TooltipTrigger onClick={(e) => { e.stopPropagation(); }}>
                                              <FileWarning className="h-4 w-4 text-amber-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                              <p>Arquivo grande ({formatBytes(memory.fileSize)}). Será enviado como link.</p>
                                          </TooltipContent>
                                      </Tooltip>
                                  </TooltipProvider>
                              )}
                            </div>
                            <div className="sm:hidden mt-1 text-xs text-muted-foreground">
                                <Badge variant={badgeVariant} className="capitalize">{typeTranslations[memory.type]}</Badge>
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={badgeVariant} className="capitalize">
                            {typeTranslations[memory.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {memory.recipients && memory.recipients.length > 0
                            ? `${memory.recipients.length} destinatário(s)`
                            : "Nenhum"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatBytes(memory.fileSize || 0)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                           {memory.createdAt ? new Date(memory.createdAt).toLocaleDateString('pt-BR') : "-"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="outline"
                                className="border-none bg-transparent hover:bg-transparent"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Alternar menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                              <TooltipProvider>
                                <DropdownMenuItem onSelect={() => router.push(`/dashboard/memories/${memory.id}/edit`)}>
                                  Editar
                                </DropdownMenuItem>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-full">
                                      <InstantSendDialog
                                        memory={memory}
                                        recipients={memoryRecipients}
                                        disabled={!hasRecipient}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {!hasRecipient && (
                                    <TooltipContent>
                                      <p>Adicione um destinatário para ativar esta opção.</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                                
                                <Tooltip>
                                   <TooltipTrigger asChild>
                                    <div className="w-full">
                                      <DoubleConfirmationDialog
                                        memory={memory}
                                        recipient={recipientMap.get(memory.recipients?.[0] ?? "")!}
                                        disabled={!hasRecipient}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {!hasRecipient && (
                                    <TooltipContent>
                                      <p>Adicione um destinatário para ativar esta opção.</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>

                                <DropdownMenuSeparator />
                                
                                <DeleteConfirmationDialog
                                  onConfirm={() => handleDeleteMemory(memory)}
                                  itemName={memory.title}
                                  itemType="memória"
                                >
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    Excluir
                                  </DropdownMenuItem>
                                </DeleteConfirmationDialog>
                              </TooltipProvider>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhuma memória encontrada. Adicione uma para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
  );
}
