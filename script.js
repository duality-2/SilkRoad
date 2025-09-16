// ===============================================
// SpiceConnect - JavaScript Functionality
// Interactive features for B2B Spices Platform
// ===============================================

// Global Variables
let cart = [];
let currentUser = null;
let totalAmount = 0;

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

// Initialize Application
function initializeApp() {
  setupNavigationToggle();
  setupSmoothScrolling();
  setupPaymentForm();
  setupTrackingForm();
  setupCartFunctionality();
  setupAnimations();
  setupFormValidations();
  hydrateFromStorage();
  setupAuthSection();
  setupCartPage();
  setupCheckoutFlow();
}

// ===============================================
// NAVIGATION FUNCTIONALITY
// ===============================================

function setupNavigationToggle() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking on a nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
}

// ===============================================
// SMOOTH SCROLLING FUNCTIONALITY
// ===============================================

function setupSmoothScrolling() {
  // Handle navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Handle hero buttons
  const exploreButton = document.querySelector(".btn-primary");
  if (exploreButton) {
    exploreButton.addEventListener("click", () => {
      document.getElementById("spices").scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  const trackButton = document.querySelector(".btn-secondary");
  if (trackButton) {
    trackButton.addEventListener("click", () => {
      openTrackingModal();
    });
  }
}

// ===============================================
// CART FUNCTIONALITY
// ===============================================

function setupCartFunctionality() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const spiceCard = this.closest(".spice-card");
      const spiceName = spiceCard.querySelector("h3").textContent;
      const spicePrice = spiceCard.querySelector(".spice-price").textContent;
      const spiceImage = spiceCard.querySelector("img").src;

      addToCart({
        name: spiceName,
        price: spicePrice,
        image: spiceImage,
        qty: 1,
      });

      // Visual feedback
      this.textContent = "Added!";
      this.style.background = "#27ae60";

      setTimeout(() => {
        this.textContent = "Add to Cart";
        this.style.background = "";
      }, 2000);
    });
  });
}

function addToCart(item) {
  // Normalize price to number (₹xxx/kg → xxx)
  const priceNumber = parseInt(String(item.price).replace(/[^0-9]/g, ""), 10) || 0;

  // Merge if same name
  const existing = cart.find((p) => p.name === item.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, priceNumber });
  }
  updateCartDisplay();
  persistCart();

  // Show notification
  showNotification(`${item.name} added to cart!`, "success");
}

function updateCartDisplay() {
  // Calculate total items and amount
  const totalItems = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = totalItems;

  // You can add a cart icon and counter here
  console.log(`Cart updated: ${totalItems} items`);
}

function persistCart() {
  try {
    localStorage.setItem("sc_cart", JSON.stringify(cart));
  } catch {}
}

function hydrateFromStorage() {
  try {
    const stored = localStorage.getItem("sc_cart");
    if (stored) cart = JSON.parse(stored);
    const user = localStorage.getItem("sc_user");
    if (user) currentUser = JSON.parse(user);
  } catch {}
  updateCartDisplay();
  renderCartPage();
  reflectAuthState();
}

// ===============================================
// AUTH SECTION
// ===============================================

function setupAuthSection() {
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginTab && signupTab && loginForm && signupForm) {
    loginTab.addEventListener("click", () => switchAuthTab("login"));
    signupTab.addEventListener("click", () => switchAuthTab("signup"));

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      if (!email || !password) return;
      // Demo auth: accept any; persist
      currentUser = { name: email.split("@")[0], email };
      try { localStorage.setItem("sc_user", JSON.stringify(currentUser)); } catch {}
      showNotification("Logged in successfully", "success");
      reflectAuthState();
      navigateToSection("spices");
    });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const pass = document.getElementById("signupPassword").value;
      const conf = document.getElementById("signupConfirm").value;
      if (!name || !email || !pass || pass !== conf) {
        showNotification("Please fill all fields and confirm password.", "error");
        return;
      }
      currentUser = { name, email };
      try { localStorage.setItem("sc_user", JSON.stringify(currentUser)); } catch {}
      showNotification("Account created and logged in", "success");
      reflectAuthState();
      navigateToSection("spices");
    });
  }
}

function switchAuthTab(which) {
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (which === "login") {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }
}

function reflectAuthState() {
  // Could update navbar later (e.g., show user name)
}

