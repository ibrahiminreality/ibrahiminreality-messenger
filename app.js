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
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let selectedUser = null;
let currentChatId = null;

/* ================= AUTH ================= */

window.login = async () => {
  await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
};

window.register = async () => {
  const userCred = await createUserWithEmailAndPassword(
    auth,
    registerEmail.value,
    registerPassword.value
  );

  await setDoc(doc(db, "users", userCred.user.uid), {
    name: registerName.value,
    email: registerEmail.value,
    online: true,
    lastSeen: serverTimestamp(),
    typing: false
  });
};

window.logout = async () => {
  await updateDoc(doc(db, "users", currentUser.uid), {
    online: false,
    lastSeen: serverTimestamp()
  });
  await signOut(auth);
};

window.resetPassword = async () => {
  await sendPasswordResetEmail(auth, resetEmail.value);
  alert("Reset link sent");
};

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;

    auth-container.classList.add("hidden");
    main-app.classList.remove("hidden");

    await updateDoc(doc(db, "users", user.uid), {
      online: true
    });

    loadUsers();
  } else {
    auth-container.classList.remove("hidden");
    main-app.classList.add("hidden");
  }
});

/* ================= USERS ================= */

function loadUsers() {
  onSnapshot(collection(db, "users"), snap => {
    userList.innerHTML = "";
    snap.forEach(docSnap => {
      if (docSnap.id !== currentUser.uid) {
        const data = docSnap.data();

        const div = document.createElement("div");
        div.className = "user-item";

        div.innerHTML = `
          <div class="avatar">${data.name[0]}</div>
          ${data.name}
          ${data.online ? '<div class="online-dot"></div>' : ''}
        `;

        div.onclick = () => openChat(docSnap.id, data.name);
        userList.appendChild(div);
      }
    });
  });
}

/* ================= CHAT ================= */

function openChat(uid, name) {
  selectedUser = uid;
  currentChatId = [currentUser.uid, uid].sort().join("_");

  chatWith.innerText = name;
  loadMessages();
  listenTyping();
}

function loadMessages() {
  const q = query(
    collection(db, "chats", currentChatId, "messages"),
    orderBy("time")
  );

  onSnapshot(q, snap => {
    messages.innerHTML = "";
    snap.forEach(docSnap => {
      const msg = docSnap.data();

      const div = document.createElement("div");
      div.className =
        "message " + (msg.sender === currentUser.uid ? "me" : "");

      div.innerText = msg.text;
      messages.appendChild(div);
    });

    messages.scrollTop = messages.scrollHeight;
  });
}

/* ================= SEND MESSAGE ================= */

window.sendMessage = async () => {
  if (!messageInput.value) return;

  await addDoc(
    collection(db, "chats", currentChatId, "messages"),
    {
      text: messageInput.value,
      sender: currentUser.uid,
      time: serverTimestamp(),
      seen: false
    }
  );

  messageInput.value = "";
};

/* ================= TYPING ================= */

window.sendTyping = async () => {
  await updateDoc(doc(db, "users", currentUser.uid), {
    typing: true
  });

  setTimeout(async () => {
    await updateDoc(doc(db, "users", currentUser.uid), {
      typing: false
    });
  }, 1000);
};

function listenTyping() {
  onSnapshot(doc(db, "users", selectedUser), snap => {
    const data = snap.data();
    typingIndicator.innerText = data.typing ? "Typing..." : "";
  });
}
