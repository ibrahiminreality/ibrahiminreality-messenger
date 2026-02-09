import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy } 
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
let currentChat = null;

window.register = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = await createUserWithEmailAndPassword(auth,email,password);
  await setDoc(doc(db,"users",user.user.uid),{
    email:email,
    online:true,
    lastSeen:new Date()
  });
};

window.login = async () => {
  await signInWithEmailAndPassword(auth,
    document.getElementById("email").value,
    document.getElementById("password").value
  );
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth,user=>{
  if(user){
    currentUser=user;
    authBox.style.display="none";
    mainApp.style.display="block";
    loadChats();
  }else{
    authBox.style.display="block";
    mainApp.style.display="none";
  }
});

window.searchUser = async ()=>{
  const q=query(collection(db,"users"),
    where("email","==",searchEmail.value));
  const snap=await getDocs(q);

  if(snap.empty){ alert("User not found"); return; }

  snap.forEach(d=>{
    const data=d.data();
    if(d.id===currentUser.uid) return;

    searchResult.innerHTML=`
      ${data.email}
      <button onclick="startChat('${d.id}','${data.email}')">Add</button>
    `;
  });
};

window.startChat = async (uid,email)=>{
  const chatId=[currentUser.uid,uid].sort().join("_");
  await setDoc(doc(db,"chats",chatId),{
    users:[currentUser.uid,uid]
  });
  openChat(chatId,email);
};

async function loadChats(){
  const q=query(collection(db,"chats"),
    where("users","array-contains",currentUser.uid));
  const snap=await getDocs(q);

  chatList.innerHTML="";
  snap.forEach(d=>{
    chatList.innerHTML+=`
      <div class="chatItem" onclick="openChat('${d.id}','Chat')">
        ${d.id}
      </div>`;
  });
}

window.openChat=(chatId,email)=>{
  currentChat=chatId;
  chatSection.style.display="block";
  chatWith.innerText=email;

  const q=query(collection(db,"chats",chatId,"messages"),
    orderBy("createdAt"));

  onSnapshot(q,snap=>{
    messages.innerHTML="";
    snap.forEach(d=>{
      const m=d.data();
      const cls=m.sender===currentUser.uid?"msg you":"msg other";
      messages.innerHTML+=`
        <div class="${cls}">${m.text}</div>`;
    });
  });
};

window.sendMessage=async ()=>{
  if(!currentChat) return;

  await addDoc(collection(db,"chats",currentChat,"messages"),{
    text:messageInput.value,
    sender:currentUser.uid,
    createdAt:new Date()
  });

  messageInput.value="";
};
