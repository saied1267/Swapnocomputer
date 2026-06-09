import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Live Firebase Configuration inlined for direct seamless deployment on GitHub, Netlify, and local machines
const firebaseConfig = {
  projectId: "gen-lang-client-0707601747",
  appId: "1:205694360485:web:c04737f00e45575761264c",
  apiKey: "AIzaSyAq_rd2h-FnlkGEYChvM1qcUBjLvrVIIAk",
  authDomain: "gen-lang-client-0707601747.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-06870833-0f71-4747-bd93-5ecb321388cf",
  storageBucket: "gen-lang-client-0707601747.firebasestorage.app",
  messagingSenderId: "205694360485",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  };
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error("Firestore Error Exception: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
