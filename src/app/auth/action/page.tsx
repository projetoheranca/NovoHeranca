
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando seu e-mail...');

  useEffect(() => {
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');

    if (!mode || !actionCode) {
      setStatus('error');
      setMessage('Link inválido ou ausente. Por favor, tente novamente.');
      return;
    }

    const handleAction = async () => {
      try {
        switch (mode) {
          case 'verifyEmail':
            await applyActionCode(auth, actionCode);
            setStatus('success');
            setMessage('Seu e-mail foi verificado com sucesso! Agora você pode fazer login.');
            break;
          // Adicionar outros casos como 'resetPassword' aqui no futuro
          default:
            throw new Error('Ação não suportada.');
        }
      } catch (error: any) {
        setStatus('error');
        if (error.code === 'auth/invalid-action-code') {
          setMessage('O link de verificação é inválido ou já foi utilizado. Por favor, solicite um novo.');
        } else {
          setMessage('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
        }
        console.error('Erro ao processar ação:', error);
      }
    };

    handleAction();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md card-glow text-center">
        <CardHeader>
          <Link href="/" className="mx-auto mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary-foreground">
              <Image src="/img/logo1.png" alt="Logo" width={32} height={32} className="icon-glow" style={{ width: 'auto', height: 'auto' }} />
            </div>
          </Link>
          {status === 'loading' && (
            <>
              <CardTitle className="text-2xl font-black text-glow">Processando...</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          {status === 'success' && (
            <>
              <MailCheck className="mx-auto h-12 w-12 text-green-500 icon-glow mb-4" />
              <CardTitle className="text-2xl font-black text-glow">Sucesso!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive icon-glow mb-4" />
              <CardTitle className="text-2xl font-black text-glow">Ocorreu um Erro</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          {(status === 'success' || status === 'error') && (
            <Button asChild className="w-full">
              <Link href="/login">Ir para o Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}


export default function AuthActionPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <AuthActionContent />
        </Suspense>
    )
}
