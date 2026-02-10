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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let selectedUser = null;

window.login = async function () {
  const email = loginEmail.value;
  const pass = loginPassword.value;
  await signInWithEmailAndPassword(auth, email, pass);
};

window.register = async function () {
  const name = registerName.value;
  const email = registerEmail.value;
  const pass = registerPassword.value;
  const userCred = await createUserWithEmailAndPassword(auth, email, pass);
  await setDoc(doc(db,"users",userCred.user.uid),{
    name,
    email,
    online:true,
    lastSeen:serverTimestamp()
  });
};

window.resetPassword = async function(){
  await sendPasswordResetEmail(auth, resetEmail.value);
  alert("Reset sent");
};

window.logout = async function(){
  await updateDoc(doc(db,"users",currentUser.uid),{
    online:false,
    lastSeen:serverTimestamp()
  });
  await signOut(auth);
};

onAuthStateChanged(auth, async user=>{
  if(user){
    currentUser = user;
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");

    await updateDoc(doc(db,"users",user.uid),{
      online:true
    });

    loadUsers();
  } else {
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("main-app").classList.add("hidden");
  }
});

function loadUsers(){
  onSnapshot(collection(db,"users"),snap=>{
    userList.innerHTML="";
    snap.forEach(docSnap=>{
      if(docSnap.id!==currentUser.uid){
        const data=docSnap.data();
        const div=document.createElement("div");
        div.className="user-item";
        div.innerHTML=`
          <div class="avatar">${data.name[0]}</div>
          ${data.name}
          ${data.online?'<div class="online-dot"></div>':''}
        `;
        div.onclick=()=>openChat(docSnap.id,data.name);
        userList.appendChild(div);
      }
    });
  });
}

function openChat(uid,name){
  selectedUser=uid;
  chatWith.innerText=name;
  loadMessages();
}

function loadMessages(){
  const chatId=[currentUser.uid,selectedUser].sort().join("_");
  const q=query(collection(db,"chats",chatId,"messages"),orderBy("time"));
  onSnapshot(q,snap=>{
    messages.innerHTML="";
    snap.forEach(docSnap=>{
      const msg=docSnap.data();
      const div=document.createElement("div");
      div.className="message "+(msg.sender===currentUser.uid?"me":"");
      div.innerText=msg.text;
      messages.appendChild(div);
    });
  });
}

window.sendMessage=async function(){
  const text=messageInput.value;
  const chatId=[currentUser.uid,selectedUser].sort().join("_");
  await addDoc(collection(db,"chats",chatId,"messages"),{
    text,
    sender:currentUser.uid,
    time:serverTimestamp()
  });
  messageInput.value="";
};
