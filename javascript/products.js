document.addEventListener("DOMContentLoaded", function () {
    const watches = [
        { category: "titan", img: "/titan_img/titan1.webp", name: "Titan Edge", rating: 4.5, price: "NPR 6,410.00" },
        { category: "titan", img: "/titan_img/titan2.webp", name: "Titan Raga", rating: 4.3, price: "NPR 9,850.00" },
        { category: "titan", img: "/titan_img/titan3.jpeg", name: "Titan Octane", rating: 4.2, price: "NPR 5,290.00" },
        { category: "women", img: "/womens/womens1.jpg", name: "Elegant Pearl", rating: 4.6, price: "NPR 7,500.00" },
        { category: "women", img: "/womens/womens2.avif", name: "Rose Gold Chic", rating: 4.4, price: "NPR 8,300.00" },
        { category: "women", img: "/womens/womens3.jpg", name: "Classic Femme", rating: 4.7, price: "NPR 9,000.00" },
        { category: "men", img: "/man/man1.webp", name: "Bold Chrono", rating: 4.5, price: "NPR 10,500.00" },
        { category: "men", img: "/man/man2.jpg", name: "Steel Majesty", rating: 4.3, price: "NPR 11,200.00" },
        { category: "men", img: "/man/man3.webp", name: "Royal Heritage", rating: 4.6, price: "NPR 12,000.00" },
        { category: "rolex", img: "/rolex/rolex1.webp", name: "Rolex Submariner", rating: 4.9, price: "NPR 1,200,000.00" },
        { category: "rolex", img: "/rolex/rolex2.webp", name: "Rolex Daytona", rating: 4.8, price: "NPR 1,500,000.00" },
        { category: "rolex", img: "/rolex/rolex3.jpg", name: "Rolex Explorer", rating: 4.7, price: "NPR 1,100,000.00" },
        { category: "digital", img: "/digital/digital.1.jpg", name: "Smart LED", rating: 4.4, price: "NPR 3,500.00" },
        { category: "digital", img: "/digital/digital.2.webp", name: "Futuristic Touch", rating: 4.5, price: "NPR 4,000.00" },
        { category: "digital", img: "/digital/digital3.webp", name: "Neon Glow", rating: 4.3, price: "NPR 4,500.00" },
        { category: "omega", img: "/omega/omega1.avif", name: "Classic Leather", rating: 4.6, price: "NPR 5,200.00" },
        { category: "omega", img: "/omega/omega2.avif", name: "Vintage Gold", rating: 4.5, price: "NPR 6,000.00" },
        { category: "omega", img: "/omega/omega3.jpg", name: "Minimalist Black", rating: 4.7, price: "NPR 5,800.00" },
        { category: "kids", img: "/kids/kids1.avif", name: "Cartoon Time", rating: 4.8, price: "NPR 2,500.00" },
        { category: "kids", img: "/kids/kids2.jpg", name: "Color Pop", rating: 4.6, price: "NPR 2,800.00" },
        { category: "kids", img: "/kids/kids3.jpg", name: "Fun Dial", rating: 4.7, price: "NPR 3,000.00" },
        { category: "smartwatch", img: "/SM/sm1.webp", name: "Fit Tracker", rating: 4.5, price: "NPR 9,000.00" },
        { category: "smartwatch", img: "/SM/sm2.jpg", name: "Tech Pro", rating: 4.6, price: "NPR 10,500.00" },
        { category: "smartwatch", img: "/SM/sm3.webp", name: "Next Gen", rating: 4.7, price: "NPR 12,000.00" }
    ];

    const mainSection = document.querySelector(".main-section");
    const sortDropdown = document.getElementById("sort");
    const main = document.querySelector(".main"); // Main container for all body content
    const detail = document.querySelector(".product-div"); // Container for product details

    function renderWatches(watchesArray) {
        mainSection.innerHTML = ""; // Clear existing cards
        let row;

        watchesArray.forEach((watch, index) => {
            if (index % 3 === 0) {
                row = document.createElement("div");
                row.classList.add("row");
                mainSection.appendChild(row);
            }

            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <img src="${watch.img}" alt="${watch.name}">
                <h3>${watch.name}</h3>
                <div class="rating">${'★'.repeat(Math.floor(watch.rating))}☆ <span>(${watch.rating})</span></div>
                <p class="price">${watch.price}</p>
                <button onclick="addToCart2('${watch.img}', '${watch.name}', '${watch.price}')">Add to Cart</button>
                <button class="learn-more">Learn More</button>
            `;

            row.appendChild(card);

            // Add event listener for "Learn More" button
            card.querySelector(".learn-more").addEventListener("click", function () {
                showProductDetails(watch);
            });
        });
    }

    function sortWatches(criteria) {
        let sortedWatches = [...watches];

        if (criteria === "price-low-high") {
            sortedWatches.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
        } else if (criteria === "price-high-low") {
            sortedWatches.sort((a, b) => extractPrice(b.price) - extractPrice(a.price));
        } else if (criteria === "rating-high-low") {
            sortedWatches.sort((a, b) => b.rating - a.rating);
        }

        renderWatches(sortedWatches);
    }
     
    function extractPrice(priceString) {
        return parseFloat(priceString.replace("NPR ", "").replace(/,/g, ""));
    }
     
    function showProductDetails(watch) {
        // Hide the main div (which contains all body content)
        main.style.display = "none";

        // Create a new div for product details
        const productDetails = document.createElement("div");
        productDetails.className = "product-details";
        productDetails.style.display = "block"; // Ensure it's visible

        productDetails.innerHTML = `
            <div class="image-container">
                <img src="${watch.img}" alt="${watch.name}" class="product-image">
            </div>
            <div class="details-container">
                <h1 class="product-title">${watch.name}</h1>
                <h2 class="product-price">${watch.price}</h2>
                <div class="rating-js">
                    ${'★'.repeat(Math.floor(watch.rating))}☆ <span>(${watch.rating})</span>
                </div>
                <p class="product-description">
                    A timeless classic with a silver dial and a premium leather strap. Perfect for any occasion, blending elegance and functionality.
                </p>
                <div class="btn-group">
<button class="btn add-to-cart" onclick="addToCart2('${watch.img}', '${watch.name}', '${watch.price}')">Add to Cart</button>
                    <button class="btn buy-now" onclick="addToCartAndRedirect('${watch.img}', '${watch.name}', '${watch.price}')">Buy Now</button>
                </div>
               <button class="btn back-button" type="button" onclick="window.history.back()">Back</button>
            </div>
        `;

        // Append the product details to the body
        detail.appendChild(productDetails);
    }

    sortDropdown.addEventListener("change", function () {
        sortWatches(sortDropdown.value);
    });

    renderWatches(watches);
});
function addToCart2(img,title,price) {
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
      price.innerText = `NRP ${item.price}`;
  
      cartDiv.appendChild(img);
      cartDiv.appendChild(title);
      cartDiv.appendChild(price);
  
      main.appendChild(cartDiv);
    });
  }
