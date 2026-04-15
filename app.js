// =======================
// CART SETUP
// =======================
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// update cart badge
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.innerText = cart.length;
}
updateCartCount();

// =======================
// PRICING LOGIC
// =======================

// base cabinet rules
const BASE_STANDARD = { w: 24, h: 32, d: 21, price: 100 };
const WALL_STANDARD = { w: 24, h: 24, d: 15, price: 80 }; // cheaper base for wall

function calculatePrice(type, width, height, depth, material) {
  let base;

  if (type === "base" || type === "vanity") {
    base = BASE_STANDARD;
  } else {
    base = WALL_STANDARD;
  }

  let price = base.price;

  // size adjustments
  const sizeDiff =
    Math.abs(width - base.w) +
    Math.abs(height - base.h) +
    Math.abs(depth - base.d);

  price += sizeDiff * 15;

  // material increase
  if (material === "premium") {
    price *= 1.15;
  }

  return Math.round(price);
}

// =======================
// READ CARD DATA
// =======================
function getCardData(card) {
  const type = card.dataset.type;

  const width = Number(card.querySelector(".width").value);
  const height = Number(card.querySelector(".height").value);
  const depth = Number(card.querySelector(".depth").value);

  const material = card.querySelector(".material").value;

  const upgrades = {
    doorStyle: card.querySelector(".doorStyle").value,
    finish: card.querySelector(".finish").value,
    drawerCount: Number(card.querySelector(".drawerCount").value),
    softClose: card.querySelector(".softClose")?.checked,
    finishedEnds: card.querySelector(".finishedEnds")?.checked,
    plywoodBox: card.querySelector(".plywoodBox")?.checked,
    pulloutShelf: card.querySelector(".pulloutShelf")?.checked,
    sinkBase: card.querySelector(".sinkBase")?.checked
  };

  const price = calculatePrice(type, width, height, depth, material);

  return {
    type,
    width,
    height,
    depth,
    material,
    upgrades,
    price
  };
}

// =======================
// UPDATE PRICE LIVE
// =======================
function setupPricing(card) {
  const inputs = card.querySelectorAll("input, select");

  function update() {
    const data = getCardData(card);
    card.querySelector(".priceValue").innerText = data.price;
  }

  inputs.forEach((el) => el.addEventListener("input", update));

  update(); // initial
}

// =======================
// ADD TO CART
// =======================
function setupAddToCart(card) {
  const btn = card.querySelector(".add-to-cart");

  btn.addEventListener("click", () => {
    const data = getCardData(card);

    cart.push(data);
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    btn.innerText = "Added!";
    setTimeout(() => (btn.innerText = "Add to Cart"), 1000);
  });
}

// =======================
// INIT ALL CARDS
// =======================
document.querySelectorAll(".product-card").forEach((card) => {
  setupPricing(card);
  setupAddToCart(card);
});
