import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentUser = null;
let currentChatId = null;

window.register = async function () {
  const email = emailInput.value;
  const password = passwordInput.value;

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", userCred.user.uid), {
    email: email,
    uid: userCred.user.uid
  });
};

window.login = async function () {
  await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
};

window.logout = async function () {
  await signOut(auth);
};

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    authBox.style.display = "none";
    mainApp.style.display = "block";
    loadChats();
  } else {
    authBox.style.display = "block";
    mainApp.style.display = "none";
  }
});

window.searchUser = async function () {
  const q = query(collection(db, "users"), where("email", "==", searchEmail.value));
  const snap = await getDocs(q);

  if (snap.empty) {
    alert("User not found");
    return;
  }

  snap.forEach(docSnap => {
    const user = docSnap.data();
    if (user.uid === currentUser.uid) return;

    searchResult.innerHTML = `
      ${user.email}
      <button onclick="startChat('${user.uid}','${user.email}')">Add Chat</button>
    `;
  });
};

window.startChat = async function (otherUid, otherEmail) {

  const chatId = [currentUser.uid, otherUid].sort().join("_");

  await setDoc(doc(db, "chats", chatId), {
    users: [currentUser.uid, otherUid]
  });

  openChat(chatId, otherEmail);
};

async function loadChats() {
  const q = query(collection(db, "chats"), where("users", "array-contains", currentUser.uid));
  const snap = await getDocs(q);

  chatList.innerHTML = "";

  snap.forEach(docSnap => {
    const chatId = docSnap.id;
    const otherUid = chatId.replace(currentUser.uid + "_", "").replace("_" + currentUser.uid, "");

    chatList.innerHTML += `
      <div onclick="openChat('${chatId}','User')">
        ${chatId}
      </div>
    `;
  });
}

window.openChat = function (chatId, email) {
  currentChatId = chatId;
  chatSection.style.display = "block";
  chatWith.innerText = email;

  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));

  onSnapshot(q, snapshot => {
    messages.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      messages.innerHTML += `
        <div class="message">
          <b>${msg.sender === currentUser.uid ? "You" : "Other"}:</b> ${msg.text}
        </div>
      `;
    });
  });
};

window.sendMessage = async function () {
  if (!currentChatId) return;

  await addDoc(collection(db, "chats", currentChatId, "messages"), {
    text: messageInput.value,
    sender: currentUser.uid,
    createdAt: new Date()
  });

  messageInput.value = "";
};
