

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import 'firebase/auth'; // Importação crucial para a Identity Toolkit API

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDwDogUlAnEmfYwATHiVZkQ1sOwhFjvif8",
  authDomain: "studio-8232085638-4768f.firebaseapp.com",
  databaseURL: "https://studio-8232085638-4768f-default-rtdb.firebaseio.com",
  projectId: "studio-8232085638-4768f",
  storageBucket: "studio-8232085638-4768f.firebasestorage.app",
  messagingSenderId: "278456213375",
  appId: "1:278456213375:web:f2a2c4e9e1f2c669fc044a"
};


// --- Client-side Initialization ---
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Este código foi removido pois a abordagem correta é a importação da API
// if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
//   connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableAppCheck: true });
// }


// This export is now just for compatibility with existing imports, can be refactored
export { firebaseConfig, app as firebaseApp, auth, database, storage };
