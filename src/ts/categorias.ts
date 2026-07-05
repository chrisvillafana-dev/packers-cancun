import "./common";
import type { Category } from "./types";

function render(categories: Category[]): void {
  const grid = document.querySelector<HTMLElement>("[data-categories-grid]");
  if (!grid) return;

  grid.innerHTML = categories
    .map(
      (c) => `
      <article class="card reveal">
        <span class="badge badge-outline">${c.schedule}</span>
        <h3 class="section-title" style="font-size:1.6rem;margin-top:0.9rem;">${c.name}</h3>
        <p class="news-excerpt" style="margin-top:0.6rem;">${c.description}</p>
      </article>`
    )
    .join("");
}

async function loadCategories(): Promise<void> {
  try {
    const res = await fetch("/data/categories.json");
    if (!res.ok) throw new Error("No se pudo cargar categories.json");
    render((await res.json()) as Category[]);
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadCategories);
