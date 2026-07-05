import "./common";
import type { NewsItem } from "./types";

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='400' height='250' fill='%2316301f'/%3E%3C/svg%3E";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function renderNews(items: NewsItem[]): void {
  const grid = document.querySelector<HTMLElement>("[data-news-grid]");
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<p class="news-empty">Aún no hay noticias publicadas. Agrega la primera en /public/data/news.json</p>`;
    return;
  }

  grid.innerHTML = items
    .slice(0, 6)
    .map(
      (item) => `
      <article class="news-card reveal">
        <div class="news-media" style="background-image:url('${item.image || FALLBACK_IMG}')">
          <span class="news-tag">${item.tag}</span>
        </div>
        <div class="news-body">
          <span class="news-date">${formatDate(item.date)}</span>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-excerpt">${item.excerpt}</p>
        </div>
      </article>`
    )
    .join("");

  // Los elementos se insertan después de que initRevealOnScroll ya corrió,
  // así que los observamos de nuevo aquí para que también animen al aparecer.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    grid.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  } else {
    grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
}

async function loadNews(): Promise<void> {
  const grid = document.querySelector<HTMLElement>("[data-news-grid]");
  try {
    const res = await fetch("/data/news.json");
    if (!res.ok) throw new Error("No se pudo cargar news.json");
    const items = (await res.json()) as NewsItem[];
    renderNews(
      [...items].sort((a, b) => (a.date < b.date ? 1 : -1))
    );
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.innerHTML = `<p class="news-empty">No se pudieron cargar las noticias. Corre el sitio con "npm run dev" (no abriendo el HTML directo).</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", loadNews);
