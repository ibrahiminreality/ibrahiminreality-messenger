import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

let currentUser = null;
let currentChatId = null;

// Register
window.register = async () => {
  const user = await createUserWithEmailAndPassword(auth, email.value, password.value);
  await setDoc(doc(db, "users", user.user.uid), { email: email.value });
};

// Login
window.login = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
};

// Logout
window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if(user){
    currentUser = user;
    authBox.classList.add("hidden");
    app.classList.remove("hidden");
    loadChats();
  } else {
    authBox.classList.remove("hidden");
    app.classList.add("hidden");
  }
});

// Add private chat
window.addUser = async () => {
  const search = searchEmail.value;
  const q = query(collection(db,"users"), where("email","==",search));
  const snap = await getDocs(q);

  snap.forEach(async docu => {
    const chatId = [currentUser.uid, docu.id].sort().join("_");
    await setDoc(doc(db,"chats",chatId),{
      participants:[currentUser.uid, docu.id],
      type:"private"
    });
  });
};

// Create group
window.createGroup = async () => {
  const name = prompt("Group name?");
  if(!name) return;

  await addDoc(collection(db,"chats"),{
    participants:[currentUser.uid],
    type:"group",
    name:name
  });
};

// Load chats
function loadChats(){
  const q = query(collection(db,"chats"), where("participants","array-contains",currentUser.uid));
  onSnapshot(q,snap=>{
    chatList.innerHTML="";
    snap.forEach(docu=>{
      const div=document.createElement("div");
      div.className="chat-item";
      div.innerText=docu.data().name || "Private Chat";
      div.onclick=()=>openChat(docu.id);
      chatList.appendChild(div);
    });
  });
}

// Open chat
function openChat(id){
  currentChatId=id;
  onSnapshot(collection(db,"chats",id,"messages"),snap=>{
    messages.innerHTML="";
    snap.forEach(docu=>{
      const msg=docu.data();
      const div=document.createElement("div");
      div.className="message "+(msg.uid===currentUser.uid?"sent":"received");
      div.innerText=msg.text;
      messages.appendChild(div);
    });
  });
}

// Send message
window.sendMessage = async () => {
  if(!currentChatId) return;
  await addDoc(collection(db,"chats",currentChatId,"messages"),{
    text:messageInput.value,
    uid:currentUser.uid
  });
  messageInput.value="";
};
