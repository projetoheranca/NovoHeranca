
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { RecaptchaVerifier, PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";
import { auth } from "@/firebase/config";

type VerifyStage = 
  | 'loading'
  | 'getInfo'
  | 'captchaPending'
  | 'sendingCode'
  | 'codeSent'
  | 'verifyingCode'
  | 'success';


export default function VerifyMfaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { mfaResolver, setMfaResolver, logout } = useSession();

    const [stage, setStage] = useState<VerifyStage>('loading');
    const [verificationCode, setVerificationCode] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const recaptchaContainerRef = useRef<HTMLDivElement>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const verificationIdRef = useRef<string | null>(null);
    const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

     const cleanupRecaptcha = useCallback(() => {
        if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
        }
        if (recaptchaContainerRef.current) {
            recaptchaContainerRef.current.innerHTML = '';
        }
    }, []);

    const startCooldown = useCallback(() => {
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
    }, []);
    
    const handleSendVerificationCode = useCallback(async () => {
        if (!mfaResolver || !recaptchaVerifierRef.current) return;
        
        setStage('sendingCode');
        
        try {
            const phoneInfoOptions = {
                multiFactorHint: mfaResolver.hints[0],
                session: mfaResolver.session
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);

            const newVerificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifierRef.current);
            
            verificationIdRef.current = newVerificationId;
            toast({ title: "Código SMS Enviado", description: "Verifique seu celular." });
            setStage('codeSent');
            startCooldown();
        } catch (error: any) {
            console.error("Erro ao enviar SMS:", error);
            let errorMessage = "Ocorreu uma falha desconhecida ao enviar o código SMS.";
             if (error.code === 'auth/captcha-check-failed') {
                errorMessage = "A verificação reCAPTCHA falhou. Tente novamente.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Muitas tentativas foram feitas. Tente novamente mais tarde.";
            }
            toast({ variant: 'destructive', title: 'Falha ao Enviar SMS', description: errorMessage, duration: 9000 });
            cleanupRecaptcha();
            setStage('getInfo'); // Volta para o estágio inicial para poder tentar novamente.
        }
    }, [mfaResolver, startCooldown, toast, cleanupRecaptcha]);

    const handleInitiatePhoneVerification = useCallback(async () => {
        if (!recaptchaContainerRef.current || stage === 'captchaPending' || stage === 'sendingCode') {
          return;
        }
        setStage('captchaPending');
        cleanupRecaptcha();

        try {
          const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
              'size': 'normal', 
              'callback': () => {
                handleSendVerificationCode();
              },
              'expired-callback': () => {
                  toast({ variant: 'destructive', title: 'reCAPTCHA Expirou', description: 'Por favor, tente novamente.'});
                  cleanupRecaptcha();
                  setStage('getInfo');
              }
          });
          
          recaptchaVerifierRef.current = verifier;
          await verifier.render();

        } catch (error: any) {
            console.error("Erro ao renderizar reCAPTCHA:", error);
            toast({ variant: 'destructive', title: 'Falha no reCAPTCHA', description: 'Não foi possível carregar a verificação. Recarregue a página.'});
            cleanupRecaptcha();
            setStage('getInfo');
        }
    }, [cleanupRecaptcha, handleSendVerificationCode, toast, stage]);


    useEffect(() => {
        if (!mfaResolver) {
            router.replace('/login');
            return;
        }
        setStage('getInfo');
        
        return () => {
            cleanupRecaptcha();
            if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mfaResolver, router]);


    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationIdRef.current || !verificationCode || !mfaResolver) {
            toast({ variant: 'destructive', title: 'Informações Faltando', description: 'Código de verificação ou sessão de login inválida.' });
            return;
        }

        setStage('verifyingCode');
        try {
            const cred = PhoneAuthProvider.credential(verificationIdRef.current, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            
            await mfaResolver.resolveSignIn(multiFactorAssertion);
            
            setStage('success');
            toast({ title: "Sucesso!", description: "Login concluído. Redirecionando..." });
            // O session provider cuidará do redirecionamento
            
        } catch (error: any) {
            console.error("Erro ao verificar código MFA:", error);
            let errorMessage = "Código inválido ou expirado.";
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = "O código de verificação digitado está incorreto.";
            } else if (error.code === 'auth/code-expired') {
                errorMessage = "O código de verificação expirou. Por favor, solicite um novo."
            }
            toast({ variant: 'destructive', title: 'Falha na Verificação', description: errorMessage });
            setStage('codeSent'); 
        }
    };
    
    const handleCancel = async () => {
        await logout();
        setMfaResolver(null);
        router.replace('/login');
    };

    if (stage === 'loading') {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm card-glow">
                <form onSubmit={handleVerifyCode}>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary-foreground">
                            <ShieldCheck className="h-8 w-8 text-primary icon-glow" />
                        </div>
                        <CardTitle className="text-2xl font-black text-glow">Verificação de Dois Fatores</CardTitle>
                        <CardDescription>
                            {mfaResolver?.hints[0].displayName ? `Um código SMS será enviado para o final ${mfaResolver.hints[0].displayName?.slice(-4)}.` : 'Um código SMS será enviado para seu celular.'}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        {(stage === 'getInfo' || stage === 'captchaPending') && (
                            <Button onClick={handleInitiatePhoneVerification} className="w-full" disabled={stage !== 'getInfo'}>
                                Enviar Código SMS
                            </Button>
                        )}
                        
                        <div ref={recaptchaContainerRef} className="flex justify-center my-4"></div>

                        {(stage === 'sendingCode' || stage === 'verifyingCode' || stage === 'codeSent') && (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="space-y-2">
                                    <Label htmlFor="verificationCode">Código de Verificação</Label>
                                    <Input
                                        id="verificationCode"
                                        type="tel"
                                        maxLength={6}
                                        placeholder="_ _ _ _ _ _"
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        disabled={stage === 'verifyingCode' || stage === 'sendingCode'}
                                        className="text-center text-lg tracking-[0.5em]"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={stage !== 'codeSent' || verificationCode.length < 6}>
                                    {stage === 'verifyingCode' ? <Loader2 className="animate-spin" /> : "Verificar e Entrar"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={handleInitiatePhoneVerification}
                                    disabled={cooldown > 0 || stage === 'sendingCode' || stage === 'verifyingCode'}
                                    className="p-0 h-auto w-full"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {cooldown > 0 ? `Reenviar em (${cooldown}s)` : 'Reenviar Código'}
                                </Button>
                            </div>
                        )}
                         {stage === 'sendingCode' && (
                             <div className="flex items-center justify-center text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando código...
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button type="button" variant="link" onClick={handleCancel}>
                            Cancelar e voltar para o login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
