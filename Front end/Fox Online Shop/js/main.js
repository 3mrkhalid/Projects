import { products } from "./data.js";

// Function to add a product to the shopping cart
function AddToCart(product) {
  // Get current cart from localStorage or initialize empty array
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if product already exists in cart
  let existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    // If exists, increment quantity
    existingItem.quantity++;
  } else {
    // If new, add to cart with quantity 1
    cart.push({ ...product, quantity: 1 });
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to update the cart display
function updateCart() {
  // Get DOM elements
  const cartItemsContainer = document.getElementById("cart_items");
  const cartCounter = document.getElementById("cart_counter");
  const cartTotal = document.getElementById("cart_total");
  const price_cart_total = document.querySelector(".price_cart_total");
  const count_item_cart = document.querySelector(".Count_items_cart");
  const count_item_header = document.querySelector(".count_item_header");

  // Get cart from localStorage or empty array
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Initialize totals
  let totalPrice = 0;
  let totalItems = 0;

  // Update cart items display
  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = cart.length
      ? cart
          .map((item, index) => {
            // Calculate item total and add to overall totals
            totalPrice += item.price * item.quantity;
            totalItems += item.quantity;

            // Return HTML for each cart item
            return `
          <div class="item_cart" data-id="${item.id}">
              <img src="${item.img}" alt="${item.name}">
              <div class="content">
                  <h4>${item.name}</h4>
                  <p class="price_cart">$${(item.price * item.quantity).toFixed(
                    2
                  )}</p>
                  <div class="quantity_control">
                      <button class="decrease_quantity" data-index="${index}">-</button>
                      <span class="quantity">${item.quantity}</span>
                      <button class="increase_quantity" data-index="${index}">+</button>
                  </div>
              </div>
              <button class="delete_item" data-index="${index}">
                  <i class="fa-solid fa-trash-can"></i>
              </button>
          </div>`;
          })
          .join("")
      : "<p>The cart is empty</p>";
  }

  // Update total price display
  if (price_cart_total) {
    price_cart_total.innerHTML = `$${totalPrice.toFixed(2)}`;
  }

  // Update item count displays
  if (count_item_cart) count_item_cart.textContent = totalItems;
  if (count_item_header) count_item_header.textContent = totalItems;
  if (cartCounter) {
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? "block" : "none";
  }

  // Update cart total display
  if (cartTotal) {
    cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
  } else {
    console.error("Element cart_total not found in the HTML!");
  }

  // Attach event listeners to cart buttons
  attachCartEventListeners();
}

// Function to attach event listeners to cart buttons
function attachCartEventListeners() {
  // Get all quantity adjustment and delete buttons
  const decreaseButtons = document.querySelectorAll(".decrease_quantity");
  const increaseButtons = document.querySelectorAll(".increase_quantity");
  const deleteButtons = document.querySelectorAll(".delete_item");

  // Attach event handlers
  decreaseButtons.forEach((button) =>
    button.addEventListener("click", handleQuantityChange)
  );
  increaseButtons.forEach((button) =>
    button.addEventListener("click", handleQuantityChange)
  );
  deleteButtons.forEach((button) =>
    button.addEventListener("click", (event) => {
      const index = parseInt(
        event.target.closest("button").getAttribute("data-index")
      );
      removeFromCart(index);
    })
  );
}

// Function to handle quantity changes
function handleQuantityChange(event) {
  const button = event.target.closest("button");
  const index = parseInt(button.getAttribute("data-index"));
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemName = cart[index].name;

  if (button.classList.contains("decrease_quantity")) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
      showToast(`Decreased quantity of ${itemName}`, "info");
    } else {
      cart.splice(index, 1);
      showToast(`${itemName} removed from cart`, "warning");
    }
  } else if (button.classList.contains("increase_quantity")) {
    cart[index].quantity++;
    showToast(`Increased quantity of ${itemName}`, "info");
  }

  // Save updated cart and refresh display
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

