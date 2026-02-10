// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB6xxlmwTb0CWLYP_ONalRsHPEi2h0DnpQ",
  authDomain: "ibrahiminreality-messenger.firebaseapp.com",
  projectId: "ibrahiminreality-messenger",
  storageBucket: "ibrahiminreality-messenger.firebasestorage.app",
  messagingSenderId: "498261952449",
  appId: "1:498261952449:web:f72e1a212af2d2022d1140",
  measurementId: "G-BXGWWZHK6Y"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let currentChatUser = null;

// Auth State
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    setOnlineStatus(true);
    loadUsers();
  }
});

// Register
function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(res => {
      return db.collection("users").doc(res.user.uid).set({
        name: name,
        email: email,
        online: true,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Registered Successfully");
    })
    .catch(err => alert(err.message));
}

// Login
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}

// Logout
function logout() {
  setOnlineStatus(false);
  auth.signOut();
}

// Online Status
function setOnlineStatus(status) {
  if (!currentUser) return;

  db.collection("users").doc(currentUser.uid).update({
    online: status,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Load Users
function loadUsers() {
  db.collection("users").onSnapshot(snapshot => {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    snapshot.forEach(doc => {
      if (doc.id !== currentUser.uid) {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "user-item";

        const avatarLetter = data.name ? data.name.charAt(0).toUpperCase() : "U";
        const onlineDot = data.online ? "🟢" : "⚫";
        const lastSeenText = data.online ? "Online" : "Last seen";

        div.innerHTML = `
          <div class="avatar">${avatarLetter}</div>
          <div class="user-info">
            <div>${onlineDot} ${data.name}</div>
            <small>${lastSeenText}</small>
          </div>
        `;

        div.onclick = () => openChat(doc.id, data.name);
        userList.appendChild(div);
      }
    });
  });
}

// Open Chat
function openChat(uid, name) {
  currentChatUser = uid;
  document.getElementById("chatHeader").innerText = name;
  loadMessages(uid);
}

// Send Message
function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  if (!msg || !currentChatUser) return;

  const chatId = [currentUser.uid, currentChatUser].sort().join("_");

  db.collection("chats").doc(chatId).collection("messages").add({
    sender: currentUser.uid,
    message: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("messageInput").value = "";
}

// Load Messages
function loadMessages(uid) {
  const chatId = [currentUser.uid, uid].sort().join("_");

  db.collection("chats").doc(chatId)
    .collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");

        div.className = data.sender === currentUser.uid
          ? "message sent"
          : "message received";

        div.innerText = data.message;
        chatBox.appendChild(div);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Reset Password
function resetPassword() {
  const email = document.getElementById("resetEmail").value;
  auth.sendPasswordResetEmail(email)
    .then(() => alert("Reset Email Sent"))
    .catch(err => alert(err.message));
                                  }
