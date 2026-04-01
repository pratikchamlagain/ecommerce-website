function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function parsePriceToNumber(price) {
  if (typeof price === "number") {
    return price;
  }
  return parseFloat(String(price).replace(/NPR|NRP|,/gi, "").trim()) || 0;
}

function toDisplayPrice(value) {
  const amount = parsePriceToNumber(value);
  return `NPR ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addOrUpdateCartItem(product, quantityDelta = 1) {
  const cart = getCart();
  const keyName = (product.name || "").trim().toLowerCase();
  const keyImage = product.image || "";

  const existingIndex = cart.findIndex(
    (item) => (item.name || "").trim().toLowerCase() === keyName && (item.image || "") === keyImage
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantityDelta;
  } else {
    cart.push({
      name: product.name,
      image: product.image,
      price: parsePriceToNumber(product.price),
      quantity: Math.max(1, quantityDelta)
    });
  }

  const cleaned = cart.filter((item) => (item.quantity || 0) > 0);
  setCart(cleaned);
}

function addToCart(buttonEl) {
  const clicked = buttonEl || (window.event && window.event.target ? window.event.target : null);
  const card = clicked ? clicked.closest('.card') : null;
  if (!card) {
    return;
  }

  const img = card.querySelector('img') ? card.querySelector('img').src : "";
  const title = card.querySelector('h3') ? card.querySelector('h3').textContent : "Product";
  const priceText = card.querySelector('.price') ? card.querySelector('.price').innerText : "NPR 0";

  addOrUpdateCartItem({ name: title, price: priceText, image: img }, 1);
  alert("Item added to cart");
}

function changeCartQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) {
    return;
  }
  cart[index].quantity = (cart[index].quantity || 1) + delta;
  const cleaned = cart.filter((item) => (item.quantity || 0) > 0);
  setCart(cleaned);
  makeCart();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  makeCart();
}

function getCartTotals(cart) {
  const subtotal = cart.reduce((sum, item) => {
    return sum + parsePriceToNumber(item.price) * (item.quantity || 1);
  }, 0);
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function makeCart() {
  const main = document.getElementById("main-body");
  if (!main) {
    return;
  }

  const cart = getCart();
  const summary = document.getElementById("cart-summary");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cart.length === 0) {
    main.innerHTML = "<p>Your cart is empty</p>";
    if (summary) {
      summary.innerHTML = "";
    }
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
    }
    return;
  }

  main.innerHTML = '';

  cart.forEach(function(item, index) {
    const cartDiv = document.createElement("div");
    cartDiv.classList.add("cart-item");

    const img = document.createElement("img");
    img.src = item.image;

    const title = document.createElement("p");
    title.innerText = item.name;

    const unitPrice = parsePriceToNumber(item.price);
    const quantity = item.quantity || 1;
    const lineTotal = unitPrice * quantity;

    const price = document.createElement("p");
    price.innerText = toDisplayPrice(lineTotal);

    const qtyWrap = document.createElement("div");
    qtyWrap.style.display = "flex";
    qtyWrap.style.gap = "8px";
    qtyWrap.style.alignItems = "center";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.innerText = "-";
    minusBtn.onclick = function() { changeCartQuantity(index, -1); };

    const qtyText = document.createElement("span");
    qtyText.innerText = quantity;

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.innerText = "+";
    plusBtn.onclick = function() { changeCartQuantity(index, 1); };

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.innerText = "Remove";
    removeBtn.onclick = function() { removeCartItem(index); };

    qtyWrap.appendChild(minusBtn);
    qtyWrap.appendChild(qtyText);
    qtyWrap.appendChild(plusBtn);
    qtyWrap.appendChild(removeBtn);

    cartDiv.appendChild(img);
    cartDiv.appendChild(title);
    cartDiv.appendChild(price);
    cartDiv.appendChild(qtyWrap);

    main.appendChild(cartDiv);
  });

  const totals = getCartTotals(cart);
  if (summary) {
    summary.innerHTML = `
      <p>Subtotal: <strong>${toDisplayPrice(totals.subtotal)}</strong></p>
      <p>Shipping: <strong>${toDisplayPrice(totals.shipping)}</strong></p>
      <p>Total: <strong>${toDisplayPrice(totals.total)}</strong></p>
    `;
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
  }
}

function clearCart() {
  localStorage.removeItem("cart");
  makeCart();
}

function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  window.location.href = "checkout.html";
}

function addToCartAndRedirect(img, title, price, redirectUrl = "cart.html") {
  if (img && title && price) {
    addOrUpdateCartItem({ name: title, price: price, image: img }, 1);
  }
  window.location.href = redirectUrl;
}




