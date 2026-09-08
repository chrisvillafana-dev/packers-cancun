import "./common";
import { db } from "./../../admin/ts/firebase";

import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "firebase/firestore";

/* =========================================================
   TIPOS
========================================================= */

interface PublicReel {
  title: string;
  description: string;
  platform: string;
  url: string;
  published: boolean;
  createdAt?: any;
}

/* =========================================================
   FALLBACK
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800'%3E%3Crect width='600' height='800' fill='%2316301f'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='32'%3EPackers Cancún%3C/text%3E%3C/svg%3E";

/* =========================================================
   ICONOS
========================================================= */

function getPlatformIcon(platform: string): string {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "◎";

    case "tiktok":
      return "♪";

    case "youtube":
      return "▶";

    case "facebook":
      return "f";

    default:
      return "▶";
  }
}

/* =========================================================
   DETECTAR PLATAFORMA
========================================================= */

function detectPlatform(url: string, platform: string): string {
  const normalizedPlatform = platform.toLowerCase();

  if (normalizedPlatform.includes("instagram")) {
    return "instagram";
  }

  if (normalizedPlatform.includes("tiktok")) {
    return "tiktok";
  }

  if (normalizedPlatform.includes("youtube")) {
    return "youtube";
  }

  if (normalizedPlatform.includes("facebook")) {
    return "facebook";
  }

  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes("instagram.com")) {
    return "instagram";
  }

  if (
    normalizedUrl.includes("tiktok.com") ||
    normalizedUrl.includes("vm.tiktok.com")
  ) {
    return "tiktok";
  }

  if (
    normalizedUrl.includes("youtube.com") ||
    normalizedUrl.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (
    normalizedUrl.includes("facebook.com") ||
    normalizedUrl.includes("fb.watch")
  ) {
    return "facebook";
  }

  return "other";
}

/* =========================================================
   YOUTUBE
========================================================= */

