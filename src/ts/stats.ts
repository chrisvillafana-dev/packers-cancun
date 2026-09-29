import "./common";

import {
  db
} from "./../../admin/ts/firebase";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";


/* =========================================================
   TIPOS
========================================================= */

interface PlayerStats {
  touchdowns: number;
  intercepciones: number;
  partidos: number;
  recepciones?: number;
  flagPulls?: number;
  qbTouchdowns?: number;
  completions?: number;
  sacks?: number;
}


interface Player {
  id: string;
  name: string;
  number: string;
  category: string;
  position: string;
  photo: string;
  bio: string;

  seasons: number;
  achievement: string;

  instagram: string;
  tiktok: string;
  highlights: string;

  published: boolean;

  stats: PlayerStats;
}


interface Category {
  id: string;
  name: string;
  order: number;
  published: boolean;
}


/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_PHOTO =
  "/assets/logo-nav.png";


/* =========================================================
   ESTADO
========================================================= */

let players: Player[] = [];

let categories: Category[] = [];

let activeCategory =
  "all";

let searchTerm =
  "";

let weeklyMvps: Record<string, string> = {};


/* =========================================================
   ELEMENTOS PRINCIPALES
========================================================= */

const grid =
  document.querySelector<HTMLElement>(
    "[data-stats-body]"
  );

const count =
  document.querySelector<HTMLElement>(
    "[data-stats-count]"
  );

const searchInput =
  document.querySelector<HTMLInputElement>(
    "#stats-search"
  );

const filtersContainer =
  document.querySelector<HTMLElement>(
    "[data-stats-filters]"
  );


/* =========================================================
   MVP / LÍDERES
========================================================= */

const mvpSection = document.querySelector<HTMLElement>("[data-mvp-section]");
const mvpGrid = document.querySelector<HTMLElement>("[data-mvp-grid]");
const leaderboards = document.querySelector<HTMLElement>("[data-leaderboards]");

/* =========================================================
   MODAL
========================================================= */

const modal =
  document.querySelector<HTMLElement>(
    "[data-player-modal]"
  );

const modalPhoto =
  document.querySelector<HTMLImageElement>(
    "[data-player-photo]"
  );

const modalName =
  document.querySelector<HTMLElement>(
    "[data-player-name]"
  );

const modalNumber =
  document.querySelector<HTMLElement>(
    "[data-player-number]"
  );

const modalCategory =
  document.querySelector<HTMLElement>(
    "[data-player-category]"
  );

const modalPosition =
  document.querySelector<HTMLElement>(
    "[data-player-position]"
  );

const modalBio =
  document.querySelector<HTMLElement>(
    "[data-player-bio]"
  );

const modalStats =
  document.querySelector<HTMLElement>(
    "[data-player-stats]"
  );

const modalInfoSection =
  document.querySelector<HTMLElement>(
    "[data-player-info-section]"
  );

const modalSeasonsWrap =
  document.querySelector<HTMLElement>(
    "[data-player-seasons-wrap]"
  );

const modalSeasons =
  document.querySelector<HTMLElement>(
    "[data-player-seasons]"
  );

const modalAchievementWrap =
  document.querySelector<HTMLElement>(
    "[data-player-achievement-wrap]"
  );

const modalAchievement =
  document.querySelector<HTMLElement>(
    "[data-player-achievement]"
  );

const modalSocialSection =
  document.querySelector<HTMLElement>(
    "[data-player-social-section]"
  );

const modalSocials =
  document.querySelector<HTMLElement>(
    "[data-player-socials]"
  );


/* =========================================================
   INICIAR
========================================================= */

async function init(): Promise<void> {

  await Promise.all([
    loadPlayers(),
    loadCategories()
  ]);

  await loadStatsSettings();

  sortPlayers();

  renderCategoryFilters();

  renderPlayers();

  renderLeaderboards();
  renderWeeklyMvp();

}


/* =========================================================
   CARGAR JUGADORES
========================================================= */

