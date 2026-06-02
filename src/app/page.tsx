
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { MOCK_SUBSCRIPTION_PLANS } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Banknote,
  BookOpen,
  Check,
  Gem,
  Heart,
  Lightbulb,
  Lock,
  MessageSquare,
  Shield,
  Rocket,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { pushToDataLayer } from "@/lib/analytics";


const problemCards = [
  {
    icon: Banknote,
    title: "Finanças e Investimentos",
    points: [
      "Senhas de bancos e corretoras",
      "R$ 80 mil em Bitcoin que ninguém sabe que existe",
      "Ações e investimentos sem documentação acessível",
      "Seguros de vida (número da apólice)",
      "Dívidas a receber",
    ],
    result: "PERDIDO PARA SEMPRE",
  },
  {
    icon: Lock,
    title: "Senhas e Acessos",
    points: [
      "Código da BlueWallet (seed phrase de 12 palavras)",
      "Senha do Ledger (hardware wallet)",
      "Acesso ao Gmail e contas importantes",
      "PIN do cofre físico",
      "Senhas de redes sociais e serviços",
    ],
    result: "INACESSÍVEL PARA SEMPRE",
  },
  {
    icon: Gem,
    title: "Valores Escondidos",
    points: [
      '“Joias da avó no cofre do Banco Itaú, agência 1234”',
      '“R$ 20 mil em ouro enterrado no sítio, embaixo da mangueira”',
      "Relógio de R$ 50 mil escondido no armário",
      "Documentos importantes em local secreto",
    ],
    result: "NUNCA ENCONTRADO",
  },
  {
    icon: BookOpen,
    title: "Histórias de Família",
    points: [
      "Como você conheceu sua esposa",
      "História do bisavô na Segunda Guerra",
      "Origem da família e antepassados",
      "Momentos marcantes da sua vida",
      "Receitas especiais de família",
    ],
    result: "ESQUECIDO PARA SEMPRE",
  },
  {
    icon: Lightbulb,
    title: "Conselhos e Sabedoria",
    points: [
      '“Nunca empreste dinheiro sem contrato”',
      '“Invista em imóveis, não em carros”',
      "Lições de 50 anos de experiência",
      "Erros para não repetir",
      "Segredos de sucesso profissional",
    ],
    result: "PERDIDO PARA SEMPRE",
  },
  {
    icon: Heart,
    title: "Amor e Despedidas",
    points: [
      '“Filho, você foi meu maior orgulho”',
      "Mensagem para o aniversário de 18 anos",
      "Carta para o dia do casamento",
      "Palavras de perdão",
      '“Te amo mais que tudo”',
    ],
    result: "NUNCA OUVIDO",
  },
];

const realStories = [
    {
        name: "Júlia, 34 anos, São Paulo",
        headline: "“Meu marido tinha R$ 120 mil em Bitcoin”",
        story: "“Meu marido partiu de forma súbita aos 38 anos, vítima de infarto. Ele sempre comentava sobre 'investimentos em crypto', mas nunca compartilhou os detalhes. Depois que ele se foi, encontrei anotações sobre 'BlueWallet' e valores que somavam R$ 120 mil. Tentei de tudo. Contratei especialistas. Nada funcionou. O dinheiro está lá, mas é como se não existisse. Meus dois filhos perderam não só o pai, mas também a segurança financeira que ele havia guardado para eles.”",
        impact: "R$ 120.000 perdidos para sempre",
        image: "/img/bt.jpg",
        imageHint: "worried woman"
    },
    {
        name: "Carlos, 52 anos, Rio de Janeiro",
        headline: "“Nunca soube a história do meu avô na guerra”",
        story: "“Meu pai sempre dizia que um dia contaria a história do meu avô na Segunda Guerra Mundial - como ele salvou 12 pessoas, as medalhas que ganhou, por que veio para o Brasil. 'Um dia eu te conto', ele dizia. Mas ele partiu repentinamente e esse dia nunca chegou. Hoje tenho 52 anos e três filhos. Eles perguntam sobre o bisavô. Eu não sei responder. A história se foi com meu pai. É uma dor que não passa.”",
        impact: "Legado familiar perdido para sempre",
        image: "/img/guerra.jpg",
        imageHint: "elderly man"
    },
    {
        name: "Amanda, 28 anos, Belo Horizonte",
        headline: "“Nunca ouvi as últimas palavras da minha mãe”",
        story: "“Minha mãe partiu em um acidente de carro quando eu tinha 17 anos. Foi tão rápido que ela não teve chance de se despedir. Hoje tenho 28 anos. Me formei, me casei, tive meu primeiro filho. Em cada momento importante, penso: 'O que minha mãe diria?'. Eu daria TUDO para ter um vídeo dela me dando conselhos. Ou uma carta para o dia do meu casamento. Mas não tenho nada.”",
        impact: "Últimas palavras nunca ouvidas",
        image: "/img/bye.jpg",
        imageHint: "woman thoughtful"
    }
];

