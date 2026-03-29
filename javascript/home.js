const header = document.getElementById('header');   
// window.onscroll= function(){
//     if(window.scrollY>200){
//         header.style.backgroundColor = '#1E2A38';
//         header.classList.add('delay');

//         header.style.color = 'black';
//         header.style.textDecorationColor='black';
//     }else{
//         header.style.backgroundColor = '';
//         header.classList.add('delay');

//      header.style.color = "rgb(243, 242, 242)";

//      header.style.textDecorationColor="rgb(243, 242, 242)";


    
//     }
// }
const slideWrapper = document.querySelector('.carousel-slide-wrapper');
const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentIndex = 0;
const visibleSlides = 4; // Number of visible slides
const totalSlides = slides.length;

function updateCarousel() {
  if (!slideWrapper || slides.length === 0) {
    return;
  }
    const slideWidth = slides[0].clientWidth + 15; // Account for the gap
    slideWrapper.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
}

if (nextBtn && prevBtn && totalSlides > 0) {
  nextBtn.addEventListener('click', () => {
    if (currentIndex < totalSlides - visibleSlides) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop back to the start
    }
    updateCarousel();
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = totalSlides - visibleSlides; // Loop back to the end
    }
    updateCarousel();
  });
}

// Adjust on window resize
window.addEventListener('resize', updateCarousel);
//Another slider

const slideWrapperAlt = document.querySelector('.carousel-slide-wrapper-alt');
const slidesAlt = document.querySelectorAll('.carousel-slide-alt');
const prevBtnAlt = document.querySelector('.prev-btn-alt');
const nextBtnAlt = document.querySelector('.next-btn-alt');

let currentIndexAlt = 0;
const visibleSlidesAlt = 4; // Number of visible slides
const totalSlidesAlt = slidesAlt.length;

function updateCarouselAlt() {
  if (!slideWrapperAlt || slidesAlt.length === 0) {
    return;
  }
    const slideWidthAlt = slidesAlt[0].clientWidth + 20; // Account for the gap
    slideWrapperAlt.style.transform = `translateX(${-currentIndexAlt * slideWidthAlt}px)`;
}

if (nextBtnAlt && prevBtnAlt && totalSlidesAlt > 0) {
  nextBtnAlt.addEventListener('click', () => {
    if (currentIndexAlt < totalSlidesAlt - visibleSlidesAlt) {
      currentIndexAlt++;
    } else {
      currentIndexAlt = 0; // Loop back to the start
    }
    updateCarouselAlt();
  });

  prevBtnAlt.addEventListener('click', () => {
    if (currentIndexAlt > 0) {
      currentIndexAlt--;
    } else {
      currentIndexAlt = totalSlidesAlt - visibleSlidesAlt; // Loop back to the end
    }
    updateCarouselAlt();
  });
}

// Adjust on window resize
window.addEventListener('resize', updateCarouselAlt);

// var catogories = document.getElementsByClassName('catogory-container');
// catogories.addEventListener('onfocus',() =>{

// });

// function offers(){
//     var off = document.getElementById('offer');
//     off.classList.toggle('offers');
// }
function learnMore(e) {
    // Clear the current content of the main container
    document.getElementById('header').style.backgroundColor = '#1E2A38';
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
    addToCartButton.onclick = () => addToCart1(img,title,price);
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
  function buyNow(){
    alert('Order has been Placed');
  }
  // Example addToCart function
  function addToCart1(img,title,price) {
    
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
      price.innerText = `NRP ${item.price}`;
  
      cartDiv.appendChild(img);
      cartDiv.appendChild(title);
      cartDiv.appendChild(price);
  
      main.appendChild(cartDiv);
    });
  }
