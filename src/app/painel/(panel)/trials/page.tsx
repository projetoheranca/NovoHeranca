
"use client"

import { useMemo, useState, useEffect } from "react";
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
import { Clock, Loader2 } from "lucide-react";

const TRIAL_DURATION_DAYS = 14;

export default function TrialUsersPage() {
  const { userProfiles, isLoading } = useAllUserProfiles();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const trialUsers = useMemo(() => {
    if (!isMounted || !userProfiles) return [];
    
    return userProfiles
      .filter(user => (user.subscriptionStatus === 'Teste' || user.subscriptionStatus === 'trialing') && user.createdAt)
      .map(user => {
        const createdAt = new Date(user.createdAt);
        const expirationDate = new Date(createdAt);
        expirationDate.setDate(createdAt.getDate() + TRIAL_DURATION_DAYS);
        
        const now = new Date();
        const daysLeft = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...user,
          daysLeft: daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [userProfiles, isMounted]);
  
  if (!isMounted) return null;

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell colSpan={3}>
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

  const getDaysLeftText = (days: number) => {
    if (days > 0) return `${days} dia(s) restante(s)`;
    if (days === 0) return `Expira hoje`;
    return `Expirado há ${Math.abs(days)} dia(s)`;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Controle de Trials</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuários em Período de Teste</CardTitle>
          <CardDescription>
            Usuários que estão ou estiveram no período de teste de {TRIAL_DURATION_DAYS} dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">Data de Criação</TableHead>
                <TableHead className="text-right">Status do Trial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => renderSkeleton(i))
              ) : trialUsers.length > 0 ? (
                trialUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar" />
                          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-medium">{user.name || user.email.split('@')[0]}</span>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={user.daysLeft < 7 ? "destructive" : "secondary"}>
                        <Clock className="mr-1.5 h-3 w-3" />
                        {getDaysLeftText(user.daysLeft)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum usuário em período de teste no momento.
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
