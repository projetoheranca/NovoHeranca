"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
    FileCode, 
    Eye, 
    ShieldCheck, 
    CreditCard, 
    Zap, 
    Heart, 
    TrendingUp,
    CheckCircle2,
    PlusCircle,
    Loader2,
    Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getTemplatePreviewHtml, saveCustomTemplate, getCustomTemplates, deleteCustomTemplate } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import type { CustomEmailTemplate } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const systemCategories = [
    {
        name: "Autenticação e Segurança",
        icon: ShieldCheck,
        templates: [
            { key: 'auth.confirmation', name: 'Confirmação de Registro', desc: 'Primeiro e-mail para validar o cadastro.' },
            { key: 'auth.verified', name: 'Email Verificado', desc: 'Boas-vindas após validação do e-mail.' },
            { key: 'auth.passwordReset', name: 'Recuperação de Senha', desc: 'Link seguro para nova senha.' },
        ]
    },
    {
        name: "Faturamento e Planos",
        icon: CreditCard,
        templates: [
            { key: 'payment.trialStarted', name: 'Trial Iniciado', desc: 'Boas-vindas aos 14 dias de bônus.' },
            { key: 'payment.pixActivated', name: 'Assinatura PIX Ativada', desc: 'Confirmação imediata do PIX.' },
            { key: 'payment.succeeded', name: 'Pagamento Confirmado', desc: 'Recibo de renovação mensal/anual.' },
            { key: 'payment.failed', name: 'Falha na Renovação', desc: 'Aviso de problema no cartão.' },
        ]
    },
    {
        name: "Dead Man's Switch",
        icon: Zap,
        templates: [
            { key: 'checkin.reminder', name: 'Lembrete de Check-in', desc: 'Alerta preventivo antes do prazo vencer.' },
            { key: 'checkin.verificationStarted', name: 'Verificação Ativa', desc: 'Alerta crítico de inatividade detectada.' },
        ]
    },
    {
        name: "Entrega de Legado",
        icon: Heart,
        templates: [
            { key: 'delivery.padrão', name: 'Entrega Padrão', desc: 'E-mail principal para o herdeiro.' },
            { key: 'delivery.aniversário', name: 'Presente de Aniversário', desc: 'Template festivo agendado.' },
            { key: 'delivery.casamento', name: 'Mensagem de Casamento', desc: 'Template especial para bodas.' },
        ]
    },
    {
        name: "Marketing e Customizados",
        icon: TrendingUp,
        templates: [
            { key: 'marketing.welcome', name: 'Onboarding Boas-Vindas', desc: 'Nutrição de novos usuários.' },
            { key: 'marketing.tips', name: 'Dicas de Uso', desc: 'Sugestões para o cliente usar o cofre.' },
        ]
    }
];

