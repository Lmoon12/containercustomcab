const EMAILJS_PUBLIC_KEY = 'zh8Yg87P1oNzc6jE8';
const EMAILJS_SERVICE_ID = 'service_fqhcube';
const EMAILJS_TEMPLATE_ID = 'template_51jo6pa';

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// EmailJS init
if (window.emailjs) {
  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
  });
}

// Update cart count
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.innerText = cart.length;
}
updateCartCount();

// Helpers
function formatType(type) {
  if (type === "base") return "Base Cabinet";
  if (type === "wall") return "Wall Cabinet";
  if (type === "vanity") return "Vanity";
  return type;
}

function formatMaterial(material) {
  return material === "maple"
    ? "Maple"
    : "Stain grade / non-maple";
}

function pretty(val) {
  if (!val) return "";
  return val.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
}

function formatUpgrades(u) {
  if (!u) return "None";

  const list = [];

  if (u.doorStyle) list.push(`Door: ${pretty(u.doorStyle)}`);
  if (u.finish) list.push(`Finish: ${pretty(u.finish)}`);
  if (u.drawerCount > 0) list.push(`Drawers: ${u.drawerCount}`);
  if (u.softClose) list.push("Soft-close");
  if (u.finishedEnds) list.push("Finished ends");
  if (u.plywoodBox) list.push("Plywood box");
  if (u.pulloutShelf) list.push("Pull-out shelf");
  if (u.sinkBase) list.push("Sink base");

  return list.length ? list.join(" • ") : "None";
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
}

// Render cart
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const submitBtn = document.getElementById("submit-order");

  if (!cart.length) {
    container.innerHTML = `<div class="empty-cart">Your cart is empty.</div>`;
    totalEl.innerText = "$0";
    submitBtn.disabled = true;
    return;
  }

  let total = 0;

  container.innerHTML = cart.map((item, index) => {
    total += Number(item.price || 0);

    return `
      <div class="cart-item">
        <div class="cart-item-top">
          <div class="cart-item-title">
            ${index + 1}. ${formatType(item.type)}
          </div>
          <div class="cart-item-price">$${item.price}</div>
        </div>

        <div class="cart-item-line">
          <strong>Size:</strong>
          ${item.width}W × ${item.height}H × ${item.depth}D
        </div>

        <div class="cart-item-line">
          <strong>Material:</strong>
          ${formatMaterial(item.material)}
        </div>

        <div class="cart-item-line">
          <strong>Upgrades:</strong>
          ${formatUpgrades(item.upgrades)}
        </div>

        <button class="remove-item-btn" onclick="removeItem(${index})">
          Remove
        </button>
      </div>
    `;
  }).join("");

  totalEl.innerText = `$${total}`;
  submitBtn.disabled = false;
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// Clear cart
document.getElementById("clear-cart").addEventListener("click", () => {
  cart = [];
  localStorage.removeItem("cart");
  renderCart();
  updateCartCount();
});

// =======================
// SUBMIT ORDER (MAILTO)
// =======================
document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!cart.length) return;

  const formData = new FormData(e.target);
  const total = getCartTotal();

  const orderItems = cart.map((item, index) => {
    return `${index + 1}. ${formatType(item.type)}
Size: ${item.width}W x ${item.height}H x ${item.depth}D
Material: ${formatMaterial(item.material)}
Upgrades: ${formatUpgrades(item.upgrades)}
Price: $${item.price}
`;
  }).join("\n");

  const subject = "New Cabinet Order Request";

  const body = `
Customer Information
---------------------
Name: ${formData.get("fullName")}
Email: ${formData.get("email")}
Phone: ${formData.get("phone")}
City: ${formData.get("city")}

Project Notes:
${formData.get("notes")}

Order Details
---------------------
${orderItems}

TOTAL: $${total}
`;

  const mailtoLink = `mailto:your@email.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;

  // optional: clear cart after opening email
  localStorage.removeItem("cart");
});

// init
renderCart();
