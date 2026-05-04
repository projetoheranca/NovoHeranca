"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAllUserProfiles } from "@/hooks/use-all-user-profiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
    Mail, 
    Send, 
    Loader2, 
    Users, 
    Target, 
    User,
    Search,
    AlertCircle,
    Clock,
    FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendBulkCustomEmail, getCustomTemplates } from "@/lib/actions";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CustomEmailTemplate } from "@/lib/types";

export default function EmailMarketingPage() {
    const { userProfiles, isLoading } = useAllUserProfiles();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    const [emailSubject, setEmailSubject] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [emailSegment, setEmailSegment] = useState("all");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
    const [isSending, setIsSending] = useState(false);
    
    const [customTemplates, setCustomTemplates] = useState<CustomEmailTemplate[]>([]);

    useEffect(() => {
        setIsMounted(true);
        getCustomTemplates().then(setCustomTemplates);
    }, []);

    const counts = useMemo(() => {
        if (!userProfiles) return { all: 0, active: 0, leads: 0, trials: 0 };
        return {
            all: userProfiles.length,
            active: userProfiles.filter(u => u.lastPaymentStatus === 'Pago').length,
            leads: userProfiles.filter(u => u.lastPaymentStatus === 'Pendente').length,
            trials: userProfiles.filter(u => u.subscriptionStatus === 'Trial' || u.subscriptionStatus === 'trialing' || u.subscriptionStatus === 'Teste').length,
        };
    }, [userProfiles]);

    const targetRecipients = useMemo(() => {
        if (!userProfiles) return [];
        if (emailSegment === 'individual') {
            const user = userProfiles.find(u => u.id === selectedUserId);
            return user ? [user] : [];
        }
        return userProfiles.filter(u => {
            if (emailSegment === 'active') return u.lastPaymentStatus === 'Pago';
            if (emailSegment === 'leads') return u.lastPaymentStatus === 'Pendente';
            if (emailSegment === 'trials') return u.subscriptionStatus === 'Trial' || u.subscriptionStatus === 'trialing' || u.subscriptionStatus === 'Teste';
            return true;
        });
    }, [userProfiles, emailSegment, selectedUserId]);

    const handleApplyTemplate = (id: string) => {
        setSelectedTemplateId(id);
        if (id === 'none') return;
        const tpl = customTemplates.find(t => t.id === id);
        if (tpl) {
            setEmailSubject(tpl.subject);
            setEmailContent(tpl.content);
            toast({ title: "Template Aplicado", description: tpl.name });
        }
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailContent) {
            toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha o assunto e a mensagem." });
            return;
        }
        if (targetRecipients.length === 0) {
            toast({ variant: "destructive", title: "Sem destinatários", description: "Nenhum usuário encontrado para este segmento." });
            return;
        }

        setIsSending(true);
        try {
            const result = await sendBulkCustomEmail({
                recipients: targetRecipients.map(u => ({ email: u.email, name: u.name || 'Cliente' })),
                subject: emailSubject,
                content: emailContent,
                templateKey: 'marketing.custom'
            });
            if (result.success) {
                toast({ title: "Sucesso!", description: result.message });
                if (emailSegment === 'individual') {
                    setEmailSubject("");
                    setEmailContent("");
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro no disparo", description: error.message });
        } finally {
            setIsSending(false);
        }
    };

    if (!isMounted || isLoading) {
        return <div className="flex h-full items-center justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Mail className="h-8 w-8 text-primary" />
                    Email Marketing e Comunicação
                </h1>
                <p className="text-muted-foreground">Envie comunicados em massa ou mensagens personalizadas individuais.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-xl border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Compor Mensagem</CardTitle>
                                <CardDescription>Use o editor abaixo ou carregue um template salvo.</CardDescription>
                            </div>
                            <Select value={selectedTemplateId} onValueChange={handleApplyTemplate}>
                                <SelectTrigger className="w-[200px]">
                                    <FileText className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Carregar Template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum (Em branco)</SelectItem>
                                    {customTemplates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Assunto do Email</Label>
                                <Input 
                                    id="subject" 
                                    placeholder="Ex: Novidades sobre sua conta..." 
                                    value={emailSubject} 
                                    onChange={(e) => setEmailSubject(e.target.value)} 
                                    disabled={isSending}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Público Alvo</Label>
                                <Select value={emailSegment} onValueChange={setEmailSegment} disabled={isSending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione quem receberá" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Usuários ({counts.all})</SelectItem>
                                        <SelectItem value="active">Clientes Pagantes ({counts.active})</SelectItem>
                                        <SelectItem value="leads">Leads / Pendentes ({counts.leads})</SelectItem>
                                        <SelectItem value="trials">Usuários em Trial ({counts.trials})</SelectItem>
                                        <SelectItem value="individual" className="font-bold text-primary">👤 Usuário Específico (Individual)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {emailSegment === 'individual' && (
                                <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in-up">
                                    <Label className="flex items-center gap-2"><Search className="h-3 w-3"/> Localizar Usuário</Label>
                                    <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={isSending}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o destinatário..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="max-h-72 overflow-y-auto">
                                                {userProfiles?.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>
                                                        {u.name || u.email.split('@')[0]} ({u.email})
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label>Mensagem</Label>
                                <div className="min-h-[300px]">
                                    <RichTextEditor 
                                        content={emailContent} 
                                        onChange={setEmailContent} 
                                        editable={!isSending} 
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between border-t p-6 bg-muted/20">
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Destinatários selecionados: <strong>{targetRecipients.length}</strong></span>
                            </div>
                            <Button size="lg" onClick={handleSendEmail} disabled={isSending || targetRecipients.length === 0} className="button-glow">
                                {isSending ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                                ) : (
                                    <><Send className="mr-2 h-4 w-4" /> Disparar Agora</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resumo do Público</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/> Total</span>
                                <Badge variant="secondary">{counts.all}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4 text-green-500"/> Pagantes</span>
                                <Badge variant="outline" className="text-green-500 border-green-500/20">{counts.active}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500"/> Trials</span>
                                <Badge variant="outline" className="text-amber-500 border-amber-500/20">{counts.trials}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4 text-slate-400"/> Leads</span>
                                <Badge variant="outline" className="text-slate-400 border-slate-400/20">{counts.leads}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <User className="h-4 w-4" /> Dica de Admin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Use templates personalizados para ganhar tempo em respostas recorrentes de suporte ou promoções sazonais. Você pode gerenciar esses modelos na aba "Templates de Emails".
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}