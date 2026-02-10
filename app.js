import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const resetBox = document.getElementById("resetBox");
const homeBox = document.getElementById("homeBox");
const userName = document.getElementById("userName");

function show(box){
  loginBox.classList.add("hidden");
  registerBox.classList.add("hidden");
  resetBox.classList.add("hidden");
  homeBox.classList.add("hidden");
  box.classList.remove("hidden");
}

document.getElementById("goRegister").onclick = () => show(registerBox);
document.getElementById("goReset").onclick = () => show(resetBox);
document.getElementById("backLogin1").onclick = () => show(loginBox);
document.getElementById("backLogin2").onclick = () => show(loginBox);

document.getElementById("registerBtn").onclick = async () => {
  const email = registerEmail.value;
  const pass = registerPassword.value;
  await createUserWithEmailAndPassword(auth, email, pass);
  alert("Registered Successfully");
  show(loginBox);
};

document.getElementById("loginBtn").onclick = async () => {
  const email = loginEmail.value;
  const pass = loginPassword.value;
  await signInWithEmailAndPassword(auth, email, pass);
};

document.getElementById("resetBtn").onclick = async () => {
  const email = resetEmail.value;
  await sendPasswordResetEmail(auth, email);
  alert("Reset Link Sent");
};

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, user => {
  if(user){
    userName.innerText = user.email;
    show(homeBox);
  } else {
    show(loginBox);
  }
});