const testimonials = [
  {
    name: "Ana Paula Silva",
    title: "Arquiteta, 34 anos",
    quote: "Protegi não só memórias, mas senhas de bancos e localização das joias da família.",
    image: "https://picsum.photos/seed/headshot1/300/300",
    imageHint: "professional headshot"
  },
  {
    name: "Roberto Mendes",
    title: "Policial Militar, 42 anos",
    quote: "Deixei senhas, códigos de crypto e últimas palavras. Paz total.",
    image: "https://picsum.photos/seed/headshot2/300/300",
    imageHint: "professional portrait"
  },
  {
    name: "Dra. Sofia Martins",
    title: "Médica Cardiologista, 51 anos",
    quote: "Guardei códigos de crypto e localização de valores escondidos.",
    image: "https://picsum.photos/seed/headshot3/300/300",
    imageHint: "business portrait"
  },
  {
    name: "Mariana Costa",
    title: "Aposentada, 68 anos",
    quote: "Gravei histórias e conselhos para meus 5 netos.",
    image: "https://picsum.photos/seed/headshot4/300/300",
    imageHint: "professional headshot"
  },
  {
    name: "Carlos Eduardo Rocha",
    title: "Empresário, 47 anos",
    quote: "Documentei 25 anos de experiência e deixei senhas do negócio.",
    image: "https://picsum.photos/seed/headshot5/300/300",
    imageHint: "business portrait"
  },
]

