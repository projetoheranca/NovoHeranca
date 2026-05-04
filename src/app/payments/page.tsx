
"use client";

import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CurlRequest = `curl -X POST \\
    'https://api.mercadopago.com/v1/payments'\\
    -H 'Content-Type: application/json' \\
    -H 'X-Idempotency-Key: 0d5020ed-1af6-469c-ae06-c3bec19954bb' \\
    -H 'Authorization: Bearer APP_USR-7*********288159-03*********c8c9b4b93*********2d0fd9b22*********691' \\
    -d '{
  "additional_info": {
    "items": [
      {
        "id": "MLB2907679857",
        "title": "Point Mini",
        "description": "Point product for card payments via Bluetooth.",
        "picture_url": "https://http2.mlstatic.com/resources/frontend/statics/growth-sellers-landings/device-mlb-point-i_medium2x.png",
        "category_id": "electronics",
        "quantity": 1,
        "unit_price": 58,
        "type": "electronics"
      }
    ]
  },
  "description": "Payment for product",
  "external_reference": "MP0001",
  "installments": 1,
  "payer": {
    "email": "test_user_123@testuser.com",
    "identification": { "type": "CPF", "number": "95749019047" }
  },
  "payment_method_id": "master",
  "token": "ff8080814c11e237014c1ff593b57b4d",
  "transaction_amount": 58
}'`;

const JsonResponse = `{
  "id": 20359978,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 58,
  "installments": 1,
  "description": "Point Mini a maquininha que dá o dinheiro de suas vendas na hora.",
  "payer": {
    "id": 123,
    "email": "test_user_123@testuser.com"
  },
  "point_of_interaction": {
    "type": "PIX",
    "transaction_data": {
      "qr_code_base64": "iVBORw0KGgo...",
      "qr_code": "00020126600014br.gov.bcb.pix...",
      "ticket_url": "https://www.mercadopago.com.br/payments/123456789/ticket"
    }
  }
}`;

const comparisonOptions = [
  {
    type: "Integração intermediária",
    title: "Checkout Bricks",
    features: [
      "Checkout modular e flexível",
      "Integre apenas os bricks que precisar",
      "Aceita cartões e outros meios de pagamento",
      "Aceita pagamentos recorrentes"
    ],
    isRecommended: false,
  },
  {
    type: "Integração avançada",
    title: "Checkout API",
    features: [
      "Experiência personalizável",
      "Seus clientes pagam dentro da sua loja",
      "Aceita cartões e outros meios de pagamento",
      "Aceita pagamentos recorrentes"
    ],
    isRecommended: true,
  }
];

export default function PaymentsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="container mx-auto px-4 md:px-6 py-20 md:py-24 lg:py-28">

        {/* Section: Comparison */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-glow">Qual o melhor para o seu projeto?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
              O Mercado Pago oferece diferentes formas de integração, cada uma com um nível de personalização. Para nosso projeto, o <strong>Checkout API</strong> é a escolha ideal.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {comparisonOptions.map((option) => (
              <Card key={option.title} className={cn("flex flex-col", option.isRecommended && "border-2 border-primary shadow-lg")}>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-4">{option.type}</Badge>
                  <CardTitle>{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section: API Documentation */}
        <article className="prose dark:prose-invert max-w-none mx-auto space-y-8">
          
          <div>
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">POST</Badge>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">Criar Pagamento via API</h1>
              <p className="font-mono bg-muted p-2 rounded-md text-sm">/v1/payments</p>
            </div>
            <p className="text-muted-foreground">
              Este endpoint permite a criação de um pagamento, possibilitando a inclusão de todas as informações necessárias. Certifique-se de adicionar os detalhes do pagamento e as informações do cliente. Em caso de sucesso, a requisição retornará uma resposta com o status <Badge variant="default" className="bg-green-500/20 text-green-300">201</Badge>.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Headers da Requisição</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parâmetro</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Exemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Content-Type</TableCell>
                    <TableCell>Define o tipo de conteúdo da requisição.</TableCell>
                    <TableCell><code className="text-sm">application/json</code></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-semibold">X-Idempotency-Key</TableCell>
                    <TableCell>Chave única para evitar processamentos duplicados da mesma requisição. Útil para prevenir a criação de dois pagamentos idênticos.</TableCell>
                    <TableCell><code className="text-sm">0d5020ed-1af6-469c-ae06-c3bec19954bb</code></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-semibold">Authorization</TableCell>
                    <TableCell>Credencial de acesso (Access Token) para autenticar a requisição na API do Mercado Pago.</TableCell>
                    <TableCell><code className="text-sm">Bearer APP_USR-7...</code></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Corpo (Body) da Requisição</CardTitle>
                 <p className="text-muted-foreground pt-2">
                    Principais atributos. Consulte a documentação oficial para a lista completa.
                </p>
            </CardHeader>
             <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parâmetro</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">transaction_amount</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Valor total a ser pago.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">description</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Descrição do produto ou serviço.</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-semibold">payment_method_id</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>ID do método de pagamento (ex: 'master', 'pix').</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">payer.email</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>E-mail do pagador.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">payer.identification</TableCell>
                    <TableCell>Sim</TableCell>
                    <TableCell>Documento (CPF/CNPJ) do pagador.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">token</TableCell>
                    <TableCell>Condicional</TableCell>
                    <TableCell>Token do cartão gerado no frontend (obrigatório para pagamentos com cartão).</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
           <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Exemplo de Requisição (cURL)</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto"><code>{CurlRequest}</code></pre>
            </div>
            <div className="space-y-4">
               <h3 className="text-xl font-semibold">Exemplo de Resposta (JSON)</h3>
               <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto"><code>{JsonResponse}</code></pre>
            </div>
           </div>

        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
