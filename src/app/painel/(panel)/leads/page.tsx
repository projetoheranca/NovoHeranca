
"use client";

import React, { useMemo, useState } from "react";
import { useAllLeads } from "@/hooks/use-all-leads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Search, 
    Filter, 
    Download, 
    Mail, 
    Phone, 
    Calendar, 
    Globe, 
    Youtube, 
    Play, 
    Search as GoogleIcon,
    Facebook,
    MessageCircle,
    UserPlus,
    Loader2,
    Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDatabase } from "@/firebase";
import { ref, remove, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sourceIcons: Record<string, React.ElementType> = {
    google: GoogleIcon,
    youtube: Youtube,
    facebook: Facebook,
    instagram: Play,
    tiktok: Play,
    linkedin: Globe,
    direct: UserPlus,
    other: Globe
};

const statusColors: Record<string, string> = {
    new: "bg-blue-500",
    contacted: "bg-amber-500",
    converted: "bg-green-500",
    discarded: "bg-gray-500"
};

const statusLabels: Record<string, string> = {
    new: "Novo",
    contacted: "Contatado",
    converted: "Convertido",
    discarded: "Descartado"
};

export default function LeadsPage() {
    const { leads, isLoading, mutate } = useAllLeads();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSource, setFilterSource] = useState("all");
    const database = useDatabase();
    const { toast } = useToast();

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                lead.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSource = filterSource === 'all' || lead.source === filterSource;
            return matchesSearch && matchesSource;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [leads, searchTerm, filterSource]);

    const stats = useMemo(() => {
        const total = leads.length;
        const newLeads = leads.filter(l => l.status === 'new').length;
        const conversionRate = total > 0 ? ((leads.filter(l => l.status === 'converted').length / total) * 100).toFixed(1) : "0";
        
        return { total, newLeads, conversionRate };
    }, [leads]);

    const handleDeleteLead = async (id: string) => {
        if (!database) return;
        await remove(ref(database, `leads/${id}`));
        toast({ title: "Lead removido" });
        mutate();
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!database) return;
        await update(ref(database, `leads/${id}`), { status: newStatus });
        toast({ title: "Status atualizado" });
        mutate();
    };

    const exportToCsv = () => {
        const headers = ["Nome", "Email", "Telefone", "Origem", "Mídia", "Campanha", "Status", "Data"];
        const rows = filteredLeads.map(l => [
            l.name, l.email, l.phone, l.source, l.medium, l.campaign, l.status, new Date(l.createdAt).toLocaleString()
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `leads_heranca_digital_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Leads</h1>
                    <p className="text-muted-foreground">Potenciais clientes capturados via Webhook e Formulários.</p>
                </div>
                <Button onClick={exportToCsv} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Capturado</CardDescription>
                        <CardTitle className="text-2xl">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Novos (Aguardando)</CardDescription>
                        <CardTitle className="text-2xl text-blue-500">{stats.newLeads}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Taxa de Conversão</CardDescription>
                        <CardTitle className="text-2xl text-green-500">{stats.conversionRate}%</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-1 items-center gap-2 max-w-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por nome ou email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={filterSource} onValueChange={setFilterSource}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar Origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Origens</SelectItem>
                                    <SelectItem value="google">Google Ads</SelectItem>
                                    <SelectItem value="facebook">Meta Ads</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="direct">Direto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lead</TableHead>
                                <TableHead>Origem / Campanha</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => {
                                    const Icon = sourceIcons[lead.source] || Globe;
                                    return (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{lead.name || "Sem Nome"}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {lead.email}
                                                    </span>
                                                    {lead.phone && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone className="h-3 w-3" /> {lead.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1 text-sm font-semibold">
                                                        <Icon className="h-3 w-3 text-primary" />
                                                        <span className="capitalize">{lead.source}</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{lead.campaign || lead.medium || 'Direto'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select 
                                                    defaultValue={lead.status} 
                                                    onValueChange={(val) => handleUpdateStatus(lead.id, val)}
                                                >
                                                    <SelectTrigger className="h-8 w-[130px]">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 w-2 rounded-full ${statusColors[lead.status]}`} />
                                                            <SelectValue />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(statusLabels).map(([val, label]) => (
                                                            <SelectItem key={val} value={val}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeleteConfirmationDialog
                                                    onConfirm={() => handleDeleteLead(lead.id)}
                                                    itemName={lead.email}
                                                    itemType="lead"
                                                    triggerComponent={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        Nenhum lead encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
