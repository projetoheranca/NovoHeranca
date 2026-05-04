
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
import { Users } from "lucide-react";

export default function ReferralsPage() {
  const { userProfiles, isLoading } = useAllUserProfiles();

  const referralData = useMemo(() => {
    if (!userProfiles) return [];

    const userMap = new Map(userProfiles.map(u => [u.id, u]));

    return userProfiles
      .filter(user => user.referredBy)
      .map(referredUser => {
        const referrer = userMap.get(referredUser.referredBy!);
        return {
          referred: referredUser,
          referrer: referrer,
        };
      })
      .sort((a, b) => new Date(b.referred.createdAt).getTime() - new Date(a.referred.createdAt).getTime());
  }, [userProfiles]);

  const getStatusVariant = (status: string) => {
    if (status === 'Anual' || status === 'Mensal') return 'default';
    if (status === 'trialing' || status === 'Teste') return 'secondary';
    return 'destructive';
  }
  
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
        <h1 className="text-2xl font-bold">Controle de Indicações (Referrals)</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Indicações</CardTitle>
          <CardDescription>
            Usuários que se cadastraram através de um link de indicação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário Indicado</TableHead>
                <TableHead className="hidden sm:table-cell">Indicado Por</TableHead>
                <TableHead className="hidden md:table-cell">Data da Indicação</TableHead>
                <TableHead className="text-right">Status do Indicado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => renderSkeleton(i))
              ) : referralData.length > 0 ? (
                referralData.map(({ referred, referrer }) => (
                  <TableRow key={referred.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${referred.id}`} alt="Avatar" />
                          <AvatarFallback>{referred.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-medium">{referred.name || referred.email.split('@')[0]}</span>
                            <p className="text-sm text-muted-foreground">{referred.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {referrer ? (
                             <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                     <AvatarImage src={`https://i.pravatar.cc/150?u=${referrer.id}`} alt="Avatar" />
                                    <AvatarFallback>{referrer.email.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{referrer.name || referrer.email.split('@')[0]}</span>
                             </div>
                        ) : (
                            <span className="text-muted-foreground">ID não encontrado</span>
                        )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(referred.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(referred.subscriptionStatus)}>
                        {referred.subscriptionStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2"/>
                    Nenhuma indicação encontrada ainda.
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
