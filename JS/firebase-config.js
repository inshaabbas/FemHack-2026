import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRpfBoCwp87phavfxUSACXrTXu_YgSVww",
  authDomain: "hackathon-practice-80853.firebaseapp.com",
  projectId: "hackathon-practice-80853",
  storageBucket: "hackathon-practice-80853.firebasestorage.app",
  messagingSenderId: "257500784730",
  appId: "1:257500784730:web:e763425e314b3318dc5063"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };