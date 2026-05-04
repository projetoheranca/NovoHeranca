
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/session-provider";
import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { session, isLoading: isSessLoading } = useSession();

  // Redirecionamento automático após login bem-sucedido
  useEffect(() => {
    if (!isSessLoading && session) {
      if (session.role === 'admin') {
        router.replace("/painel");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [session, isSessLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Sucesso!", description: "Acessando seu cofre digital..." });
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "E-mail ou senha incorretos.";
      if (error.code === 'auth/invalid-credential') {
          message = "Credenciais inválidas. Verifique seus dados.";
      }
      toast({ variant: "destructive", title: "Falha no Login", description: message });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm card-glow">
        <form onSubmit={handleAuth}>
          <CardHeader className="text-center">
            <Link href="/" className="mx-auto mb-4">
              <Image src="/img/logo1.png" alt="Logo" width={48} height={48} className="icon-glow" />
            </Link>
            <CardTitle className="text-2xl font-black text-glow">Acesse sua Conta</CardTitle>
            <CardDescription>Entre no seu cofre digital.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link href="/forgot-password" size="sm" className="ml-auto text-xs underline">Esqueceu?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full button-glow rounded-full font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Entrar Agora"}
            </Button>
            <div className="flex flex-col items-center gap-3">
              <div className="text-center text-sm">
                Não tem conta? <Link href="/signup" className="underline hover:text-primary font-bold">Cadastre-se</Link>
              </div>
              <Link 
                href="/painel/login" 
                className="opacity-0 hover:opacity-0 cursor-default text-[10px] py-1"
                aria-hidden="true"
              >
                Acesso Administrativo
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
