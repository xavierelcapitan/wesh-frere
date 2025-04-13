// Ce fichier permet d'éviter les erreurs du linter concernant les imports Firebase
declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export class FirebaseApp {
    name: string;
    options: FirebaseOptions;
  }

  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
    photoURL: string | null;
    phoneNumber: string | null;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  }

  export interface Auth {
    app: any;
    currentUser: User | null;
  }

  export interface UserCredential {
    user: User;
  }

  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function updateProfile(user: User, profile: { displayName?: string, photoURL?: string }): Promise<void>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: ((user: User | null) => void), error?: (error: Error) => void, completed?: () => void): () => void;
}

declare module 'firebase/firestore' {
  export type Timestamp = {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
    valueOf(): string;
  };

  export function Timestamp(seconds: number, nanoseconds: number): Timestamp;
  export namespace Timestamp {
    function now(): Timestamp;
    function fromDate(date: Date): Timestamp;
    function fromMillis(milliseconds: number): Timestamp;
  }

  export type DocumentData = {
    [field: string]: any;
  };

  export interface QueryDocumentSnapshot {
    id: string;
    exists(): boolean;
    data(): DocumentData;
    get(fieldPath: string): any;
  }

  export interface DocumentReference {
    id: string;
    path: string;
    parent: CollectionReference;
    collection(collectionPath: string): CollectionReference;
  }

  export interface CollectionReference {
    id: string;
    path: string;
    doc(documentPath?: string): DocumentReference;
    parent: DocumentReference | null;
  }

  export interface QuerySnapshot {
    docs: QueryDocumentSnapshot[];
    empty: boolean;
    size: number;
  }

  export interface Firestore {
    app: any;
  }

  export function getFirestore(app?: any): Firestore;
  export function collection(firestore: Firestore, path: string): CollectionReference;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function doc(reference: CollectionReference, path?: string): DocumentReference;
  export function getDoc(reference: DocumentReference): Promise<QueryDocumentSnapshot>;
  export function getDocs(query: any): Promise<QuerySnapshot>;
  export function setDoc(reference: DocumentReference, data: any): Promise<void>;
  export function updateDoc(reference: DocumentReference, data: any): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function query(reference: CollectionReference, ...queryConstraints: any[]): any;
  export function where(fieldPath: string, opStr: string, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): any;
  export function limit(n: number): any;
  export function increment(n: number): any;
} 