import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let currentUser;
let currentChatId = null;

// Register
window.register = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", userCred.user.uid), {
    email: email,
    online: true,
    lastSeen: serverTimestamp()
  });
};

// Login
window.login = () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
};

// Logout
window.logout = async () => {
  await updateDoc(doc(db, "users", currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });
  signOut(auth);
};

// Auth State
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;

    await updateDoc(doc(db, "users", user.uid), {
      online: true,
      lastSeen: serverTimestamp()
    });

    authScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");

    loadUsers();
    loadChats();

    window.addEventListener("beforeunload", async () => {
      await updateDoc(doc(db, "users", user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      });
    });

  } else {
    authScreen.classList.remove("hidden");
    mainApp.classList.add("hidden");
  }
});

// Create chat automatically
async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  snapshot.forEach(docSnap => {
    if (docSnap.id !== currentUser.uid) {
      createChatIfNotExists(docSnap.id);
    }
  });
}

async function createChatIfNotExists(otherUserId) {
  const chatId = [currentUser.uid, otherUserId].sort().join("_");
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [currentUser.uid, otherUserId],
      lastMessage: "",
      updatedAt: serverTimestamp()
    });
  }
}

// Load chats
function loadChats() {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", currentUser.uid)
  );

  onSnapshot(q, snapshot => {
    chatList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const div = document.createElement("div");
      div.textContent = docSnap.data().lastMessage || "Start chatting";
      div.onclick = () => openChat(docSnap.id);
      chatList.appendChild(div);
    });
  });
}

// Open chat
async function openChat(chatId) {
  currentChatId = chatId;

  const users = chatId.split("_");
  const otherUserId = users.find(id => id !== currentUser.uid);

  const userSnap = await getDoc(doc(db, "users", otherUserId));
  const userData = userSnap.data();

  if (userData.online) {
    chatHeader.textContent = userData.email + " (Online)";
  } else {
    chatHeader.textContent = userData.email + " (Last seen)";
  }

  loadMessages(chatId);
}

// Load messages
function loadMessages(chatId) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp")
  );

  onSnapshot(q, snapshot => {
    messages.innerHTML = "";
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("message");
      div.classList.add(
        msg.sender === currentUser.uid ? "myMessage" : "otherMessage"
      );
      div.textContent = msg.text;
      messages.appendChild(div);
    });
  });
}

// Send message
window.sendMessage = async () => {
  if (!currentChatId) return;
  const text = messageInput.value;
  if (!text) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text,
    sender: currentUser.uid,
    timestamp: serverTimestamp(),
    seen: false,
    type: "text"
  });

  await updateDoc(doc(db, "chats", currentChatId), {
    lastMessage: text,
    updatedAt: serverTimestamp()
  });

  messageInput.value = "";
};
