
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { 
    Calendar as CalendarIcon, 
    Loader2, 
    Send, 
    Trash2, 
    History, 
    Cake, 
    Diamond, 
    Gift, 
    Sparkles, 
    Heart, 
    Trophy, 
    Egg,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-provider";
import { useDatabase, useList, useMemoFirebase } from "@/firebase";
import { ref, push, set, remove } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import type { Memory, Recipient, ScheduledMemory } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { retryFailedScheduledMemory } from "@/lib/calendar-actions";
import { holidaysByType } from "@/lib/brazilian-holidays";
import { Input } from "@/components/ui/input";

const scheduleSchema = z.object({
  date: z.date({ required_error: "A data do agendamento é obrigatória." }),
  memoryId: z.string({ required_error: "Selecione uma memória." }),
  recipientId: z.string({ required_error: "Selecione um destinatário." }),
  message: z.string().optional(),
  templateType: z.enum(['padrão', 'aniversário', 'casamento', 'natal', 'ano_novo', 'dia_das_maes', 'dia_dos_pais', 'dia_dos_namorados', 'pascoa']).default('padrão'),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const templateOptions = [
  { value: 'padrão', label: 'Mensagem Comum', icon: Send },
  { value: 'aniversário', label: 'Aniversário', icon: Cake },
  { value: 'casamento', label: 'Casamento', icon: Diamond },
  { isSeparator: true },
  { value: 'natal', label: 'Natal', icon: Gift },
  { value: 'ano_novo', label: 'Ano Novo', icon: Sparkles },
  { value: 'dia_das_maes', label: 'Dia das Mães', icon: Heart },
  { value: 'dia_dos_pais', label: 'Dia dos Pais', icon: Trophy },
  { value: 'dia_dos_namorados', label: 'Dia dos Namorados', icon: Heart },
  { value: 'pascoa', label: 'Páscoa', icon: Egg },
];

const parseDateString = (dateString: string): Date => new Date(dateString.replace(/-/g, '/'));

export default function CalendarPage() {
  const { session } = useSession();
  const database = useDatabase();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSelectedDate(new Date());
  }, []);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { templateType: 'padrão' }
  });

  const memoriesQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/memories`);
  }, [session, database]);
  const { data: memories, isLoading: isLoadingMemories } = useList<Memory>(memoriesQuery);

  const recipientsQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/recipients`);
  }, [session, database]);
  const { data: recipients, isLoading: isLoadingRecipients } = useList<Recipient>(recipientsQuery);

  const scheduledMemoriesQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/scheduledMemories`);
  }, [session, database]);
  const { data: allScheduledMemories, isLoading: isLoadingScheduled, mutate: mutateScheduled } = useList<ScheduledMemory>(scheduledMemoriesQuery);

  const scheduledOnly = allScheduledMemories?.filter(sm => sm.status === 'scheduled') || [];
  const history = allScheduledMemories?.filter(sm => sm.status === 'sent' || sm.status === 'failed') || [];

  const scheduledDays = useMemo(() => {
    if (!allScheduledMemories) return [];
    return allScheduledMemories.map(sm => parseDateString(sm.date));
  }, [allScheduledMemories]);

  const onSubmit = async (data: ScheduleFormValues) => {
    if (!session?.uid || !database) return;
    setIsSubmitting(true);
    try {
      const scheduledMemoriesRef = ref(database, `users/${session.uid}/scheduledMemories`);
      await set(push(scheduledMemoriesRef), {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Memória Agendada!", description: "Entrega programada com sucesso." });
      form.reset();
      mutateScheduled();
    } catch (error) {
      toast({ variant: "destructive", title: "Falha no Agendamento" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSchedule = async (id: string) => {
    if (!session?.uid || !database) return;
    await remove(ref(database, `users/${session.uid}/scheduledMemories/${id}`));
    toast({ title: "Agendamento Removido" });
    mutateScheduled();
  };

  const handleRetry = async (id: string) => {
    if (!session?.uid) return;
    setRetryingId(id);
    try {
        const result = await retryFailedScheduledMemory({ userId: session.uid, scheduleId: id });
        if(result.success) {
            toast({ title: "Reenvio Iniciado" });
            mutateScheduled();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Falha na Retentativa", description: error.message });
    } finally {
        setRetryingId(null);
    }
  };

  const renderScheduleItem = (sm: ScheduledMemory) => {
    const memory = memories?.find(m => m.id === sm.memoryId);
    const recipient = recipients?.find(r => r.id === sm.recipientId);
    return (
      <div key={sm.id} className="flex items-center justify-between rounded-lg border p-4 gap-4">
        <div className="flex-1">
          <p className="font-semibold">{format(parseDateString(sm.date), "PPP", { locale: ptBR })}</p>
          <p className="text-sm text-muted-foreground">{memory?.title || "Memória"} para {recipient?.name || "Destinatário"}</p>
        </div>
         <div className="flex items-center gap-2">
            {sm.status === 'sent' && <Badge>Enviado</Badge>}
            {sm.status === 'failed' && (
                <Button variant="ghost" size="icon" onClick={() => handleRetry(sm.id)} disabled={retryingId === sm.id}>
                    {retryingId === sm.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4" />}
                </Button>
            )}
            {sm.status === 'scheduled' && (
             <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(sm.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
            )}
        </div>
      </div>
    );
  };

  if (!isClient) return <div className="flex flex-1 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <h1 className="text-3xl font-black tracking-tighter text-glow">Calendário de Recordações</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader><CardTitle>Calendário</CardTitle></CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { setSelectedDate(date); if(date) form.setValue("date", date); }}
                locale={ptBR}
                className="rounded-md border p-0 w-full"
                modifiers={{ 
                  scheduled: scheduledDays,
                  national: holidaysByType.national,
                }}
                modifiersClassNames={{
                  scheduled: 'scheduled',
                  national: 'holiday-national',
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader><CardTitle>Agendar um Envio</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Envio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full sm:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="memoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memória</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma memória" /></SelectTrigger></FormControl>
                        <SelectContent>{memories?.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="recipientId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinatário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um destinatário" /></SelectTrigger></FormControl>
                        <SelectContent>{recipients?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Agendar Envio</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>Envios Agendados</CardTitle></CardHeader>
        <CardContent><div className="space-y-4">{scheduledOnly.length > 0 ? scheduledOnly.map(renderScheduleItem) : <p className="text-center text-muted-foreground py-4">Nenhum envio agendado.</p>}</div></CardContent>
      </Card>
    </main>
  );
}
