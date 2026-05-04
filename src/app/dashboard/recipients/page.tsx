
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/context/session-provider";
import { useDatabase, useList, useMemoFirebase } from "@/firebase";
import { ref, remove } from "firebase/database";
import type { Recipient } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";

export default function RecipientsPage() {
  const { session } = useSession();
  const database = useDatabase();
  const router = useRouter();
  const { toast } = useToast();

  const recipientsQuery = useMemoFirebase(() => {
    if (!session?.uid || !database) return null;
    return ref(database, `users/${session.uid}/recipients`);
  }, [session, database]);

  const { data: recipients, isLoading } = useList<Recipient>(recipientsQuery);
  
  const handleDeleteRecipient = async (recipientId: string) => {
    if (!session?.uid || !database) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o destinatário. Tente novamente.",
      });
      return;
    }
    const recipientRef = ref(database, `users/${session.uid}/recipients/${recipientId}`);
    await remove(recipientRef);
  };
  
  const handleRowClick = (recipientId: string) => {
    router.push(`/dashboard/recipients/${recipientId}/edit`);
  };

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
    </TableRow>
  );

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Seus Herdeiros Digitais</h1>
          <Button asChild>
            <Link href="/dashboard/recipients/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Novo Destinatário
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Destinatários</CardTitle>
            <CardDescription>
              Gerencie os herdeiros da sua herança digital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Relacionamento</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => renderSkeleton(i))}
                  </>
                ) : recipients && recipients.length > 0 ? (
                  recipients.map((recipient) => (
                    <TableRow 
                      key={recipient.id} 
                      className="cursor-pointer transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg"
                      onClick={() => handleRowClick(recipient.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={`https://picsum.photos/seed/${recipient.id}/100/100`} alt="Avatar" />
                            <AvatarFallback>
                              {recipient.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            <p className="truncate max-w-[150px] sm:max-w-none">{recipient.name}</p>
                            <div className="md:hidden mt-1 text-xs text-muted-foreground space-y-0.5">
                                <p className="truncate max-w-[150px] sm:max-w-none">{recipient.email}</p>
                                {recipient.phone && <p>{recipient.phone}</p>}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{recipient.relationship}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {recipient.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {recipient.phone || "N/A"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="outline"
                              className="border-none bg-transparent hover:bg-transparent"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Alternar menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => router.push(`/dashboard/recipients/${recipient.id}/edit`)}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DeleteConfirmationDialog
                                onConfirm={() => handleDeleteRecipient(recipient.id)}
                                itemName={recipient.name}
                                itemType="destinatário"
                              >
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </DeleteConfirmationDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum destinatário encontrado. Adicione um para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
  );
}