// Function to remove item from cart
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const removedProduct = cart.splice(index, 1)[0];
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast(`${removedProduct.name} removed from cart`, "warning");
  updateButtonsState(removedProduct.id);
  updateCart();
}

// Function to update button states when item is removed
function updateButtonsState(productId) {
  const allMatchingButtons = document.querySelectorAll(
    `.btn_add_cart[data-id="${productId}"]`
  );
  allMatchingButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to cart`;
    btn.disabled = false;
    btn.style.pointerEvents = "auto";
    btn.style.backgroundColor = "transparent";
    btn.style.color = "var(--color-heading)";
    const cartIcon = btn.querySelector(".fa-cart-shopping");
    if (cartIcon) {
      cartIcon.style.color = "var(--main-color)";
    }
    attachHoverEvents(btn);
  });
}

// Function to attach hover effects to buttons
function attachHoverEvents(button) {
  button.onmouseover = () => {
    if (!button.classList.contains("active")) {
      button.style.backgroundColor = "var(--main-color)";
      button.style.color = "var(--white-color)";
      const cartIcon = button.querySelector(".fa-cart-shopping");
      if (cartIcon) {
        cartIcon.style.color = "var(--white-color)";
      }
    }
  };

  button.onmouseout = () => {
    if (!button.classList.contains("active")) {
      button.style.backgroundColor = "transparent";
      button.style.color = "var(--color-heading)";
      const cartIcon = button.querySelector(".fa-cart-shopping");
      if (cartIcon) {
        cartIcon.style.color = "var(--main-color)";
      }
    }
  };
}

// Function to show notification toasts
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Style the toast
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "10px 20px";
  toast.style.backgroundColor =
    type === "success"
      ? "var(--main-color)"
      : type === "warning"
      ? "#e74c3c"
      : "#3498db";
  toast.style.color = "var(--white-color)";
  toast.style.borderRadius = "5px";
  toast.style.zIndex = "1000";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  toast.style.transform = "translateY(-20px)";

  // Animate in
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 100);

  // Animate out after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Function to clear entire cart
function clearCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.forEach((item) => updateButtonsState(item.id));
  localStorage.removeItem("cart");
  updateCart();
  showToast("Cart cleared!", "warning");
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateCart();

  // Set up "Add to Cart" buttons
  const AddToCartButtons = document.querySelectorAll(".btn_add_cart");
  AddToCartButtons.forEach((button) => {
    // Reset button state
    if (button.classList.contains("active")) {
      button.classList.remove("active");
      button.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to cart`;
    }
    button.style.backgroundColor = "transparent";
    button.style.color = "var(--color-heading)";
    const cartIcon = button.querySelector(".fa-cart-shopping");
    if (cartIcon) {
      cartIcon.style.color = "var(--main-color)";
    }
    button.disabled = false;
    button.style.pointerEvents = "auto";
    attachHoverEvents(button);

    // Add click handler
    button.addEventListener("click", (event) => {
      const productId = event.target
        .closest(".btn_add_cart")
        .getAttribute("data-id");
      const selectedProduct = products.find(
        (product) => product.id == productId
      );

      AddToCart(selectedProduct);
      showToast(`${selectedProduct.name} added to cart!`, "success");

      // Update all matching buttons for this product
      const allMatchingButtons = document.querySelectorAll(
        `.btn_add_cart[data-id="${productId}"]`
      );
      allMatchingButtons.forEach((btn) => {
        btn.classList.add("active");
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`;
        btn.disabled = true;
        btn.style.pointerEvents = "none";
        btn.style.backgroundColor = "var(--main-color)";
        btn.style.color = "var(--white-color)";
        const cartIcon = btn.querySelector(".fa-cart-shopping");
        if (cartIcon) {
          cartIcon.style.color = "var(--white-color)";
        }
      });

      updateCart();
    });
  });

  // Set up clear cart button
  const clearCartButton = document.getElementById("clear_cart");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", clearCart);
  }
});