async function loadPlayers(): Promise<void> {

  try {

    const playersQuery =
      query(
        collection(
          db,
          "players"
        ),
        where(
          "published",
          "==",
          true
        )
      );


    const snapshot =
      await getDocs(
        playersQuery
      );


    players =
      snapshot.docs.map(
        (documentSnapshot) => {

          const data =
            documentSnapshot.data();

          const storedStats =
            data.stats || {};


          const playerStats: PlayerStats = {

            touchdowns:
              Number(
                storedStats.touchdowns ??
                data.touchdowns ??
                0
              ),

            intercepciones:
              Number(
                storedStats.intercepciones ??
                data.interceptions ??
                0
              ),

            partidos:
              Number(
                storedStats.partidos ??
                data.gamesPlayed ??
                0
              ),

            recepciones: numberOrUndefined(storedStats.recepciones ?? data.receptions),
            flagPulls: numberOrUndefined(storedStats.flagPulls ?? data.flagPulls),
            qbTouchdowns: numberOrUndefined(storedStats.qbTouchdowns ?? data.qbTouchdowns),
            completions: numberOrUndefined(storedStats.completions ?? data.completions),
            sacks: numberOrUndefined(storedStats.sacks ?? data.sacks)

          };


          return {

            id:
              documentSnapshot.id,

            name:
              String(
                data.name || ""
              ),

            number:
              String(
                data.number ?? ""
              ),

            category:
              String(
                data.category || ""
              ),

            position:
              String(
                data.position || ""
              ),

            photo:
              String(
                data.photo || ""
              ),

            bio:
              String(
                data.bio || ""
              ),

            seasons:
              Number(
                data.seasons || 0
              ),

            achievement:
              String(
                data.achievement || ""
              ),

            /*
             * Compatibilidad:
             *
             * Primero buscamos los nombres
             * actuales del CMS.
             *
             * También permitimos variantes
             * por si algún documento anterior
             * fue guardado con "Url".
             */

            instagram:
              String(
                data.instagram ??
                data.instagramUrl ??
                ""
              ),

            tiktok:
              String(
                data.tiktok ??
                data.tiktokUrl ??
                ""
              ),

            highlights:
              String(
                data.highlights ??
                data.highlightsUrl ??
                data.highlightUrl ??
                ""
              ),

            published:
              data.published === true,

            stats:
              playerStats

          };

        }
      );


  } catch (error) {

    console.error(
      "Error cargando jugadores:",
      error
    );

    players = [];

  }

}


/* =========================================================
   CARGAR CATEGORÍAS
========================================================= */

async function loadCategories(): Promise<void> {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "categories"
        )
      );


    categories =
      snapshot.docs

        .map(
          (documentSnapshot) => {

            const data =
              documentSnapshot.data();


            return {

              id:
                documentSnapshot.id,

              name:
                String(
                  data.name || ""
                ),

              order:
                Number(
                  data.order || 0
                ),

              published:
                data.published === true

            };

          }
        )

        .filter(
          (category) =>
            category.published &&
            category.name
        )

        .sort(
          (a, b) =>
            a.order - b.order
        );


  } catch (error) {

    console.warn(
      "No se pudieron cargar las categorías:",
      error
    );

    categories = [];

  }

}


/* =========================================================
   SETTINGS / MVP
========================================================= */

async function loadStatsSettings(): Promise<void> {

  try {

    const settingsRef =
      doc(
        db,
        "settings",
        "stats"
      );


    const snapshot =
      await getDoc(
        settingsRef
      );


    if (
      snapshot.exists()
    ) {

      const data = snapshot.data();
      if (data.weeklyMvps && typeof data.weeklyMvps === "object") {
        weeklyMvps = data.weeklyMvps as Record<string, string>;
      } else if (data.weeklyMvp) {
        const legacy = players.find((player) => player.id === String(data.weeklyMvp));
        if (legacy?.category) weeklyMvps[legacy.category] = legacy.id;
      }

    }


  } catch (error) {

    console.warn(
      "No se pudo cargar el MVP:",
      error
    );

  }

}


/* =========================================================
   ORDEN
========================================================= */

