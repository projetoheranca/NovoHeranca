
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 md:px-6 py-20 md:py-24 lg:py-28">
        <article className="prose dark:prose-invert max-w-none mx-auto">
          <h1>POLÍTICA DE REEMBOLSO</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 26 de novembro de 2025</p>

          <h2>1. DIREITO DE ARREPENDIMENTO (GARANTIA DE 7 DIAS)</h2>
          <p>
            Conforme o Artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), você tem o direito de se arrepender da compra e solicitar o reembolso integral do valor pago em até <strong>7 (sete) dias corridos</strong> a partir da data do primeiro pagamento.
          </p>
          <p>
            Esta garantia se aplica tanto para pagamentos via Cartão de Crédito (após o período de teste gratuito) quanto para pagamentos via PIX.
          </p>

          <h3>Condições para o Reembolso de 7 Dias:</h3>
          <ul>
            <li>A solicitação deve ser feita dentro do prazo de 7 dias corridos após o primeiro pagamento.</li>
            <li>Não é necessário apresentar justificativa para a solicitação.</li>
            <li>O reembolso será de 100% do valor pago.</li>
          </ul>

          <h2>2. COMO SOLICITAR O REEMBOLSO</h2>
          <p>Para solicitar seu reembolso dentro do prazo de 7 dias, siga os passos abaixo:</p>
          
          <ol>
            <li>Envie um e-mail para nosso suporte no endereço: <strong>help@minhaherancadigital.com</strong></li>
            <li>No assunto do e-mail, coloque: "Solicitação de Reembolso".</li>
            <li>No corpo do e-mail, por favor, informe seu <strong>nome completo</strong> e o <strong>e-mail</strong> que você utilizou para se cadastrar na plataforma. Isso é essencial para localizarmos sua conta rapidamente.</li>
          </ol>
          <p>Nossa equipe processará sua solicitação e responderá o mais breve possível.</p>


          <h2>3. PRAZOS E PROCESSAMENTO DO REEMBOLSO</h2>
          <p>Após a sua solicitação, nossa equipe tem até <strong>7 (sete) dias úteis</strong> para processar o reembolso.</p>
          <ul>
            <li><strong>Pagamentos com Cartão de Crédito:</strong> O estorno será solicitado à operadora do seu cartão. O valor pode aparecer na sua fatura atual ou na próxima, dependendo da data de fechamento e das políticas da operadora do cartão.</li>
            <li><strong>Pagamentos com PIX:</strong> O valor será estornado diretamente para a conta bancária da qual o PIX foi originado.</li>
          </ul>
           <p>Você receberá um email de confirmação assim que o processo de reembolso for concluído pela nossa equipe.</p>

          <h2>4. APÓS O PERÍODO DE 7 DIAS</h2>
          <p>
            Após o prazo legal de 7 dias para arrependimento, não haverá reembolso de valores já pagos, seja em planos mensais ou anuais.
          </p>
          <p>
            Você pode cancelar sua assinatura a qualquer momento para evitar cobranças futuras, mas não haverá reembolso proporcional pelo período restante do seu ciclo de faturamento (mês ou ano).
          </p>
          <p>
            <strong>Exemplo:</strong> Se você tem um plano anual e cancela no oitavo mês, seu acesso continuará ativo até o final do 12º mês, e não haverá cobrança de renovação. Nenhum valor será reembolsado pelos meses restantes.
          </p>

          <h2>5. EXCEÇÕES</h2>
          <p>
            Casos excepcionais, como cobranças indevidas ou falhas técnicas graves em nossa plataforma que impeçam o uso do serviço, serão analisados individualmente. Nestas situações, entre em contato com nosso suporte pelo email <strong>help@minhaherancadigital.com</strong>.
          </p>

           <h2>6. CONTATO</h2>
          <p>Para dúvidas sobre nossa política de reembolso, entre em contato conosco:</p>
          <ul>
              <li><strong>Email:</strong> help@minhaherancadigital.com</li>
              <li><strong>Assunto:</strong> Dúvida sobre Reembolso</li>
          </ul>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
