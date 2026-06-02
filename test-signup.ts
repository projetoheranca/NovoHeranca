import 'dotenv/config';
import { signupUser } from './src/lib/auth-actions';

function generateCPF() {
  const randomDigit = () => Math.floor(Math.random() * 10);
  const n = Array.from({length: 9}, randomDigit);
  const d1 = n.reduce((acc, val, i) => acc + val * (10 - i), 0) % 11;
  n.push(d1 < 2 ? 0 : 11 - d1);
  const d2 = n.reduce((acc, val, i) => acc + val * (11 - i), 0) % 11;
  n.push(d2 < 2 ? 0 : 11 - d2);
  return n.join('');
}

async function test() {
  try {
    const cpf = generateCPF();
    const email = `testebot${Date.now()}@gmail.com`;
    console.log(`Testing with email: ${email} and CPF: ${cpf}`);
    
    const result = await signupUser({
      name: "Teste Bot",
      email: email,
      cpf: cpf,
      password: "Password123!",
      method: "pix"
    });
    
    console.log("Result:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
