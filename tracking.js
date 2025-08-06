   import { db } from './firebase-config.js';
import { doc, getDoc } from "firebase/firestore";

class MochaTracker {
  constructor() {
    this.cacheDOM();
    this.initEventListeners();
    this.setupMobileMenu();
  }

  // Cache all DOM elements
  cacheDOM() {
    this.elements = {
      // Tracking Section
      loadingOverlay: document.getElementById("loadingOverlay"),
      errorMsg: document.getElementById("errorMsg"),
      resultsContainer: document.getElementById("trackingResults"),
      trackingInput: document.getElementById("trackingNumber"),
      trackBtn: document.querySelector('.track-btn'),
      
      // Navigation
      hamburger: document.getElementById("hamburger"),
      navLinks: document.getElementById("navLinks"),
      
      // Order Info Display
      orderNumberText: document.getElementById("orderNumberText"),
      orderStatus: document.getElementById("orderStatus"),
      deliveryDate: document.getElementById("deliveryDate"),
      customerName: document.getElementById("customerName"),
      orderDetails: document.getElementById("orderDetails"),
      
      // Progress Tracking
      progressFill: document.querySelector('.progress-fill'),
      timelineContainer: document.querySelector('.status-timeline'),
      deliveryElement: document.querySelector('.delivery-estimate'),
      stepsContainer: document.querySelector('.progress-steps')
    };
  }

  // Initialize all event listeners
  initEventListeners() {
    // Tracking Form
    this.elements.trackBtn.addEventListener('click', () => this.trackOrder());
    this.elements.trackingInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.trackOrder();
    });

    // Mobile Menu
    document.addEventListener('click', (e) => {
      const isClickInside = this.elements.navLinks.contains(e.target) || 
                          this.elements.hamburger.contains(e.target);
      if (!isClickInside) {
        this.closeMobileMenu();
      }
    });
  }

  // Mobile Menu Functions
  setupMobileMenu() {
    this.elements.hamburger.addEventListener('click', () => {
      this.elements.navLinks.classList.toggle('active');
      this.elements.hamburger.innerHTML = this.elements.navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });
  }

  closeMobileMenu() {
    this.elements.navLinks.classList.remove('active');
    this.elements.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  }

  // Main Tracking Logic
  async trackOrder() {
    const trackingNumber = this.elements.trackingInput.value.trim();
    
    if (!trackingNumber) {
      this.showError("Please enter a tracking number");
      return;
    }

    this.showLoading(true);
    this.clearResults();

    try {
      const orderData = await this.fetchOrderData(trackingNumber);
      this.displayOrderResults(orderData, trackingNumber);
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  async fetchOrderData(trackingNumber) {
    const docRef = doc(db, "orders", trackingNumber);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Order not found. Please check your tracking number.");
    }
    
    return docSnap.data();
  }

  displayOrderResults(data, trackingNumber) {
    // Update basic info
    this.elements.orderNumberText.textContent = `Order #${trackingNumber}`;
    this.elements.orderStatus.textContent = data.status || "Processing";
    this.elements.deliveryDate.textContent = data.deliveryDate || "Not specified";
    this.elements.customerName.textContent = data.customer || "Not specified";
    this.elements.orderDetails.textContent = data.items || "No details available";

    // Update visual tracking
    this.updateProgressVisualization(data.status);
    this.renderTimeline(data.steps || []);
    this.updateDeliveryEstimate(data.deliveryDate);

    // Show results
    this.elements.resultsContainer.style.display = "block";
    this.elements.resultsContainer.classList.add('fade-in');
  }

  updateProgressVisualization(currentStatus) {
    const statusOrder = ["Processing", "In Transit", "Delivered"];
    const steps = this.elements.stepsContainer.querySelectorAll('.step');
    const activeIndex = statusOrder.indexOf(currentStatus);

    steps.forEach((step, index) => {
      step.classList.remove('completed', 'active', 'pending');
      
      if (index < activeIndex) {
        step.classList.add('completed');
      } else if (index === activeIndex) {
        step.classList.add('active');
      } else {
        step.classList.add('pending');
      }
    });

    // Animate progress bar
    const progressPercent = ((activeIndex + 1) / statusOrder.length) * 100;
    this.elements.progressFill.style.width = `${progressPercent}%`;
    this.elements.progressFill.style.transition = 'width 0.5s ease';
  }

  renderTimeline(steps) {
    this.elements.timelineContainer.innerHTML = steps.map(step => `
      <div class="status-item ${step.status === "Delivered" ? 'completed' : ''}">
        <div class="status-content">
          <div class="status-text">${step.status}</div>
          <div class="status-details">${step.details}</div>
        </div>
        <div class="status-date">${step.time}</div>
      </div>
    `).join('');
  }

  updateDeliveryEstimate(date) {
    if (date) {
      this.elements.deliveryElement.style.display = 'flex';
      document.querySelector('.delivery-date').textContent = date;
    } else {
      this.elements.deliveryElement.style.display = 'none';
    }
  }

  // Utility Functions
  showLoading(show) {
    this.elements.loadingOverlay.classList.toggle('active', show);
  }

  showError(message) {
    this.elements.errorMsg.textContent = message;
    this.elements.errorMsg.style.display = 'block';
    setTimeout(() => {
      this.elements.errorMsg.style.display = 'none';
    }, 5000);
  }

  clearResults() {
    this.elements.resultsContainer.style.display = 'none';
    this.elements.errorMsg.textContent = '';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const tracker = new MochaTracker();
  
  // For debugging/dev only - remove in production
  window.tracker = tracker;
});
    // Mobile menu toggle (unchanged)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
