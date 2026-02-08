import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

let currentUser;
let currentChatId;

window.register = async function () {
  const email = email.value;
  const password = password.value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", userCred.user.uid), {
    email: email
  });
};

window.login = async function () {
  await signInWithEmailAndPassword(auth, email.value, password.value);
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    chatSection.style.display = "block";
    logoutBtn.style.display = "block";
    loadChats();
  } else {
    authSection.style.display = "block";
    chatSection.style.display = "none";
    logoutBtn.style.display = "none";
  }
});

window.addUser = async function () {
  const searchEmail = document.getElementById("searchEmail").value;

  const q = query(collection(db, "users"), where("email", "==", searchEmail));
  onSnapshot(q, snapshot => {
    snapshot.forEach(docSnap => {
      const otherUserId = docSnap.id;
      const chatId = [currentUser.uid, otherUserId].sort().join("_");

      currentChatId = chatId;
      openChat(chatId);
    });
  });
};

function loadChats() {
  // simple demo load
}

function openChat(chatId) {
  chatBox.style.display = "block";
  messages.innerHTML = "";

  const q = collection(db, "chats", chatId, "messages");

  onSnapshot(q, snapshot => {
    messages.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = "message";
      div.innerText = msg.text;
      messages.appendChild(div);
    });
  });
}

window.sendMessage = async function () {
  const text = messageInput.value;
  if (!text) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text: text,
    sender: currentUser.uid,
    timestamp: Date.now()
  });

  messageInput.value = "";
};
