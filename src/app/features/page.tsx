import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { ShieldCheck, Zap, Lock, EyeOff, KeyRound, Server } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: EyeOff,
    title: "Discrição Absoluta com a Camuflagem de Calculadora",
    description: "Sua privacidade é a camada zero de nossa segurança. O Minha Herança Digital se disfarça como um aplicativo de calculadora comum e totalmente funcional. Ninguém, exceto você, saberá que por trás de uma interface familiar, suas memórias mais preciosas estão guardadas.",
    imageUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageHint: "calculator privacy",
    points: [
      {
        icon: ShieldCheck,
        title: "Interface Dupla",
        text: "Uma calculadora 100% funcional para operações do dia a dia, que só revela o cofre com sua senha secreta."
      },
      {
        icon: ShieldCheck,
        title: "Sem Rastros Visuais",
        text: "Nenhum ícone, notificação ou nome suspeito que denuncie a verdadeira natureza do aplicativo em seu dispositivo."
      },
      {
        icon: ShieldCheck,
        title: "Acesso por Código Secreto",
        text: "Apenas a sequência correta de números e operações inserida na calculadora garante acesso ao seu cofre."
      },
    ]
  },
  {
    icon: Zap,
    title: "Entrega Automática por Inatividade (Dead Man's Switch)",
    description: "A vida é imprevisível. Nosso sistema inteligente de 'Dead Man's Switch' é a sua garantia de que, mesmo no inesperado, seu legado será entregue. Defina um período de inatividade e, se ele for atingido, o Minha Herança Digital iniciará o protocolo de entrega para os guardiões que você escolheu.",
    imageUrl: "https://images.unsplash.com/photo-1611843467160-25afb8df1074?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageHint: "automatic delivery",
    points: [
      {
        icon: Zap,
        title: "Check-ins de Vida",
        text: "Confirmações periódicas (configuráveis por você) garantem que o sistema só ative quando for realmente necessário."
      },
      {
        icon: Zap,
        title: "Múltiplos Guardiões",
        text: "Atribua memórias específicas a diferentes pessoas, com mensagens personalizadas para cada uma delas."
      },
       {
        icon: Zap,
        title: "Protocolo de Confirmação Dupla",
        text: "Opcionalmente, exija uma confirmação em um e-mail secundário antes da entrega, como uma camada extra contra ativações acidentais."
      },
    ]
  },
  {
    icon: Lock,
    title: "Segurança de Nível Militar para Suas Memórias",
    description: "A segurança não é um opcional, é a nossa fundação. Aplicamos as práticas mais rigorosas da indústria para garantir que suas memórias sejam vistas apenas por você e por quem você autorizar. Seus dados são completamente ilegíveis para qualquer outra pessoa, incluindo nossa equipe.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageHint: "data security",
     points: [
      {
        icon: KeyRound,
        title: "Criptografia de Ponta a Ponta (E2EE)",
        text: "Utilizamos o padrão AES-256 bits. Seus dados são criptografados no seu dispositivo e só podem ser descriptografados por você ou seus guardiões."
      },
      {
        icon: Server,
        title: "Arquitetura Zero-Knowledge",
        text: "Nós não temos as chaves para abrir seus arquivos. Somente você as tem. Isso significa que nem mesmo nossa equipe pode acessar seu conteúdo."
      },
      {
        icon: Lock,
        title: "Infraestrutura Segura na Nuvem",
        text: "Seus dados criptografados são armazenados em servidores de classe mundial, garantindo a integridade e disponibilidade."
      },
    ]
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-1">
        <section className="w-full py-20 md:py-28 lg:py-32 bg-card">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl text-glow">
              Recursos Construídos para Proteger Seu Legado
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              Descubra a tecnologia e o cuidado por trás de cada funcionalidade do Minha Herança Digital, projetada para oferecer segurança, discrição e paz de espírito.
            </p>
          </div>
        </section>

        <section className="w-full py-20 md:py-24 lg:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-28">
              {features.map((feature, index) => (
                <div key={feature.title} className="grid gap-10 md:grid-cols-2 md:items-center">
                  <div className={`md:order-${index % 2 === 0 ? 2 : 1} animate-fade-in-up group`}>
                     <div className="image-glow rounded-xl overflow-hidden">
                        <Image
                            src={feature.imageUrl}
                            alt={feature.title}
                            width={600}
                            height={400}
                            className="rounded-xl shadow-2xl object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                            data-ai-hint={feature.imageHint}
                        />
                    </div>
                  </div>
                  <div className={`md:order-${index % 2 === 0 ? 1 : 2} animate-fade-in-up`}>
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-semibold text-primary mb-4">
                      <feature.icon className="inline-block h-4 w-4 mr-2" />
                      {feature.title.split(" com ")[0]}
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{feature.title}</h2>
                    <p className="mt-4 text-muted-foreground text-lg">{feature.description}</p>
                    <ul className="mt-8 space-y-6">
                      {feature.points.map((point) => (
                        <li key={point.title} className="flex items-start gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                             <point.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{point.title}</h4>
                            <p className="text-muted-foreground text-sm">{point.text}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
