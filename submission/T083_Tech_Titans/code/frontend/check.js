// //check.html
// console.log("Script loaded");
// document.addEventListener("DOMContentLoaded", function() {
//   const categories = ["age", "gender", "profession"];
//   categories.forEach(category => {
//     const container = document.querySelector(`[data-category="${category}"]`);
//     const buttons = container.querySelectorAll("button");

//     // Load stored selection from localStorage
//     const storedValue = localStorage.getItem(category);
//     if (storedValue) {
//       buttons.forEach(btn => {
//         if (btn.dataset.value === storedValue) {
//           btn.classList.add("selected-btn");
//         }
//       });
//     }

//     buttons.forEach(btn => {
//       btn.addEventListener("click", () => {
//         const currentlySelected = container.querySelector(".selected-btn");
//         // If clicking the already selected button, deselect
//         if (btn === currentlySelected) {
//           btn.classList.remove("selected-btn");
//           localStorage.removeItem(category);
//         } else {
//           // Remove previous selection
//           if (currentlySelected) currentlySelected.classList.remove("selected-btn");
//           // Add new selection
//           btn.classList.add("selected-btn");
//           localStorage.setItem(category, btn.dataset.value);

//           // Redirect to different page based on gender selection
//           if (category === "gender") {
//             const genderValue = btn.dataset.value;
//             console.log("Gender selected: " + genderValue);
//             const continueBtn = document.querySelector(".continue-btn");
//             const continueLink = continueBtn.parentElement;
//             if (genderValue === "Female") {
//               continueLink.href = "body.html"; 
//               console.log("Set href to body.html");
//             } else if (genderValue === "Male") {
//               continueLink.href = "bodymale.html"; 
//               console.log("Set href to bodymale.html");
//             }
//           }
//         }
//       });
//     });
//   });
// });



console.log("Body page script loaded");

document.addEventListener("DOMContentLoaded", () => {
  const groups = ["body-shape-btn", "body-size-btn", "skin-tone-btn"];

  groups.forEach((groupClass) => {
    const options = document.querySelectorAll("." + groupClass);

    // Restore previous selection from localStorage
    options.forEach((option) => {
      const key = option.dataset.key;
      const saved = localStorage.getItem(key);
      if (saved && saved === option.dataset.value) {
        option.classList.add("selected");
      }
    });

    // Add click event
    options.forEach((option) => {
      option.addEventListener("click", () => {
        // If already selected, do nothing
        if (option.classList.contains("selected")) return;

        // Remove selected from all in the group
        options.forEach((o) => o.classList.remove("selected"));

        // Add selected class to clicked option
        option.classList.add("selected");

        // Save selection to localStorage
        const key = option.dataset.key;
        const value = option.dataset.value;
        localStorage.setItem(key, value);
      });
    });
  });

  // Optional: Continue button check
  const continueBtn = document.querySelector(".continue-btn");
  continueBtn.addEventListener("click", (e) => {
    const shape = localStorage.getItem("bodyShape");
    const size = localStorage.getItem("bodySize");
    const tone = localStorage.getItem("skinTone");

    if (!shape || !size || !tone) {
      e.preventDefault(); // Prevent going to next page
      alert("Please select your Body Shape, Body Size, and Skin Tone.");
    }
  });
});
