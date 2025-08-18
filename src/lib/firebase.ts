// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "drink-it-digital-catalog",
  appId: "1:687895737933:web:c91cfc7a90ed10da928e04",
  storageBucket: "drink-it-digital-catalog.firebasestorage.app",
  apiKey: "AIzaSyBtM6OpoB2A6aL6SRP93i_Un56kHvhpgE8",
  authDomain: "drink-it-digital-catalog.firebaseapp.com",
  messagingSenderId: "687895737933",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
// The storage import and export have been removed to avoid needing the service.

export { app, db };
