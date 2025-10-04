
// ================== SEARCH FUNCTION ==================
const searchInput = document.querySelector(".search-bar input");
const products = document.querySelectorAll(".product");

searchInput.addEventListener("keyup", function() {
  let value = this.value.toLowerCase();
  products.forEach(product => {
    let name = product.innerText.toLowerCase();
    product.style.display = name.includes(value) ? "block" : "none";
  });
});

// ================== ADD TO CART ==================
let cartCount = 0;
const cartIcon = document.querySelector(".icons span:last-child");
const cartButtons = document.querySelectorAll(".btn");

cartButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    cartCount++;
    cartIcon.textContent = "🛒 (" + cartCount + ")";
    alert("Added to cart!");
  });
});

// ================== AUTO-SCROLL RUNWAY ==================
function autoScroll(trackId) {
  const track = document.getElementById(trackId);
  let scrollAmount = 0;

  setInterval(() => {
    scrollAmount += 2;
    if (scrollAmount >= track.scrollWidth - track.clientWidth) {
      scrollAmount = 0;
    }
    track.scrollTo({
      left: scrollAmount,
      behavior: "smooth"
    });
  }, 50);
}

autoScroll("modelTrack1");
autoScroll("modelTrack");

// ================== CATEGORY CLICK TO PRODUCTS ==================
const categories = document.querySelectorAll(".category");
const productSection = document.querySelector(".products");

categories.forEach(cat => {
  cat.addEventListener("click", () => {
    productSection.scrollIntoView({ behavior: "smooth" });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Dark/Light Mode Toggle
  const darkModeIcon = document.getElementById("darkModeToggle");
let darkMode = false;

darkModeIcon.addEventListener("click", () => {
  darkMode = !darkMode;

  if (darkMode) {
    document.body.style.background = "#111";
    document.body.style.color = "#fff";
    darkModeIcon.textContent = "☀️";

    document.querySelectorAll(".navbar, .hero, .slidbat, .product, .sidebar-product, footer").forEach(el => {
      el.style.backgroundColor = "#222";
      el.style.color = "#fff";
    });

    document.querySelectorAll(".navbar h1, .menu a, .search-bar input").forEach(el => {
      el.style.color = "#fff";
    });
    document.querySelector(".search-bar input").style.backgroundColor = "#333";
    document.querySelector(".search-bar input").style.color = "#fff";

  } else {
    document.body.style.background = "linear-gradient(to bottom, #e0f4ff, #fff)";
    document.body.style.color = "#000";
    darkModeIcon.textContent = "🌙";

    document.querySelectorAll(".navbar, .hero, .slidbat, .product, .sidebar-product, footer").forEach(el => {
      el.style.backgroundColor = "";
      el.style.color = "";
    });

    document.querySelectorAll(".navbar h1, .menu a, .search-bar input").forEach(el => {
      el.style.color = "";
    });
    document.querySelector(".search-bar input").style.backgroundColor = "";
    document.querySelector(".search-bar input").style.color = "";
  }
});


  // Wishlist / Favorites
  const products = document.querySelectorAll(".product, .sidebar-product");
  products.forEach(product => {
    const favBtn = document.createElement("span");
    favBtn.textContent = "♥";
    favBtn.style.cursor = "pointer";
    favBtn.style.fontSize = "20px";
    favBtn.style.marginLeft = "10px";
    favBtn.style.color = "red";
    product.appendChild(favBtn);

    const productName = product.querySelector("h3, p strong").textContent;

    if (localStorage.getItem("wishlist") && JSON.parse(localStorage.getItem("wishlist")).includes(productName)) {
      favBtn.style.opacity = "1";
    }

    favBtn.addEventListener("click", () => {
      let wishlist = localStorage.getItem("wishlist") ? JSON.parse(localStorage.getItem("wishlist")) : [];
      if (!wishlist.includes(productName)) {
        wishlist.push(productName);
        favBtn.style.opacity = "1";
      } else {
        wishlist = wishlist.filter(name => name !== productName);
        favBtn.style.opacity = "0.5";
      }
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    });
  });

  // Search Filter
  const searchInput = document.querySelector(".search-bar input");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    products.forEach(product => {
      const name = product.querySelector("h3, p strong").textContent.toLowerCase();
      if (name.includes(term)) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  });

  // Auto-moving runway
  const runway1 = document.getElementById("modelTrack1");
  const runway2 = document.getElementById("modelTrack");
  let scrollAmount1 = 0;
  let scrollAmount2 = 0;
  setInterval(() => {
    if (runway1) {
      scrollAmount1 += 1;
      if (scrollAmount1 > runway1.scrollWidth - runway1.clientWidth) scrollAmount1 = 0;
      runway1.scrollLeft = scrollAmount1;
    }
    if (runway2) {
      scrollAmount2 += 1;
      if (scrollAmount2 > runway2.scrollWidth - runway2.clientWidth) scrollAmount2 = 0;
      runway2.scrollLeft = scrollAmount2;
    }
  }, 30);
});


//hamburger
const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

hamburger.addEventListener('click', () => {
  menu.classList.toggle('active');  // toggles visibility
});
