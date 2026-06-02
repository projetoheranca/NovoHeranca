import { signupUser } from './lib/auth-actions';

async function run() {
  console.log("Iniciando teste de signupUser...");
  try {
    const result = await signupUser({
      name: "Teste AI Agent",
      email: `ai_agent_test_${Date.now()}@example.com`,
      phone: "11999999999",
      password: "password123",
      cpf: "11144477735", // Vamos usar um CPF válido para o teste
    });
    console.log("Resultado do cadastro:", result);
    process.exit(0);
  } catch (error) {
    console.error("Erro capturado no teste:", error);
    process.exit(1);
  }
}

run();
