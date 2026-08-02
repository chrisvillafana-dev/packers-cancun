import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDyhRF2D4s-oyFlfBUCUXDYQAUdSnXsaBw",
  authDomain: "packers-cancun-cms.firebaseapp.com",
  projectId: "packers-cancun-cms",
  storageBucket: "packers-cancun-cms.firebasestorage.app",
  messagingSenderId: "424679948251",
  appId: "1:424679948251:web:63109e4854b5f32b3a71fe",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
