
'use server';

import 'dotenv/config'; // Mantido para possível uso em desenvolvimento local
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Importa diretamente o arquivo de credenciais JSON.
// Isso torna a inicialização independente das variáveis de ambiente no servidor.
import serviceAccountCredentials from '../../minhaheranca.json';

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
        // Usa as credenciais importadas diretamente do arquivo JSON.
        const serviceAccount = serviceAccountCredentials as ServiceAccount;

        // Define as URLs do banco de dados e storage para garantir que sejam encontradas no ambiente de produção.
        const databaseURL = "https://studio-8232085638-4768f-default-rtdb.firebaseio.com";
        const storageBucket = "studio-8232085638-4768f.appspot.com";

        if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
            console.error('[FATAL_ERROR] O arquivo de credenciais do Firebase Admin (minhaheranca.json) está incompleto ou inválido.');
            throw new Error('Configuração do servidor Firebase incompleta.');
        }

        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
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
