import "./common";
import { getPublishedGallery } from "./gallery.service";
/* ==========================================
   ELEMENTOS
========================================== */
const grid = document.querySelector("[data-gallery-grid]");
const lightbox = document.querySelector("[data-gallery-lightbox]");
const lightboxImage = document.querySelector("[data-gallery-lightbox-image]");
const lightboxTitle = document.querySelector("[data-gallery-lightbox-title]");
const lightboxDescription = document.querySelector("[data-gallery-lightbox-description]");
const lightboxCategory = document.querySelector("[data-gallery-lightbox-category]");
const closeButton = document.querySelector("[data-gallery-close]");
const previousButton = document.querySelector("[data-gallery-prev]");
const nextButton = document.querySelector("[data-gallery-next]");
const filterButtons = document.querySelectorAll("[data-gallery-filter]");
/* ==========================================
   ESTADO
========================================== */
let allGalleryItems = [];
let filteredGalleryItems = [];
let currentIndex = 0;
/* ==========================================
   RENDER
========================================== */
function renderGallery(items) {
    if (!grid)
        return;
    if (!items.length) {
        grid.innerHTML = `
      <p class="news-empty">
        No hay imágenes publicadas en esta categoría.
      </p>
    `;
        return;
    }
    grid.innerHTML = items
        .map((item, index) => `

        <article
          class="gallery-card reveal"
          data-gallery-index="${index}"
        >

          <img
            src="${item.imageUrl}"
            alt="${escapeHtml(item.title)}"
            loading="lazy"
          >

          <div class="gallery-card-overlay">

            <span class="gallery-card-category">
              ${escapeHtml(item.category)}
            </span>

            <h3 class="gallery-card-title">
              ${escapeHtml(item.title)}
            </h3>

          </div>

        </article>

      `)
        .join("");
    /*
     * Click en cada fotografía
     */
    grid
        .querySelectorAll("[data-gallery-index]")
        .forEach((card) => {
        card.addEventListener("click", () => {
            const index = Number(card.dataset.galleryIndex);
            openLightbox(index);
        });
    });
    /*
     * Animaciones
     */
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        grid
            .querySelectorAll(".reveal")
            .forEach((element) => {
            observer.observe(element);
        });
    }
    else {
        grid
            .querySelectorAll(".reveal")
            .forEach((element) => {
            element.classList.add("is-visible");
        });
    }
}
/* ==========================================
   LIGHTBOX
========================================== */
function openLightbox(index) {
    if (!lightbox ||
        !lightboxImage ||
        !lightboxTitle ||
        !lightboxDescription ||
        !lightboxCategory) {
        return;
    }
    const item = filteredGalleryItems[index];
    if (!item)
        return;
    currentIndex = index;
    lightboxImage.src =
        item.imageUrl;
    lightboxImage.alt =
        item.title;
    lightboxTitle.textContent =
        item.title;
    lightboxDescription.textContent =
        item.description;
    lightboxCategory.textContent =
        item.category;
    lightbox.classList.remove("hidden");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow =
        "hidden";
}
/* ==========================================
   CERRAR LIGHTBOX
========================================== */
function closeLightbox() {
    if (!lightbox)
        return;
    lightbox.classList.add("hidden");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow =
        "";
}
/* ==========================================
   ANTERIOR
========================================== */
function showPrevious() {
    if (!filteredGalleryItems.length) {
        return;
    }
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex =
            filteredGalleryItems.length - 1;
    }
    updateLightbox();
}
/* ==========================================
   SIGUIENTE
========================================== */
function showNext() {
    if (!filteredGalleryItems.length) {
        return;
    }
    currentIndex++;
    if (currentIndex >=
        filteredGalleryItems.length) {
        currentIndex = 0;
    }
    updateLightbox();
}
/* ==========================================
   ACTUALIZAR LIGHTBOX
========================================== */
function updateLightbox() {
    const item = filteredGalleryItems[currentIndex];
    if (!item ||
        !lightboxImage ||
        !lightboxTitle ||
        !lightboxDescription ||
        !lightboxCategory) {
        return;
    }
    lightboxImage.src =
        item.imageUrl;
    lightboxImage.alt =
        item.title;
    lightboxTitle.textContent =
        item.title;
    lightboxDescription.textContent =
        item.description;
    lightboxCategory.textContent =
        item.category;
}
/* ==========================================
   FILTROS
========================================== */
function applyFilter(category) {
    if (category === "Todos") {
        filteredGalleryItems =
            [...allGalleryItems];
    }
    else {
        filteredGalleryItems =
            allGalleryItems.filter((item) => item.category === category);
    }
    renderGallery(filteredGalleryItems);
}
/* ==========================================
   EVENTOS DE FILTROS
========================================== */
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterButtons.forEach((item) => {
            item.classList.remove("active");
        });
        button.classList.add("active");
        const category = button.dataset.galleryFilter
            || "Todos";
        applyFilter(category);
    });
});
/* ==========================================
   EVENTOS LIGHTBOX
========================================== */
closeButton?.addEventListener("click", closeLightbox);
previousButton?.addEventListener("click", showPrevious);
nextButton?.addEventListener("click", showNext);
/* ==========================================
   TECLADO
========================================== */
document.addEventListener("keydown", (event) => {
    if (lightbox?.classList.contains("hidden")) {
        return;
    }
    if (event.key === "Escape") {
        closeLightbox();
    }
    if (event.key === "ArrowLeft") {
        showPrevious();
    }
    if (event.key === "ArrowRight") {
        showNext();
    }
});
/* ==========================================
   CLIC FUERA DE LA IMAGEN
========================================== */
lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        closeLightbox();
    }
});
/* ==========================================
   ESCAPAR HTML
========================================== */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/* ==========================================
   CARGAR GALERÍA
========================================== */
async function loadGallery() {
    if (!grid)
        return;
    try {
        grid.innerHTML = `
      <p class="news-empty">
        Cargando galería…
      </p>
    `;
        allGalleryItems =
            await getPublishedGallery();
        filteredGalleryItems =
            [...allGalleryItems];
        renderGallery(filteredGalleryItems);
    }
    catch (error) {
        console.error("Error cargando galería:", error);
        grid.innerHTML = `
      <p class="news-empty">
        No se pudo cargar la galería.
      </p>
    `;
    }
}
/* ==========================================
   INICIO
========================================== */
document.addEventListener("DOMContentLoaded", loadGallery);
