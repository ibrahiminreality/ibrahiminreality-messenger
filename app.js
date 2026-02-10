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
  getDocs,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
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
      name: registerName.value,
      email: registerEmail.value
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
  await signOut(auth);
};

// ================= UI SWITCH =================

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

// ================= AUTH STATE =================

onAuthStateChanged(auth, async (user) => {
  if (user) {
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

async function loadUsers() {
  userList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "users"));

  querySnapshot.forEach(docSnap => {
    if (docSnap.id !== auth.currentUser.uid) {
      const div = document.createElement("div");
      div.innerText = docSnap.data().email;

      div.onclick = () => {
        openChat(docSnap.id, docSnap.data().email);
      };

      userList.appendChild(div);
    }
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
  messages.innerHTML = "";

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
        msg.classList.add(".mymessage");
      } else {
        msg.classList.add("other-message");
      }

      messages.appendChild(msg);
    });

    // Auto scroll
    messages.scrollTop = messages.scrollHeight;
  });
}

// ================= SEND MESSAGE =================

window.sendMessage = async () => {
  if (!currentChatUser) return;
  if (messageInput.value.trim() === "") return;

  const chatId = [auth.currentUser.uid, currentChatUser].sort().join("_");

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: messageInput.value,
    sender: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
};