function navigateToSection(id) {
  const sections = document.querySelectorAll("section.page-section, section.hero, section.spices-section, section.features-section, section.about-section, section.contact-section");
  sections.forEach((s) => {
    if (s.id === id || (id === "home" && s.classList.contains("hero"))) {
      s.style.display = "block";
      s.scrollIntoView({ behavior: "smooth" });
    } else if (s.classList.contains("hero") || s.classList.contains("spices-section") || s.classList.contains("features-section") || s.classList.contains("about-section") || s.classList.contains("contact-section")) {
      // Keep main pages visible unless navigating to a specific page-section
      if (id === "cart" || id === "auth" || id === "checkout" || id === "payment" || id === "confirmation") {
        s.style.display = "none";
      } else {
        s.style.display = "";
      }
    } else {
      s.style.display = s.classList.contains("page-section") ? "none" : s.style.display;
    }
  });
}

// ===============================================
// CART PAGE RENDERING
// ===============================================

function setupCartPage() {
  const continueBtn = document.getElementById("continueShopping");
  const checkoutBtn = document.getElementById("goToCheckout");
  if (continueBtn) continueBtn.addEventListener("click", () => navigateToSection("spices"));
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showNotification("Your cart is empty", "warning");
      return;
    }
    navigateToSection("checkout");
  });

  // Intercept clicks on nav Cart link to render
  const cartLink = document.querySelector('a[href="#cart"]');
  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      e.preventDefault();
      renderCartPage();
      navigateToSection("cart");
    });
  }
}

function renderCartPage() {
  const list = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!list || !totalEl) return;
  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#7f8c8d;">Your cart is empty.</p>';
    totalEl.textContent = "₹0";
    return;
  }

  let total = 0;
  list.innerHTML = cart
    .map((item, idx) => {
      const unit = item.priceNumber || parseInt(String(item.price).replace(/[^0-9]/g, ""), 10) || 0;
      const sub = unit * (item.qty || 1);
      total += sub;
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="unit">₹${unit} / kg</p>
            <div class="qty-controls">
              <button data-idx="${idx}" class="qty-minus">-</button>
              <input type="number" min="1" value="${item.qty || 1}" data-idx="${idx}" class="qty-input" />
              <button data-idx="${idx}" class="qty-plus">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="subtotal">₹${sub}</div>
            <button data-idx="${idx}" class="remove-item">Remove</button>
          </div>
        </div>`;
    })
    .join("");

  totalEl.textContent = `₹${total}`;

  // Wire controls
  list.querySelectorAll(".remove-item").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.getAttribute("data-idx"), 10);
      cart.splice(idx, 1);
      persistCart();
      updateCartDisplay();
      renderCartPage();
    })
  );
  list.querySelectorAll(".qty-minus").forEach((btn) =>
    btn.addEventListener("click", (e) => changeQty(e.currentTarget.getAttribute("data-idx"), -1))
  );
  list.querySelectorAll(".qty-plus").forEach((btn) =>
    btn.addEventListener("click", (e) => changeQty(e.currentTarget.getAttribute("data-idx"), 1))
  );
  list.querySelectorAll(".qty-input").forEach((inp) =>
    inp.addEventListener("change", (e) => setQty(e.currentTarget.getAttribute("data-idx"), parseInt(e.currentTarget.value, 10)))
  );
}

function changeQty(indexStr, delta) {
  const idx = parseInt(indexStr, 10);
  const item = cart[idx];
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  persistCart();
  renderCartPage();
  updateCartDisplay();
}

function setQty(indexStr, qty) {
  const idx = parseInt(indexStr, 10);
  const item = cart[idx];
  if (!item) return;
  item.qty = Math.max(1, qty || 1);
  persistCart();
  renderCartPage();
  updateCartDisplay();
}

// ===============================================
// CHECKOUT → PAYMENT → CONFIRMATION
// ===============================================

function setupCheckoutFlow() {
  const backToCart = document.getElementById("backToCart");
  if (backToCart) backToCart.addEventListener("click", () => navigateToSection("cart"));

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showNotification("Your cart is empty", "warning");
      return;
    }
    const details = {
      name: document.getElementById("custName").value.trim(),
      phone: document.getElementById("custPhone").value.trim(),
      email: document.getElementById("custEmail").value.trim(),
      address: document.getElementById("custAddress").value.trim(),
    };
    if (!details.name || !details.phone || !details.email || !details.address) {
      showNotification("Please fill all details", "error");
      return;
    }
    try { localStorage.setItem("sc_checkout", JSON.stringify(details)); } catch {}
    renderPaymentChoice();
    navigateToSection("payment");
  });

  const backToCheckout = document.getElementById("backToCheckout");
  if (backToCheckout) backToCheckout.addEventListener("click", () => navigateToSection("checkout"));

  const paymentChoiceForm = document.getElementById("paymentChoiceForm");
  if (paymentChoiceForm) paymentChoiceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const method = document.querySelector('input[name="payChoice"]:checked').value;
    confirmOrder(method);
  });

  const goHomeAfterOrder = document.getElementById("goHomeAfterOrder");
  if (goHomeAfterOrder) goHomeAfterOrder.addEventListener("click", () => {
    // reset state
    cart = [];
    persistCart();
    updateCartDisplay();
  });
}

function renderPaymentChoice() {
  const container = document.getElementById("paymentChoiceDetails");
  if (!container) return;
  const selected = document.querySelector('input[name="payChoice"]:checked').value;
  let html = "";
  if (selected === "upi") {
    html = `<input type="text" id="upiChoice" placeholder="UPI ID (e.g., user@upi)" required />`;
  } else if (selected === "card") {
    html = `<input type=\"text\" id=\"cardChoice\" placeholder=\"Card Number\" required />
            <div class=\"card-row\"><input type=\"text\" id=\"cardExpChoice\" placeholder=\"MM/YY\" required />
            <input type=\"text\" id=\"cardCvvChoice\" placeholder=\"CVV\" required /></div>`;
  } else {
    html = `<p>Cash will be collected upon delivery.</p>`;
  }
  container.innerHTML = html;

  // react on change
  document.querySelectorAll('input[name="payChoice"]').forEach((r) =>
    r.addEventListener("change", renderPaymentChoice)
  );
}

