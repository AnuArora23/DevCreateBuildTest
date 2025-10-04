
// ----------------------
// 1. Bottom Nav Active Highlight
// ----------------------
const navLinks = document.querySelectorAll(".bottom-nav a");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    // Only prevent default if href is "#" or empty
    if (link.getAttribute("href") === "#" || !link.getAttribute("href")) {
      e.preventDefault(); // prevent page reload
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    }
    // Otherwise, allow navigation to href target (e.g., s.html)
  });
});

// ----------------------
// 2. Live Search (filters categories by text)
// ----------------------
const searchInput = document.querySelector(".search-header input");
const categories = document.querySelectorAll(".category-item p");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  categories.forEach(cat => {
    const item = cat.parentElement;
    if (cat.textContent.toLowerCase().includes(query)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});

// ----------------------
// 3. Try-On Button Functionality
// ----------------------
const tryOnButtons = document.querySelectorAll(".product-card button");
tryOnButtons.forEach(button => {
  button.addEventListener("click", () => {
    const productName = button.parentElement.querySelector("img").alt;
    alert(`👗 Virtual Try-On for: ${productName}`);
  });
});
