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