function confirmOrder(method) {
  // Minimal validation for selected method fields
  if (method === "upi") {
    const v = document.getElementById("upiChoice").value.trim();
    if (!v) return showNotification("Enter a valid UPI ID", "error");
  }
  if (method === "card") {
    const n = document.getElementById("cardChoice").value.trim();
    const e = document.getElementById("cardExpChoice").value.trim();
    const c = document.getElementById("cardCvvChoice").value.trim();
    if (!n || !e || !c) return showNotification("Enter complete card details", "error");
  }

  // Build order summary
  const details = (() => {
    try { return JSON.parse(localStorage.getItem("sc_checkout") || "{}"); } catch { return {}; }
  })();
  const total = cart.reduce((sum, i) => (i.priceNumber || 0) * (i.qty || 1) + sum, 0);
  const itemsText = cart.map((i) => `${i.name} x ${i.qty || 1}`).join(", ");
  const summary = `Order for ${details.name || "Customer"} (₹${total}) — Items: ${itemsText}. Payment: ${method.toUpperCase()}.`;

  const summaryEl = document.getElementById("orderSummary");
  if (summaryEl) summaryEl.textContent = summary;

  navigateToSection("confirmation");
  showNotification("Order confirmed!", "success");
}

// ===============================================
// PAYMENT MODAL FUNCTIONALITY
// ===============================================

function openPaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Set default amount if cart has items
    const amountInput = document.getElementById("paymentAmount");
    if (amountInput && cart.length > 0) {
      amountInput.value = "5000"; // Default amount
    }
  }
}

function closePaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    resetPaymentForm();
  }
}

function setupPaymentForm() {
  const paymentForm = document.getElementById("paymentForm");
  const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );

  // Handle payment method changes
  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      showPaymentDetails(this.value);
    });
  });

  // Handle form submission
  if (paymentForm) {
    paymentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      processPayment();
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (e) {
    const modal = document.getElementById("paymentModal");
    if (e.target === modal) {
      closePaymentModal();
    }
  });
}

function showPaymentDetails(method) {
  // Hide all payment details
  document.querySelectorAll(".payment-details").forEach((detail) => {
    detail.style.display = "none";
  });

  // Show selected payment method details
  const selectedDetail = document.getElementById(method + "Details");
  if (selectedDetail) {
    selectedDetail.style.display = "block";
  }
}

