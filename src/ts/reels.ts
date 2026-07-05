import "./common";
import type { Reel } from "./types";

function render(reels: Reel[]): void {
  const grid = document.querySelector<HTMLElement>("[data-reels-grid]");
  if (!grid) return;

  if (!reels.length) {
    grid.innerHTML = `<p class="news-empty">Aún no hay reels publicados. Sube tus videos a /public/videos y agrégalos en /public/data/reels.json</p>`;
    return;
  }

  grid.innerHTML = reels
    .map((r) => {
      const media = r.video
        ? `<video src="${r.video}" muted loop playsinline preload="metadata"></video>`
        : `<img src="${r.thumbnail || ""}" alt="${r.title}" />`;
      return `
      <div class="reel-card reveal" data-reel>
        ${media}
        <div class="reel-caption">${r.caption}</div>
      </div>`;
    })
    .join("");

  // Reproducir en hover para dar vida a la cuadrícula sin autoplay agresivo.
  grid.querySelectorAll<HTMLElement>("[data-reel]").forEach((card) => {
    const video = card.querySelector("video");
    if (!video) return;
    card.addEventListener("mouseenter", () => video.play().catch(() => {}));
    card.addEventListener("mouseleave", () => video.pause());
  });
}

async function loadReels(): Promise<void> {
  try {
    const res = await fetch("/data/reels.json");
    if (!res.ok) throw new Error("No se pudo cargar reels.json");
    render((await res.json()) as Reel[]);
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadReels);
