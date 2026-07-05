import "./common";
import type { Game } from "./types";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "2-digit", month: "long" });
}

function renderUpcoming(games: Game[]): void {
  const wrap = document.querySelector<HTMLElement>("[data-upcoming-games]");
  if (!wrap) return;

  if (!games.length) {
    wrap.innerHTML = `<p class="news-empty">Aún no hay partidos programados.</p>`;
    return;
  }

  wrap.innerHTML = games
    .map(
      (g) => `
      <article class="card reveal">
        <span class="badge">${g.category}</span>
        <h3 class="section-title" style="font-size:1.4rem;margin-top:0.8rem;">Packers Cancún vs ${g.opponent}</h3>
        <p class="news-excerpt" style="margin-top:0.5rem;">
          ${formatDate(g.date)} · ${g.time} hrs<br />${g.location}
        </p>
      </article>`
    )
    .join("");
}

function renderResults(games: Game[]): void {
  const wrap = document.querySelector<HTMLElement>("[data-results-games]");
  if (!wrap) return;

  if (!games.length) {
    wrap.innerHTML = `<p class="news-empty">Aún no hay resultados capturados.</p>`;
    return;
  }

  wrap.innerHTML = games
    .map((g) => {
      const badgeClass = g.outcome === "victoria" ? "badge" : "badge badge-outline";
      return `
      <article class="card reveal">
        <span class="${badgeClass}">${g.outcome ?? "Resultado"}</span>
        <h3 class="section-title" style="font-size:1.4rem;margin-top:0.8rem;">vs ${g.opponent}</h3>
        <p class="news-excerpt" style="margin-top:0.5rem;">
          ${formatDate(g.date)} · ${g.category}<br />
          <strong style="color:var(--gold-300)">${g.result ?? ""}</strong>
        </p>
      </article>`;
    })
    .join("");
}

async function loadGames(): Promise<void> {
  try {
    const res = await fetch("/data/games.json");
    if (!res.ok) throw new Error("No se pudo cargar games.json");
    const data = (await res.json()) as { proximos: Game[]; resultados: Game[] };
    renderUpcoming(data.proximos ?? []);
    renderResults(data.resultados ?? []);
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadGames);