function processPayment() {
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;
  const amount = document.getElementById("paymentAmount").value;

  if (!amount || amount <= 0) {
    showNotification("Please enter a valid amount", "error");
    return;
  }

  // Simulate payment processing
  showNotification("Processing payment...", "info");

  setTimeout(() => {
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      const transactionId = generateTransactionId();
      showPaymentSuccess(paymentMethod, amount, transactionId);
    } else {
      showNotification("Payment failed. Please try again.", "error");
    }
  }, 2000);
}

function generateTransactionId() {
  return "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function showPaymentSuccess(method, amount, transactionId) {
  const modalContent = document.querySelector("#paymentModal .modal-content");
  modalContent.innerHTML = `
        <span class="close" onclick="closePaymentModal()">&times;</span>
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-check-circle" style="font-size: 4rem; color: #27ae60; margin-bottom: 1rem;"></i>
            <h2 style="color: #27ae60; margin-bottom: 1rem;">Payment Successful!</h2>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Method:</strong> ${method.toUpperCase()}</p>
                <p><strong>Status:</strong> <span style="color: #27ae60;">Completed</span></p>
            </div>
            <p style="color: #7f8c8d; margin-bottom: 2rem;">Your order will be processed within 24 hours.</p>
            <button class="btn btn-primary" onclick="closePaymentModal()">Continue Shopping</button>
        </div>
    `;

  // Clear cart after successful payment
  cart = [];
  updateCartDisplay();
}

function resetPaymentForm() {
  const form = document.getElementById("paymentForm");
  if (form) {
    form.reset();
    showPaymentDetails("card"); // Reset to default
  }
}

// ===============================================
// SHIPMENT TRACKING FUNCTIONALITY
// ===============================================

function openTrackingModal() {
  const modal = document.getElementById("trackingModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeTrackingModal() {
  const modal = document.getElementById("trackingModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    resetTrackingForm();
  }
}

function setupTrackingForm() {
  const trackingForm = document.getElementById("trackingForm");

  if (trackingForm) {
    trackingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      trackShipment();
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (e) {
    const modal = document.getElementById("trackingModal");
    if (e.target === modal) {
      closeTrackingModal();
    }
  });
}

function trackShipment() {
  const trackingId = document.getElementById("trackingId").value.trim();
  const resultDiv = document.getElementById("trackingResult");

  if (!trackingId) {
    showNotification("Please enter a tracking ID", "error");
    return;
  }

  // Show loading
  resultDiv.innerHTML =
    '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #e67e22;"></i><p>Tracking your shipment...</p></div>';

  // Simulate API call
  setTimeout(() => {
    const trackingData = generateTrackingData(trackingId);
    displayTrackingResult(trackingData);
  }, 1500);
}

function generateTrackingData(trackingId) {
  const statuses = ["processing", "in-transit", "delivered"];
  const locations = [
    "Mumbai, Maharashtra",
    "Delhi, NCR",
    "Bangalore, Karnataka",
    "Chennai, Tamil Nadu",
  ];
  const spices = [
    "Turmeric",
    "Cardamom",
    "Black Pepper",
    "Cumin Seeds",
    "Coriander",
  ];

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const spice = spices[Math.floor(Math.random() * spices.length)];

  return {
    trackingId: trackingId,
    status: status,
    currentLocation: location,
    product: spice,
    estimatedDelivery: getEstimatedDelivery(status),
    timeline: generateTimeline(status),
  };
}

function getEstimatedDelivery(status) {
  const today = new Date();
  let deliveryDate;

  switch (status) {
    case "processing":
      deliveryDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      break;
    case "in-transit":
      deliveryDate = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
      break;
    case "delivered":
      deliveryDate = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
      break;
  }

  return deliveryDate.toLocaleDateString("en-IN");
}

function generateTimeline(status) {
  const timeline = [
    { step: "Order Placed", date: "2025-09-13", completed: true },
    { step: "Processing", date: "2025-09-14", completed: true },
    {
      step: "In Transit",
      date: "2025-09-15",
      completed: status !== "processing",
    },
    {
      step: "Delivered",
      date: "2025-09-16",
      completed: status === "delivered",
    },
  ];

  return timeline;
}

function displayTrackingResult(data) {
  const resultDiv = document.getElementById("trackingResult");

  const statusClass = `status-${data.status}`;
  const statusText =
    data.status.charAt(0).toUpperCase() +
    data.status.slice(1).replace("-", " ");

  resultDiv.innerHTML = `
        <div style="background: white; padding: 1.5rem; border-radius: 10px; border-left: 4px solid #e67e22;">
            <div class="tracking-status">
                <div>
                    <h4>Tracking ID: ${data.trackingId}</h4>
                    <p style="color: #7f8c8d;">Product: ${data.product}</p>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div style="margin: 1rem 0;">
                <p><strong>Current Location:</strong> ${
                  data.currentLocation
                }</p>
                <p><strong>Estimated Delivery:</strong> ${
                  data.estimatedDelivery
                }</p>
            </div>
            
            <div style="margin-top: 1.5rem;">
                <h5 style="margin-bottom: 1rem; color: #2c3e50;">Tracking Timeline</h5>
                ${data.timeline
                  .map(
                    (item) => `
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <i class="fas fa-${
                          item.completed ? "check-circle" : "circle"
                        }" 
                           style="color: ${
                             item.completed ? "#27ae60" : "#bdc3c7"
                           }; margin-right: 10px;"></i>
                        <span style="color: ${
                          item.completed ? "#2c3e50" : "#7f8c8d"
                        };">
                            ${item.step} - ${item.date}
                        </span>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;
}

