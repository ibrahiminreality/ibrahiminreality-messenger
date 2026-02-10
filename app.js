import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentChatUser = null;
let unsubscribeMessages = null;
let typingTimeout = null;

const authContainer = document.getElementById("authContainer");
const mainApp = document.getElementById("mainApp");
const userList = document.getElementById("userList");
const messages = document.getElementById("messages");
const chatHeader = document.getElementById("chatHeader");
const messageInput = document.getElementById("messageInput");
const typingStatus = document.getElementById("typingStatus");


// LOGIN
window.login = async () => {
  await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
};

window.logout = async () => {
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });
  await signOut(auth);
};


// AUTH STATE
onAuthStateChanged(auth, async (user) => {

  if (user) {

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      online: true,
      lastSeen: serverTimestamp()
    }, { merge: true });

    authContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");

    loadUsers();

  } else {
    mainApp.classList.add("hidden");
    authContainer.classList.remove("hidden");
  }
});


// LOAD USERS
function loadUsers() {

  onSnapshot(collection(db, "users"), snapshot => {

    userList.innerHTML = "";

    snapshot.forEach(docSnap => {

      if (docSnap.id !== auth.currentUser.uid) {

        const user = docSnap.data();
        const div = document.createElement("div");

        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;">
            <span>${user.email}</span>
            <small style="color:${user.online ? '#2ecc71' : '#aaa'}">
              ${user.online ? 'Online' : 'Offline'}
            </small>
          </div>
        `;

        div.onclick = () => openChat(docSnap.id, user.email);

        userList.appendChild(div);
      }
    });
  });
}


// OPEN CHAT
function openChat(userId, email) {

  currentChatUser = userId;
  chatHeader.innerText = email;

  if (unsubscribeMessages) unsubscribeMessages();

  loadMessages();
}


// LOAD MESSAGES
function loadMessages() {

  const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt")
  );

  unsubscribeMessages = onSnapshot(q, snapshot => {

    messages.innerHTML = "";

    snapshot.forEach(async docSnap => {

      const data = docSnap.data();
      const msg = document.createElement("div");

      msg.innerText = data.text;

      if (data.sender === auth.currentUser.uid) {
        msg.classList.add("my-message");
        if (data.seen) msg.innerText += " ✓✓";
      } else {
        msg.classList.add("other-message");
        if (!data.seen) {
          await updateDoc(docSnap.ref, { seen: true });
        }
      }

      messages.appendChild(msg);
    });

    messages.scrollTop = messages.scrollHeight;
  });
}


// SEND MESSAGE
window.sendMessage = async () => {

  if (!currentChatUser) return;
  if (messageInput.value.trim() === "") return;

  const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: messageInput.value,
    sender: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    seen: false
  });

  messageInput.value = "";
};


// TYPING SYSTEM
window.typing = async () => {

  if (!currentChatUser) return;

  const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

  await setDoc(doc(db, "typing", chatId), {
    user: auth.currentUser.uid
  });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(async () => {
    await setDoc(doc(db, "typing", chatId), { user: null });
  }, 1500);
};


// LISTEN TYPING
onSnapshot(collection(db, "typing"), snapshot => {

  snapshot.forEach(docSnap => {

    if (!currentChatUser) return;

    const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

    if (docSnap.id === chatId) {

      const data = docSnap.data();

      if (data.user === currentChatUser) {
        typingStatus.innerText = "Typing...";
      } else {
        typingStatus.innerText = "";
      }
    }
  });
});
