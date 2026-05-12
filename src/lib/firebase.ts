import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDm2ibTrN8FhRR-jfa5a8t_jnKO6rTClvA",
  authDomain: "anas-online-shop.firebaseapp.com",
  projectId: "anas-online-shop",
  storageBucket: "anas-online-shop.firebasestorage.app",
  messagingSenderId: "1090209762264",
  appId: "1:1090209762264:web:48fb865ad09962cd02c0ad"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Error Handling
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'anonymous-or-local-login', // Default since real Firebase Auth isn't used yet
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
