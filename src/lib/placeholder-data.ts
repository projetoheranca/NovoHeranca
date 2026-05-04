
import type { SubscriptionPlan } from "@/lib/types";

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: "Teste",
    priceMonthly: "R$0,00",
    priceYearly: "N/A",
    discount: "Plano de Cortesia",
    storage: "1 GB",
    features: [
      "Exclusivo para testes e suporte",
      "Espaço de 1 GB",
      "Monitoramento de inatividade ativo",
      "Entrega automática habilitada",
    ],
  },
  {
    name: "Mensal",
    priceMonthly: "R$24,90",
    priceYearly: "N/A",
    discount: "",
    storage: "50 GB",
    features: [
      "14 dias de teste gratuito",
      "Cancele quando quiser",
      "Memórias ilimitadas",
      "Guardiões ilimitados",
      "Limite de 50 GB de armazenamento",
      "Confirmação dupla por e-mail",
      "Suporte prioritário",
      "Interface camuflada de calculadora",
      "Entrega por Inatividade (Dead Man's Switch)",
    ],
  },
  {
    name: "Anual",
    priceMonthly: "N/A",
    priceYearly: "R$209,30",
    discount: "Economize 30%!",
    storage: "100 GB",
    features: [
      "Armazenamento de 100 GB",
      "Sessão de planejamento de legado",
      "Acesso antecipado a novos recursos",
      "Todos os recursos do plano Mensal",
    ],
  },
];
