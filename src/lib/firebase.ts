import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKG9PJIjx9G-4mxwsQu2gwGyV4oGedItM",
  authDomain: "finanzas-club-jb.firebaseapp.com",
  projectId: "finanzas-club-jb",
  storageBucket: "finanzas-club-jb.firebasestorage.app",
  messagingSenderId: "900869725908",
  appId: "1:900869725908:web:50411a5b41f05d2679e541"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
