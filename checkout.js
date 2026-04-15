let cart = JSON.parse(localStorage.getItem("cart") || "[]");

const BUSINESS_EMAIL = "lancemoon187@gmail.com";

// =======================
// UPDATE CART COUNT
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
  return material === "maple" ? "Maple" : "Stain grade / non-maple";
}

function pretty(val) {
  if (!val) return "";
  return String(val).replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
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

function generateInvoiceNumber() {
  const now = new Date();
  return `CCC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
}

// =======================
// RENDER CART
// =======================
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const submitBtn = document.getElementById("submit-order");

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        Your cart is empty. Go back and add cabinets before checking out.
      </div>
    `;
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
          <div class="cart-item-title">${index + 1}. ${formatType(item.type)}</div>
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

        <button class="remove-item-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  }).join("");

  totalEl.innerText = `$${total}`;
  submitBtn.disabled = false;
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
// PDF INVOICE
// =======================
function buildInvoicePdf(customer, invoiceNumber) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const total = getCartTotal();
  const today = new Date().toLocaleDateString();

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Container Custom Cabinets", 14, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Cabinet Order Invoice / Request", 14, y);

  y += 10;
  doc.text(`Invoice #: ${invoiceNumber}`, 14, y);
  y += 6;
  doc.text(`Date: ${today}`, 14, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 14, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${customer.fullName}`, 14, y);
  y += 6;
  doc.text(`Email: ${customer.email}`, 14, y);
  y += 6;
  doc.text(`Phone: ${customer.phone}`, 14, y);
  y += 6;
  doc.text(`City / Job Location: ${customer.city || "-"}`, 14, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Order Items", 14, y);

  y += 8;
  doc.setFont("helvetica", "normal");

  cart.forEach((item, index) => {
    const lines = [
      `${index + 1}. ${formatType(item.type)} - $${item.price}`,
      `   Size: ${item.width}W x ${item.height}H x ${item.depth}D`,
      `   Material: ${formatMaterial(item.material)}`,
      `   Upgrades: ${formatUpgrades(item.upgrades)}`
    ];

    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 6;
    });

    y += 2;
  });

  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text(`Estimated Total: $${total}`, 14, y);

  y += 10;
  doc.text("Project Notes", 14, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  const notes = customer.notes || "-";
  const wrappedNotes = doc.splitTextToSize(notes, 180);
  doc.text(wrappedNotes, 14, y);

  return doc;
}

// =======================
// SUBMIT ORDER (PDF + MAILTO)
// =======================
document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!cart.length) return;

  const formData = new FormData(e.target);

  const customer = {
    fullName: formData.get("fullName") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    city: formData.get("city") || "",
    notes: formData.get("notes") || ""
  };

  const total = getCartTotal();
  const invoiceNumber = generateInvoiceNumber();

  // Generate and download PDF
  const doc = buildInvoicePdf(customer, invoiceNumber);
  const pdfFileName = `${invoiceNumber}.pdf`;
  doc.save(pdfFileName);

  const orderItems = cart.map((item, index) => {
    return `${index + 1}. ${formatType(item.type)}
Size: ${item.width}W x ${item.height}H x ${item.depth}D
Material: ${formatMaterial(item.material)}
Upgrades: ${formatUpgrades(item.upgrades)}
Price: $${item.price}
`;
  }).join("\n");

  const subject = `Cabinet Order Request - ${invoiceNumber}`;

  const body = `
A new cabinet order request has been prepared.

Invoice Number: ${invoiceNumber}
Estimated Total: $${total}

Customer Information
---------------------
Name: ${customer.fullName}
Email: ${customer.email}
Phone: ${customer.phone}
City / Job Location: ${customer.city}

Project Notes
---------------------
${customer.notes}

Order Details
---------------------
${orderItems}

IMPORTANT:
The invoice PDF was downloaded on the customer's device.
Please attach the downloaded PDF (${pdfFileName}) before sending this email.
`;

  const mailtoLink =
    `mailto:${BUSINESS_EMAIL}` +
    `?cc=${encodeURIComponent(customer.email)}` +
    `&subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;

  setTimeout(() => {
    localStorage.removeItem("cart");
    window.location.href = "thankyou.html";
  }, 1200);
});

// =======================
renderCart();
