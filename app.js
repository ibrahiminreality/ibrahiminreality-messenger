import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6xxlmwTb0CWLYP_ONalRsHPEi2h0DnpQ",
  authDomain: "ibrahiminreality-messenger.firebaseapp.com",
  projectId: "ibrahiminreality-messenger",
  storageBucket: "ibrahiminreality-messenger.firebasestorage.app",
  messagingSenderId: "498261952449",
  appId: "1:498261952449:web:f72e1a212af2d2022d1140"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentChatId = null;

const authBox = document.getElementById("authBox");
const appBox = document.getElementById("appBox");
const userEmailSpan = document.getElementById("userEmail");

document.getElementById("registerBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", userCred.user.uid), {
    email: email
  });

  alert("Registered!");
};

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);
};

document.getElementById("logoutBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    authBox.style.display = "none";
    appBox.style.display = "block";
    userEmailSpan.innerText = user.email;
  } else {
    authBox.style.display = "block";
    appBox.style.display = "none";
  }
});

document.getElementById("searchBtn").onclick = async () => {
  const searchEmail = document.getElementById("searchInput").value;

  const q = query(collection(db, "users"), where("email", "==", searchEmail));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    alert("User not found");
    return;
  }

  snapshot.forEach(docSnap => {
    const otherId = docSnap.id;
    currentChatId = [currentUser.uid, otherId].sort().join("_");
    openChat();
  });
};

function openChat() {
  document.getElementById("chatArea").style.display = "block";
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  const q = collection(db, "chats", currentChatId, "messages");

  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = "message";
      if (msg.sender === currentUser.uid) div.classList.add("me");
      div.innerText = msg.text;
      messagesDiv.appendChild(div);
    });
  });
}

document.getElementById("sendBtn").onclick = async () => {
  const text = document.getElementById("messageInput").value;
  if (!text) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text: text,
    sender: currentUser.uid,
    time: Date.now()
  });

  document.getElementById("messageInput").value = "";
};
