
"use client";

import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, Video as VideoIcon, ExternalLink } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { Memory, Recipient } from "@/lib/types";
import Image from "next/image";
import { useSession } from "@/context/session-provider";
import { useDatabase, useList, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import { RecipientSelector } from "./recipient-selector";
import { RichTextEditor } from "./rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

/**
 * @description Define o schema de validação para o formulário de memória usando a biblioteca Zod.
 * Cada campo tem suas próprias regras (tipo, tamanho mínimo/máximo, etc.).
 */
export const memoryFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "O título deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O título não pode ter mais de 100 caracteres." }),
  description: z
    .string()
    .max(500, { message: "A descrição não pode ter mais de 500 caracteres." })
    .optional(),
  type: z.enum(["texto", "image", "video", "audio"], {
    required_error: "Você precisa selecionar um tipo de memória.",
  }),
  content: z.string().optional(),
  file: z.any().optional(),
  recipients: z.array(z.string()).optional().default([]),
});

// Extrai o tipo TypeScript do schema Zod para usar no formulário.
type MemoryFormValues = z.infer<typeof memoryFormSchema>;

// Define as propriedades que o componente MemoryForm espera receber.
interface MemoryFormProps {
  form: UseFormReturn<MemoryFormValues>;
  isSaving: boolean;
  onSubmit: (values: MemoryFormValues) => void;
  initialData?: Memory | null; // Dados iniciais para o modo de edição.
}

/**
 * @description Componente principal do formulário para criar e editar memórias.
 * Ele gerencia a interface do formulário, a pré-visualização de arquivos e a submissão dos dados.
 */
