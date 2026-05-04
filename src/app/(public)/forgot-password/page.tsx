
"use client";

import { useState } from "react";
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
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetLink } from "@/lib/auth-actions"; // Alterado para usar a Server Action
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "E-mail obrigatório",
        description: "Por favor, preencha o campo de e-mail.",
      });
      return;
    }
    setIsLoading(true);

    try {
      // Chama a nova Server Action
      const result = await sendPasswordResetLink(email);

      if (result.success) {
        setIsSent(true);
        toast({
          title: "E-mail enviado!",
          description: "Verifique sua caixa de entrada para o link de redefinição de senha.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Falha no envio",
        description: error.message || "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
         <Card className="w-full max-w-sm card-glow text-center">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 icon-glow mb-4">
                    <MailCheck className="h-8 w-8"/>
                </div>
                <CardTitle className="text-2xl font-black text-glow">Verifique seu E-mail</CardTitle>
                <CardDescription>
                Enviamos um link de redefinição de senha para <strong>{email}</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam.
                </p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/login">Voltar para o Login</Link>
                </Button>
            </CardFooter>
         </Card>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm card-glow">
        <form onSubmit={handlePasswordReset}>
          <CardHeader className="text-center">
             <Link href="/" className="mx-auto mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary-foreground">
                  <Image src="/img/logo1.png" alt="Logo" width={32} height={32} className="icon-glow" style={{ width: 'auto', height: 'auto' }} />
                </div>
              </Link>
            <CardTitle className="text-2xl font-black text-glow">Esqueceu sua Senha?</CardTitle>
            <CardDescription>
              Sem problemas. Digite seu e-mail e enviaremos um link para você criar uma nova.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Enviar Link de Recuperação"}
            </Button>
            <Button variant="link" asChild>
                <Link href="/login">Voltar para o Login</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
