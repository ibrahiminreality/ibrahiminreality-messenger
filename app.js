import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

window.register = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, email, password);
};

window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, password);
};

window.logout = async function() {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
    loadMessages();
  } else {
    document.getElementById("authScreen").classList.remove("hidden");
    document.getElementById("mainApp").classList.add("hidden");
  }
});

window.sendMessage = async function() {
  const text = document.getElementById("messageInput").value;
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    text: text,
    createdAt: new Date()
  });

  document.getElementById("messageInput").value = "";
};

function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  onSnapshot(q, (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = document.createElement("div");
      msg.className = "message";
      msg.textContent = doc.data().text;
      messagesDiv.appendChild(msg);
    });
  });
}