function getYouTubeEmbed(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    let videoId = "";

    if (parsedUrl.hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      videoId = parsedUrl.searchParams.get("v") || "";

      if (!videoId && parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname
          .replace("/shorts/", "")
          .split("/")[0];
      }

      if (!videoId && parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname
          .replace("/embed/", "")
          .split("/")[0];
      }
    }

    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${encodeURIComponent(
      videoId
    )}?autoplay=1&rel=0`;

  } catch {
    return null;
  }
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  value: string
): string {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}

/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

/* =========================================================
   MODAL
========================================================= */

let activeModal: HTMLElement | null = null;

function closeReelModal(): void {
  if (!activeModal) return;

  const iframe =
    activeModal.querySelector<HTMLIFrameElement>(
      "[data-reel-iframe]"
    );

  if (iframe) {
    iframe.src = "";
  }

  activeModal.remove();
  activeModal = null;

  document.body.style.overflow = "";
}

function openReelModal(reel: PublicReel): void {
  closeReelModal();

  const platform =
    detectPlatform(reel.url, reel.platform);

  const safeTitle =
    escapeHtml(reel.title);

  const safeDescription =
    escapeHtml(reel.description);

  const safePlatform =
    escapeHtml(reel.platform);

  const safeUrl =
    escapeAttribute(reel.url);

  let mediaContent = "";

  /* =======================================================
     YOUTUBE
  ======================================================= */

  if (platform === "youtube") {
    const embedUrl =
      getYouTubeEmbed(reel.url);

    if (embedUrl) {
      mediaContent = `
        <div class="reel-modal-video">
          <iframe
            data-reel-iframe
            src="${escapeAttribute(embedUrl)}"
            title="${safeTitle}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      `;
    } else {
      mediaContent = `
        <div class="reel-modal-placeholder">
          <span class="public-reel-play">▶</span>
          <p>No pudimos obtener el video de YouTube.</p>
        </div>
      `;
    }
  }

  /* =======================================================
     INSTAGRAM
  ======================================================= */

  else if (platform === "instagram") {
    mediaContent = `
      <div class="reel-modal-placeholder">
        <span class="public-reel-play">◎</span>
        <strong>Instagram</strong>
        <p>
          Este contenido pertenece a Instagram.
          Puedes abrirlo directamente desde el siguiente botón.
        </p>
      </div>
    `;
  }

  /* =======================================================
     TIKTOK
  ======================================================= */

  else if (platform === "tiktok") {
    mediaContent = `
      <div class="reel-modal-placeholder">
        <span class="public-reel-play">♪</span>
        <strong>TikTok</strong>
        <p>
          Este contenido pertenece a TikTok.
          Puedes abrirlo directamente desde el siguiente botón.
        </p>
      </div>
    `;
  }

  /* =======================================================
     FACEBOOK
  ======================================================= */

  else if (platform === "facebook") {
    mediaContent = `
      <div class="reel-modal-placeholder">
        <span class="public-reel-play">f</span>
        <strong>Facebook</strong>
        <p>
          Este contenido pertenece a Facebook.
          Puedes abrirlo directamente desde el siguiente botón.
        </p>
      </div>
    `;
  }

  /* =======================================================
     OTRA PLATAFORMA
  ======================================================= */

  else {
    mediaContent = `
      <div class="reel-modal-placeholder">
        <span class="public-reel-play">▶</span>
        <strong>${safePlatform}</strong>
        <p>
          Este reel está disponible en su plataforma original.
        </p>
      </div>
    `;
  }

  /* =======================================================
     CREAR MODAL
  ======================================================= */

  const modal =
    document.createElement("div");

  modal.className =
    "reel-modal";

  modal.setAttribute(
    "role",
    "dialog"
  );

  modal.setAttribute(
    "aria-modal",
    "true"
  );

  modal.setAttribute(
    "aria-label",
    reel.title
  );

  modal.innerHTML = `
    <div class="reel-modal-backdrop"
         data-reel-close></div>

    <div class="reel-modal-dialog">

      <button
        type="button"
        class="reel-modal-close"
        data-reel-close
        aria-label="Cerrar Reel">
        ×
      </button>

      <div class="reel-modal-media">
        ${mediaContent}
      </div>

      <div class="reel-modal-info">

        <span class="public-reel-platform">
          ${safePlatform}
        </span>

        <h2>
          ${safeTitle}
        </h2>

        <p>
          ${safeDescription}
        </p>

        <a
          href="${safeUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn">
          Abrir en ${safePlatform}
        </a>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  activeModal = modal;

  document.body.style.overflow = "hidden";

  /* =======================================================
     CERRAR
  ======================================================= */

  modal
    .querySelectorAll<HTMLElement>(
      "[data-reel-close]"
    )
    .forEach((element) => {

      element.addEventListener(
        "click",
        closeReelModal
      );

    });

  /* =======================================================
     ESCAPE
  ======================================================= */

  const handleEscape =
    (event: KeyboardEvent) => {

      if (
        event.key === "Escape" &&
        activeModal === modal
      ) {

        closeReelModal();

        document.removeEventListener(
          "keydown",
          handleEscape
        );

      }

    };

  document.addEventListener(
    "keydown",
    handleEscape
  );

  /* =======================================================
     ANIMACIÓN
  ======================================================= */

  requestAnimationFrame(() => {
    modal.classList.add("is-open");
  });
}

/* =========================================================
   CARGAR REELS
========================================================= */

async function loadReels(): Promise<void> {

  const grid =
    document.querySelector<HTMLElement>(
      "[data-reels-grid]"
    );

  if (!grid) {
    return;
  }

  try {

    const reelsQuery =
      query(
        collection(db, "reels"),
        where(
          "published",
          "==",
          true
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

    const snapshot =
      await getDocs(reelsQuery);

    if (snapshot.empty) {

      grid.innerHTML = `
        <p class="news-empty">
          Aún no hay reels publicados.
        </p>
      `;

      return;
    }

    const reels: PublicReel[] =
      snapshot.docs.map(
        (document) => {

          return document.data() as PublicReel;

        }
      );

    renderReels(
      grid,
      reels
    );

  } catch (error) {

    console.error(
      "Error cargando Reels:",
      error
    );

    grid.innerHTML = `
      <p class="news-empty">
        No se pudieron cargar los Reels.
      </p>
    `;
  }
}

/* =========================================================
   RENDERIZAR REELS
========================================================= */

function renderReels(
  grid: HTMLElement,
  reels: PublicReel[]
): void {

  grid.innerHTML = reels.map((reel) => {

    const platformIcon =
      getPlatformIcon(reel.platform);

    return `
      <article class="public-reel-card reveal">

        <button
          type="button"
          class="public-reel-preview"
          data-reel-open
          aria-label="Ver ${escapeAttribute(reel.title)}">

          <img
            src="${FALLBACK_IMAGE}"
            alt="${escapeAttribute(reel.title)}"
            loading="lazy"
          >

          <div class="public-reel-overlay">
            <span class="public-reel-play">
              ${platformIcon}
            </span>
          </div>

          <span class="public-reel-platform">
            ${escapeHtml(reel.platform)}
          </span>

        </button>

        <div class="public-reel-content">

          <h3>
            ${escapeHtml(reel.title)}
          </h3>

          <p>
            ${escapeHtml(reel.description)}
          </p>

          <button
            type="button"
            class="btn public-reel-button"
            data-reel-open>
            Ver Reel
          </button>

        </div>

      </article>
    `;

  }).join("");


  const cards =
    grid.querySelectorAll<HTMLElement>(
      ".public-reel-card"
    );


  cards.forEach((card, index) => {

    const reel = reels[index];

    if (!reel) {
      return;
    }


    const buttons =
      card.querySelectorAll<HTMLButtonElement>(
        "[data-reel-open]"
      );


    buttons.forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          openReelModal(reel);

        }
      );

    });

  });


  initReveal(grid);
}

/* =========================================================
   REVEAL
========================================================= */

function initReveal(
  container: HTMLElement
): void {

  const elements =
    container.querySelectorAll<HTMLElement>(
      ".public-reel-card.reveal"
    );

  if (!elements.length) {
    return;
  }

  if (
    !(
      "IntersectionObserver" in
      window
    )
  ) {

    elements.forEach(
      (element) => {

        element.classList.add(
          "is-visible"
        );

      }
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.15
      }
    );

  elements.forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );
}

/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadReels();

  }
);