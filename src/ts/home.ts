import "./common";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

import { db } from "../../admin/ts/firebase";


interface PublicNews {

  id: string;

  title: string;

  description: string;

  category: string;

  image?: string;

  published: boolean;

  createdAt?: any;

}


/* ==========================================
   ELEMENTOS
========================================== */

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%2316301f'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-family='Arial' font-size='28'%3EPACKERS CANCÚN%3C/text%3E%3C/svg%3E";


/* ==========================================
   ESCAPAR HTML
========================================== */

function escapeHTML(value: string): string {

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==========================================
   FORMATEAR FECHA
========================================== */

function formatDate(timestamp: any): string {

  if (!timestamp) {
    return "";
  }

  try {

    const date =
      typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleDateString(
      "es-MX",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  } catch {

    return "";

  }

}


/* ==========================================
   RENDER NOTICIAS
========================================== */

function renderNews(items: PublicNews[]): void {

  const grid =
    document.querySelector<HTMLElement>(
      "[data-news-grid]"
    );

  if (!grid) return;


  if (!items.length) {

    grid.innerHTML = `
      <p class="news-empty">
        Aún no hay noticias publicadas.
      </p>
    `;

    return;

  }


  grid.innerHTML = items
    .slice(0, 6)
    .map((item) => {

      const title =
        escapeHTML(item.title || "Sin título");

      const description =
        escapeHTML(
          item.description || ""
        );

      const category =
        escapeHTML(
          item.category || "General"
        );

      const image =
        item.image && item.image.trim()
          ? item.image
          : FALLBACK_IMG;

      const date =
        formatDate(item.createdAt);


      return `
        <article class="news-card reveal">

          <div class="news-media">

            <img
              src="${image}"
              alt="${title}"
              loading="lazy"
              onerror="this.src='${FALLBACK_IMG}'"
            >

            <span class="news-tag">
              ${category}
            </span>

          </div>


          <div class="news-body">

            <span class="news-date">
              ${date}
            </span>

            <h3 class="news-title">
              ${title}
            </h3>

            <p class="news-excerpt">
              ${description}
            </p>

          </div>

        </article>
      `;

    })
    .join("");


  initNewsReveal();

}


/* ==========================================
   ANIMACIÓN DE NOTICIAS
========================================== */

function initNewsReveal(): void {

  const elements =
    document.querySelectorAll(
      "[data-news-grid] .reveal"
    );


  if (
    !("IntersectionObserver" in window)
  ) {

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
   CARGAR NOTICIAS DESDE FIRESTORE
========================================== */

async function loadNews(): Promise<void> {

  const grid =
    document.querySelector<HTMLElement>(
      "[data-news-grid]"
    );


  if (!grid) return;


  try {

    grid.innerHTML = `
      <p class="news-empty">
        Cargando noticias…
      </p>
    `;


    const newsQuery =
      query(
        collection(db, "news"),

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
      await getDocs(newsQuery);


    const news: PublicNews[] =
      snapshot.docs.map((document) => {

        return {
          id: document.id,
          ...document.data()
        } as PublicNews;

      });


    renderNews(news);


  } catch (error) {

    console.error(
      "Error cargando noticias:",
      error
    );


    grid.innerHTML = `
      <p class="news-empty">
        No se pudieron cargar las noticias.
      </p>
    `;

  }

}


/* ==========================================
   INICIAR
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadNews();

  }
);