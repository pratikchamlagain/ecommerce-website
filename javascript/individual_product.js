function learnMore(e) {
  // Clear the current content of the main container
  const mainElement = document.querySelector('.main');
  mainElement.innerHTML = '';
  mainElement.style.display = 'none'; // Hide the main container

  // Get data from the clicked element
  const source = e && e.target ? e.target : (window.event ? window.event.target : null);
  const a = source ? source.closest('.card') : null;
  if (!a) {
    return;
  }
  const img = a.querySelector('img').src;
  const title = a.querySelector('h3').textContent;
  const price = a.querySelector('.price').innerText.replace('Price: ', '');
console.log(price);
  // Create main container
  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-container';
   
  // Create image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';

  // Add product image
  const productImage = document.createElement('img');
  productImage.src = img;
  productImage.alt = 'Product Image';
  productImage.className = 'product-image';
  imageContainer.appendChild(productImage);

  // Create details container
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'details-container';

  // Add product title
  const productTitle = document.createElement('h1');
  productTitle.className = 'product-title';
  productTitle.innerHTML = title;
  detailsContainer.appendChild(productTitle);

  // Add product price
  const productPrice = document.createElement('h2');
  productPrice.className = 'product-price';
  productPrice.textContent = price;
  detailsContainer.appendChild(productPrice);

  // Create rating section
  const rating = document.createElement('div');
  rating.className = 'rating-js';
  rating.innerHTML = "★★★★★"
  const ratingText = document.createElement('span');
  ratingText.className = 'rating-text';
  ratingText.textContent = '(5/5)';
  rating.appendChild(ratingText);
  detailsContainer.appendChild(rating);

  // Add product description
  const productDescription = document.createElement('p');
  productDescription.className = 'product-description';
  productDescription.textContent =
    'A timeless classic with a silver dial and a premium leather strap. Perfect for any occasion, blending elegance and functionality.';
  detailsContainer.appendChild(productDescription);

  // Create button group
  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';

  // Add "Add to Cart" button
  const addToCartButton = document.createElement('button');
  addToCartButton.className = 'btn add-to-cart';
  addToCartButton.textContent = 'Add to Cart';
  addToCartButton.onclick = () => addToCart3(img,title,price);
  btnGroup.appendChild(addToCartButton);

  // Add "Buy Now" button
  const buyNowButton = document.createElement('button');
  buyNowButton.className = 'btn buy-now';
  buyNowButton.textContent = 'Buy Now';
  buyNowButton.onclick = () => addToCartAndRedirect(img, title, price);
  btnGroup.appendChild(buyNowButton);

  // Append button group to details container
  detailsContainer.appendChild(btnGroup);

  // Append image and details containers to main container
  mainContainer.appendChild(imageContainer);
  mainContainer.appendChild(detailsContainer);

  // Create "Back" button as an anchor tag
  const backButton = document.createElement('button');
  backButton.className = 'btn back-button';
  backButton.textContent = 'Back';
  backButton.type = 'button';
  backButton.onclick = () => window.history.back();
  document.body.appendChild(backButton); // Add the back button to the body

  // Append main container to the product-div
  const div = document.querySelector('.product-div'); // Use querySelector to get the first matching element
  if (div) {
    div.appendChild(mainContainer);
  } else {
    console.error("Element with class 'product-div' not found.");
  }
}
function addToCart3(img,title,price) {
  if (typeof addOrUpdateCartItem === "function") {
    addOrUpdateCartItem({ name: title, price: price, image: img }, 1);
  }
  alert("Item added to cart");
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
// Example addToCart function

