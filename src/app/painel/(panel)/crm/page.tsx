"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAllUserProfiles } from "@/hooks/use-all-user-profiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    TrendingUp, 
    Award,
    Loader2,
    ChevronRight,
    Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CRMPage() {
    const { userProfiles, isLoading } = useAllUserProfiles();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const stats = useMemo(() => {
        if (!isMounted || !userProfiles) return null;

        const total = userProfiles.length;
        const paid = userProfiles.filter(u => u.lastPaymentStatus === 'Pago').length;
        const trialing = userProfiles.filter(u => u.subscriptionStatus === 'Trial' || u.subscriptionStatus === 'trialing' || u.subscriptionStatus === 'Teste').length;
        const leads = userProfiles.filter(u => u.lastPaymentStatus === 'Pendente').length;
        const churnRequests = userProfiles.filter(u => u.cancellationRequested).length;

        const conversionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : "0";
        
        const monthlyValue = 24.90;
        const annualValue = 209.30 / 12;
        const estimatedMRR = userProfiles.reduce((acc, u) => {
            if (u.lastPaymentStatus !== 'Pago') return acc;
            return acc + (u.subscriptionStatus === 'Anual' ? annualValue : monthlyValue);
        }, 0);

        const referralStats: Record<string, { total: number, paid: number }> = {};
        userProfiles.forEach(u => {
            if (u.referredBy) {
                if (!referralStats[u.referredBy]) referralStats[u.referredBy] = { total: 0, paid: 0 };
                referralStats[u.referredBy].total++;
                if (u.lastPaymentStatus === 'Pago') {
                    referralStats[u.referredBy].paid++;
                }
            }
        });

        const topAffiliates = Object.entries(referralStats)
            .map(([id, s]) => {
                const user = userProfiles.find(up => up.id === id);
                return { 
                    name: user?.name || user?.email || 'Desconhecido', 
                    total: s.total,
                    paid: s.paid,
                    rate: s.total > 0 ? (s.paid / s.total) * 100 : 0
                };
            })
            .sort((a, b) => b.paid - a.paid)
            .slice(0, 10);

        return {
            total, paid, trialing, leads, churnRequests,
            conversionRate, estimatedMRR, topAffiliates
        };
    }, [userProfiles, isMounted]);

    if (!isMounted || isLoading || !stats) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Inteligente</h1>
                    <p className="text-muted-foreground">Gestão de crescimento e conversão.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1 text-sm border-primary/50 text-primary">
                    Atualizado em tempo real
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 lg:max-w-md">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="funil">Funil</TabsTrigger>
                    <TabsTrigger value="afiliados"><Award className="h-4 w-4 mr-2" /> Afiliados</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Conversão Paga</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                                <Progress value={parseFloat(stats.conversionRate)} className="mt-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">MRR Estimado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.estimatedMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                <p className="text-xs text-green-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Receita Recorrente</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Base Total</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <p className="text-xs text-muted-foreground mt-1">Usuários</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-destructive">Churn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">{stats.churnRequests}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pedidos de cancelamento</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="funil" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-l-4 border-l-slate-500 shadow-lg">
                            <CardHeader>
                                <Badge variant="outline">LEADS</Badge>
                                <CardTitle className="text-lg">Capturados ({stats.leads})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="w-full text-xs" asChild>
                                    <Link href="/painel/leads">Ver Lista de Leads <ChevronRight className="ml-1 h-3 w-3"/></Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-amber-500 shadow-lg">
                            <CardHeader>
                                <Badge variant="outline" className="text-amber-500 border-amber-500/50">TRIAL</Badge>
                                <CardTitle className="text-lg">Bônus Ativo ({stats.trialing})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="w-full text-xs" asChild>
                                    <Link href="/painel/trials">Monitorar Trials <ChevronRight className="ml-1 h-3 w-3"/></Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500 shadow-lg">
                            <CardHeader>
                                <Badge variant="outline" className="text-green-500 border-green-500/50">PAGOS</Badge>
                                <CardTitle className="text-lg">Clientes ({stats.paid})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs font-bold text-green-500 text-center">Fundo de Funil (Lucro)</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="afiliados" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500"/> Ranking de Vendas Confirmadas</CardTitle>
                            <CardDescription>O ranking é baseado em quem trouxe mais usuários que se tornaram assinantes pagantes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {stats.topAffiliates.length > 0 ? (
                                stats.topAffiliates.map((aff, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold">{index + 1}. {aff.name}</span>
                                            <span className="text-green-500 font-bold">+{aff.paid} Assinaturas Pagas</span>
                                        </div>
                                        <Progress value={aff.rate} className="h-1.5" />
                                        <p className="text-[10px] text-muted-foreground">{aff.paid} pagos de {aff.total} indicações ({aff.rate.toFixed(1)}% de conversão)</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Nenhuma indicação paga registrada ainda.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}