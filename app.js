// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB6xxlmwTb0CWLYP_ONalRsHPEi2h0DnpQ",
  authDomain: "ibrahiminreality-messenger.firebaseapp.com",
  projectId: "ibrahiminreality-messenger",
  storageBucket: "ibrahiminreality-messenger.firebasestorage.app",
  messagingSenderId: "498261952449",
  appId: "1:498261952449:web:f72e1a212af2d2022d1140",
  measurementId: "G-BXGWWZHK6Y"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ================= UI Switch =================

window.showRegister = function () {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("resetBox").classList.add("hidden");
  document.getElementById("registerBox").classList.remove("hidden");
};

window.showLogin = function () {
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("resetBox").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
};

window.showReset = function () {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("resetBox").classList.remove("hidden");
};


// ================= Register =================

window.register = async function () {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!name || !email || !password) {
    alert("All fields required!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      createdAt: new Date()
    });

    alert("Registration successful!");
    showLogin();

  } catch (error) {
    alert(error.message);
  }
};


// ================= Login =================

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};


// ================= Reset Password =================

window.resetPassword = async function () {
  const email = document.getElementById("resetEmail").value;

  if (!email) {
    alert("Enter your email");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent!");
    showLogin();
  } catch (error) {
    alert(error.message);
  }
};


// ================= Logout =================

window.logout = async function () {
  await signOut(auth);
};


// ================= Auth State =================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("resetBox").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");

  } else {
    document.getElementById("homePage").classList.add("hidden");
    showLogin();
  }
});