function sortPlayers(): void {

  players.sort(
    (a, b) => {

      const categoryA =
        getCategoryOrder(
          a.category
        );

      const categoryB =
        getCategoryOrder(
          b.category
        );


      if (
        categoryA !==
        categoryB
      ) {

        return (
          categoryA -
          categoryB
        );

      }


      const numberA =
        Number(
          a.number
        );

      const numberB =
        Number(
          b.number
        );


      if (
        Number.isFinite(
          numberA
        ) &&
        Number.isFinite(
          numberB
        ) &&
        numberA !==
        numberB
      ) {

        return (
          numberA -
          numberB
        );

      }


      return (
        a.name.localeCompare(
          b.name,
          "es",
          {
            sensitivity:
              "base"
          }
        )
      );

    }
  );

}


function getCategoryOrder(
  name: string
): number {

  const category =
    categories.find(
      (item) =>
        item.name === name
    );


  return (
    category?.order ??
    999
  );

}


/* =========================================================
   FILTROS
========================================================= */

function renderCategoryFilters(): void {

  if (!filtersContainer) {
    return;
  }


  let visibleCategories =
    categories;


  if (
    !visibleCategories.length
  ) {

    const playerCategories =
      Array.from(
        new Set(
          players
            .map(
              (player) =>
                player.category
            )
            .filter(
              Boolean
            )
        )
      );


    visibleCategories =
      playerCategories.map(
        (name, index) => ({

          id:
            name,

          name,

          order:
            index,

          published:
            true

        })
      );

  }


  filtersContainer.innerHTML = `

    <button
      type="button"
      class="stats-filter active"
      data-category="all"
    >
      Todos
    </button>

  `;


  visibleCategories.forEach(
    (category) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "stats-filter";

      button.dataset.category =
        category.name;

      button.textContent =
        category.name;


      button.addEventListener(
        "click",
        handleCategoryClick
      );


      filtersContainer.appendChild(
        button
      );

    }
  );


  const allButton =
    filtersContainer.querySelector<HTMLButtonElement>(
      '[data-category="all"]'
    );


  allButton?.addEventListener(
    "click",
    handleCategoryClick
  );

}


/* =========================================================
   CLICK CATEGORÍA
========================================================= */

function handleCategoryClick(
  event: Event
): void {

  const button =
    event.currentTarget as
      HTMLButtonElement;


  filtersContainer
    ?.querySelectorAll(
      ".stats-filter"
    )
    .forEach(
      (element) =>
        element.classList.remove(
          "active"
        )
    );


  button.classList.add(
    "active"
  );


  activeCategory =
    button.dataset.category ||
    "all";


  renderPlayers();

}


/* =========================================================
   FILTRAR
========================================================= */

function getFilteredPlayers(): Player[] {

  const normalizedSearch =
    normalizeText(
      searchTerm
    );


  return players.filter(
    (player) => {

      const matchesCategory =
        activeCategory ===
        "all" ||
        player.category ===
        activeCategory;


      if (
        !matchesCategory
      ) {

        return false;

      }


      if (
        !normalizedSearch
      ) {

        return true;

      }


      const searchableText =
        normalizeText(`

          ${player.name}

          ${player.number}

          ${player.category}

          ${player.position}

        `);


      return searchableText.includes(
        normalizedSearch
      );

    }
  );

}


/* =========================================================
   RENDER JUGADORES
========================================================= */

function renderPlayers(): void {

  if (!grid) {
    return;
  }


  const filtered =
    getFilteredPlayers();


  if (count) {

    count.textContent =
      String(
        filtered.length
      );

  }


  if (
    !filtered.length
  ) {

    grid.innerHTML = `

      <div class="stats-empty">

        <span class="stats-empty-code">
          00
        </span>

        <strong>
          No encontramos jugadores
        </strong>

        <p>
          Prueba con otra categoría
          o cambia tu búsqueda.
        </p>

      </div>

    `;

    return;

  }


  grid.innerHTML =
    filtered
      .map(
        createPlayerCard
      )
      .join("");


  bindPlayerCards();

  initStatsReveal();

}


/* =========================================================
   TARJETA
========================================================= */

