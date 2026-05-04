
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { signupUser } from "@/lib/auth-actions";
import Image from "next/image";
import { formatCPF, validateCPF } from "@/lib/utils";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth as clientAuth } from "@/firebase/config";
import { pushToDataLayer } from "@/lib/analytics";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const plan = searchParams.get('plan') || 'mensal';
  const method = searchParams.get('method');
  const referralId = searchParams.get('ref');

  useEffect(() => {
    pushToDataLayer('begin_signup', { plan_selected: plan, payment_method: method });
  }, [plan, method]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !cpf) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha todos os campos para continuar." });
      return;
    }
    if (!validateCPF(cpf)) {
      toast({ variant: "destructive", title: "CPF Inválido", description: "Por favor, insira um CPF válido." });
      return;
    }
    if (!termsAccepted) {
      toast({ variant: "destructive", title: "Aceite os Termos", description: "É necessário aceitar os termos." });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Cria a conta no servidor (Firebase Admin)
      const result = await signupUser({ 
        name, 
        email, 
        phone, 
        password,
        cpf: cpf.replace(/\D/g, ''),
        referredBy: referralId || undefined,
        method: method || undefined,
      });

      if (result.success) {
        // 2. Realiza o login automático no cliente para garantir a sessão no checkout
        await signInWithEmailAndPassword(clientAuth, email, password);
        
        pushToDataLayer('signup_success', { plan_selected: plan, payment_method: method });
        toast({ title: "Conta criada!", description: "Vamos configurar seu pagamento." });
        
        // 3. Redirecionamento obrigatório
        if (method === 'pix') {
            router.push(`/pix-checkout/${plan}`);
        } else {
            router.push(`/checkout/${plan}`);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({ variant: "destructive", title: "Falha no cadastro", description: error.message || "Ocorreu um erro ao criar sua conta." });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm card-glow">
        <form onSubmit={handleSignup}>
          <CardHeader className="text-center">
             <Link href="/" className="mx-auto mb-4">
                <Image src="/img/logo1.png" alt="Logo" width={32} height={32} className="icon-glow" />
              </Link>
            <CardTitle className="text-2xl font-black text-glow">Crie sua Conta</CardTitle>
            <CardDescription>
              {method === 'pix' 
                ? 'Pague com PIX para liberar acesso imediato.'
                : 'Inicie seu teste de 14 dias com Cartão.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Seu nome completo" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="000.000.000-00" required value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} disabled={isLoading} maxLength={14} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            </div>
            <div className="items-top flex space-x-2">
                <Checkbox id="aceito-termos" required checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c as boolean)} />
                <Label htmlFor="aceito-termos" className="text-sm cursor-pointer">Aceito os Termos e Privacidade</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full button-glow rounded-full font-bold" disabled={isLoading || !termsAccepted}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Continuar para Pagamento"}
            </Button>
            <div className="text-center text-sm">
              Já tem conta? <Link href="/login" className="underline font-bold">Faça login</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
