import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 md:px-6 py-20 md:py-24 lg:py-28">
        <article className="prose dark:prose-invert max-w-none mx-auto">
          <h1>POLÍTICA DE PRIVACIDADE</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 19 de Janeiro de 2026</p>

          <h2>1. COLETA DE DADOS</h2>
          <p>Coletamos apenas os dados estritamente necessários para a prestação do serviço:</p>
          <ul>
              <li><strong>Dados de Conta:</strong> Nome, Email, Telefone.</li>
              <li><strong>Dados de Pagamento:</strong> Processados de forma segura pelo Stripe (não armazenamos números de cartão completos).</li>
              <li><strong>Dados dos Herdeiros:</strong> Nome, Email e Telefone (utilizados exclusivamente para a entrega do legado).</li>
              <li><strong>Logs de Acesso:</strong> IP e data de acesso (para segurança e auditoria).</li>
          </ul>

          <h2>2. USO DOS DADOS</h2>
          <p>Seus dados são utilizados para:</p>
          <ul>
              <li>Gerenciar sua conta e assinatura.</li>
              <li>Processar pagamentos.</li>
              <li>Monitorar inatividade (Dead Man's Switch).</li>
              <li>Enviar notificações de segurança e serviço.</li>
              <li>Entregar o legado aos herdeiros no momento apropriado.</li>
          </ul>
          <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</p>
          
          <h2>3. ARMAZENAMENTO E SEGURANÇA</h2>
          <ul>
              <li><strong>Localização:</strong> Seus dados são armazenados em servidores seguros em nuvem (AWS/Google Cloud) com redundância.</li>
              <li><strong>Criptografia:</strong> Dados sensíveis são armazenados criptografados (AES-256). Dados em trânsito são protegidos por SSL/TLS.</li>
              <li><strong>Retenção:</strong> Mantemos seus dados enquanto sua conta estiver ativa. Após cancelamento, mantemos por 6 meses (período de graça) e depois excluímos permanentemente.</li>
          </ul>

          <h2>4. SEUS DIREITOS (LGPD)</h2>
          <p>Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul>
              <li>Acessar seus dados.</li>
              <li>Corrigir dados incompletos ou desatualizados.</li>
              <li>Solicitar a exclusão de seus dados (o que encerra o serviço).</li>
              <li>Portabilidade dos dados (exportação).</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato através do email help@minhaherancadigital.com ou utilize a ferramenta "Exportar Meus Dados" no painel de configurações.</p>

          <h2>5. CONTATO DO ENCARREGADO (DPO)</h2>
          <p>Para questões relacionadas à privacidade e proteção de dados, entre em contato com nosso Encarregado de Proteção de Dados através do email: help@minhaherancadigital.com.</p>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
