const themeToggle = document.querySelector(".theme-toggle");
const promptInput = document.querySelector(".prompt-input");
const promptForm = document.querySelector(".prompt-form");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
const API_KEY = "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";

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

// Set theme based on saved preference or system default
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  if (themeToggle) {
    themeToggle.querySelector("i").className = isDarkTheme
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  }
})();

// Switch between dark & light
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  });
}

// Fill prompt input with random example
if (promptBtn && promptInput) {
  promptBtn.addEventListener("click", () => {
    const prompt =
      examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
  });
} else {
  console.error("promptBtn or promptInput not found in the DOM");
}

// Generate images using Hugging Face API
const generateImages = async (
  selectModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectModel}`;

  // Scale aspectRatio
  let width, height;
  switch (aspectRatio) {
    case "1/1":
      width = 512;
      height = 512;
      break;
    case "16/9":
      width = 512;
      height = 288;
      break;
    case "4/3":
      width = 512;
      height = 384;
      break;
    default:
      width = 512;
      height = 512;
  }

  // Create an array of promises for generating images
  const imagePromises = Array.from({ length: imageCount }, async () => {
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true, use_cache: false },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.blob();
      return URL.createObjectURL(result);
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  });

  // Wait for all images to be generated
  try {
    const generatedImages = await Promise.all(imagePromises);
    return generatedImages;
  } catch (error) {
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Create placeholder cards with loading spinners
const CreatImageCards = async (
  selectModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  // Clear previous cards
  gridGallery.innerHTML = "";

  // Add placeholder cards
  for (let i = 0; i < imageCount; i++) {
    const card = document.createElement("div");
    card.className = "img-card loading";
    card.id = `img-card-${i}`;
    card.style.aspectRatio = aspectRatio;
    card.innerHTML = `
            <div class="status-container">
                <div class="spinner"></div>
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="status-text">Generating</p>
            </div>
            <img src="" class="result-img">
            <div class="img-overlay">
                <button class="img-download-btn">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        `;
    gridGallery.appendChild(card);
  }

  // Generate images and update cards
  try {
    const imageUrls = await generateImages(
      selectModel,
      imageCount,
      aspectRatio,
      promptText
    );
    imageUrls.forEach((url, index) => {
      const card = document.getElementById(`img-card-${index}`);
      const img = card.querySelector(".result-img");
      const statusContainer = card.querySelector(".status-container");

      img.src = url;
      img.onload = () => {
        card.classList.remove("loading");
        statusContainer.style.display = "none";
      };
      img.onerror = () => {
        card.classList.remove("loading"); // إزالة الـ loading class
        card.classList.add("error"); // إضافة الـ error class
        statusContainer.innerHTML = `
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p class="status-text">Failed to load image</p>
                `;
      };
    });
  } catch (error) {
    for (let i = 0; i < imageCount; i++) {
      const card = document.getElementById(`img-card-${i}`);
      const statusContainer = card.querySelector(".status-container");
      card.classList.remove("loading"); // إزالة الـ loading class
      card.classList.add("error"); // إضافة الـ error class
      statusContainer.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="status-text">Error: ${error.message}</p>
            `;
    }
  }
};

// Handle Form submission
if (
  promptForm &&
  modelSelect &&
  countSelect &&
  ratioSelect &&
  promptInput &&
  gridGallery
) {
  promptForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get Form Values
    const selectModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    if (!promptText) {
      alert("Please enter a prompt!");
      return;
    }

    CreatImageCards(selectModel, imageCount, aspectRatio, promptText);
  });
} else {
  console.error(
    "One or more form elements or gridGallery not found in the DOM"
  );
}
