import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* 🔥 YOUR FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ibrahiminreality-messenger.firebaseapp.com",
  projectId: "ibrahiminreality-messenger",
  storageBucket: "ibrahiminreality-messenger.appspot.com",
  messagingSenderId: "498261952449",
  appId: "1:498261952449:web:f72e1a212af2d2022d1140"
};

/* Initialize */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* Elements */
const authSection = document.getElementById("authSection");
const homeSection = document.getElementById("homeSection");
const registerBox = document.getElementById("registerBox");
const resetBox = document.getElementById("resetBox");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");


/* UI SWITCH */
window.showRegister = () => {
  registerBox.classList.remove("hidden");
  resetBox.classList.add("hidden");
};

window.showReset = () => {
  resetBox.classList.remove("hidden");
  registerBox.classList.add("hidden");
};


/* REGISTER */
window.register = async () => {
  const cred = await createUserWithEmailAndPassword(
    auth,
    regEmail.value,
    regPassword.value
  );

  await setDoc(doc(db, "users", cred.user.uid), {
    name: regName.value,
    email: regEmail.value,
    status: "online",
    avatar: regName.value.charAt(0).toUpperCase(),
    lastSeen: new Date()
  });

  alert("Registration successful");
};


/* LOGIN */
window.login = async () => {
  await signInWithEmailAndPassword(
    auth,
    loginEmail.value,
    loginPassword.value
  );

  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    status: "online"
  });
};


/* LOGOUT */
window.logout = async () => {
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    status: "offline",
    lastSeen: new Date()
  });

  await signOut(auth);
};


/* RESET PASSWORD */
window.sendReset = async () => {
  await sendPasswordResetEmail(auth, resetEmail.value);
  alert("Password reset email sent");
};


/* SIDEBAR */
window.toggleSidebar = () => {
  sidebar.classList.toggle("active");
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";
};

overlay.onclick = () => {
  sidebar.classList.remove("active");
  overlay.style.display = "none";
};


/* SEARCH USER */
window.searchUser = async () => {
  const snap = await getDocs(collection(db, "users"));

  snap.forEach(async (docSnap) => {
    if (docSnap.data().email === searchEmail.value) {
      await addDoc(collection(db, "chats"), {
        user1: auth.currentUser.uid,
        user2: docSnap.id,
        createdAt: new Date()
      });
      alert("User Added");
    }
  });
};


/* AUTH STATE */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    homeSection.classList.remove("hidden");

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.data();

    profileName.innerText = data.name;
    profileEmail.innerText = user.email;
    avatarCircle.innerText = data.avatar;
    userStatus.innerText = data.status;

  } else {
    authSection.classList.remove("hidden");
    homeSection.classList.add("hidden");
  }
});