export default function TemplatesPage() {
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState("");
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    
    const [customTemplates, setCustomTemplates] = useState<CustomEmailTemplate[]>([]);
    const [isLoadingCustom, setIsLoadingCustom] = useState(true);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", content: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadCustomTemplates();
    }, []);

    const loadCustomTemplates = async () => {
        setIsLoadingCustom(true);
        try {
            const data = await getCustomTemplates();
            setCustomTemplates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingCustom(false);
        }
    };

    const handlePreview = async (key: string, name: string) => {
        setIsLoadingPreview(true);
        setPreviewTitle(name);
        try {
            const result = await getTemplatePreviewHtml(key);
            if (result.success && result.html) {
                setPreviewHtml(result.html);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro na prévia", description: error.message });
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleSaveCustom = async () => {
        if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
            toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha todos os campos." });
            return;
        }
        setIsSaving(true);
        try {
            const result = await saveCustomTemplate(newTemplate);
            if (result.success) {
                toast({ title: "Template Salvo!" });
                setIsCreateModalOpen(false);
                setNewTemplate({ name: "", subject: "", content: "" });
                loadCustomTemplates();
            } else {
                throw new Error(result.message);
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Erro ao salvar", description: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCustom = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este template?")) return;
        try {
            await deleteCustomTemplate(id);
            toast({ title: "Template excluído." });
            loadCustomTemplates();
        } catch (err) {
            toast({ variant: "destructive", title: "Erro ao excluir" });
        }
    };

    if (!isMounted) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FileCode className="h-8 w-8 text-primary" />
                        Biblioteca de Templates
                    </h1>
                    <p className="text-muted-foreground">Visualize e gerencie as comunicações da plataforma.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="button-glow">
                    <PlusCircle className="mr-2 h-4 w-4" /> Criar Template
                </Button>
            </div>

            <Tabs defaultValue="system" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="system">Templates do Sistema</TabsTrigger>
                    <TabsTrigger value="custom">Templates Personalizados</TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="grid gap-6 md:grid-cols-2">
                    {systemCategories.map((cat) => (
                        <Card key={cat.name} className="shadow-md">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-2">
                                    <cat.icon className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {cat.templates.map((tpl) => (
                                        <div key={tpl.key} className="flex items-center justify-between group border-b pb-3 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold leading-none">{tpl.name}</p>
                                                <p className="text-xs text-muted-foreground">{tpl.desc}</p>
                                                <code className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded">{tpl.key}</code>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handlePreview(tpl.key, tpl.name)}>
                                                <Eye className="h-4 w-4 mr-1" /> Ver
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="custom">
                    {isLoadingCustom ? (
                        <div className="grid gap-4 md:grid-cols-3">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : customTemplates.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-3">
                            {customTemplates.map((tpl) => (
                                <Card key={tpl.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-base">{tpl.name}</CardTitle>
                                        <CardDescription className="truncate">{tpl.subject}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="mt-auto gap-2 border-t pt-4">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                                            setPreviewTitle(tpl.name);
                                            setPreviewHtml(tpl.content);
                                        }}>
                                            <Eye className="h-4 w-4 mr-1" /> Ver
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteCustom(tpl.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Você ainda não criou templates personalizados.</p>
                            <Button variant="link" onClick={() => setIsCreateModalOpen(true)}>Criar primeiro template agora</Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modal de Prévia */}
            <Dialog open={!!previewHtml} onOpenChange={(open) => !open && setPreviewHtml(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            Prévia: {previewTitle}
                        </DialogTitle>
                        <DialogDescription>
                            Esta é uma visualização exata do e-mail que será enviado para seus clientes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 bg-white overflow-hidden">
                        {previewHtml && (
                            <iframe 
                                srcDoc={previewHtml} 
                                title="Email Preview"
                                className="w-full h-full border-0"
                            />
                        )}
                    </div>
                    <DialogFooter className="p-4 border-t bg-muted/20">
                        <Button onClick={() => setPreviewHtml(null)}>Fechar Visualização</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Criação */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Novo Template Personalizado</DialogTitle>
                        <DialogDescription>
                            Crie um modelo de e-mail para usar em disparos manuais de marketing ou suporte.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tpl-name">Nome do Template (Interno)</Label>
                            <Input 
                                id="tpl-name" 
                                placeholder="Ex: Oferta Plano Anual - Black Friday" 
                                value={newTemplate.name}
                                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tpl-subject">Assunto do Email (O que o cliente vê)</Label>
                            <Input 
                                id="tpl-subject" 
                                placeholder="Ex: 🎁 Uma condição especial para você garantir seu legado" 
                                value={newTemplate.subject}
                                onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Corpo do Email (HTML/Texto Rico)</Label>
                            <RichTextEditor 
                                content={newTemplate.content}
                                onChange={(html) => setNewTemplate({...newTemplate, content: html})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCustom} disabled={isSaving} className="button-glow">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Salvar Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isLoadingPreview && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                    <Card className="p-6 flex items-center gap-4">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                        <span className="font-semibold">Renderizando prévia...</span>
                    </Card>
                </div>
            )}
        </div>
    );
}