const planIcons: { [key: string]: React.ElementType } = {
  "Teste": Rocket,
  "Mensal": Shield,
  "Anual": Gem,
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />

      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="relative w-full flex items-center justify-center text-center text-white overflow-hidden py-40">
          <Image
            src="/img/8a.jpg"
            alt="Legado Digital"
            layout="fill"
            objectFit="cover"
            className="brightness-50"
            data-ai-hint="happy family"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 mt-10">
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up text-glow">
              E Se Você Não Estivesse Aqui Amanhã?
            </h1>
            <p className="mt-2 text-lg md:text-xl animate-fade-in-up [animation-delay:200ms]">
              Suas informações mais importantes chegariam às pessoas certas?
            </p>
            
            <div className="mt-6 p-6 bg-red-900/80 border border-red-700 rounded-lg shadow-2xl max-w-2xl w-full animate-fade-in-up [animation-delay:400ms]">
                <h2 className="text-xl font-bold">40% das pessoas se vão sem chance de dizer adeus ou passar informações vitais.</h2>
                <p className="mt-4 font-semibold text-lg">87% das famílias perdem TUDO:</p>
                <ul className="mt-2 space-y-1 text-left list-inside list-disc">
                    <li>Senhas de contas bancárias e investimentos</li>
                    <li>Códigos de carteiras digitais (Bitcoin, crypto)</li>
                    <li>Localização de valores e joias guardados</li>
                    <li>Histórias de família que só você conhece</li>
                    <li>Últimas palavras de amor e conselhos</li>
                </ul>
            </div>

            <p className="mt-8 text-xl font-bold animate-fade-in-up [animation-delay:600ms]">Você não controla quando vai partir. Mas pode garantir que nada se perca.</p>
            
            <div className="mt-4 animate-fade-in-up [animation-delay:800ms] flex flex-col items-center gap-2">
               <Button size="lg" asChild className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg button-glow">
                <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'hero_cta', location: 'hero' })}>Preparar Minha Herança Digital Agora</Link>
              </Button>
              <p className="text-sm text-white/80">(Experimente grátis por 14 dias - Sem precisar de cartão)</p>
               <p className="mt-4 text-sm font-semibold flex items-center gap-2 animate-pulse"><AlertTriangle className="h-4 w-4 text-yellow-300" /> Cada dia sem preparação é um dia de risco</p>
            </div>
          </div>
        </section>

        {/* Section 2: The Problem */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">O Que Sua Família Perde Quando Você Parte</h2>
              <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">Não é só sobre memórias. São informações CRÍTICAS que desaparecem e nunca mais voltam.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {problemCards.map((card) => {
                const Icon = card.icon;
                return(
                  <Card key={card.title} className="flex flex-col text-center p-6 border-destructive/20 hover:border-destructive/50 transition-all hover:scale-105">
                     <Icon className="h-10 w-10 mx-auto text-destructive" />
                     <CardTitle className="mt-4 text-xl">{card.title}</CardTitle>
                     <CardContent className="mt-4 text-sm text-muted-foreground text-left px-0 pb-0">
                       <ul className="space-y-1 list-disc list-inside">
                        {card.points.map(point => <li key={point}>{point}</li>)}
                       </ul>
                     </CardContent>
                     <p className="mt-auto pt-4 text-destructive font-bold">{card.result}</p>
                  </Card>
                )
              })}
            </div>
             <div className="text-center mt-16">
              <p className="text-2xl font-bold text-destructive flex items-center justify-center gap-2"><AlertTriangle/> ISSO ACONTECE TODOS OS DIAS</p>
              <p className="mt-2 text-muted-foreground">Famílias perdem milhões em ativos inacessíveis. Filhos crescem sem conhecer suas raízes. Últimas palavras nunca são ouvidas.</p>
              <Button asChild size="lg" className="mt-8 button-glow">
                <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'problem_cta', location: 'problem_section' })}>Não Deixar Isso Acontecer Comigo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 3: Real Stories */}
        <section className="w-full py-20 md:py-24 lg:py-28">
           <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Histórias Reais de Perda</h2>
                <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">Isso não é teoria. Acontece todos os dias.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {realStories.map(story => (
                    <Card key={story.name} className="overflow-hidden">
                        <Image src={story.image} alt={story.headline} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={story.imageHint} />
                        <CardHeader>
                            <CardTitle>"{story.headline}"</CardTitle>
                            <CardDescription>{story.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">"{story.story}"</p>
                            <p className="mt-4 font-bold text-destructive flex items-center gap-2"><Heart className="fill-current"/> {story.impact}</p>
                        </CardContent>
                    </Card>
                ))}
              </div>
              <div className="text-center mt-12">
                <p className="text-xl font-bold text-destructive flex items-center justify-center gap-2"><AlertTriangle/> NÃO DEIXE ISSO ACONTECER COM SUA FAMÍLIA</p>
                <Button asChild size="lg" className="mt-6 button-glow">
                    <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'stories_cta', location: 'stories_section' })}>Preparar Minha Herança Digital</Link>
                </Button>
              </div>
           </div>
        </section>
        
        {/* Section 4: Institutional Video */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-card/30">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Existe Uma Solução Simples</h2>
                <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">Veja como proteger tudo em menos de 5 minutos</p>
                <div className="mt-8 max-w-3xl mx-auto aspect-video bg-muted rounded-lg flex items-center justify-center image-glow">
                    <video controls className="w-full h-full rounded-lg">
                        <source src="/videos/video1.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto text-sm">
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-primary"/> Proteja senhas e acessos</div>
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-primary"/> Guarde localização de valores</div>
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-primary"/> Grave histórias e conselhos</div>
                    <div className="flex items-center gap-2"><Check className="h-5 w-5 text-primary"/> Deixe últimas palavras</div>
                    <div className="flex items-center gap-2 col-span-2 lg:grid-cols-1 justify-center"><Check className="h-5 w-5 text-primary"/> Entrega automática</div>
                </div>
                 <div className="mt-12 flex flex-col items-center gap-2">
                    <Button asChild size="lg" className="button-glow">
                        <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'video_cta', location: 'video_section' })}>Começar Agora (Teste por 14 dias)</Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">✓ Teste por 14 dias  •  ✓ Sem precisar de cartão  •  ✓ Configure em 5 minutos</p>
                </div>
            </div>
        </section>

        {/* Section 5: Everything you can protect */}
        <section className="w-full py-20 md:py-24 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Proteja TUDO Que Importa Para Sua Família</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {problemCards.map((card) => {
                        const Icon = card.icon;
                        return(
                        <div key={card.title} className="p-6">
                            <Icon className="h-8 w-8 text-primary" />
                            <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                                {card.points.map(point => <li key={point}>{point}</li>)}
                            </ul>
                        </div>
                        )
                    })}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild size="lg" className="button-glow">
                        <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'everything_cta', location: 'everything_section' })}>Proteger Tudo Agora</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Section 6: How it works */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-card/30">
             <div className="container mx-auto px-4 md:px-6">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Como Funciona (3 Passos Simples)</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-12 text-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>
                     <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground font-black text-3xl border-4 border-background mb-4">1</div>
                        <p className="absolute -top-8 bg-card px-2 text-sm text-muted-foreground rounded-full">2 minutos</p>
                        <h3 className="text-xl font-bold">Guarde Tudo</h3>
                        <p className="mt-2 text-muted-foreground text-sm">Senhas de bancos, códigos de crypto (BlueWallet, Ledger), localização exata de valores escondidos, histórias de família, conselhos de vida, últimas palavras de amor. Tudo criptografado de ponta-a-ponta. Ninguém acessa. Nem nós.</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground font-black text-3xl border-4 border-background mb-4">2</div>
                        <p className="absolute -top-8 bg-card px-2 text-sm text-muted-foreground rounded-full">2 minutos</p>
                        <h3 className="text-xl font-bold">Defina Herdeiros</h3>
                        <p className="mt-2 text-muted-foreground text-sm">Escolha quem recebe cada informação. Filhos recebem vídeos e conselhos. Esposa recebe senhas e finanças. Irmão recebe localização das joias. Você decide quem recebe o quê.</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground font-black text-3xl border-4 border-background mb-4">3</div>
                        <p className="absolute -top-8 bg-card px-2 text-sm text-muted-foreground rounded-full">Automático</p>
                        <h3 className="text-xl font-bold">Sistema Entrega</h3>
                        <p className="mt-2 text-muted-foreground text-sm">Se você não fizer check-in por muito tempo (você escolhe: 7, 15, 30 ou 60 dias), entramos em contato com seus 3 contatos de verificação. Após confirmação, tudo é entregue automaticamente aos herdeiros através de páginas personalizadas e seguras.</p>
                    </div>
                </div>
                 <div className="text-center mt-16">
                     <p className="font-bold text-primary">Simples. Automático. Garantido.</p>
                    <Button asChild size="lg" className="mt-4 button-glow">
                        <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'howitworks_cta', location: 'howitworks_section' })}>Começar Agora (5 minutos)</Link>
                    </Button>
                </div>
             </div>
        </section>

        {/* Section 7: Testimonials */}
        <section className="w-full py-20 md:py-24 lg:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Quem Já Preparou Sua Herança Digital</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">Mais de 5.000 pessoas já garantiram que suas informações mais importantes chegarão aos seus amados</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial.name} className="flex flex-col items-center text-center p-4">
                            <div className="relative w-24 h-24">
                                <Image src={testimonial.image} alt={testimonial.name} width={96} height={96} className="rounded-full object-cover" data-ai-hint={testimonial.imageHint} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                    <Video className="h-8 w-8 text-white"/>
                                </div>
                            </div>
                            <CardHeader className="p-2 pt-4">
                                <CardTitle className="text-base">{testimonial.name}</CardTitle>
                                <CardDescription className="text-xs">{testimonial.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 flex-1">
                                <p className="text-sm italic text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Section 8: Plans */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-card/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Escolha Seu Plano</h2>
                </div>
                <div className="mx-auto grid max-w-5xl items-stretch gap-8 md:grid-cols-3">
                    {MOCK_SUBSCRIPTION_PLANS.map((plan, index) => {
                        const isRecommended = plan.name === "Mensal";
                        const Icon = planIcons[plan.name] || Rocket;
                        const linkHref = `/signup?plan=${plan.name.toLowerCase()}`;
                        return (
                        <Card
                            key={plan.name}
                            className={cn(
                            "relative flex flex-col border-2 transition-transform duration-300 hover:scale-105",
                            isRecommended ? "border-primary ring-2 ring-primary shadow-2xl" : "border-border"
                            )}
                        >
                            {plan.discount && (
                                <div className="absolute -top-4 right-1/2 translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg">
                                {plan.discount}
                                </div>
                            )}
                            <CardHeader className={cn("items-center pb-4 text-center", plan.discount && "pt-8")}>
                                <Icon className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="font-semibold">
                                    {plan.priceYearly !== "N/A"
                                    ? <span className="text-4xl font-black tracking-tighter">{plan.priceYearly}<span className="text-sm font-normal">/ano</span></span>
                                    : <span className="text-4xl font-black tracking-tighter">{plan.priceMonthly}<span className="text-sm font-normal">/mês</span></span>}
                                </CardDescription>
                                 {plan.name === 'Anual' && <p className="text-sm text-muted-foreground">(Equivalente a R$ 17,44/mês)</p>}
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex-col gap-2">
                               <Button asChild className={cn("w-full", isRecommended && "button-glow")} variant={isRecommended ? "default" : "outline"}>
                                    <Link href={linkHref} onClick={() => pushToDataLayer('cta_click', { button_name: 'plan_cta', location: 'plans_section', plan_selected: plan.name })}>
                                        {plan.name === 'Mensal' ? 'Começar Teste Grátis' : plan.name === 'Teste' ? 'Começar Teste' : 'Assinar Agora'}
                                    </Link>
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    {plan.name === 'Anual' ? 'Cancele quando quiser' : 'Sem cartão necessário'}
                                </p>
                            </CardFooter>
                        </Card>
                        );
                    })}
                </div>
                 <p className="mt-8 text-center text-sm font-semibold flex items-center justify-center gap-2 animate-pulse"><AlertTriangle className="h-4 w-4 text-yellow-300" /> Cada dia sem preparação é um dia de risco</p>
            </div>
        </section>
        
        {/* Section 9: Final CTA */}
        <section className="w-full py-20 md:py-24 lg:py-28 bg-red-900 text-white">
            <div className="container mx-auto px-4 md:px-6 text-center">
                 <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl">Não Deixe Seus Amados Sem Respostas</h2>
                 <p className="mt-4 max-w-2xl mx-auto">Se você não estivesse aqui amanhã, sua família saberia:</p>
                 <div className="mt-6 max-w-md mx-auto text-left space-y-2">
                    <p className="flex items-center gap-2"><span className="text-red-400 font-bold text-xl">❌</span> Onde estão seus R$ 80 mil em Bitcoin?</p>
                    <p className="flex items-center gap-2"><span className="text-red-400 font-bold text-xl">❌</span> Qual a senha do banco?</p>
                    <p className="flex items-center gap-2"><span className="text-red-400 font-bold text-xl">❌</span> Onde estão as joias da avó?</p>
                    <p className="flex items-center gap-2"><span className="text-red-400 font-bold text-xl">❌</span> A história do bisavô na guerra?</p>
                    <p className="flex items-center gap-2"><span className="text-red-400 font-bold text-xl">❌</span> Suas últimas palavras de amor?</p>
                 </div>
                 <p className="mt-6 text-2xl font-bold">NÃO.</p>
                 <p className="mt-1 text-xl">Tudo se perderia. Para sempre.</p>

                 <p className="mt-12 text-xl font-bold text-yellow-300 flex items-center justify-center gap-2"><AlertTriangle/> 40% DAS PARTIDAS SÃO SÚBITAS. SEM AVISOS. SEM TEMPO.</p>
                 <p className="mt-8 text-2xl font-semibold">Prepare sua herança digital HOJE. Leva menos de 5 minutos.</p>

                 <div className="mt-8 flex flex-col items-center gap-2">
                    <Button asChild size="lg" variant="outline" className="bg-white text-red-700 font-bold text-lg h-14 hover:bg-gray-200">
                        <Link href="/signup?plan=mensal" onClick={() => pushToDataLayer('cta_click', { button_name: 'final_cta', location: 'footer_section' })}>Preparar Minha Herança Digital</Link>
                    </Button>
                    <div className="mt-4 text-sm space-y-2">
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400"/> Teste por 14 dias</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400"/> Sem cartão necessário</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400"/> Configure em 5 minutos</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400"/> Cancele quando quiser</p>
                    </div>
                     <p className="mt-8 font-semibold">Mais de 5.000 famílias já estão protegidas</p>
                 </div>
            </div>
        </section>

      </main>
      <LandingFooter />
    </div>
  );
}
