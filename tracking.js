import { db } from './firebase-config.js';
import { doc, getDoc } from "firebase/firestore";

async function trackOrder() {
  const trackingNumber = document.getElementById("trackingNumber").value;
  const docSnap = await getDoc(doc(db, "orders", trackingNumber));
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("orderStatus").textContent = data.status;
    document.getElementById("customerName").textContent = data.customer;
  } else {
    alert("Order not found!");
  }
}