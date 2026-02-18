// cart-utils.js
const CART_KEY = "ccc_cart_v1";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item) {
  const cart = getCart();

  // If same product + same options + same size exists, just increase qty
  const matchIndex = cart.findIndex(x =>
    x.id === item.id &&
    x.finish === item.finish &&
    x.size.w === item.size.w &&
    x.size.h === item.size.h &&
    x.size.d === item.size.d
  );

  if (matchIndex !== -1) {
    cart[matchIndex].qty += item.qty;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function updateQty(index, newQty) {
  const cart = getCart();
  const qty = Math.max(1, Number(newQty) || 1);
  cart[index].qty = qty;
  saveCart(cart);
}

export function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
