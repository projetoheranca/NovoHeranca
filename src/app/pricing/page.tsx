
"use client";

import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, X, Rocket, Shield, Gem, Users, FileText, Server, KeyRound, EyeOff, Zap, Lock, CreditCard, Laptop, ShieldQuestion, HelpCircle, Banknote, AlertTriangle, DollarSign } from "lucide-react";
import { MOCK_SUBSCRIPTION_PLANS } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const faqCategories = [
  {
    category: "Como Funciona",
    icon: FileText,
    questions: [
        {
            question: "1. O que é o Minha Herança Digital?",
            answer: "O Minha Herança Digital é uma plataforma segura que permite você armazenar informações importantes (senhas, documentos, vídeos, mensagens) e entregá-las automaticamente aos seus herdeiros quando você não estiver mais aqui.<br/><br/><strong>Principais funcionalidades:</strong><ul><li>🔒 Armazenamento criptografado de senhas, documentos e memórias</li><li>⏰ Dead Man's Switch (entrega automática por inatividade)</li><li>👨‍👩‍👧‍👦 Herdeiros ilimitados com conteúdo personalizado</li><li>🛡️ Criptografia de ponta-a-ponta (sistema zero-knowledge)</li><li>📹 Vídeos e mensagens personalizadas para cada herdeiro</li></ul>"
        },
        {
            question: "2. Como funciona na prática?",
            answer: "<strong>Passo a passo:</strong><br/><br/><strong>1. Você cria sua conta:</strong> Cadastra nome, email e senha e define um período de inatividade (7, 15, 30, 60 ou 90 dias).<br/><strong>2. Você armazena suas informações:</strong> Senhas de bancos, documentos, vídeos, localização de valores, etc.<br/><strong>3. Você cadastra seus herdeiros:</strong> Adiciona nome e email de cada herdeiro e define o que cada um receberá.<br/><strong>4. Você faz check-in regularmente:</strong> Fazendo login na plataforma ou clicando em links enviados por email.<br/><strong>5. Sistema monitora sua atividade:</strong> Se você ficar inativo, o sistema inicia um processo de verificação com 20 emails e ligações telefônicas.<br/><strong>6. Herdeiros recebem automaticamente:</strong> Se não houver resposta em 15 dias, o sistema entrega as informações aos herdeiros com uma chave de descriptografia."
        },
        {
            question: "3. O que é check-in e como funciona?",
            answer: "Check-in é o ato de confirmar que você está vivo e bem.<br/><br/><strong>Formas de fazer check-in:</strong><br/>1. <strong>Login na plataforma:</strong> Sempre que você acessa sua conta, conta como check-in automático.<br/>2. <strong>Link por email:</strong> Clique no link de check-in enviado periodicamente.<br/>3. <strong>Botão de check-in:</strong> Dentro da plataforma, clique em 'Fazer Check-in'.<br/><br/><strong>Frequência recomendada:</strong> Se configurou 30 dias de inatividade, faça check-in pelo menos uma vez a cada 25 dias. Não precisa ser todo dia!"
        },
        {
            question: "4. Posso guardar QUALQUER tipo de informação?",
            answer: "Sim! Você pode armazenar:<br/><br/><strong>Informações Financeiras:</strong> Senhas de bancos, códigos de criptomoedas, apólices de seguro.<br/><strong>Documentos:</strong> Certidões, escrituras, contratos.<br/><strong>Memórias e Mensagens:</strong> Vídeos pessoais, cartas, fotos.<br/><strong>Acessos Digitais:</strong> Senhas de redes sociais, contas de email.<br/><br/><em>Observação: Tudo é criptografado de ponta-a-ponta. Nós (empresa) não temos acesso ao conteúdo.</em>"
        },
        {
            question: "5. Há limite de tamanho para o que eu guardo?",
            answer: "Não há limite de quantidade! Você pode armazenar vídeos, textos e senhas ilimitadas.<br/><br/><strong>Planos de armazenamento:</strong><br/>- <strong>Mensal:</strong> 50 GB de espaço.<br/>- <strong>Anual:</strong> 100 GB de espaço.<br/><br/><em>Observação sobre vídeos: Vídeos são comprimidos automaticamente para economizar espaço, mantendo a qualidade HD, e não há limite de duração por vídeo.</em>"
        }
    ]
  },
  {
    category: "Segurança e Privacidade",
    icon: Lock,
    questions: [
        {
            question: "6. Vocês têm acesso às minhas senhas e informações?",
            answer: "<strong>NÃO!</strong> Operamos sob sistema <strong>zero-knowledge</strong>.<br/><br/><strong>Nós temos acesso a:</strong><br/>- Nome, email e telefone (dados de cadastro).<br/>- Informações de pagamento (processadas pelo Stripe).<br/><br/><strong>Nós NÃO temos acesso a:</strong><br/>- Senhas de bancos, criptomoedas.<br/>- Conteúdo de vídeos e mensagens.<br/>- Documentos armazenados.<br/><br/>Tudo é criptografado de ponta-a-ponta antes de ser enviado aos nossos servidores. Apenas você e seus herdeiros possuem a chave para descriptografar."
        },
        {
            question: "7. Como funciona a criptografia exatamente?",
            answer: "Utilizamos criptografia de padrão militar AES-256 (E2EE).<br/><br/><strong>Processo:</strong><br/>1. Seus dados são criptografados <strong>no seu dispositivo</strong> usando sua senha como base.<br/>2. Os dados já criptografados são enviados e armazenados nos servidores do Google Cloud.<br/>3. Ao acessar, os dados são baixados criptografados e descriptografados localmente no seu navegador.<br/><br/><em>Nós nunca vemos os dados em texto puro.</em>"
        },
        {
            question: "8. Onde meus dados ficam armazenados?",
            answer: "Seus dados criptografados ficam em servidores seguros do <strong>Google Cloud</strong> no Brasil, com backups em múltiplas regiões (EUA, Europa) para garantir redundância e proteção contra desastres. Nem mesmo o Google pode acessar o conteúdo."
        },
        {
            question: "9. E se hackers invadirem o sistema?",
            answer: "Seus dados continuam protegidos. Mesmo que um hacker acesse nossos servidores, ele encontrará apenas dados criptografados ilegíveis. Sem a sua chave de descriptografia (que nunca é armazenada conosco), os dados são inúteis. Além disso, temos múltiplas camadas de segurança como Firewall, monitoramento 24/7 e 2FA opcional."
        },
        {
            question: "10. Minha privacidade é garantida?",
            answer: "Sim. Estamos em conformidade com a <strong>LGPD</strong>. Você tem direito de acessar, corrigir, excluir e exportar seus dados. Compartilhamos seus dados de cadastro (nome, email) apenas com serviços essenciais como Stripe (pagamento) e Firebase (hospedagem). Seus dados sensíveis <strong>NUNCA</strong> são compartilhados."
        }
    ]
  },
  {
    category: "Dead Man's Switch",
    icon: Zap,
    questions: [
      {
        question: "11. O que é Dead Man's Switch?",
        answer: "É o sistema que monitora sua atividade e, em caso de inatividade prolongada (período que você escolhe: 7, 15, 30, 60 ou 90 dias), inicia um processo de verificação e, se confirmado, entrega suas informações aos herdeiros automaticamente."
      },
      {
        question: "12. Como o sistema verifica se realmente aconteceu algo comigo?",
        answer: "O processo de verificação é automático e direto com você:<br/>1. <strong>Detecção de Inatividade:</strong> O sistema detecta que você não fez check-in no período configurado.<br/>2. <strong>Tentativas de Contato Direto:</strong> O sistema envia 20 emails para você e faz ligações telefônicas (se cadastrado).<br/>3. <strong>Período de Verificação:</strong> Você tem até 15 dias para responder a qualquer uma dessas tentativas.<br/>4. <strong>Confirmação Automática:</strong> Se não houver resposta após 15 dias, o sistema considera o falecimento como confirmado e inicia a entrega.<br/><br/><em>Você pode interromper o processo a qualquer momento fazendo login ou check-in.</em>"
      },
      {
        question: "13. E se eu esquecer de fazer check-in?",
        answer: "Não se preocupe! O sistema envia lembretes por email antes do prazo vencer. Se o prazo expirar, você ainda tem um período de verificação de 15 dias com múltiplos alertas para fazer o check-in e cancelar o processo."
      },
      {
        question: "14. E se eu estiver viajando sem internet por 60 dias?",
        answer: "Planeje antes! Você pode simplesmente alterar seu período de inatividade para 60 ou 90 dias nas configurações do Dead Man's Switch antes de viajar. Lembre-se de fazer um check-in logo antes de sair para reiniciar a contagem."
      }
    ]
  },
  {
    category: "Herdeiros e Entrega",
    icon: Users,
    questions: [
      {
        question: "15. Como meus herdeiros recebem as memórias?",
        answer: "Após a confirmação, cada herdeiro recebe um e-mail automático com um link de acesso seguro e uma chave de descriptografia única. Eles acessam uma página personalizada onde podem visualizar e baixar apenas o conteúdo que você designou para eles, sem precisar criar uma conta."
      },
      {
        question: "16. Posso escolher quem recebe o quê?",
        answer: "Sim, a personalização é total. Você pode criar 'pacotes' de informações diferentes para cada herdeiro. Por exemplo: sua esposa recebe as senhas financeiras, enquanto seus filhos recebem vídeos e cartas pessoais. Cada um só vê o que lhe foi destinado."
      },
      {
        question: "17. Por quanto tempo meus herdeiros têm acesso?",
        answer: "<strong>Acesso permanente!</strong> Após a entrega, as informações ficam disponíveis para seus herdeiros por tempo indeterminado. Eles podem acessar o link e baixar o conteúdo sempre que precisarem. Mesmo assim, recomendamos que eles façam o download e guardem em local seguro."
      },
      {
        question: "18. Posso testar a entrega antes?",
        answer: "Sim. Nas configurações, você poderá usar a função 'Simular Entrega' para enviar um e-mail de teste a um herdeiro e validar todo o processo de acesso e visualização, garantindo que tudo funcione como o esperado."
      }
    ]
  },
  {
    category: "Planos e Pagamentos",
    icon: CreditCard,
    questions: [
        {
            question: "19. Quanto custa?",
            answer: "<strong>PLANO MENSAL:</strong> R$ 24,90/mês com 50 GB. <strong>PLANO ANUAL:</strong> R$ 209,30/ano (R$ 17,44/mês - 30% de economia) com 100 GB e bônus.<br/><br/><strong>IMPORTANTE:</strong><br/>- <strong>Cartão de Crédito:</strong> Permite um teste gratuito de 14 dias. A cobrança é automática após o período, se não for cancelado.<br/>- <strong>PIX:</strong> É um pagamento imediato, sem período de teste. O acesso é liberado após a confirmação."
        },
        {
            question: "20. O que acontece se eu cancelar minha assinatura?",
            answer: "Seu acesso é bloqueado, mas seus dados criptografados são mantidos por 6 meses, período durante o qual você pode reativar a conta. Após 6 meses, todos os dados são excluídos permanentemente. O Dead Man's Switch é desativado no momento do cancelamento."
        },
        {
            question: "21. E se eu ficar inadimplente?",
            answer: "Após 10 dias de falha no pagamento, sua conta é bloqueada e o Dead Man's Switch é pausado. Seus dados são mantidos por 6 meses. Se a situação não for regularizada, os dados são excluídos permanentemente após esse período."
        },
        {
            question: "22. E se meu cartão for recusado?",
            answer: "Você será notificado por e-mail e terá 10 dias para atualizar os dados do cartão, durante os quais a conta continua ativa. Se o problema não for resolvido, a conta é bloqueada."
        },
        {
            question: "23. Posso cancelar quando quiser?",
            answer: "Sim, sem multas ou burocracia, diretamente nas configurações da sua conta. Se cancelar durante o teste gratuito, nada é cobrado. Para assinaturas ativas, o acesso é bloqueado e não há reembolso proporcional pelo período já pago."
        },
        {
            question: "24. Há reembolso?",
            answer: "Sim. Conforme o Código de Defesa do Consumidor, você tem <strong>7 dias corridos</strong> após o primeiro pagamento para solicitar o reembolso integral, sem necessidade de justificativa. Você pode solicitar nas configurações da sua conta ou por e-mail para o suporte."
        }
    ]
  },
  {
    category: "Questões Técnicas",
    icon: Laptop,
    questions: [
        {
            question: "25. E se eu esquecer minha senha?",
            answer: "Você pode usar a função 'Esqueci minha senha' na tela de login. <strong>ATENÇÃO:</strong> Devido à nossa criptografia 'zero-knowledge', se você perder o acesso ao seu e-mail E esquecer a senha, será impossível para nós recuperarmos seus dados."
        },
        {
            question: "26. Posso acessar de qualquer dispositivo?",
            answer: "Sim. Nosso serviço é baseado na web e pode ser acessado de qualquer navegador moderno em computadores, celulares ou tablets. Seus dados são sincronizados na nuvem. Recomendamos ativar a autenticação de 2 fatores (2FA) para maior segurança."
        }
    ]
  },
  {
    category: "Questões Legais",
    icon: ShieldQuestion,
    questions: [
        {
            question: "27. Isso tem validade legal? Substitui testamento?",
            answer: "<strong>NÃO substitui um testamento oficial.</strong> Nosso serviço é legalmente válido como um registro de vontade para entregar informações e facilitar o acesso a senhas e documentos. Para a partilha de bens formais (imóveis, etc.), um testamento e inventário continuam sendo necessários. Use nosso serviço como um complemento prático ao seu planejamento legal."
        },
        {
            question: "28. E se alguém contestar a entrega?",
            answer: "Nós entregaremos o conteúdo exatamente conforme você configurou. Mantemos logs de auditoria (data, hora, IP) de todas as suas configurações, que podem ser usados como prova da sua vontade. Disputas familiares devem ser resolvidas entre as partes; nosso compromisso é com as suas instruções."
        },
        {
            question: "29. Vocês entregam mesmo se a família pedir para NÃO entregar?",
            answer: "Sim. Nosso compromisso é com você e suas instruções. A única exceção é se recebermos uma ordem judicial específica para bloquear a entrega ou se um herdeiro solicitar explicitamente não receber sua parte."
        }
    ]
  },
   {
    category: "Perguntas Adicionais",
    icon: HelpCircle,
    questions: [
        {
            question: "30. O que é Autenticação de Dois Fatores (2FA)?",
            answer: "É uma camada extra de segurança que, além da sua senha, exige um código (enviado por SMS) para fazer login. Isso protege sua conta mesmo que sua senha seja descoberta. Recomendamos fortemente a ativação."
        },
        {
            question: "31. Posso exportar meus dados?",
            answer: "Sim. A LGPD garante seu direito à portabilidade. Em 'Configurações', você pode solicitar uma exportação completa de todos os seus dados, incluindo arquivos, em formato ZIP. Você receberá um link para download por e-mail."
        },
        {
            question: "32. Como funciona o suporte?",
            answer: "Oferecemos suporte via e-mail (suporte@minhaherancadigital.com) e WhatsApp, com atendimento prioritário para assinantes. Nosso tempo de resposta é de até 24 horas úteis. Para questões de privacidade (LGPD), o contato é dpo@minhaherancadigital.com."
        }
    ]
  }
];


