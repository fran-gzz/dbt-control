import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function adminApp() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada en el entorno del servidor.")
  }
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    })
  }
  return getApps()[0]
}

export function adminDb() {
  return getFirestore(adminApp())
}

export function adminAuth() {
  return getAuth(adminApp())
}
