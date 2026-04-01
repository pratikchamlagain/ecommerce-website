function getCheckoutCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function parseCheckoutPrice(price) {
  if (typeof price === "number") {
    return price;
  }
  return parseFloat(String(price).replace(/NPR|NRP|,/gi, "").trim()) || 0;
}

function checkoutDisplayPrice(value) {
  return `NPR ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderCheckoutSummary() {
  const cart = getCheckoutCart();
  const itemsEl = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");

  if (!itemsEl || !totalEl) {
    return;
  }

  if (cart.length === 0) {
    itemsEl.innerHTML = "<p>Your cart is empty. Add products before checkout.</p>";
    totalEl.textContent = "";
    return;
  }

  let subtotal = 0;
  itemsEl.innerHTML = "";

  cart.forEach((item) => {
    const qty = item.quantity || 1;
    const unit = parseCheckoutPrice(item.price);
    const line = unit * qty;
    subtotal += line;

    const row = document.createElement("div");
    row.className = "order-line";
    row.innerHTML = `<span>${item.name} x ${qty}</span><strong>${checkoutDisplayPrice(line)}</strong>`;
    itemsEl.appendChild(row);
  });

  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;
  totalEl.textContent = `Total: ${checkoutDisplayPrice(total)} (incl. shipping ${checkoutDisplayPrice(shipping)})`;
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  const success = document.getElementById("order-success");

  if (!form || !success) {
    return;
  }

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const cart = getCheckoutCart();
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    localStorage.removeItem("cart");
    success.style.display = "block";

    setTimeout(() => {
      window.location.href = "home.html";
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  renderCheckoutSummary();
  setupCheckoutForm();
});
