import "./common";
import type { PlayerStat } from "./types";

function render(rows: PlayerStat[]): void {
  const body = document.querySelector<HTMLElement>("[data-stats-body]");
  if (!body) return;

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="5">Aún no hay estadísticas capturadas.</td></tr>`;
    return;
  }

  body.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${r.jugador}</td>
        <td>${r.categoria}</td>
        <td>${r.touchdowns}</td>
        <td>${r.intercepciones}</td>
        <td>${r.partidosJugados}</td>
      </tr>`
    )
    .join("");
}

async function loadStats(): Promise<void> {
  try {
    const res = await fetch("/data/stats.json");
    if (!res.ok) throw new Error("No se pudo cargar stats.json");
    render((await res.json()) as PlayerStat[]);
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadStats);
