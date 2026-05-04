
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function CookiePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 md:px-6 py-20 md:py-24 lg:py-28">
        <article className="prose dark:prose-invert max-w-none mx-auto">
          <h1>POLÍTICA DE COOKIES</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 26 de novembro de 2025</p>

          <h2>1. O QUE SÃO COOKIES?</h2>
          <p>
            Cookies são pequenos arquivos de texto que um site armazena no seu computador ou dispositivo móvel quando você o visita. Eles são amplamente utilizados para fazer os sites funcionarem, ou funcionarem de forma mais eficiente, bem como para fornecer informações aos proprietários do site.
          </p>
          <p>
            Nesta política, explicamos como usamos cookies e tecnologias similares para garantir que nossos serviços funcionem corretamente, prevenir fraudes, analisar e melhorar nossos serviços e para fins de marketing.
          </p>

          <h2>2. COMO USAMOS OS COOKIES</h2>
          <p>Utilizamos diferentes categorias de cookies para diversas finalidades:</p>
          
          <h3>2.1 Cookies Essenciais (Obrigatórios)</h3>
          <p>Estes cookies são estritamente necessários para o funcionamento básico da plataforma. Sem eles, serviços como login, gerenciamento de sessão e segurança não funcionariam.</p>
          <ul>
            <li><strong>Autenticação e Segurança:</strong> Usamos cookies para identificar e autenticar nossos usuários, manter suas sessões ativas e proteger suas contas contra atividades fraudulentas. (Ex: Cookies do Firebase Authentication).</li>
            <li><strong>Preferências do Site:</strong> Armazenamos suas preferências, como o tema escolhido (claro ou escuro), para que você não precise configurá-lo a cada visita. (Ex: Cookie do `next-themes`).</li>
          </ul>
          <p><strong>Base Legal (LGPD):</strong> Legítimo interesse e execução de contrato. Você não pode desativar esses cookies, pois são essenciais para a funcionalidade do site.</p>

          <h3>2.2 Cookies de Desempenho e Análise (Opcionais)</h3>
          <p>Estes cookies nos ajudam a entender como os visitantes interagem com nosso site, coletando informações de forma anônima. Usamos esses dados para analisar o tráfego, identificar as páginas mais populares e melhorar a experiência do usuário.</p>
          <ul>
            <li><strong>Google Analytics:</strong> Utilizamos para coletar estatísticas sobre o uso do site, como número de visitantes, páginas visitadas e tempo gasto no site. Isso nos ajuda a tomar decisões informadas sobre melhorias na plataforma.</li>
          </ul>
           <p><strong>Base Legal (LGPD):</strong> Consentimento. Você pode optar por não aceitar esses cookies através do nosso banner de consentimento ou nas configurações do seu navegador.</p>

          <h3>2.3 Cookies de Marketing (Opcionais)</h3>
          <p>Estes cookies são usados para rastrear visitantes através de sites com o objetivo de exibir anúncios que são relevantes e envolventes para o usuário individual. Eles também nos ajudam a medir a eficácia de nossas campanhas de marketing.</p>
          <ul>
            <li><strong>ActiveCampaign e outros:</strong> Podemos usar cookies de parceiros de marketing para personalizar a comunicação e as ofertas com base em seu interesse e interação com a plataforma.</li>
          </ul>
          <p><strong>Base Legal (LGPD):</strong> Consentimento. Você pode optar por não aceitar esses cookies.</p>

          <h2>3. GERENCIAMENTO DE COOKIES</h2>
          <p>Você tem o controle sobre os cookies que aceita. A maioria dos navegadores permite que você gerencie suas preferências de cookies através das configurações.</p>
          <ul>
              <li><strong>Banner de Cookies:</strong> Ao visitar nosso site pela primeira vez, você será apresentado a um banner onde pode aceitar, rejeitar ou personalizar suas preferências de cookies.</li>
              <li><strong>Configurações do Navegador:</strong> Você pode alterar as configurações do seu navegador para recusar alguns ou todos os cookies. No entanto, se você bloquear cookies essenciais, partes do nosso site podem não funcionar corretamente. Encontre instruções sobre como gerenciar cookies nos navegadores mais populares:
                  <ul>
                      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                      <li><a href="https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-que-os-sites-usam" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                      <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
                      <li><a href="https://support.microsoft.com/pt-br/windows/excluir-e-gerenciar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                  </ul>
              </li>
          </ul>

          <h2>4. ALTERAÇÕES NA POLÍTICA DE COOKIES</h2>
          <p>Podemos atualizar esta Política de Cookies de tempos em tempos para refletir, por exemplo, mudanças nos cookies que usamos ou por outras razões operacionais, legais ou regulatórias. Portanto, por favor, revisite esta política regularmente para se manter informado sobre nosso uso de cookies.</p>
          
          <h2>5. CONTATO</h2>
          <p>Se você tiver alguma dúvida sobre nosso uso de cookies, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do email: <strong>dpo@minhaherancadigital.com</strong>.</p>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
