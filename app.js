import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
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

/* REGISTER */
window.register = async function () {
  const name = regName.value;
  const email = regEmail.value;
  const password = regPassword.value;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    uid: user.uid
  });

  alert("Registration Successful");
};

/* LOGIN */
window.login = async function () {
  await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
};

/* LOGOUT */
logoutBtn.onclick = async () => await signOut(auth);

/* AUTH STATE */
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    chatSection.style.display = "block";
    loadChats();
  } else {
    authSection.style.display = "block";
    chatSection.style.display = "none";
  }
});

/* SEARCH USER */
window.searchUser = async function () {
  const q = query(collection(db, "users"), where("email", "==", searchEmail.value));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    if (docSnap.id !== currentUser.uid) {
      startChat(docSnap.id, docSnap.data().name);
    }
  });
};

/* START CHAT */
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
    const name = userDoc.data().name;

    const div = document.createElement("div");
    div.className = "chatItem";
    div.innerText = name;
    div.onclick = () => openChat(docSnap.id, name);

    chatList.appendChild(div);
  }
}

/* OPEN CHAT */
function openChat(chatId, name) {
  currentChatId = chatId;
  chatBox.style.display = "block";
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
window.sendMessage = async function () {
  if (!messageInput.value) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text: messageInput.value,
    sender: currentUser.uid,
    createdAt: new Date()
  });

  messageInput.value = "";
};

/* UPDATE NAME */
window.updateProfile = async function () {
  await setDoc(doc(db, "users", currentUser.uid), {
    name: newName.value,
    email: currentUser.email,
    uid: currentUser.uid
  });
  alert("Name Updated");
};

/* CHANGE PASSWORD */
window.changePassword = async function () {
  await updatePassword(currentUser, newPassword.value);
  alert("Password Changed");
};

/* RESET PASSWORD */
window.resetPassword = async function () {
  await sendPasswordResetEmail(auth, resetEmail.value);
  alert("Reset Email Sent");
};