function resetTrackingForm() {
  document.getElementById("trackingForm").reset();
  document.getElementById("trackingResult").innerHTML = "";
}

// ===============================================
// FORM VALIDATIONS
// ===============================================

function setupFormValidations() {
  // Contact form validation
  const contactForm = document.querySelector(".contact-form form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitContactForm();
    });
  }

  // Payment form validations
  setupPaymentValidations();
}

function setupPaymentValidations() {
  const cardNumber = document.getElementById("cardNumber");
  const expiry = document.getElementById("expiry");
  const cvv = document.getElementById("cvv");

  if (cardNumber) {
    cardNumber.addEventListener("input", function () {
      this.value = this.value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ");
      if (this.value.length > 19) this.value = this.value.substr(0, 19);
    });
  }

  if (expiry) {
    expiry.addEventListener("input", function () {
      this.value = this.value
        .replace(/\D/g, "")
        .replace(/(\d{2})(?=\d)/, "$1/");
      if (this.value.length > 5) this.value = this.value.substr(0, 5);
    });
  }

  if (cvv) {
    cvv.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
      if (this.value.length > 3) this.value = this.value.substr(0, 3);
    });
  }
}

function submitContactForm() {
  const formData = new FormData(document.querySelector(".contact-form form"));

  // Simulate form submission
  showNotification("Sending message...", "info");

  setTimeout(() => {
    showNotification(
      "Message sent successfully! We will contact you soon.",
      "success"
    );
    document.querySelector(".contact-form form").reset();
  }, 1500);
}

// ===============================================
// ANIMATIONS AND EFFECTS
// ===============================================

function setupAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up");
      }
    });
  }, observerOptions);

  // Observe spice cards
  document.querySelectorAll(".spice-card").forEach((card) => {
    observer.observe(card);
  });

  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    observer.observe(card);
  });

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
      navbar.style.boxShadow = "0 2px 30px rgba(0, 0, 0, 0.15)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
    }
  });
}

// ===============================================
// NOTIFICATION SYSTEM
// ===============================================

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 3000;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        ">
            <i class="fas fa-${getNotificationIcon(
              type
            )}" style="margin-right: 10px;"></i>
            ${message}
        </div>
    `;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "#27ae60";
    case "error":
      return "#e74c3c";
    case "warning":
      return "#f39c12";
    default:
      return "#3498db";
  }
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "exclamation-circle";
    case "warning":
      return "exclamation-triangle";
    default:
      return "info-circle";
  }
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===============================================
// KEYBOARD ACCESSIBILITY
// ===============================================

document.addEventListener("keydown", function (e) {
  // Close modals with Escape key
  if (e.key === "Escape") {
    closePaymentModal();
    closeTrackingModal();
  }
});

// ===============================================
// PERFORMANCE OPTIMIZATION
// ===============================================

// Lazy loading for images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// Console message for developers
console.log(
  "%cSpiceConnect B2B Platform",
  "color: #e67e22; font-size: 24px; font-weight: bold;"
);
console.log(
  "%cBuilt with vanilla JavaScript for college project",
  "color: #7f8c8d; font-size: 14px;"
);
console.log(
  "%cFeatures: Payment Gateway, Shipment Tracking, Responsive Design",
  "color: #2c3e50; font-size: 12px;"
);