function createPlayerCard(
  player: Player
): string {

  const photo =
    player.photo ||
    DEFAULT_PHOTO;


  const hasAchievement =
    Boolean(
      player.achievement
    );


  return `

    <article
      class="player-card stats-reveal"
      data-player-id="${escapeAttribute(
        player.id
      )}"
      tabindex="0"
      role="button"
      aria-label="Ver perfil de ${escapeAttribute(
        player.name
      )}"
    >


      <div class="player-card-media">


        <img
          src="${escapeAttribute(
            photo
          )}"
          alt="${escapeAttribute(
            player.name
          )}"
          class="player-card-image"
          loading="lazy"
        >


        <div
          class="player-card-image-shade"
          aria-hidden="true"
        ></div>


        <div
          class="player-card-field-lines"
          aria-hidden="true"
        ></div>


        <div class="player-card-topline">


          <span class="player-card-category">

            ${escapeHtml(
              player.category
            )}

          </span>


          <span class="player-card-number">

            #${escapeHtml(
              player.number ||
              "00"
            )}

          </span>


        </div>


        <div class="player-card-identity">


          <span class="player-card-team">
            PACKERS CANCÚN
          </span>


          <h3>

            ${escapeHtml(
              player.name
            )}

          </h3>


          <p>

            ${escapeHtml(
              player.position ||
              "Jugador"
            )}

          </p>


        </div>


      </div>


      <div class="player-card-content">


        <div class="player-card-accent-line"></div>


        ${
          hasAchievement

            ? `

              <div class="player-card-achievement">

                <span>
                  DESTACADO
                </span>

                <strong>
                  ${escapeHtml(
                    player.achievement
                  )}
                </strong>

              </div>

            `

            : ""
        }


        <div class="player-card-stats">

  ${createSortedCardStats(
    player.stats
  )}

</div>


        <div class="player-card-action">


          <div>

            <span class="player-card-action-label">
              PLAYER PROFILE
            </span>

            <strong>
              Ver perfil
            </strong>

          </div>


          <span
            class="player-card-arrow"
            aria-hidden="true"
          >
            →
          </span>


        </div>


      </div>


    </article>

  `;

}


/* =========================================================
   CARD STAT
========================================================= */

function createSortedCardStats(
  stats: PlayerStats
): string {

  const availableStats = [

    {
      value: Number(stats.touchdowns ?? 0),
      label: "TD",
      title: "Touchdowns"
    },

    {
      value: Number(stats.recepciones ?? 0),
      label: "REC",
      title: "Recepciones"
    },

    {
      value: Number(stats.flagPulls ?? 0),
      label: "FP",
      title: "Flag Pulls"
    },

    {
      value: Number(stats.intercepciones ?? 0),
      label: "INT",
      title: "Intercepciones"
    },

    {
      value: Number(stats.qbTouchdowns ?? 0),
      label: "QB TD",
      title: "TD como QB"
    },

    {
      value: Number(stats.completions ?? 0),
      label: "COMP",
      title: "Pases completos"
    },

    {
      value: Number(stats.sacks ?? 0),
      label: "SACK",
      title: "Sacks"
    },

    {
      value: Number(stats.partidos ?? 0),
      label: "PJ",
      title: "Partidos jugados"
    }

  ];

  return availableStats

    .sort(
      (a, b) =>
        b.value - a.value
    )

    .map(
      (stat) =>
        createCardStat(
          stat.value,
          stat.label,
          stat.title
        )
    )

    .join("");

}

function createCardStat(
  value: number,
  label: string,
  title: string
): string {

  return `

    <div
      class="player-card-stat"
      title="${escapeAttribute(
        title
      )}"
    >

      <strong>
        ${value}
      </strong>

      <span>
        ${escapeHtml(
          label
        )}
      </span>

    </div>

  `;

}


/* =========================================================
   EVENTOS TARJETAS
========================================================= */

function bindPlayerCards(): void {

  if (!grid) {
    return;
  }


  grid
    .querySelectorAll<HTMLElement>(
      "[data-player-id]"
    )
    .forEach(
      (card) => {

        const open =
          (): void => {

            const id =
              card.dataset.playerId;


            if (!id) {
              return;
            }


            const player =
              players.find(
                (item) =>
                  item.id === id
              );


            if (!player) {
              return;
            }


            openPlayerModal(
              player
            );

          };


        card.addEventListener(
          "click",
          open
        );


        card.addEventListener(
          "keydown",
          (event) => {

            if (
              event.key ===
              "Enter" ||
              event.key ===
              " "
            ) {

              event.preventDefault();

              open();

            }

          }
        );


        const image =
          card.querySelector<HTMLImageElement>(
            ".player-card-image"
          );


        image?.addEventListener(
          "error",
          () => {

            image.src =
              DEFAULT_PHOTO;

          },
          {
            once:
              true
          }
        );

      }
    );

}


