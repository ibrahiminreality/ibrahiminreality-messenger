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
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc
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

// DOM
const authContainer = document.getElementById("authContainer");
const registerContainer = document.getElementById("registerContainer");
const resetContainer = document.getElementById("resetContainer");
const mainApp = document.getElementById("mainApp");
const userList = document.getElementById("userList");
const messages = document.getElementById("messages");
const chatHeader = document.getElementById("chatHeader");
const messageInput = document.getElementById("messageInput");


// ================= AUTH =================

window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  } catch (err) {
    alert(err.message);
  }
};

window.register = async () => {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      registerEmail.value,
      registerPassword.value
    );

    await setDoc(doc(db, "users", userCred.user.uid), {
      email: registerEmail.value,
      online: true,
      lastSeen: serverTimestamp()
    });

  } catch (err) {
    alert(err.message);
  }
};

window.resetPassword = async () => {
  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    alert("Reset email sent!");
  } catch (err) {
    alert(err.message);
  }
};

window.logout = async () => {

  if (auth.currentUser) {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      online: false,
      lastSeen: serverTimestamp()
    });
  }

  await signOut(auth);
};


// ================= AUTH STATE =================

onAuthStateChanged(auth, async (user) => {

  if (user) {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        online: true,
        lastSeen: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        online: true,
        lastSeen: serverTimestamp()
      });
    }

    authContainer.classList.add("hidden");
    registerContainer.classList.add("hidden");
    resetContainer.classList.add("hidden");
    mainApp.classList.remove("hidden");

    loadUsers();

  } else {
    mainApp.classList.add("hidden");
    authContainer.classList.remove("hidden");
  }

});


// ================= LOAD USERS =================

function loadUsers() {

  const q = collection(db, "users");

  onSnapshot(q, (snapshot) => {

    userList.innerHTML = "";

    snapshot.forEach(docSnap => {

      if (!auth.currentUser) return;
      if (docSnap.id === auth.currentUser.uid) return;

      const userData = docSnap.data();
      const div = document.createElement("div");

      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>${userData.email}</span>
          <span style="
            width:10px;
            height:10px;
            border-radius:50%;
            background:${userData.online ? '#2ecc71' : '#ccc'};
          "></span>
        </div>
      `;

      div.onclick = () => {
        openChat(docSnap.id, userData.email);
      };

      userList.appendChild(div);

    });

  });

}


// ================= OPEN CHAT =================

function openChat(userId, email) {

  currentChatUser = userId;
  chatHeader.innerText = email;

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  loadMessages();
}


// ================= LOAD MESSAGES =================

function loadMessages() {

  if (!currentChatUser) return;

  const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt")
  );

  unsubscribeMessages = onSnapshot(q, snapshot => {

    messages.innerHTML = "";

    snapshot.forEach(docSnap => {

      const data = docSnap.data();
      const msg = document.createElement("div");

      msg.innerText = data.text;

      if (data.sender === auth.currentUser.uid) {
        msg.classList.add("my-message");
      } else {
        msg.classList.add("other-message");
      }

      messages.appendChild(msg);

    });

    messages.scrollTop = messages.scrollHeight;

  });

}


// ================= SEND MESSAGE =================

window.sendMessage = async () => {

  if (!currentChatUser) return;
  if (!messageInput.value.trim()) return;

  const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: messageInput.value,
    sender: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
};
