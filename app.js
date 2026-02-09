import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = window.auth;
const db = window.db;

let currentUser = null;
let currentChatId = null;

/* UI SWITCH */
window.showRegister = () => {
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
};

window.showLogin = () => {
  registerSection.classList.add("hidden");
  resetSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
};

window.showReset = () => {
  loginSection.classList.add("hidden");
  resetSection.classList.remove("hidden");
};

/* REGISTER */
window.register = async () => {
  const user = await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value);
  await setDoc(doc(db, "users", user.user.uid), {
    name: regName.value,
    email: regEmail.value,
    uid: user.user.uid
  });
  alert("Registration Successful");
  showLogin();
};

/* LOGIN */
window.login = async () => {
  await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
};

/* LOGOUT */
window.logout = async () => await signOut(auth);

/* RESET */
window.resetPassword = async () => {
  await sendPasswordResetEmail(auth, resetEmail.value);
  alert("Reset Email Sent");
};

/* AUTH STATE */
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    resetSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    const userDoc = await getDoc(doc(db, "users", user.uid));
    profileName.innerText = userDoc.data().name;

    loadChats();
  }
});

/* SIDEBAR */
window.toggleSidebar = () => {
  sidebar.classList.toggle("active");
};

/* SEARCH USER */
window.searchUser = async () => {
  const q = query(collection(db, "users"), where("email", "==", searchEmail.value));
  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    if (docSnap.id !== currentUser.uid) {
      startChat(docSnap.id, docSnap.data().name);
    }
  });
};

async function startChat(otherUid, otherName) {
  const chatId = [currentUser.uid, otherUid].sort().join("_");
  await setDoc(doc(db, "chats", chatId), {
    users: [currentUser.uid, otherUid]
  });
  openChat(chatId, otherName);
}

/* LOAD CHATS */
async function loadChats() {
  const q = query(collection(db, "chats"),
    where("users", "array-contains", currentUser.uid));

  const snapshot = await getDocs(q);
  chatList.innerHTML = "";

  for (const docSnap of snapshot.docs) {
    const otherUid = docSnap.data().users.find(u => u !== currentUser.uid);
    const userDoc = await getDoc(doc(db, "users", otherUid));

    const div = document.createElement("div");
    div.className = "chatItem";
    div.innerText = userDoc.data().name;
    div.onclick = () => openChat(docSnap.id, userDoc.data().name);

    chatList.appendChild(div);
  }
}

/* OPEN CHAT */
function openChat(chatId, name) {
  currentChatId = chatId;
  chatBox.classList.remove("hidden");
  chatWith.innerText = name;

  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));

  onSnapshot(q, snapshot => {
    messages.innerHTML = "";
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const div = document.createElement("div");
      div.className = msg.sender === currentUser.uid ? "msg you" : "msg other";
      div.innerText = msg.text;
      messages.appendChild(div);
    });
  });
}

/* SEND MESSAGE */
window.sendMessage = async () => {
  if (!messageInput.value) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text: messageInput.value,
    sender: currentUser.uid,
    createdAt: new Date()
  });

  messageInput.value = "";
};

/* UPDATE NAME */
window.updateProfile = async () => {
  await setDoc(doc(db, "users", currentUser.uid), {
    name: newName.value,
    email: currentUser.email,
    uid: currentUser.uid
  });
  alert("Name Updated");
};

/* CHANGE PASSWORD */
window.changePassword = async () => {
  await updatePassword(currentUser, newPassword.value);
  alert("Password Changed");
};