/* =========================================================
   MVP
========================================================= */

function renderWeeklyMvp(): void {
  if (!mvpSection || !mvpGrid) return;

  const entries = Object.entries(weeklyMvps)
    .map(([category, playerId]) => ({ category, player: players.find((item) => item.id === playerId) }))
    .filter((item): item is { category: string; player: Player } => Boolean(item.player));

  if (!entries.length) {
    mvpSection.classList.add("hidden");
    return;
  }

  mvpGrid.innerHTML = entries.map(({ category, player }) => `
    <article class="mvp-category-card" data-player-id="${escapeAttribute(player.id)}">
      <div class="mvp-gold-ring">
        <img src="${escapeAttribute(player.photo || DEFAULT_PHOTO)}" alt="${escapeAttribute(player.name)}">
      </div>
      <span class="mvp-category-label">MVP ${escapeHtml(category)}</span>
      <h3>${escapeHtml(player.name)}</h3>
      <p>#${escapeHtml(player.number || "00")} · ${escapeHtml(player.position || "Jugador")}</p>
      <div class="mvp-mini-stats">
        <span><strong>${player.stats.touchdowns}</strong> TD</span>
        <span><strong>${player.stats.flagPulls ?? 0}</strong> FP</span>
        <span><strong>${player.stats.intercepciones}</strong> INT</span>
      </div>
      <button type="button" class="mvp-profile-button">Ver perfil completo →</button>
    </article>
  `).join("");

  mvpGrid.querySelectorAll<HTMLElement>("[data-player-id]").forEach((card) => {
    card.querySelector("button")?.addEventListener("click", () => {
      const player = players.find((item) => item.id === card.dataset.playerId);
      if (player) openPlayerModal(player);
    });
  });

  mvpSection.classList.remove("hidden");
}

