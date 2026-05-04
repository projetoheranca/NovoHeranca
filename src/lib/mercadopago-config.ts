
import 'dotenv/config';
import { MercadoPagoConfig } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn("[MERCADOPAGO_CONFIG] O Access Token do Mercado Pago não foi encontrado no ambiente. A API de faturamento do PIX não funcionará.");
}

// Inicializa e exporta o cliente do Mercado Pago.
// Garante que o cliente seja um singleton, inicializado apenas uma vez.
export const mercadopagoClient = accessToken 
  ? new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } })
  : null;
