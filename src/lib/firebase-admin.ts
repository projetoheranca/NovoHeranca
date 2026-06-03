
'use server';

import 'dotenv/config'; // Mantido para possível uso em desenvolvimento local
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// O nome ÚNICO e CONSISTENTE para o app do Firebase Admin no servidor.
const ADMIN_APP_NAME = 'firebase-admin-heranca-digital-main-app';

/**
 * Garante que o Firebase Admin SDK seja inicializado apenas uma vez (singleton) e retorna os serviços.
 * Esta é a ÚNICA função que deve inicializar o admin no projeto.
 * @returns Um objeto contendo os serviços de database, auth e storage do admin.
 */
export async function getAdminServices() {
    const getExistingApp = () => {
        try {
            return admin.app(ADMIN_APP_NAME);
        } catch (error) {
            return null;
        }
    };

    let app = getExistingApp();

    if (!app) {
        // Define as credenciais do admin diretamente para garantir que o backend novoheranca consiga conectar no RTDB do projeto
        let serviceAccount: ServiceAccount = {
            projectId: "studio-8232085638-4768f",
            clientEmail: "firebase-adminsdk-fbsvc@studio-8232085638-4768f.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6wUJh/6hvKfn9\nTo72SeGiEH1wsCa6oo4q1NE6JRasqJW8wduzibPcXXPVYICERO+abXraSO7p+aoo\nf2bubAgc0xS/jBnE5victgJ2T1Q/GOMQp348dnGKb49/EcKFxMVWgIoe8nIUn++g\npqYd+5RSKtalbtdIuAQE4fUshNPw863ZcflLN5DbHJ2uEqhLJVJk4cCUCfMwym2+\neM72DBYI2NlZdJpQRsBfNYTC6k3PUxS7r2+WWQyHMeMWqxFpdHXUQDajluhTPt2g\nE0G0e0JxYuIkVHOwV9XVktcVVN8iK9FUXmdOKrX5Iri2tMo+OPaycMqO9GgH2aZC\nCUzvCNLFAgMBAAECggEAKLV1YLLPtrGmAHE2KRooQMFK8rw3KQJDrrL2y6+nfmn+\nP+fbGgsHhZ7qX8YaJZr4RsecGsaAq8iELrE80PaEGzJo6Ksjt9/oLBLhvQPkV5+3\naVs1YX0pGVXhp/+JUUr4ADfjQ8UyGGxXmgORnOII7hNP+D5N19hi6eSOYs6ue2xn\nIfnhow3AmTfc03R5zm9yezq8O/tEcem3qmJmoC3KlQ30IRyCCFpV1ovDelqOzrXi\nlhhfJu+yM6VngFvMDE6lyjohoCTe02L5J8TrShUL6/wxjGyvz/6uDvubHD3065aL\nc3OPuFMhqGUkugmSnThe+W7SGEBwKZGcewgQXHriYQKBgQDtNPiMcJpH3p2uPTqX\njNn1h/OzDmbYH0HGNJSd/lRhk5pB7v5jEiO1MF4QJPmSt89XWXN/LEuZC6EHfqL8\ndTKbd2YY1QzO8PFLeTxMVagKerUGB9TGzqvhKCx6ssKWGDCNjfxUKx9RuFEZNtfM\n8HhOKWgIPv6i7xRBmKIGfW4voQKBgQDJjQV1a727HnkHp2ek9NaTTh4OehMCGk6k\nRDQ2cNXopxH+jrdDPPcq8HOUB034TlwSuApE//k+bvh/62z6M8aGruit1WBAix+w\nyl3tEafdnXZrWjTUEJKluTzNhoEUSUw9ZmUHShOqnYyZATVmOpCm2rVE+7151TQV\nebH59xAgpQKBgQCfl30GGBhk9E0IVp+eKSDXxgFbXfwpulXpgaTf66ZgBAvMAnza\nsPCfTgxrNkVHxi1U6pT/YhD2xlEwFq6Xxk4nNRzW5jh43ripe8bq4NJvQoGarhgl\nLhWMJhhO8QhkLaA1DOtQwbaPp7/AhBqLAtseU1NwANoXS11IiOWyEh/ZIQKBgQCO\nxjgcsuLnX7HKyzqvbsVl+gtuo+k9LxeQY8Q84HeXZGpp0f1eQxywLT8imH4SLKgq\nlnan5FBSetfL/iDnqK+0jsjDA4k4j5U2blRU8JHien39lBwiMU9A2FSLHwHnNfks\n8ZEVtdLypMKJTILgVRJNMFcCc/YIDRDlOZzq/qpNBQKBgERO8/MrP1fE0W7EOfJo\nmKPwK0DRSxWx4R0L4lI7MMdEwdujKK9k9wnUIRRpYLVGC1AM2cBQlo3qBENsupDR\ndGdXfORWfsAkm7+zvhSD96pqcCnqF1HLCaKGtyRnar1UFt3OTEoczlJPf6TmOkBv\n0oE5u3iHR6nlnZw2kJjmjj+O\n-----END PRIVATE KEY-----\n"
        };

        // Define as URLs do banco de dados e storage para garantir que sejam encontradas no ambiente de produção.
        const databaseURL = "https://studio-8232085638-4768f-default-rtdb.firebaseio.com";
        const storageBucket = "studio-8232085638-4768f.appspot.com";

        let credential;
        if (serviceAccount && serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
            credential = admin.credential.cert(serviceAccount);
        } else if (serviceAccount && (serviceAccount as any).projectId && (serviceAccount as any).clientEmail && (serviceAccount as any).privateKey) {
            credential = admin.credential.cert(serviceAccount);
        } else {
            // Tenta usar as credenciais padrão do ambiente Google Cloud (App Hosting)
            try {
                credential = admin.credential.applicationDefault();
            } catch (e) {
                console.error('[FATAL_ERROR] Nenhuma credencial do Firebase Admin foi encontrada (minhaheranca.json ou variáveis de ambiente ausentes).');
                throw new Error('Configuração do servidor Firebase incompleta.');
            }
        }

        app = admin.initializeApp({
            credential: credential,
            databaseURL: databaseURL,
            storageBucket: storageBucket,
        }, ADMIN_APP_NAME);

        console.log(`[FIREBASE_ADMIN] SDK inicializado com sucesso para o app: ${ADMIN_APP_NAME}`);
    }

    return {
        db: admin.database(app),
        auth: admin.auth(app),
        storage: admin.storage(app),
    };
}
