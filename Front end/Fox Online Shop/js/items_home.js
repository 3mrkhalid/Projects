import { products } from "./data.js";


// Get DOM elements for different product categories
const swiper_iteams_sale = document.getElementById("swiper_iteams_sale"); // Element for sale items
const swiper_elctronics = document.getElementById("swiper_elctronics"); // Element for electronics
const swiper_Appliances = document.getElementById("swiper_Appliances"); // Element for appliances
const swiper_Mobiles = document.getElementById("swiper_Mobiles"); // Element for mobiles

// Check if all swiper elements exist in the DOM to avoid errors
if (
  !swiper_iteams_sale ||
  !swiper_elctronics ||
  !swiper_Appliances ||
  !swiper_Mobiles
) {
  console.error("One or more swiper elements are not found in the DOM!");
}

// Function to add products with discounts to the sale section
function addSaleProduct(product) {
  if (product.old_price) {
    // Check if the product has an old price (i.e., it's on sale)
    const precent_disc = Math.floor(
      ((product.old_price - product.price) / product.old_price) * 100
    ); // Calculate discount percentage

    // Add HTML for the sale product to the sale swiper
    swiper_iteams_sale.innerHTML += `
      <div class="swiper-slide product">
        <span class="sale_present">%${precent_disc}</span>
        <div class="img_product">
          <a href="#"><img src="${product.img}" alt=""></a>
        </div>
        <div class="stars">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
        </div>
        <p class="name_product"><a href="#">${product.name}</a></p>
        <div class="price">
          <p><span>$${product.price}</span></p>
          <p class="old_price">$${product.old_price}</p>
        </div>
        <div class="icons">
          <span class="btn_add_cart active" data-id = "${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
            add to cart
          </span>
          <span class="icon_product"><i class="fa-regular fa-heart"></i></span>
        </div>
      </div>
    `;
  }
}

// Function to add products to a specific category swiper
function addProductByCategory(product, category, swiperElement) {
  if (product.category === category) {
    // Check if the product belongs to the specified category
    // Conditionally include old price and discount percentage if they exist
    const old_price_Pargraph = product.old_price
      ? `<p class="old_price">$${product.old_price}</p>`
      : "";
    const precent_disc_div = product.old_price
      ? `<span class="sale_present">%${Math.floor(
          ((product.old_price - product.price) / product.old_price) * 100
        )}</span>`
      : "";

    // Add HTML for the product to the specified swiper element
    swiperElement.innerHTML += `
      <div class="swiper-slide product">
        ${precent_disc_div}
        <div class="img_product">
          <a href="#"><img src="${product.img}" alt=""></a>
        </div>
        <div class="stars">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
        </div>
        <p class="name_product"><a href="#">${product.name}</a></p>
        <div class="price">
          <p><span>$${product.price}</span></p>
          ${old_price_Pargraph}
        </div>
        <div class="icons">
          <span class="btn_add_cart active" data-id = "${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
            add to cart
          </span>
          <span class="icon_product"><i class="fa-regular fa-heart"></i></span>
        </div>
      </div>
    `;
  }
}

// Loop through each product and apply the appropriate functions
products.forEach((product) => {
  addSaleProduct(product); // Add discounted products to the sale section
  addProductByCategory(product, "electronics", swiper_elctronics); // Add electronics products
  addProductByCategory(product, "appliances", swiper_Appliances); // Add appliances products
  addProductByCategory(product, "mobiles", swiper_Mobiles); // Add mobiles products
});
