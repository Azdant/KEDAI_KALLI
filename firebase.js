import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHgrOEQaGOHqaK_qNQ0oXsE5fbBDHdoJE",
  authDomain: "kedai-kalli-1.firebaseapp.com",
  projectId: "kedai-kalli-1",
  storageBucket: "kedai-kalli-1.firebasestorage.app",
  messagingSenderId: "407723092078",
  appId: "1:407723092078:web:a5b48f707e3422fd2cde7f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

window.db = db;
window.auth = auth;
