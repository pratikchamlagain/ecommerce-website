function addToCart(buttonEl) {
  const clicked = buttonEl || (window.event && window.event.target ? window.event.target : null);
  const card = clicked ? clicked.closest('.card') : null;
  if (!card) {
    return;
  }

  var img = card.querySelector('img').src;
  var title = card.querySelector('h3').textContent;
  const price = card.querySelector(".price").innerText.replace("NRP ", "");
  const product = {
    name: title,
    price: price,
    image: img
  };

  // Get existing cart from localStorage or initialize a new one
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Add the new product to the cart
  cart.push(product);

  // Save the updated cart back to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Item Added to Cart");
}

function makeCart() {
  var main = document.getElementById("main-body");

  // Get the cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if there is any cart data
  if (cart.length === 0) {
    main.innerHTML = "<p>Your cart is empty</p>";
    return;
  }

  // Clear the current content before adding new items
  main.innerHTML = '';

  // Create and display each cart item
  cart.forEach(function(item) {
    var cartDiv = document.createElement("div");
    cartDiv.classList.add("cart-item");

    var img = document.createElement("img");
    img.src = item.image;

    var title = document.createElement("p");
    title.innerText = item.name;
  
    var price = document.createElement("p");
    price.innerText = ` ${item.price}`;

    cartDiv.appendChild(img);
    cartDiv.appendChild(title);
    cartDiv.appendChild(price);

    main.appendChild(cartDiv);
  });
}
function clearCart() {
  localStorage.removeItem("cart"); // This removes the cart from localStorage
  makeCart(); 
}

function addToCartAndRedirect(img, title, price, redirectUrl = "cart.html") {
  if (img && title && price) {
    const product = {
      name: title,
      price: price,
      image: img
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  window.location.href = redirectUrl;
}




