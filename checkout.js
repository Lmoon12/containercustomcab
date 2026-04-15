// =======================
// LOAD CART
// =======================
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// =======================
// UPDATE CART COUNT (header)
// =======================
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.innerText = cart.length;
}
updateCartCount();

// =======================
// FORMAT HELPERS
// =======================
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

// =======================
// RENDER CART
// =======================
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        Your cart is empty. Go back and add cabinets before checking out.
      </div>
    `;
    totalEl.innerText = "$0";
    document.getElementById("submit-order").disabled = true;
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
}

// =======================
// REMOVE ITEM
// =======================
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// =======================
// CLEAR CART
// =======================
document.getElementById("clear-cart").addEventListener("click", () => {
  cart = [];
  localStorage.removeItem("cart");
  renderCart();
  updateCartCount();
});

// =======================
// FORM SUBMIT (TEMP)
// =======================
document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!cart.length) return;

  alert("Order submitted (next step: email integration)");

  localStorage.removeItem("cart");
  window.location.href = "thankyou.html";
});

// =======================
renderCart();
