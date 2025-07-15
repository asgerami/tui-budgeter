import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

const app: App =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export async function verifyIdToken(idToken: string) {
  return getAuth(app).verifyIdToken(idToken);
}
