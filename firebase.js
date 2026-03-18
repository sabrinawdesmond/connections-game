import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ─────────────────────────────────────────────
// Replace with your Firebase project config.
// Get it from: Firebase Console → Project Settings → Your apps
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "connections-game-d127a.firebaseapp.com",
  projectId: "connections-game-d127a",
  storageBucket: "connections-game-d127a.firebasestorage.app",
  messagingSenderId: "426763374385",
  appId: "1:426763374385:web:3e6f88cd87c241240caa10",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
