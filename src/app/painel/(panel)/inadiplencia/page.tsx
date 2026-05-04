
"use client"

import { useMemo } from "react";
import { useAllUserProfiles } from "@/hooks/use-all-user-profiles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const GRACE_PERIOD_DAYS = 30;

export default function DelinquencyPage() {
  const { userProfiles, isLoading } = useAllUserProfiles();

  const delinquentUsers = useMemo(() => {
    if (!userProfiles) return [];
    
    return userProfiles
      .filter(user => user.lastPaymentStatus === 'Inadimplente')
      .map(user => {
        const planDurations: { [key: string]: number } = { 'Mensal': 30, 'Anual': 365, 'Teste': 9999 };
        const duration = planDurations[user.subscriptionStatus] || 30;
        const startDate = new Date(user.subscriptionStartDate || user.createdAt);
        const expirationDate = new Date(startDate);
        expirationDate.setDate(startDate.getDate() + duration);

        const gracePeriodEndDate = new Date(expirationDate);
        gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + GRACE_PERIOD_DAYS);
        
        const now = new Date();
        const daysLeft = Math.ceil((gracePeriodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...user,
          daysLeft: Math.max(0, daysLeft), // Ensure days left is not negative
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft); // Sort by soonest expiration
  }, [userProfiles]);
  
  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell colSpan={4}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Controle de Inadimplência</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuários Inadimplentes</CardTitle>
          <CardDescription>
            Usuários com pagamento pendente. A conta será bloqueada após o fim do período de carência de {GRACE_PERIOD_DAYS} dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">Plano</TableHead>
                <TableHead className="text-right">Contagem Regressiva</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => renderSkeleton(i))
              ) : delinquentUsers.length > 0 ? (
                delinquentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar" />
                          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-medium">{user.name || user.email.split('@')[0]}</span>
                            <p className="text-sm text-muted-foreground sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.subscriptionStatus}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={user.daysLeft < 10 ? "destructive" : "secondary"}>
                        {user.daysLeft} dias restantes
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum usuário inadimplente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
