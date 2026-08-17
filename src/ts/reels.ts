import "./common";
import { db } from "./../../admin/ts/firebase";

import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "firebase/firestore";

interface PublicReel {
  title: string;
  description: string;
  platform: string;
  url: string;
  published: boolean;
  createdAt?: any;
}

/* ==========================================
   ELEMENTOS
========================================== */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800'%3E%3Crect width='600' height='800' fill='%2316301f'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-size='32'%3EPackers Cancún%3C/text%3E%3C/svg%3E";


/* ==========================================
   ICONOS POR PLATAFORMA
========================================== */

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


/* ==========================================
   CARGAR REELS
========================================== */

async function loadReels(): Promise<void> {

  const grid =
    document.querySelector<HTMLElement>("[data-reels-grid]");

  if (!grid) return;


  try {

    const reelsQuery = query(

      collection(db, "reels"),

      where("published", "==", true),

      orderBy("createdAt", "desc")

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
      snapshot.docs.map((document) => {

        const data =
          document.data() as PublicReel;

        return data;

      });


    renderReels(reels);


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


/* ==========================================
   RENDERIZAR REELS
========================================== */

function renderReels(
  reels: PublicReel[]
): void {

  const grid =
    document.querySelector<HTMLElement>(
      "[data-reels-grid]"
    );

  if (!grid) return;


  grid.innerHTML = reels
    .map((reel) => {

      const platformIcon =
        getPlatformIcon(reel.platform);


      return `

        <article class="public-reel-card reveal">

          <div class="public-reel-preview">

            <img
              src="${FALLBACK_IMAGE}"
              alt="${escapeHtml(reel.title)}"
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

          </div>


          <div class="public-reel-content">

            <h3>
              ${escapeHtml(reel.title)}
            </h3>

            <p>
              ${escapeHtml(reel.description)}
            </p>

            <a
              href="${escapeAttribute(reel.url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn public-reel-button"
            >
              Ver Reel
            </a>

          </div>

        </article>

      `;

    })
    .join("");


  initReveal();

}


/* ==========================================
   PROTECCIÓN DE TEXTO
========================================== */

function escapeHtml(
  value: string
): string {

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(
  value: string
): string {

  return escapeHtml(value);

}


/* ==========================================
   ANIMACIONES
========================================== */

function initReveal(): void {

  const elements =
    document.querySelectorAll(
      ".public-reel-card.reveal"
    );


  if (!("IntersectionObserver" in window)) {

    elements.forEach((element) => {

      element.classList.add(
        "is-visible"
      );

    });

    return;

  }


  const observer =
    new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

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

        });

      },

      {
        threshold: 0.15
      }

    );


  elements.forEach((element) => {

    observer.observe(element);

  });

}


/* ==========================================
   INICIAR
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  loadReels
);