import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6xxlmwTb0CWLYP_ONalRsHPEi2h0DnpQ",
  authDomain: "ibrahiminreality-messenger.firebaseapp.com",
  projectId: "ibrahiminreality-messenger",
  storageBucket: "ibrahiminreality-messenger.firebasestorage.app",
  messagingSenderId: "498261952449",
  appId: "1:498261952449:web:f72e1a212af2d2022d1140",
  measurementId: "G-BXGWWZHK6Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ========= SHOW/HIDE ========= */

window.showRegister = () => {
  authContainer.classList.add("hidden");
  registerContainer.classList.remove("hidden");
};

window.showLogin = () => {
  registerContainer.classList.add("hidden");
  resetContainer.classList.add("hidden");
  authContainer.classList.remove("hidden");
};

window.showReset = () => {
  authContainer.classList.add("hidden");
  resetContainer.classList.remove("hidden");
};

/* ========= AUTH ========= */

window.login = async () => {
  await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
};

window.register = async () => {
  const userCred = await createUserWithEmailAndPassword(
    auth,
    registerEmail.value,
    registerPassword.value
  );

  await setDoc(doc(db, "users", userCred.user.uid), {
    name: registerName.value,
    email: registerEmail.value,
    online: true,
    lastSeen: serverTimestamp()
  });
};

window.resetPassword = async () => {
  await sendPasswordResetEmail(auth, resetEmail.value);
  alert("Reset link sent");
};

window.logout = async () => {
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });

  await signOut(auth);
};

/* ========= AUTH STATE ========= */

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await updateDoc(doc(db, "users", user.uid), {
      online: true
    });

    authContainer.classList.add("hidden");
    registerContainer.classList.add("hidden");
    resetContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");

    welcomeText.innerText = "Welcome " + user.email;
  } else {
    mainApp.classList.add("hidden");
    authContainer.classList.remove("hidden");
  }
});
