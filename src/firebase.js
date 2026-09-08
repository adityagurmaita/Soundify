import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFJFRSrCApTiucmdDnsXLPMIoXAwnRm6I",
  authDomain: "soundify-8660a.firebaseapp.com",
  projectId: "soundify-8660a",
  storageBucket: "soundify-8660a.firebasestorage.app",
  messagingSenderId: "484667755083",
  appId: "1:484667755083:web:eb6f3907166fb048705bce"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);