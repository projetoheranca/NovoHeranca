import 'dotenv/config';
import { getAdminServices } from './src/lib/firebase-admin';

async function verify() {
  const { db, auth } = await getAdminServices();
  const uid = 'cM9xIbpVDoXSYSdvRsHxNOf7poK2';
  console.log("Checking DB...");
  const snap = await db.ref(`users/${uid}/document`).get();
  console.log("DB Data:", snap.val());
  
  console.log("Checking Auth...");
  const user = await auth.getUser(uid);
  console.log("Auth User:", user.email);
}
verify();
