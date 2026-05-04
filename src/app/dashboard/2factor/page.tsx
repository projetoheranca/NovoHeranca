
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from '@/context/session-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Smartphone, ShieldCheck, ShieldOff, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  getAuth,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type MultiFactorUser,
} from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type TwoFactorStage = 
  | 'loading' 
  | 'notEnrolled'
  | 'captchaPending'
  | 'sendingCode'
  | 'codeSent'
  | 'verifyingCode'
  | 'enrolled'
  | 'disabling';

export default function TwoFactorPage() {
  const { session, isLoading: isSessionLoading } = useSession();
  const { toast } = useToast();
  const auth = getAuth();

  const [stage, setStage] = useState<TwoFactorStage>('loading');
  const [phoneNumber, setPhoneNumber] = useState('+55');
  const [verificationCode, setVerificationCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const verificationIdRef = useRef<string | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (auth.currentUser) {
      const mfaUser = multiFactor(auth.currentUser);
      if (mfaUser.enrolledFactors.length > 0) {
        setStage('enrolled');
      } else {
        setStage('notEnrolled');
      }
    }
  }, [auth.currentUser]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const startCooldown = () => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldown(60);
    cooldownTimerRef.current = setInterval(() => {
        setCooldown(prev => {
            if (prev <= 1) {
                if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };


  const cleanupRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
    }
    if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
    }
  };

  const handleInitiatePhoneVerification = async () => {
    if (!auth.currentUser || !phoneNumber) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Número de telefone inválido.' });
      return;
    }
    
    setStage('captchaPending');
    cleanupRecaptcha();

    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
          'size': 'normal', 
          'callback': (response: any) => {
            handleSendVerificationCode();
          },
          'expired-callback': () => {
              toast({ variant: 'destructive', title: 'reCAPTCHA Expirou', description: 'Por favor, tente novamente.'});
              cleanupRecaptcha();
              setStage('notEnrolled');
          }
      });
      
      recaptchaVerifierRef.current = verifier;
      await verifier.render();

    } catch (error: any) {
        console.error("Erro ao renderizar reCAPTCHA:", error);
        toast({ variant: 'destructive', title: 'Falha no reCAPTCHA', description: 'Não foi possível carregar a verificação. Recarregue a página.'});
        cleanupRecaptcha();
        setStage('notEnrolled');
    }
  };

  const handleSendVerificationCode = async () => {
    if (!auth.currentUser || !recaptchaVerifierRef.current) return;
    
    setStage('sendingCode');
    
    try {
      const multiFactorSession = await multiFactor(auth.currentUser).getSession();
      const phoneAuthProvider = new PhoneAuthProvider(auth);

      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber: phoneNumber,
          session: multiFactorSession,
        },
        recaptchaVerifierRef.current
      );

      verificationIdRef.current = verificationId;
      setStage('codeSent');
      toast({ title: "Código enviado!", description: `Verifique o SMS enviado para ${phoneNumber}.` });
      startCooldown();

    } catch (error: any) {
      console.error("Erro ao enviar código SMS:", error);
      
      let errorMessage = "Ocorreu uma falha desconhecida ao enviar o código SMS.";
      if (error.code === 'auth/requires-recent-login') {
          errorMessage = "Sua sessão expirou. Por favor, faça login novamente para habilitar o 2FA.";
      } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage = "O número de telefone fornecido não é válido.";
      } else if (error.code === 'auth/too-many-requests') {
          errorMessage = "Muitas tentativas foram feitas. Tente novamente mais tarde.";
      } else if (error.message.includes("auth/missing-client-identifier")) {
          errorMessage = "A configuração do Firebase no seu projeto está incompleta. Verifique se a 'Identity Toolkit API' está habilitada no Google Cloud Console e se a Autenticação por Telefone está ativada no Firebase.";
      } else {
        errorMessage = `Erro do Firebase: ${error.message} (Código: ${error.code})`;
      }
      
      toast({ variant: 'destructive', title: 'Falha no Envio', description: errorMessage, duration: 15000 });
      cleanupRecaptcha();
      setStage('notEnrolled');
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationIdRef.current || !verificationCode) {
      toast({ variant: 'destructive', title: 'Código de verificação é obrigatório.' });
      return;
    }

    setStage('verifyingCode');

    try {
      const credential = PhoneAuthProvider.credential(verificationIdRef.current, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

      if (auth.currentUser) {
        await multiFactor(auth.currentUser).enroll(multiFactorAssertion, `Celular ${phoneNumber.slice(-4)}`);
        setStage('enrolled');
        toast({ title: 'Sucesso!', description: 'Autenticação de dois fatores foi ativada.', className: 'bg-green-500 text-white' });
        cleanupRecaptcha();
      }

    } catch (error: any) {
      console.error("Erro ao habilitar 2FA:", error);
      toast({ variant: 'destructive', title: 'Falha na Verificação', description: 'Código inválido ou expirado. Tente novamente.' });
      cleanupRecaptcha();
      setStage('notEnrolled');
    }
  };

  const handleDisable2FA = async () => {
    if (!auth.currentUser) return;
    
    const mfaUser = multiFactor(auth.currentUser);
    const firstFactorUID = mfaUser.enrolledFactors[0]?.uid;
    
    if (!firstFactorUID) {
        toast({ variant: 'destructive', title: 'Erro', description: "Nenhum fator de autenticação encontrado para desabilitar." });
        return;
    }
    
    setStage('disabling');
    try {
      await mfaUser.unenroll(firstFactorUID);
      setStage('notEnrolled');
      setPhoneNumber('+55');
      setVerificationCode('');
      verificationIdRef.current = null;
      toast({ title: '2FA Desabilitado', description: 'Sua conta está menos protegida agora.' });

    } catch (error: any) {
      console.error("Erro ao desabilitar 2FA:", error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/requires-recent-login') {
          errorMessage = "Sua sessão expirou. Por favor, faça login novamente para desabilitar o 2FA.";
      }
      
      toast({ variant: 'destructive', title: 'Falha ao Desabilitar', description: errorMessage });
      setStage('enrolled');
    }
  };

  if (isSessionLoading || stage === 'loading') {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="flex-1 text-3xl font-black tracking-tighter text-glow">Autenticação de Dois Fatores (2FA)</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {stage === 'enrolled' ? <ShieldCheck className="text-green-500" /> : <ShieldOff className="text-destructive" />}
            Status do 2FA
          </CardTitle>
           <CardDescription>
            Adicione uma camada extra de segurança à sua conta. A autenticação de dois fatores (2FA) ajuda a garantir que apenas você possa acessar seu legado digital.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stage === 'enrolled' && (
            <div className="space-y-4 animate-fade-in-up">
              <Alert variant="default" className="border-green-500 bg-green-500/10">
                <ShieldCheck className="h-4 w-4 !text-green-500" />
                <AlertTitle>2FA Ativo!</AlertTitle>
                <AlertDescription>
                  Sua conta está protegida com verificação por SMS para o número:
                  <br />
                  <strong className="text-foreground">{auth.currentUser && multiFactor(auth.currentUser).enrolledFactors[0]?.displayName}</strong>
                </AlertDescription>
              </Alert>
              <Button onClick={handleDisable2FA} variant="destructive" disabled={stage === 'disabling'}>
                {stage === 'disabling' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                Desabilitar 2FA
              </Button>
            </div>
          )}

          {stage !== 'enrolled' && (
            <div className="space-y-6 animate-fade-in-up">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Sua conta não está totalmente protegida</AlertTitle>
                <AlertDescription>Habilite a autenticação de dois fatores para adicionar uma camada de segurança essencial.</AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+55 (17) 7777-7777"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={stage !== 'notEnrolled'}
                />
                 <p className="text-[0.8rem] text-muted-foreground">Inclua o código do país (ex: +55 para o Brasil).</p>
              </div>

              {stage === 'notEnrolled' && (
                  <Button onClick={handleInitiatePhoneVerification} disabled={!phoneNumber || stage !== 'notEnrolled'}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Habilitar 2FA por SMS
                  </Button>
              )}
              
              <div ref={recaptchaContainerRef} className="flex justify-center my-4"></div>

              {stage === 'sendingCode' && (
                  <div className="flex items-center text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando código...
                  </div>
              )}

              {(stage === 'codeSent' || stage === 'verifyingCode') && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de Verificação</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        type="text"
                        placeholder="_ _ _ _ _ _"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={stage !== 'codeSent'}
                      />
                      <Button onClick={handleVerifyAndEnable} disabled={stage !== 'codeSent' || verificationCode.length !== 6}>
                         {stage === 'verifyingCode' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
                        Verificar e Habilitar
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    onClick={handleSendVerificationCode}
                    disabled={cooldown > 0}
                    className="p-0 h-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {cooldown > 0 ? `Reenviar em (${cooldown}s)` : 'Reenviar Código'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