const featureComparison = [
  { feature: "Armazenamento", teste: "1 GB", mensal: "50 GB", anual: "100 GB" },
  { feature: "Nº de Memórias", teste: "10", mensal: "Ilimitado", anual: "Ilimitado" },
  { feature: "Nº de Guardiões", teste: "3", mensal: "Ilimitado", anual: "Ilimitado" },
  { feature: "Camuflagem de Calculadora", teste: true, mensal: true, anual: true },
  { feature: "Entrega por Inatividade", teste: true, mensal: true, anual: true },
  { feature: "Criptografia E2EE", teste: true, mensal: true, anual: true },
  { feature: "Confirmação Dupla por E-mail", teste: false, mensal: true, anual: true },
  { feature: "Suporte Prioritário", teste: false, mensal: true, anual: true },
  { feature: "Sessão de Planejamento de Legado", teste: false, mensal: false, anual: true },
];

const planIcons: { [key: string]: React.ElementType } = {
  "Mensal": Shield,
  "Anual": Gem,
};

export default function PricingPage() {
    const recommendedPlanName = "Mensal";

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <LandingHeader />
            <main className="flex-1">
                {/* Header Section */}
                <section className="w-full pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-32 bg-card text-center">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold text-primary mb-4">Nossos Planos</div>
                        <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl text-glow">
                            Encontre o Plano Perfeito para o Seu Legado
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-muted-foreground md:text-xl">
                            Planos transparentes e flexíveis, projetados para proteger o que é mais importante para você. Sem taxas ocultas, sem complicações.
                        </p>
                    </div>
                </section>

                {/* Pricing Cards Section */}
                <section id="pricing" className="w-full py-20 md:py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mx-auto grid max-w-4xl items-stretch justify-center gap-8 md:grid-cols-2 mt-8">
                            {MOCK_SUBSCRIPTION_PLANS.map((plan, index) => {
                                if (plan.name === 'Teste') return null; // Não mostra o plano de teste aqui
                                
                                const isRecommended = plan.name === recommendedPlanName;
                                const Icon = planIcons[plan.name] || Rocket;
                                const cardCheckoutLink = `/signup?plan=${plan.name.toLowerCase()}`;
                                const pixCheckoutLink = `/signup?plan=${plan.name.toLowerCase()}&method=pix`;
                                
                                return (
                                <Card
                                    key={plan.name}
                                    className={cn(
                                    "relative flex flex-col border-2 transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-2xl animate-fade-in-up",
                                    isRecommended ? "border-primary ring-2 ring-primary" : "border-border"
                                    )}
                                    style={{ animationDelay: `${200 * (index + 1)}ms`}}
                                >
                                    {isRecommended && (
                                        <div className="absolute -top-4 right-1/2 translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                                        Recomendado
                                        </div>
                                    )}
                                    <CardHeader className={cn("items-center pb-4 text-center", isRecommended && "pt-8")}>
                                        <Icon className="mb-2 h-8 w-8 text-primary" />
                                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                        <CardDescription>
                                            {plan.priceYearly !== "N/A"
                                            ? <span className="text-4xl font-black tracking-tighter">{plan.priceYearly}<span className="text-sm font-normal">/ano</span></span>
                                            : <span className="text-4xl font-black tracking-tighter">{plan.priceMonthly}<span className="text-sm font-normal">/mês</span></span>}
                                        </CardDescription>
                                         {plan.discount && <p className="text-sm font-bold text-accent">{plan.discount}</p>}
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4">
                                        
                                        {/* Card specific trial info */}
                                        <Alert variant="default" className="border-primary/50 text-center">
                                            <AlertTriangle className="h-4 w-4 !left-2 !top-3 text-primary" />
                                            <AlertTitle className="font-bold text-primary">Teste Gratuito de 14 Dias</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                Disponível apenas para pagamento com <strong>Cartão de Crédito</strong>.
                                            </AlertDescription>
                                        </Alert>

                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="flex-col gap-2">
                                       <Button asChild className={cn("w-full", isRecommended && "button-glow")} variant={"default"}>
                                            <Link href={cardCheckoutLink}>
                                                <CreditCard className="mr-2"/>
                                                {isRecommended ? 'Começar Teste com Cartão' : 'Assinar com Cartão'}
                                            </Link>
                                        </Button>
                                        <Button asChild className="w-full" variant="outline">
                                             <Link href={pixCheckoutLink} className="flex items-center gap-2">
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                {plan.name === 'Anual' ? 'Pagar R$ 209,30 com PIX' : 'Pagar R$ 24,90 com PIX'}
                                            </Link>
                                        </Button>
                                        <p className="text-xs text-muted-foreground pt-1">Pagamento com PIX não inclui teste gratuito.</p>
                                    </CardFooter>
                                </Card>
                                );
                            })}
                        </div>
                        
                        <div className="mt-16">
                            <Alert className="max-w-xl mx-auto border-green-500/50">
                                <Shield className="h-4 w-4 text-green-500" />
                                <AlertTitle className="font-bold text-green-400">Garantia de Reembolso de 7 Dias</AlertTitle>
                                <AlertDescription>
                                    Conforme o <strong>Código de Defesa do Consumidor</strong>, você tem <strong>7 dias corridos</strong> após o primeiro pagamento (para PIX ou após o período de teste no cartão) para solicitar o reembolso integral, sem necessidade de justificativa.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </section>
                
                {/* Feature Comparison Section */}
                <section className="w-full py-20 md:py-24 bg-card">
                     <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl text-glow">Compare os Planos</h2>
                            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                                Veja todos os detalhes e escolha o que melhor se adapta à sua necessidade de preservar seu legado.
                            </p>
                        </div>
                         <Card className="mt-12 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">Recurso</TableHead>
                                        <TableHead className="text-center text-primary font-bold">Mensal</TableHead>
                                        <TableHead className="text-center text-primary font-bold">Anual</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {featureComparison.slice(1).map((item) => ( // Pula o 'Teste'
                                        <TableRow key={item.feature}>
                                            <TableCell className="font-medium">{item.feature}</TableCell>
                                            <TableCell className="text-center font-medium">
                                                {typeof item.mensal === 'boolean' ? 
                                                    (item.mensal ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-red-500" />) :
                                                    item.mensal
                                                }
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {typeof item.anual === 'boolean' ? 
                                                    (item.anual ? <Check className="mx-auto h-5 w-5 text-green-500" /> : <X className="mx-auto h-5 w-5 text-red-500" />) :
                                                    item.anual
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                     </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="w-full py-20 md:py-24 lg:py-28">
                    <div className="container mx-auto px-4 md:px-6">
                         <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl text-glow">FAQ COMPLETO - MINHA HERANÇA DIGITAL</h2>
                             <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                                Tire todas as suas dúvidas sobre segurança, criptografia, Dead Man's Switch, entrega de memórias e muito mais.
                            </p>
                        </div>
                        <div className="mx-auto max-w-4xl mt-12 space-y-10">
                            {faqCategories.map((category) => {
                                const Icon = category.icon;
                                return (
                                <div key={category.category}>
                                    <h3 className="flex items-center gap-3 text-2xl font-bold mb-6">
                                        <Icon className="h-6 w-6 text-primary" />
                                        {category.category}
                                    </h3>
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {category.questions.map((item, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="bg-card/50 rounded-lg px-4">
                                                <AccordionTrigger className="text-base font-semibold text-left hover:no-underline">{item.question}</AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                                                    <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                                );
                            })}

                            <div className="text-center pt-12">
                                <h3 className="flex items-center justify-center gap-3 text-2xl font-bold mb-4">
                                    <HelpCircle className="h-6 w-6 text-primary" />
                                    Não encontrou sua pergunta?
                                </h3>
                                <p className="text-muted-foreground">Entre em contato conosco diretamente.</p>
                                <div className="mt-4 text-foreground">
                                    <p><strong>Email:</strong> contato@minhaherancadigital.com</p>
                                    <p><strong>WhatsApp:</strong> [Seu número de WhatsApp aqui]</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </div>
    );
}
