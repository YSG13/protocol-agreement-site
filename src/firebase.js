// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqB5VdFRdi--JmkvL322dHIpyMH1jTzg0",
  authDomain: "ysgs-a1e40.firebaseapp.com",
  projectId: "ysgs-a1e40",
  storageBucket: "ysgs-a1e40.firebasestorage.app",
  messagingSenderId: "373671553111",
  appId: "1:373671553111:web:9df9b58434cbcd25981b12"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
