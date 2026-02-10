import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* 🔥 YOUR CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ibrahiminreality-messenger.firebaseapp.com",
  projectId: "ibrahiminreality-messenger",
  storageBucket: "ibrahiminreality-messenger.appspot.com",
  messagingSenderId: "498261952449",
  appId: "1:498261952449:web:f72e1a212af2d2022d1140"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentChatId = null;


/* =========================
   SEND MESSAGE
========================= */
window.sendMessage = async () => {
  const text = messageInput.value;
  if (!text || !currentChatId) return;

  await addDoc(collection(db, "messages"), {
    chatId: currentChatId,
    sender: auth.currentUser.uid,
    text: text,
    createdAt: new Date(),
    read: false
  });

  messageInput.value = "";

  // typing false
  await updateDoc(doc(db, "chats", currentChatId), {
    typing: false
  });
};


/* =========================
   LOAD MESSAGES REALTIME
========================= */
function loadMessages(chatId) {

  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt")
  );

  onSnapshot(q, (snapshot) => {
    messagesBox.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();

      const div = document.createElement("div");
      div.className = msg.sender === auth.currentUser.uid ? "myMsg" : "otherMsg";
      div.innerText = msg.text;
      messagesBox.appendChild(div);

      // mark as read
      if (msg.sender !== auth.currentUser.uid && !msg.read) {
        updateDoc(doc(db, "messages", docSnap.id), { read: true });
      }
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}


/* =========================
   TYPING INDICATOR
========================= */
window.startTyping = async () => {
  if (!currentChatId) return;

  await updateDoc(doc(db, "chats", currentChatId), {
    typing: true
  });
};

function listenTyping(chatId) {
  onSnapshot(doc(db, "chats", chatId), (docSnap) => {
    const data = docSnap.data();
    if (!data) return;

    if (data.typing) {
      typingIndicator.innerText = "Typing...";
    } else {
      typingIndicator.innerText = "";
    }
  });
}


/* =========================
   UNREAD COUNTER
========================= */
function loadUnreadCounter() {

  const q = query(
    collection(db, "messages"),
    where("read", "==", false)
  );

  onSnapshot(q, (snapshot) => {
    let count = 0;

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();
      if (msg.sender !== auth.currentUser.uid) {
        count++;
      }
    });

    unreadCounter.innerText = count > 0 ? count : "";
  });
}


/* =========================
   OPEN CHAT
========================= */
window.openChat = async (chatId) => {
  currentChatId = chatId;
  loadMessages(chatId);
  listenTyping(chatId);
};


/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUnreadCounter();
  }
});
