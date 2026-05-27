
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
        // Carrega as credenciais dinamicamente para evitar erro de compilação quando o arquivo JSON não existe (ex: produção)
        let serviceAccount: ServiceAccount | null = null;

        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        } else {
            try {
                const fs = require('fs');
                const path = require('path');
                const credentialsPath = path.join(process.cwd(), 'minhaheranca.json');
                if (fs.existsSync(credentialsPath)) {
                    serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')) as ServiceAccount;
                }
            } catch (error) {
                console.warn('[FIREBASE_ADMIN] Não foi possível carregar as credenciais locais do arquivo minhaheranca.json:', error);
            }
        }

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
