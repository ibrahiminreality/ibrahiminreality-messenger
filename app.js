import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
  where,
  getDocs,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = window.auth;
const db = window.db;

let currentUser = null;
let currentChatId = null;

/* ================= REGISTER ================= */

window.register = async function () {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!name || !email || !password) {
    alert("All fields required");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      uid: user.uid
    });

    alert("Registration Successful");

  } catch (error) {
    alert(error.message);
  }
};

/* ================= LOGIN ================= */

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Email & Password required");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};

/* ================= LOGOUT ================= */

document.getElementById("logoutBtn").onclick = async function () {
  await signOut(auth);
};

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async (user) => {

  if (user) {
    currentUser = user;
    document.getElementById("authSection").style.display = "none";
    document.getElementById("chatSection").style.display = "block";
    document.getElementById("logoutBtn").style.display = "block";
    loadChats();
  } else {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
  }

});

/* ================= SEARCH USER ================= */

window.searchUser = async function () {

  const email = document.getElementById("searchEmail").value;

  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    alert("User not found");
    return;
  }

  snapshot.forEach(docSnap => {
    const userData = docSnap.data();
    if (docSnap.id === currentUser.uid) return;

    startChat(docSnap.id, userData.name);
  });

};

/* ================= START CHAT ================= */

async function startChat(otherUid, otherName) {

  const chatId = [currentUser.uid, otherUid].sort().join("_");

  await setDoc(doc(db, "chats", chatId), {
    users: [currentUser.uid, otherUid]
  });

  openChat(chatId, otherName);
}

/* ================= LOAD CHAT LIST ================= */

async function loadChats() {

  const q = query(collection(db, "chats"),
    where("users", "array-contains", currentUser.uid));

  const snapshot = await getDocs(q);

  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  for (const docSnap of snapshot.docs) {

    const chatData = docSnap.data();
    const otherUid = chatData.users.find(uid => uid !== currentUser.uid);

    const userDoc = await getDoc(doc(db, "users", otherUid));
    const userData = userDoc.data();

    const div = document.createElement("div");
    div.className = "chatItem";
    div.innerText = userData.name;  // শুধু নাম দেখাবে

    div.onclick = () => openChat(docSnap.id, userData.name);

    chatList.appendChild(div);
  }

}

/* ================= OPEN CHAT ================= */

function openChat(chatId, name) {

  currentChatId = chatId;
  document.getElementById("chatBox").style.display = "block";
  document.getElementById("chatWith").innerText = name;

  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt")
  );

  onSnapshot(q, (snapshot) => {

    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    snapshot.forEach(docSnap => {

      const msg = docSnap.data();
      const div = document.createElement("div");

      div.className = msg.sender === currentUser.uid ? "msg you" : "msg other";
      div.innerText = msg.text;

      messagesDiv.appendChild(div);
    });

  });

}

/* ================= SEND MESSAGE ================= */

window.sendMessage = async function () {

  const text = document.getElementById("messageInput").value;

  if (!text || !currentChatId) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text: text,
    sender: currentUser.uid,
    createdAt: new Date()
  });

  document.getElementById("messageInput").value = "";

};
