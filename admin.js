import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

// Login Function
async function login() {
  const email = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("loginPanel").classList.add("hidden");
    document.getElementById("trackingPanel").classList.remove("hidden");
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

// Save Order to Firebase
async function saveOrder() {
  const trackingID = document.getElementById("trackingID").value;
  
  await setDoc(doc(db, "orders", trackingID), {
    status: document.getElementById("orderStatus").value,
    customer: document.getElementById("customerName").value,
    items: document.getElementById("orderDetails").value,
    lastUpdated: new Date()
  });
  
  alert("Order saved!");
}