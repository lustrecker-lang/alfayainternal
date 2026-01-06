import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your actual Firebase configuration
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-project.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-project.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'mock-app-id',
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const db = getFirestore(app);

// Debug logging
if (!db) {
    console.error('[Firebase] Failed to initialize Firestore db', { app });
}

export const storage = getStorage(app);

export default app;

/*
 * IMPORTANT: To connect to your Firebase project:
 * 
 * 1. Create a .env.local file in the project root
 * 2. Add your Firebase configuration:
 * 
 * NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 * NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
 * 
 * 3. Restart the dev server
 * 
 * FIRESTORE SECURITY RULES:
 * Copy these rules to Firebase Console > Firestore Database > Rules
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /general_ledger/{transaction} {
 *       allow read, write: if true; // TODO: Add authentication rules
 *     }
 *   }
 * }
 * 
 * STORAGE SECURITY RULES:
 * Copy these rules to Firebase Console > Storage > Rules
 * 
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     match /transaction_proofs/{allPaths=**} {
 *       allow read, write: if true; // TODO: Add authentication rules
 *     }
 *   }
 * }
 */
