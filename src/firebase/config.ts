import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection: Client is offline or initializing.');
    }
  }
}
testFirestoreConnection();

/**
 * Signs in with Google popup, with automatic graceful fallback to anonymous guest auth
 * when third-party cookies or cross-origin iframe security policies block popups
 * (resolving `auth/network-request-failed` and `auth/popup-blocked`).
 */
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.warn('Google Sign-in popup encountered error/restriction:', err?.code, err?.message);
    
    // Check for iframe / cross-origin / network / popup restriction
    const isNetworkOrPopupError = 
      err?.code === 'auth/network-request-failed' ||
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.code === 'auth/unauthorized-domain' ||
      String(err?.message).includes('network-request-failed') ||
      String(err?.message).includes('Cross-Origin');

    if (isNetworkOrPopupError) {
      console.info('Switching to Firebase Anonymous Guest authentication for iframe compatibility...');
      try {
        const anonResult = await signInAnonymously(auth);
        return anonResult.user;
      } catch (anonErr) {
        console.error('Anonymous fallback failed:', anonErr);
        throw err;
      }
    }
    throw err;
  }
}

export async function loginAnonymously(): Promise<FirebaseUser | null> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

