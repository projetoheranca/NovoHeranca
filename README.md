
# Minha Herança Digital - Guia de Testes

Este projeto possui rotas de API protegidas que permitem testar as funcionalidades principais (Pagamentos, Inatividade e Segurança) via terminal.

## 🛠️ Comandos de Teste (Terminal)

Certifique-se de que o servidor está rodando (`npm run dev`). O token de autorização padrão é `150973`.

### 1. Testar Sistema Anti-Fraude (Bônus de 14 dias)
Simula a tentativa de usar o mesmo cartão em contas diferentes.

**Passo A: Registrar o cartão pela primeira vez (Sucesso)**
```bash
curl -X POST "http://localhost:9002/api/test-anti-fraud" \
-H "Authorization: Bearer 150973" \
-H "Content-Type: application/json" \
-d '{"userId": "USUARIO_UM", "fingerprint": "CARTAO_X_123", "isTrial": true}'
```

**Passo B: Tentar usar o MESMO cartão em outra conta (Bloqueio)**
*Troque `USUARIO_DOIS` pelo ID de outro usuário cadastrado.*
```bash
curl -X POST "http://localhost:9002/api/test-anti-fraud" \
-H "Authorization: Bearer 150973" \
-H "Content-Type: application/json" \
-d '{"userId": "USUARIO_DOIS", "fingerprint": "CARTAO_X_123", "isTrial": true}'
```

---

### 2. Simular Verificação de Inatividade (Cron Job)
Varre todos os usuários, dispara alertas de check-in e processa a entrega de herança.
```bash
curl -X GET "http://localhost:9002/api/trigger-daily-check" -H "Authorization: Bearer 150973"
```

### 3. Ativar uma Assinatura Manualmente
Útil para testar o acesso ao dashboard sem passar o cartão.
```bash
curl -X POST "http://localhost:9002/api/manual-activation" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 150973" \
-d '{"userId": "ID_DO_USUARIO", "priceId": "INSIRA_O_PRICE_ID_DO_STRIPE_AQUI"}'
```

### 4. Limpeza de Tokens de Segurança
Remove links de download expirados ou já utilizados.
```bash
curl -X GET "http://localhost:9002/api/cleanup-tokens" -H "Authorization: Bearer 150973"
```

---

## 🔒 Variáveis de Ambiente Necessárias
- `RESEND_API_KEY`: Para envio de e-mails.
- `STRIPE_SECRET_KEY`: Para comunicação com o Stripe.
- `CRON_SECRET`: Definido como `150973`.
