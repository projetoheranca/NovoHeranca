import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function TermsOfUsePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 md:px-6 py-20 md:py-24 lg:py-28">
        <article className="prose dark:prose-invert max-w-none mx-auto">
            <h1>TERMOS DE USO</h1>
            <p className="text-sm text-muted-foreground">Última atualização: 19 de Janeiro de 2026</p>

            <h2>1. ACEITAÇÃO DOS TERMOS</h2>
            <p>Ao acessar e utilizar a plataforma Minha Herança Digital (doravante denominada "Plataforma", "Serviço" ou "Sistema"), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui estabelecida, você não deverá utilizar nossos serviços.</p>
            <p>Estes Termos de Uso constituem um acordo juridicamente vinculante entre você ("Usuário", "Você" ou "Cliente") e a Minha Herança Digital ("Empresa", "Nós" ou "Nosso"), empresa devidamente registrada no Brasil sob CNPJ 51.144.507/0001-50.</p>

            <h2>2. DESCRIÇÃO DO SERVIÇO</h2>
            <p>A Minha Herança Digital é uma plataforma web que permite aos usuários armazenar, organizar e transmitir informações vitais, senhas, dados financeiros, histórias pessoais, vídeos, mensagens e outros conteúdos digitais para herdeiros designados, mediante sistema automatizado de entrega pós-falecimento (Dead Man's Switch) ou acionamento manual em vida.</p>
            <h3>2.1 Funcionalidades Principais</h3>
            <p>O Serviço oferece as seguintes funcionalidades:</p>
            <h4>a) Armazenamento Seguro de Informações:</h4>
            <ul>
                <li>Senhas de bancos, corretoras e contas digitais</li>
                <li>Códigos de criptomoedas (seed phrases, chaves privadas)</li>
                <li>Localização de valores físicos (joias, dinheiro, documentos)</li>
                <li>Informações sobre investimentos, ações e seguros</li>
                <li>PIN de cofres físicos e digitais</li>
                <li>Acesso a contas importantes (Gmail, redes sociais, serviços)</li>
            </ul>
            <h4>b) Conteúdo Emocional e Histórico:</h4>
            <ul>
                <li>Gravação e armazenamento de vídeos ilimitados</li>
                <li>Histórias de família e memórias pessoais</li>
                <li>Conselhos e sabedoria de vida</li>
                <li>Mensagens de amor e despedida</li>
                <li>Cartas para ocasiões especiais (aniversários, casamentos)</li>
                <li>Receitas e tradições familiares</li>
            </ul>
            <h4>c) Sistema de Entrega (Dead Man's Switch e Envio Manual):</h4>
            <ul>
                <li>Monitoramento automático de inatividade do usuário (Dead Man's Switch)</li>
                <li>Períodos configuráveis: 7, 15, 30, 60 ou 90 dias</li>
                <li>Tentativas de contato com o usuário antes do envio</li>
                <li>Recurso "Enviar Agora": Permite o disparo imediato e voluntário das informações em vida.</li>
                <li>Entrega automática de informações aos herdeiros após confirmação</li>
                <li>Páginas personalizadas e seguras para cada herdeiro</li>
            </ul>
            <h4>d) Segurança e Criptografia:</h4>
            <ul>
                <li>Criptografia de ponta-a-ponta de todos os dados sensíveis</li>
                <li>Sistema zero-knowledge: a empresa não tem acesso ao conteúdo armazenado</li>
                <li>Autenticação de dois fatores (2FA)</li>
                <li>Backup criptografado com recuperação apenas pelo usuário</li>
            </ul>

            <h2>3. CADASTRO E CONTA DO USUÁRIO</h2>
            <h3>3.1 Requisitos para Cadastro</h3>
            <p>Para utilizar o Serviço, você deve:</p>
            <ul>
                <li>Ter no mínimo 18 anos de idade</li>
                <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
                <li>Manter a confidencialidade de sua senha e credenciais de acesso</li>
                <li>Notificar imediatamente a Empresa sobre qualquer uso não autorizado de sua conta</li>
            </ul>
            <h3>3.2 Dados Coletados no Cadastro</h3>
            <p>Durante o cadastro, coletamos os seguintes dados pessoais:</p>
            <ul>
                <li>Nome completo (obrigatório)</li>
                <li>Email (obrigatório)</li>
                <li>Telefone (opcional, mas recomendado para 2FA e Dead Man's Switch)</li>
                <li>Senha (criptografada, nunca armazenada em texto puro)</li>
            </ul>
            <p><strong>Importante:</strong> Não solicitamos CPF diretamente no cadastro. O CPF pode ser solicitado pelo processador de pagamentos (Stripe) durante a transação financeira, conforme exigências legais e regulatórias.</p>
            <h3>3.3 Responsabilidade do Usuário</h3>
            <p>Você é integralmente responsável por:</p>
            <ul>
                <li>Manter suas credenciais de acesso em segurança</li>
                <li>Todas as atividades realizadas em sua conta</li>
                <li>A veracidade e legalidade das informações armazenadas</li>
                <li>Atualizar seus dados cadastrais quando necessário</li>
                <li>Realizar check-ins periódicos para evitar ativação indevida do Dead Man's Switch</li>
            </ul>

            <h2>4. PLANOS E PAGAMENTOS</h2>
            <h3>4.1 Modelo de Assinatura</h3>
            <p>A Minha Herança Digital opera sob modelo de assinatura paga. Não existe plano gratuito permanente.</p>
            <p>Planos disponíveis:</p>
            <ul>
                <li>Plano Mensal: R$ 24,90 por mês</li>
                <li>Plano Anual: R$ 209,30 por ano (equivalente a R$ 17,44/mês - economia de 30%)</li>
            </ul>
            <h3>4.2 Período de Teste Gratuito e Regras de Pagamento</h3>
            <h4>A) Pagamento via Cartão de Crédito (Com Teste Grátis):</h4>
            <ul>
                <li><strong>Duração do Teste:</strong> 30 dias corridos a partir da data de cadastro.</li>
                <li><strong>Cobrança:</strong> Não há cobrança durante o período de teste. A primeira cobrança ocorre automaticamente no 31º dia, salvo cancelamento prévio.</li>
                <li><strong>Cancelamento:</strong> O usuário pode cancelar gratuitamente a qualquer momento dentro dos 30 dias através do painel.</li>
            </ul>
            <h4>B) Pagamento via PIX (Sem Teste Grátis):</h4>
            <ul>
                <li><strong>Duração do Teste:</strong> NÃO APLICÁVEL. O pagamento via PIX não contempla período de teste gratuito.</li>
                <li><strong>Cobrança:</strong> O pagamento é imediato e único para o período contratado (mensal ou anual).</li>
                <li><strong>Acesso:</strong> O acesso total à plataforma é liberado imediatamente após a confirmação bancária do PIX.</li>
                <li><strong>Renovação:</strong> A renovação via PIX pode ser manual ou automática (se configurada no banco do usuário), dependendo da disponibilidade do sistema.</li>
            </ul>
            <h3>4.3 Formas de Pagamento</h3>
            <p>Aceitamos as seguintes formas de pagamento:</p>
            <ul>
                <li>Cartão de Crédito: processado via Stripe (com teste gratuito de 30 dias)</li>
                <li>PIX: pagamento imediato, processado via Stripe ou parceiro autorizado (sem teste gratuito)</li>
            </ul>
            <h3>4.4 Renovação Automática</h3>
            <p>Ao contratar um plano pago (mensal ou anual) via cartão de crédito, você autoriza a renovação automática da assinatura ao final de cada período, salvo cancelamento prévio. Você será notificado por email antes de cada renovação anual.</p>
            <h3>4.5 Direito de Arrependimento e Reembolso</h3>
            <p>Conforme o Código de Defesa do Consumidor (CDC), você possui 7 dias corridos a partir do primeiro pagamento efetivo para solicitar reembolso, sem necessidade de justificativa.</p>
            <p>Como funciona o reembolso:</p>
            <ul>
                <li>Prazo para solicitação: até 7 dias corridos após o primeiro pagamento.</li>
                <li>Reembolso integral do valor pago.</li>
                <li>Processamento: até 7 dias úteis após solicitação.</li>
                <li>Forma de reembolso: mesma forma de pagamento utilizada (estorno no cartão ou devolução via PIX).</li>
            </ul>
            <p>Após o reembolso, sua conta será encerrada e os dados mantidos conforme Política de Privacidade.</p>
            <p><strong>Observação:</strong> O direito de arrependimento aplica-se apenas ao primeiro pagamento. Renovações subsequentes não estão sujeitas a reembolso, salvo cancelamento antecipado comunicado antes da cobrança.</p>

            <h2>5. CANCELAMENTO E SUSPENSÃO</h2>
            <h3>5.1 Cancelamento pelo Usuário</h3>
            <p>Você pode cancelar sua assinatura a qualquer momento através da Plataforma, sem necessidade de contato com suporte.</p>
            <p><strong>Após o cancelamento:</strong> O acesso à conta será mantido até o final do período já pago.</p>
            <p><strong>Retenção de Dados:</strong> Seus dados serão mantidos criptografados por 6 meses em nossos servidores para facilitar uma eventual reativação. Após este período, serão permanentemente excluídos.</p>
            <h3>5.2 Suspensão por Falta de Pagamento</h3>
            <p>Caso o pagamento da renovação não seja aprovado:</p>
            <ul>
                <li>A conta será bloqueada temporariamente.</li>
                <li>Você receberá notificações por email para regularização.</li>
                <li>Após 6 meses de inadimplência, a conta e todos os dados associados serão permanentemente excluídos.</li>
            </ul>
            <h3>5.3 Suspensão ou Encerramento pela Empresa</h3>
            <p>Reservamo-nos o direito de suspender ou encerrar sua conta, sem aviso prévio e sem reembolso, nas seguintes situações:</p>
            <ul>
                <li>Violação destes Termos de Uso.</li>
                <li>Uso indevido, fraudulento ou ilegal da Plataforma.</li>
                <li>Tentativa de burlar sistemas de segurança ou engenharia reversa.</li>
            </ul>

            <h2>6. SISTEMA DE ENTREGA (DEAD MAN'S SWITCH E ENVIO MANUAL)</h2>
            <h3>6.1 Funcionamento do Dead Man's Switch (Automático)</h3>
            <p>O Dead Man's Switch monitora sua atividade na Plataforma e, em caso de inatividade prolongada, inicia o processo de entrega.</p>
            <ul>
                <li><strong>Detecção:</strong> O sistema identifica falta de login/check-in pelo período configurado (7 a 90 dias).</li>
                <li><strong>Verificação:</strong> O sistema envia múltiplos alertas (email/SMS) para o usuário antes de disparar o legado.</li>
                <li><strong>Entrega:</strong> Se não houver resposta aos alertas, o sistema considera o evento confirmado e libera o acesso aos herdeiros.</li>
            </ul>
            <h3>6.2 Recurso "Enviar Agora" (Manual)</h3>
            <p>A Plataforma oferece um recurso de disparo imediato ("Enviar Agora" ou "Liberar Legado"), que permite ao usuário enviar voluntariamente as informações aos herdeiros em vida.</p>
            <ul>
                <li><strong>Irreversibilidade:</strong> Ao confirmar o acionamento do recurso "Enviar Agora", os emails com as chaves de acesso são disparados imediatamente para os herdeiros cadastrados.</li>
                <li><strong>Isenção de Responsabilidade:</strong> A Minha Herança Digital não se responsabiliza por acionamentos acidentais ou por arrependimento posterior ao uso desta função. O usuário reconhece que, uma vez enviados, os emails não podem ser "recuperados" das caixas de entrada dos herdeiros.</li>
            </ul>
            <h3>6.3 Cadastro e Acesso dos Herdeiros</h3>
            <ul>
                <li><strong>Quantidade:</strong> Ilimitada.</li>
                <li><strong>Personalização:</strong> Você define exatamente qual herdeiro recebe qual informação (ex: Filho A recebe senhas, Filho B recebe vídeos).</li>
                <li><strong>Acesso:</strong> Herdeiros recebem um link seguro e uma chave de acesso. Eles não precisam criar conta na plataforma para visualizar o legado deixado para eles.</li>
            </ul>

            <h2>7. SEGURANÇA E CRIPTOGRAFIA</h2>
            <h3>7.1 Criptografia de Ponta-a-Ponta</h3>
            <p>Todos os dados sensíveis (senhas, documentos, mensagens) são criptografados no seu dispositivo antes de serem enviados aos nossos servidores. Apenas você possui a chave de descriptografia (sua senha mestra).</p>
            <h3>7.2 Sistema Zero-Knowledge</h3>
            <p>A Minha Herança Digital opera sob princípio zero-knowledge:</p>
            <ul>
                <li>Não temos acesso ao conteúdo das suas senhas, vídeos ou mensagens.</li>
                <li>Não podemos recuperar seus dados se você perder sua senha mestra.</li>
                <li>Não podemos fornecer seus dados a terceiros ou governos, pois tecnicamente não temos acesso a eles.</li>
            </ul>
            <p><strong>Exceção:</strong> Dados cadastrais básicos (Nome, Email, Telefone) e metadados de pagamento não são criptografados de ponta-a-ponta para permitir o funcionamento do sistema de notificação e cobrança.</p>
            
            <h2>8. LIMITAÇÃO DE RESPONSABILIDADE</h2>
            <p>A Minha Herança Digital fornece a plataforma "como está". Embora utilizemos as melhores práticas de segurança do mercado (criptografia AES-256, SSL/TLS), não garantimos que o serviço será ininterrupto ou livre de erros.</p>
            <p>Em nenhuma circunstância a Empresa será responsável por:</p>
            <ul>
                <li>Perda de senha mestra pelo usuário (o que torna os dados irrecuperáveis).</li>
                <li>Falha na entrega de emails aos herdeiros devido a filtros de spam, caixas cheias ou endereços incorretos fornecidos pelo usuário.</li>
                <li>Consequências do acesso dos herdeiros às informações deixadas pelo usuário.</li>
            </ul>
            
            <h2>9. DISPOSIÇÕES GERAIS</h2>
            <p><strong>Alterações:</strong> Podemos atualizar estes termos a qualquer momento. Alterações significativas serão notificadas por email.</p>
            <p><strong>Foro:</strong> Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas deste contrato.</p>
            <p><strong>Contato:</strong> Dúvidas podem ser enviadas para help@minhaherancadigital.com.</p>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