function renderLeaderboards(): void {
  if (!leaderboards) return;
  const boards = [
    { key: "touchdowns" as const, title: "Touchdowns", unit: "TD" },
    { key: "flagPulls" as const, title: "Flag Pulls", unit: "FP" },
    { key: "intercepciones" as const, title: "Intercepciones", unit: "INT" },
    { key: "qbTouchdowns" as const, title: "TD como QB", unit: "QB TD" }
  ];

  leaderboards.innerHTML = boards.map((board) => {
    const top = [...players]
      .sort((a,b) => Number(b.stats[board.key] ?? 0) - Number(a.stats[board.key] ?? 0))
      .slice(0,3);

    return `
      <article class="leaderboard-card">
        <span class="leaderboard-kicker">TOP 3</span>
        <h3>${escapeHtml(board.title)}</h3>
        <div class="leaderboard-list">
          ${top.map((player,index) => `
            <button type="button" class="leader-row" data-player-id="${escapeAttribute(player.id)}">
              <span class="leader-rank">${index + 1}</span>
              <img src="${escapeAttribute(player.photo || DEFAULT_PHOTO)}" alt="">
              <span class="leader-name"><strong>${escapeHtml(player.name)}</strong><small>${escapeHtml(player.category)}</small></span>
              <span class="leader-value">${Number(player.stats[board.key] ?? 0)} <small>${escapeHtml(board.unit)}</small></span>
            </button>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");

  leaderboards.querySelectorAll<HTMLElement>("[data-player-id]").forEach((row) => {
    row.addEventListener("click", () => {
      const player = players.find((item) => item.id === row.dataset.playerId);
      if (player) openPlayerModal(player);
    });
  });
}

/* =========================================================
   ABRIR MODAL
========================================================= */

function openPlayerModal(
  player: Player
): void {

  if (!modal) {
    return;
  }


  if (modalPhoto) {

    modalPhoto.src =
      player.photo ||
      DEFAULT_PHOTO;

    modalPhoto.alt =
      player.name;

    modalPhoto.onerror =
      () => {

        modalPhoto.src =
          DEFAULT_PHOTO;

        modalPhoto.onerror =
          null;

      };

  }


  if (modalName) {

    modalName.textContent =
      player.name;

  }


  if (modalNumber) {

    modalNumber.textContent =
      `#${player.number || "00"}`;

  }


  if (modalCategory) {

    modalCategory.textContent =
      player.category;

  }


  if (modalPosition) {

    modalPosition.textContent =
      player.position ||
      "Jugador";

  }


  if (modalBio) {

    modalBio.textContent =
      player.bio ||
      "Jugador de Packers Cancún.";

  }


  renderModalStats(
    player.stats
  );


  renderPlayerInfo(
    player
  );


  renderPlayerSocials(
    player
  );


  const modalContent =
  modal.querySelector<HTMLElement>(
    ".player-modal-content"
  );

const modalInfo =
  modal.querySelector<HTMLElement>(
    ".player-modal-info"
  );


modal.classList.remove(
  "hidden"
);


requestAnimationFrame(
  () => {

    modal.scrollTop = 0;

    if (modalContent) {
      modalContent.scrollTop = 0;
    }

    if (modalInfo) {
      modalInfo.scrollTop = 0;
    }

  }
);


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  const closeButton =
    modal.querySelector<HTMLButtonElement>(
      ".player-modal-close"
    );


  window.setTimeout(
    () =>
      closeButton?.focus(),
    30
  );

}


/* =========================================================
   PLAYER INFO
========================================================= */

function renderPlayerInfo(
  player: Player
): void {

  const hasSeasons =
    player.seasons > 0;

  const hasAchievement =
    Boolean(
      player.achievement
    );


  if (
    !hasSeasons &&
    !hasAchievement
  ) {

    modalInfoSection?.classList.add(
      "hidden"
    );

    return;

  }


  modalInfoSection?.classList.remove(
    "hidden"
  );


  if (
    hasSeasons &&
    modalSeasons &&
    modalSeasonsWrap
  ) {

    modalSeasons.textContent =
      String(
        player.seasons
      );

    modalSeasonsWrap.classList.remove(
      "hidden"
    );


  } else {

    modalSeasonsWrap?.classList.add(
      "hidden"
    );

  }


  if (
    hasAchievement &&
    modalAchievement &&
    modalAchievementWrap
  ) {

    modalAchievement.textContent =
      player.achievement;

    modalAchievementWrap.classList.remove(
      "hidden"
    );


  } else {

    modalAchievementWrap?.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   REDES SOCIALES
========================================================= */

function renderPlayerSocials(
  player: Player
): void {

  if (
    !modalSocials ||
    !modalSocialSection
  ) {

    return;

  }


  const links: {
    label: string;
    url: string;
    className: string;
  }[] = [];


  const instagram =
    normalizeExternalUrl(
      player.instagram
    );


  const tiktok =
    normalizeExternalUrl(
      player.tiktok
    );


  const highlights =
    normalizeExternalUrl(
      player.highlights
    );


  if (instagram) {

    links.push({

      label:
        "Instagram",

      url:
        instagram,

      className:
        "instagram"

    });

  }


  if (tiktok) {

    links.push({

      label:
        "TikTok",

      url:
        tiktok,

      className:
        "tiktok"

    });

  }


  if (highlights) {

    links.push({

      label:
        "Highlights",

      url:
        highlights,

      className:
        "highlights"

    });

  }


  if (
    !links.length
  ) {

    modalSocialSection.classList.add(
      "hidden"
    );

    modalSocials.innerHTML =
      "";

    return;

  }


  modalSocialSection.classList.remove(
    "hidden"
  );


  modalSocials.innerHTML =
    links
      .map(
        (link) => `

          <a
            href="${escapeAttribute(
              link.url
            )}"
            target="_blank"
            rel="noopener noreferrer"
            class="
              player-social-link
              player-social-${escapeAttribute(
                link.className
              )}
            "
          >

            <span class="player-social-icon">

              ${getSocialInitial(
                link.label
              )}

            </span>


            <span class="player-social-copy">

              <small>
                VISITAR
              </small>

              <strong>
                ${escapeHtml(
                  link.label
                )}
              </strong>

            </span>


            <span
              class="player-social-arrow"
              aria-hidden="true"
            >
              ↗
            </span>

          </a>

        `
      )
      .join("");

}


/* =========================================================
   ICONO SIMPLE RED SOCIAL
========================================================= */

function getSocialInitial(
  label: string
): string {

  if (
    label ===
    "Instagram"
  ) {

    return "IG";

  }


  if (
    label ===
    "TikTok"
  ) {

    return "TT";

  }


  return "▶";

}


/* =========================================================
   NORMALIZAR URL
========================================================= */

function normalizeExternalUrl(
  value: string
): string {

  let trimmed =
    String(
      value || ""
    ).trim();


  if (!trimmed) {

    return "";

  }


  /*
   * Si escribieron:
   *
   * instagram.com/usuario
   * www.instagram.com/usuario
   *
   * añadimos https:// automáticamente.
   */

  if (
    !/^https?:\/\//i.test(
      trimmed
    )
  ) {

    trimmed =
      `https://${trimmed}`;

  }


  try {

    const url =
      new URL(
        trimmed
      );


    if (
      url.protocol !==
      "https:" &&
      url.protocol !==
      "http:"
    ) {

      return "";

    }


    return url.toString();


  } catch {

    return "";

  }

}


/* =========================================================
   MODAL STATS
========================================================= */

function renderModalStats(
  stats: PlayerStats
): void {

  if (!modalStats) {
    return;
  }


  const availableStats = [

    {
      label:
        "Touchdowns",

      abbreviation:
        "TD",

      value:
        stats.touchdowns
    },

    {
      label:
        "Intercepciones",

      abbreviation:
        "INT",

      value:
        stats.intercepciones
    },

    {
      label:
        "Partidos",

      abbreviation:
        "PJ",

      value:
        stats.partidos
    },

    {
      label:
        "Recepciones",

      abbreviation:
        "REC",

      value:
        stats.recepciones
    },

    { label: "Flag Pulls", abbreviation: "FP", value: stats.flagPulls },
    { label: "TD como QB", abbreviation: "QB TD", value: stats.qbTouchdowns },
    { label: "Pases completos", abbreviation: "COMP", value: stats.completions },
    { label: "Sacks", abbreviation: "SACK", value: stats.sacks }

  ].filter(
    (
      stat
    ): stat is {
      label: string;
      abbreviation: string;
      value: number;
    } =>

      typeof stat.value ===
      "number" &&

      Number.isFinite(
        stat.value
      )
  );


  modalStats.innerHTML =
    availableStats
      .map(
        (stat) => `

          <div class="player-stat">

            <span class="player-stat-label">

              ${escapeHtml(
                stat.abbreviation
              )}

            </span>

            <strong>
              ${stat.value}
            </strong>

            <small>

              ${escapeHtml(
                stat.label
              )}

            </small>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function closePlayerModal(): void {

  if (!modal) {
    return;
  }


  modal.classList.add(
    "hidden"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}


/* =========================================================
   EVENTOS CIERRE
========================================================= */

document
  .querySelectorAll(
    "[data-player-close]"
  )
  .forEach(
    (element) => {

      element.addEventListener(
        "click",
        closePlayerModal
      );

    }
  );


document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Escape"
    ) {

      closePlayerModal();

    }

  }
);


/* =========================================================
   SEARCH
========================================================= */

searchInput?.addEventListener(
  "input",
  () => {

    searchTerm =
      searchInput.value;

    renderPlayers();

  }
);


/* =========================================================
   REVEAL
========================================================= */

function initStatsReveal(): void {

  const elements =
    document.querySelectorAll<HTMLElement>(
      ".stats-reveal"
    );


  if (!elements.length) {
    return;
  }


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    elements.forEach(
      (element) =>
        element.classList.add(
          "is-visible"
        )
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
        threshold:
          0.08
      }
    );


  elements.forEach(
    (element) =>
      observer.observe(
        element
      )
  );

}


/* =========================================================
   NUMBER
========================================================= */

function numberOrUndefined(
  value: unknown
): number | undefined {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {

    return undefined;

  }


  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : undefined;

}


/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

function normalizeText(
  value: string
): string {

  return String(
    value
  )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  value: string
): string {

  return String(
    value
  )
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

function escapeAttribute(
  value: string
): string {

  return escapeHtml(
    value
  );

}


/* =========================================================
   START
========================================================= */

init();