import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("loginPanel").classList.add("hidden");
    document.getElementById("trackingPanel").classList.remove("hidden");
  }
});

// Login function
async function login() {
  const email = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showMessage('loginMessage', error.message, false);
  }
}

// Load order from Firestore
async function loadOrder() {
  const trackingID = document.getElementById("trackingID").value.trim().toUpperCase();
  if (!trackingID) {
    showMessage('trackingMessage', 'Please enter a tracking number', false);
    return;
  }

  try {
    const docRef = doc(db, "orders", trackingID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const orderData = docSnap.data();
      
      // Populate form fields
      document.getElementById("customerName").value = orderData.customer || "";
      document.getElementById("packageCount").value = orderData.packageCount || "1 package";
      document.getElementById("orderDetails").value = orderData.items || "";
      document.getElementById("deliveryDate").value = orderData.deliveryDate || "";
      document.getElementById("orderStatus").value = orderData.status || "Processing";

      // Populate steps
      const stepsContainer = document.getElementById("stepsContainer");
      stepsContainer.innerHTML = "";
      
      if (orderData.steps && orderData.steps.length > 0) {
        orderData.steps.forEach(step => {
          addStep(step.status, step.time, step.details);
        });
      } else {
        addStep("Order Received", new Date().toLocaleString(), "Order created in system");
      }
      
      document.getElementById("orderEditor").classList.remove("hidden");
      showMessage('trackingMessage', 'Order loaded successfully!', true);
    } else {
      // Initialize new order
      document.getElementById("customerName").value = "";
      document.getElementById("packageCount").value = "1 package";
      document.getElementById("orderDetails").value = "";
      document.getElementById("deliveryDate").value = "";
      document.getElementById("orderStatus").value = "Processing";
      
      const stepsContainer = document.getElementById("stepsContainer");
      stepsContainer.innerHTML = "";
      addStep("Order Received", new Date().toLocaleString(), "Order created in system");
      
      document.getElementById("orderEditor").classList.remove("hidden");
      showMessage('trackingMessage', 'New order initialized. Fill in details and save.', true);
    }
  } catch (error) {
    showMessage('trackingMessage', 'Error loading order: ' + error.message, false);
  }
}

// Save order to Firestore
async function saveOrder() {
  const trackingID = document.getElementById("trackingID").value.trim().toUpperCase();
  if (!trackingID) {
    showMessage('trackingMessage', 'Please enter a tracking number', false);
    return;
  }

  try {
    // Collect all steps
    const steps = [];
    const stepGroups = document.querySelectorAll('.step-group');
    
    stepGroups.forEach(group => {
      steps.push({
        status: group.querySelector('.step-status').value,
        time: group.querySelector('.step-time').value,
        details: group.querySelector('.step-details').value
      });
    });

    if (steps.length === 0) {
      showMessage('trackingMessage', 'Please add at least one tracking step', false);
      return;
    }

    // Create order data object
    const orderData = {
      trackingNumber: trackingID,
      status: document.getElementById("orderStatus").value,
      customer: document.getElementById("customerName").value,
      items: document.getElementById("orderDetails").value,
      packageCount: document.getElementById("packageCount").value,
      deliveryDate: document.getElementById("deliveryDate").value,
      steps: steps,
      lastUpdated: new Date()
    };

    // Save to Firestore
    await setDoc(doc(db, "orders", trackingID), orderData);
    showMessage('trackingMessage', 'Order saved successfully!', true);
  } catch (error) {
    showMessage('trackingMessage', 'Error saving order: ' + error.message, false);
  }
}

// Helper functions
function showMessage(elementId, message, isSuccess) {
  const msgElement = document.getElementById(elementId);
  msgElement.textContent = message;
  msgElement.className = isSuccess ? 'message success' : 'message error';
  msgElement.classList.remove('hidden');
  setTimeout(() => msgElement.classList.add('hidden'), 3000);
}

function addStep(status = "", time = "", details = "") {
  const stepsContainer = document.getElementById("stepsContainer");
  const stepNumber = stepsContainer.children.length + 1;
  
  const stepGroup = document.createElement("div");
  stepGroup.className = "step-group";
  stepGroup.innerHTML = `
    <label>Step ${stepNumber}</label>
    <div class="form-row">
      <div>
        <label>Status</label>
        <input type="text" class="step-status" placeholder="e.g., Shipped" value="${status}">
      </div>
      <div>
        <label>Date/Time</label>
        <input type="text" class="step-time" placeholder="e.g., June 14, 2025 11:20 AM" value="${time}">
      </div>
    </div>
    <label>Details</label>
    <textarea class="step-details" placeholder="Step details...">${details}</textarea>
    <button class="btn-danger" onclick="removeStep(this)"><i class="fas fa-trash"></i> Remove Step</button>
  `;
  stepsContainer.appendChild(stepGroup);
}

function removeStep(button) {
  const stepGroup = button.closest('.step-group');
  stepGroup.remove();
  
  // Re-number the remaining steps
  const steps = document.querySelectorAll('.step-group');
  steps.forEach((step, index) => {
    step.querySelector('label').textContent = `Step ${index + 1}`;
  });
}

function resetForm() {
  if (confirm('Are you sure you want to reset all changes?')) {
    document.getElementById("orderEditor").classList.add("hidden");
    document.getElementById("trackingID").value = "";
    showMessage('trackingMessage', 'Form reset. Enter a tracking number to continue.', true);
  }
}

// Make functions available globally
window.login = login;
window.loadOrder = loadOrder;
window.saveOrder = saveOrder;
window.addStep = addStep;
window.removeStep = removeStep;
window.resetForm = resetForm;
