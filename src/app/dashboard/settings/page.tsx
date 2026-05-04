
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useDatabase } from "@/firebase";
import { useSession } from "@/context/session-provider";
import { ref, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useList, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import type { CheckIn } from "@/lib/types";
import { exportUserData, deleteUserAccount } from "@/lib/actions";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { useRouter } from "next/navigation";
import { formatPhoneNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";


export default function SettingsPage() {
  const { session, logout } = useSession();
  const database = useDatabase();
  const { userProfile, isLoading: isProfileLoading, mutate } = useUserProfile();
  const { toast } = useToast();
  const router = useRouter();

  const [checkInFrequency, setCheckInFrequency] = useState<string | undefined>(undefined);
  const [secondaryEmail, setSecondaryEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [sessionTimeout, setSessionTimeout] = useState<string | undefined>(undefined);
  const [deliveryGracePeriod, setDeliveryGracePeriod] = useState<string | undefined>(undefined);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    // This effect runs only once when the profile is loaded.
    if (userProfile && !isSaving) {
      setSecondaryEmail(userProfile.secondaryEmail || "");
      setPhone(userProfile.phone || "");
    }
    // We only want this to run when the profile loads, not when other state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileLoading]);


  const checkInsQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/checkIns`);
  }, [session, database]);

  const { data: checkIns, isLoading: isCheckInsLoading } = useList<CheckIn>(checkInsQuery);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSaveChanges = async () => {
    if (!session?.uid || !database || !userProfile) {
       toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário ou banco de dados não encontrado.",
      });
      return;
    }
    setIsSaving(true);
    
    const userProfileRef = ref(database, `users/${session.uid}/document`);
    
    const updatedProfile: { [key: string]: any } = {
        // Sempre inclua o e-mail secundário e o telefone no objeto de atualização
        secondaryEmail: secondaryEmail,
        phone: phone,
    };
    
    if (checkInFrequency !== undefined) {
      updatedProfile.checkInFrequency = parseInt(checkInFrequency, 10);
    }
    if (sessionTimeout !== undefined) {
      updatedProfile.sessionTimeout = parseInt(sessionTimeout, 10);
    }
     if (deliveryGracePeriod !== undefined) {
      updatedProfile.deliveryGracePeriod = parseInt(deliveryGracePeriod, 10);
    }
    
    const hasChanges = 
        secondaryEmail !== (userProfile.secondaryEmail || "") ||
        phone !== (userProfile.phone || "") ||
        checkInFrequency !== undefined ||
        sessionTimeout !== undefined ||
        deliveryGracePeriod !== undefined;

    if (!hasChanges) {
       toast({ title: "Nenhuma alteração", description: "Nenhuma nova configuração foi selecionada."});
       setIsSaving(false);
       return;
    }


    try {
        await update(userProfileRef, updatedProfile);
        mutate(); 
        toast({
          title: "Configurações Salvas",
          description: "Suas alterações foram salvas com sucesso.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar as configurações.",
        });
    } finally {
        setIsSaving(false);
        // Reset only the dropdown selections, not the email/phone
        setCheckInFrequency(undefined);
        setSessionTimeout(undefined);
        setDeliveryGracePeriod(undefined);
    }
  };
  
  const handleExportData = async () => {
    if (!session?.uid) {
        toast({ variant: "destructive", title: "Erro", description: "Sessão de usuário não encontrada." });
        return;
    }

    setIsExporting(true);
    setExportProgress(0);

    const progressInterval = setInterval(() => {
        setExportProgress(prev => {
            if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
            }
            return prev + 10;
        });
    }, 500);

    try {
        const result = await exportUserData({ userId: session.uid });
        clearInterval(progressInterval);
        setExportProgress(100);
        
        if (result.success && result.zipBase64) {
            const byteCharacters = atob(result.zipBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/zip' });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `heranca_digital_${session.uid}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            toast({ title: "Exportação Concluída!", description: "Seu arquivo ZIP foi baixado." });

            setTimeout(() => {
                setIsExporting(false);
            }, 1500);
        } else {
             throw new Error(result.message || "A exportação falhou por um motivo desconhecido.");
        }
    } catch (error: any) {
        clearInterval(progressInterval);
        console.error("Erro na exportação:", error);
        toast({ variant: "destructive", title: "Falha na Exportação", description: error.message });
        setIsExporting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!session?.uid) {
      toast({ variant: "destructive", title: "Erro", description: "Sessão de usuário não encontrada." });
      return;
    }
    
    try {
      await deleteUserAccount({ userId: session.uid });
      toast({ title: "Conta Excluída", description: "Sua conta foi removida permanentemente." });
      logout(); // Faz logout do usuário
      router.push('/'); // Redireciona para a página inicial
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha ao Excluir Conta", description: error.message });
    }
  };
  
  const lastCheckInDate = userProfile?.lastCheckIn 
    ? new Date(userProfile.lastCheckIn).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : "Nenhum check-in registrado";

  if (isProfileLoading || !userProfile) {
     return (
       <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
    );
  }

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Configurações</h1>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta e Segurança</CardTitle>
              <CardDescription>
                Gerencie as configurações de segurança, inatividade e exportação da sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="session-timeout">Tempo de Inatividade da Sessão</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Configuração atual: <span className="font-semibold text-foreground">{userProfile?.sessionTimeout || "15"} minutos</span>.
                </p>
                <Select
                  onValueChange={setSessionTimeout}
                  disabled={isSaving}
                  value={sessionTimeout}
                >
                  <SelectTrigger id="session-timeout" className="w-full md:w-1/2">
                    <SelectValue placeholder="Selecione um novo tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="0">Nunca deslogar</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-[0.8rem] text-muted-foreground">
                  Tempo de inatividade na plataforma até que sua sessão seja encerrada automaticamente.
                </p>
              </div>
              
              <div className="space-y-2">
                 <Label htmlFor="last-checkin-date">Último Check-in Registrado</Label>
                 <Input
                    id="last-checkin-date"
                    type="text"
                    className="w-full md:w-1/2"
                    value={lastCheckInDate}
                    disabled
                 />
                 <p className="text-sm text-muted-foreground">
                    Esta é a data do seu último check-in. O sistema a usa como base para o monitoramento de inatividade.
                 </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkin-frequency">Frequência de Check-in</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Configuração atual: <span className="font-semibold text-foreground">A cada {userProfile?.checkInFrequency || "30"} dias</span>.
                </p>
                <Select
                  onValueChange={setCheckInFrequency}
                  disabled={isSaving}
                  value={checkInFrequency}
                >
                  <SelectTrigger id="checkin-frequency" className="w-full md:w-1/2">
                    <SelectValue placeholder="Selecione uma nova frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">A cada 7 dias</SelectItem>
                    <SelectItem value="15">A cada 15 dias</SelectItem>
                    <SelectItem value="30">A cada 30 dias</SelectItem>
                    <SelectItem value="60">A cada 60 dias</SelectItem>
                    <SelectItem value="90">A cada 90 dias</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-[0.8rem] text-muted-foreground">
                  Com que frequência você precisa fazer check-in para manter sua conta ativa.
                </p>
              </div>

               <div className="space-y-2">
                <Label htmlFor="delivery-grace-period">Prazo para Entrega Após Inatividade</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Configuração atual: <span className="font-semibold text-foreground">{userProfile?.deliveryGracePeriod || "7"} dias após a falha no check-in</span>.
                </p>
                <Select
                  onValueChange={setDeliveryGracePeriod}
                  disabled={isSaving}
                  value={deliveryGracePeriod}
                >
                  <SelectTrigger id="delivery-grace-period" className="w-full md:w-1/2">
                    <SelectValue placeholder="Selecione um novo prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-[0.8rem] text-muted-foreground">
                  Período de tentativas de contato e espera após uma falha de check-in, antes que a entrega automática seja iniciada.
                </p>
              </div>


              <div className="space-y-2">
                <Label htmlFor="secondary-email">Email Secundário (Recuperação)</Label>
                <Input
                  id="secondary-email"
                  type="email"
                  placeholder="recuperacao@exemplo.com"
                  className="w-full md:w-1/2"
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  disabled={isSaving}
                />
                <p className="text-sm text-muted-foreground">
                  Usado para recuperação de conta e como parte do processo de verificação de inatividade.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+55 (XX) XXXXX-XXXX"
                  className="w-full md:w-1/2"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isSaving}
                />
                <p className="text-sm text-muted-foreground">
                  Seu número de telefone para contato e como parte do processo de verificação de inatividade.
                </p>
              </div>

            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Check-ins</CardTitle>
              <CardDescription>
                Seus últimos registros de atividade na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isCheckInsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : checkIns && checkIns.length > 0 ? (
                    checkIns.slice().reverse().slice(0, 5).map((checkIn) => ( // Show latest 5
                      <TableRow key={checkIn.id}>
                        <TableCell>{new Date(checkIn.timestamp).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{new Date(checkIn.timestamp).toLocaleTimeString('pt-BR')}</TableCell>
                        <TableCell>
                          <span className="capitalize">{checkIn.method}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Nenhum check-in encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

           <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>
                Essas ações são irreversíveis. Tenha certeza.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Meus Dados
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">Baixe todas as suas memórias e dados da conta.</p>
               </div>
                <div>
                   <DeleteConfirmationDialog
                        onConfirm={handleDeleteAccount}
                        itemName={userProfile?.name || userProfile?.email || "sua conta"}
                        itemType="conta"
                    >
                       <Button variant="destructive">
                         <Trash2 className="mr-2 h-4 w-4" />
                         Excluir Conta
                       </Button>
                    </DeleteConfirmationDialog>
                  <p className="text-sm text-muted-foreground mt-2">Exclua permanentemente sua conta e todos os dados associados.</p>
                </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={isExporting}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Exportando Seus Dados</DialogTitle>
                    <DialogDescription>
                        Estamos compactando suas memórias e informações. Isso pode levar alguns minutos. Por favor, não feche esta janela.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <div className="w-full">
                        <Progress value={exportProgress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground mt-2">{Math.round(exportProgress)}% concluído</p>
                    </div>
                    {exportProgress < 100 ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                        <p className="text-sm text-green-500">Concluído! Seu download começará em breve.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
      </main>
  );
}
