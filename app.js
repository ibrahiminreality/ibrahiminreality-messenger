import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

window.register = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Registered Successfully"))
    .catch(error => alert(error.message));
}

window.login = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .catch(error => alert(error.message));
}

window.logout = function() {
  signOut(auth);
}

window.sendMessage = async function() {
  const message = document.getElementById("messageInput").value;
  if(message.trim() === "") return;

  await addDoc(collection(db, "messages"), {
    text: message,
    createdAt: new Date()
  });

  document.getElementById("messageInput").value = "";
}

onAuthStateChanged(auth, user => {
  if(user){
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("chatSection").style.display = "block";
    document.getElementById("userStatus").innerText = "Online";

    const q = query(collection(db, "messages"), orderBy("createdAt"));
    onSnapshot(q, snapshot => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const div = document.createElement("div");
        div.className = "message";
        div.innerText = doc.data().text;
        chatBox.appendChild(div);
      });
    });

  } else {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
    document.getElementById("userStatus").innerText = "";
  }
});