export function MemoryForm({
  form,
  onSubmit,
  isSaving,
  initialData,
}: MemoryFormProps) {
  const getFileNameFromUrl = (url: string | undefined): string => {
    if (!url) return 'arquivo_invalido';
    try {
        const urlObject = new URL(url);
        // O pathname é algo como /v0/b/..../o/users%2F...%2Ffilename.ext
        const decodedPath = decodeURIComponent(urlObject.pathname);
        const fileName = decodedPath.split('/').pop();
        return fileName || 'arquivo';
    } catch (e) {
        // Fallback para uma string simples se o construtor da URL falhar
        return url.split('/').pop()?.split('?')[0] || 'arquivo';
    }
  };
  
  // Referência para o input de arquivo, permitindo "clicá-lo" via código.
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Observa o valor do campo "type" do formulário para renderização condicional.
  const memoryType = form.watch("type");

  // Hooks para obter a sessão do usuário e a instância do banco de dados.
  const { session } = useSession();
  const database = useDatabase();

  // Busca a lista de todos os destinatários do usuário no banco de dados.
  const recipientsQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/recipients`);
  }, [session, database]);

  const { data: allRecipients, isLoading: isLoadingRecipients } = useList<Recipient>(recipientsQuery);

  // Estado para armazenar a URL de pré-visualização do arquivo selecionado.
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  // Observa o campo "file" do formulário para atualizar a pré-visualização.
  const currentFile = form.watch("file");
  
  // Efeito que gera a pré-visualização sempre que um novo arquivo é selecionado.
  useEffect(() => {
    let isCancelled = false;
    const file = currentFile?.[0];
    
    if (file && typeof window !== "undefined" && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!isCancelled && reader.result) {
                setFilePreview(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    } else if (!currentFile && filePreview) {
      setFilePreview(null);
    }
    
    return () => { isCancelled = true };
  }, [currentFile, filePreview]);

  // Variáveis booleanas para simplificar a lógica de renderização condicional.
  const fileName = getFileNameFromUrl(initialData?.fileUrl);
  const isWebCompatibleVideo = initialData?.type === 'video' && initialData.fileUrl && (fileName.endsWith('.webm') || fileName.endsWith('.mp4'));
  const isIncompatibleVideo = initialData?.type === 'video' && !isWebCompatibleVideo;
  const isEditingVideo = initialData?.type === 'video';
  
  const hasInitialImage = initialData?.type === 'image' && initialData.fileUrl;
  const imagePreviewUrl = filePreview || (hasInitialImage ? initialData.fileUrl : null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* CAMPO: Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Carta para meus filhos"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                Dê um título significativo para esta memória.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* CAMPO: Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSaving}
                    placeholder="Uma breve descrição sobre o que esta memória representa."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* CAMPO: Tipo de Memória (só aparece ao criar uma nova) */}
        {!initialData && (
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Memória</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSaving || !!initialData}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo da memória" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="texto">Texto</SelectItem>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="audio">Áudio</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        )}
        
        {/* CAMPO: Seletor de Destinatários */}
        <FormField
          control={form.control}
          name="recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinatários</FormLabel>
              <FormControl>
                <RecipientSelector
                  allRecipients={allRecipients || []}
                  selectedRecipients={field.value || []}
                  onChange={field.onChange}
                  isLoading={isLoadingRecipients}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                Escolha para quem esta memória será entregue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* LÓGICA DE PRÉ-VISUALIZAÇÃO / UPLOAD */}
        
        {isWebCompatibleVideo && (
            <div className="space-y-2">
                <Label>Pré-visualização do Vídeo</Label>
                {!showVideo ? (
                    <Button variant="outline" onClick={() => setShowVideo(true)}>
                        <VideoIcon className="mr-2 h-4 w-4" />
                        Ver memória salva
                    </Button>
                ) : (
                    <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        <video
                            key={initialData?.fileUrl} 
                            src={initialData?.fileUrl}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}
            </div>
        )}

        {isIncompatibleVideo && (
            <div className="space-y-2">
                <Label>Arquivo de Vídeo Salvo</Label>
                <a
                    href={initialData.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/90"
                >
                    <VideoIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{fileName}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
                <FormDescription className="text-primary [filter:drop-shadow(0_0_4px_hsl(var(--primary)/0.6))]">
                    Clique para abrir. O formato <span className="font-bold">.{fileName.split('.').pop()}</span> pode não ser compatível com o player do navegador e pode ser baixado.
                </FormDescription>
            </div>
        )}

        {/* 2. SE O TIPO NÃO FOR 'TEXTO' E NÃO ESTIVER EDITANDO UM VÍDEO, MOSTRA A ÁREA DE UPLOAD */}
        {memoryType !== "texto" && !isEditingVideo && (
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{initialData ? "Substituir Arquivo (Opcional)" : "Arquivo"}</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center justify-center w-full">
                    <div
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-background/50 relative overflow-hidden group transition-all duration-300 hover:border-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreviewUrl ? ( // Preview para IMAGENS
                        <div className="relative w-full h-full">
                          <Image
                            src={imagePreviewUrl}
                            alt="Prévia"
                            fill
                            className="object-contain"
                          />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <p className="text-white font-semibold">Trocar Imagem</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                           <UploadCloud className="w-8 h-8 mb-2 text-primary icon-glow transition-transform duration-300 group-hover:scale-110" />
                          {currentFile?.[0] ? ( // Um arquivo foi selecionado (vídeo, áudio, etc.)
                            <>
                              <p className="mb-2 text-sm font-semibold text-foreground">
                                {currentFile[0].name}
                              </p>
                              <p className="text-xs text-muted-foreground">Clique ou arraste para substituir</p>
                            </>
                          ) : initialData?.fileUrl && !isEditingVideo ? ( // Modo de edição para audio/imagem sem novo arquivo
                            <>
                              <p className="mb-2 text-sm font-semibold text-foreground">
                                Arquivo existente.
                              </p>
                              <p className="text-xs text-muted-foreground">Clique para substituir</p>
                            </>
                          ) : !isEditingVideo ? ( // Nenhum arquivo selecionado e não é edição de vídeo
                            <>
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {memoryType === "image" && "JPG, PNG, GIF"}
                                {memoryType === "video" && "MP4, MOV, WEBM"}
                                {memoryType === "audio" && "MP3, WAV, AAC"}
                              </p>
                            </>
                          ) : null}
                        </div>
                      )}
                      
                      <Input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onBlur={field.onBlur}
                        name={field.name}
                        onChange={(e) => {
                          field.onChange(e.target.files);
                        }}
                        ref={fileInputRef}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        {/* CAMPO: Conteúdo de Texto (renderizado apenas se o tipo for 'texto') */}
        {memoryType === "texto" && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo do Texto</FormLabel>
                <FormControl>
                  <RichTextEditor
                    content={field.value ?? ""}
                    onChange={field.onChange}
                    editable={!isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* BOTÃO: Submissão do formulário */}
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? "Salvando..." : initialData ? "Salvar Alterações" : "Criar Memória"}
        </Button>
      </form>
    </Form>
  );
}
