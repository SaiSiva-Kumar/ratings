import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBXn7mEdLPlp65WjgLynXHUSBH2-tyUhmY",
  authDomain: "authentication-83b6b.firebaseapp.com",
  projectId: "authentication-83b6b",
  storageBucket: "authentication-83b6b.appspot.com",
  messagingSenderId: "404787359785",
  appId: "1:404787359785:web:b21a8bb9ad479dc99f6c38",
  measurementId: "G-4DS1W0047B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();