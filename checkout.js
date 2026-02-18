// checkout.js
import { getCart, clearCart } from "./cart-utils.js";

const emptyCartMsg = document.getElementById("emptyCartMsg");
const checkoutWrap = document.getElementById("checkoutWrap");
const deliveryFields = document.getElementById("deliveryFields");
const orderSummary = document.getElementById("orderSummary");

const subtotalEl = document.getElementById("subtotal");
const deliveryFeeEl = document.getElementById("deliveryFee");
const totalEl = document.getElementById("total");
const formError = document.getElementById("formError");

const ORDERS_KEY = "ccc_orders_v1";

function money(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function getFulfillment() {
  const selected = document.querySelector('input[name="fulfillment"]:checked');
  return selected ? selected.value : "Pickup";
}

function calcTotals(cart, fulfillment) {
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);

  // Simple simulated fees (easy to explain in presentation)
  const deliveryFee = (fulfillment === "Delivery" && subtotal > 0) ? 75 : 0;

  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
}

function renderSummary() {
  const cart = getCart();
  if (cart.length === 0) {
    emptyCartMsg.style.display = "block";
    checkoutWrap.style.display = "none";
    return;
  }

  emptyCartMsg.style.display = "none";
  checkoutWrap.style.display = "block";

  orderSummary.innerHTML = cart.map(item => `
    <p>
      ${item.qty}x ${item.name}
      (${item.size.w}"W x ${item.size.h}"H x ${item.size.d}"D, ${item.finish})
      - $${money(item.unitPrice)}
    </p>
  `).join("");

  const fulfillment = getFulfillment();
  const totals = calcTotals(cart, fulfillment);

  subtotalEl.textContent = money(totals.subtotal);
  deliveryFeeEl.textContent = money(totals.deliveryFee);
  totalEl.textContent = money(totals.total);

  // Toggle delivery fields
  deliveryFields.style.display = (fulfillment === "Delivery") ? "block" : "none";
}

// Update totals when fulfillment changes
document.querySelectorAll('input[name="fulfillment"]').forEach(radio => {
  radio.addEventListener("change", renderSummary);
});

document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  formError.textContent = "";

  const cart = getCart();
  if (cart.length === 0) {
    formError.textContent = "Your cart is empty.";
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const fulfillment = getFulfillment();

  // Delivery validation
  if (fulfillment === "Delivery") {
    const address1 = document.getElementById("address1").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();

    if (!address1 || !city || !state || !zip) {
      formError.textContent = "Please complete the delivery address fields.";
      return;
    }
  }

  // Payment fields (simulated validation only)
  const cardName = document.getElementById("cardName").value.trim();
  const cardNumber = document.getElementById("cardNumber").value.trim();
  const cardExp = document.getElementById("cardExp").value.trim();
  const cardCvv = document.getElementById("cardCvv").value.trim();

  if (!cardName || !cardNumber || !cardExp || !cardCvv) {
    formError.textContent = "Please complete the payment fields (simulated).";
    return;
  }

  const totals = calcTotals(cart, fulfillment);

  // Generate order id
  const orderId = "CCC-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  // Save order
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  orders.push({
    id: orderId,
    createdAt: new Date().toISOString(),
    customer: { fullName, email, phone },
    fulfillment,
    items: cart,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    payment: { method: "Card (Simulated)" }
  });

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // Clear cart and redirect
  clearCart();
  window.location.href = `thankyou.html?id=${encodeURIComponent(orderId)}`;
});

renderSummary();
