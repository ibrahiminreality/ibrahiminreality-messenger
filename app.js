import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const messagesDiv = document.getElementById("messages");

window.register = async function () {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, emailVal, passVal);
};

window.login = async function () {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, emailVal, passVal);
};

window.logout = async function () {
  await signOut(auth);
};

window.sendMessage = async function () {
  const text = document.getElementById("messageInput").value;
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    text: text,
    uid: auth.currentUser.uid,
    createdAt: new Date()
  });

  document.getElementById("messageInput").value = "";
};

onAuthStateChanged(auth, user => {
  if (user) {
    authSection.style.display = "none";
    chatSection.style.display = "block";

    const q = query(collection(db, "messages"), orderBy("createdAt"));
    onSnapshot(q, snapshot => {
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        messagesDiv.innerHTML += `<div class="message">${msg.text}</div>`;
      });
    });

  } else {
    authSection.style.display = "block";
    chatSection.style.display = "none";
  }
});
