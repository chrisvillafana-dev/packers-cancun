import "./common";
import { db } from "./../../admin/ts/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
/* =========================================================
   CONFIG
========================================================= */
const DEFAULT_PHOTO = "/assets/logo-nav.png";
/* =========================================================
   ESTADO
========================================================= */
let players = [];
let categories = [];
let activeCategory = "all";
let searchTerm = "";
let weeklyMvpId = "";
/* =========================================================
   ELEMENTOS PRINCIPALES
========================================================= */
const grid = document.querySelector("[data-stats-body]");
const count = document.querySelector("[data-stats-count]");
const searchInput = document.querySelector("#stats-search");
const filtersContainer = document.querySelector("[data-stats-filters]");
/* =========================================================
   MVP
========================================================= */
const mvpSection = document.querySelector("[data-mvp-section]");
const mvpCard = document.querySelector("[data-mvp-card]");
const mvpPhoto = document.querySelector("[data-mvp-photo]");
const mvpCategory = document.querySelector("[data-mvp-category]");
const mvpNumber = document.querySelector("[data-mvp-number]");
const mvpName = document.querySelector("[data-mvp-name]");
const mvpPosition = document.querySelector("[data-mvp-position]");
const mvpAchievement = document.querySelector("[data-mvp-achievement]");
const mvpStats = document.querySelector("[data-mvp-stats]");
const mvpOpenButton = document.querySelector("[data-mvp-open]");
/* =========================================================
   MODAL
========================================================= */
const modal = document.querySelector("[data-player-modal]");
const modalPhoto = document.querySelector("[data-player-photo]");
const modalName = document.querySelector("[data-player-name]");
const modalNumber = document.querySelector("[data-player-number]");
const modalCategory = document.querySelector("[data-player-category]");
const modalPosition = document.querySelector("[data-player-position]");
const modalBio = document.querySelector("[data-player-bio]");
const modalStats = document.querySelector("[data-player-stats]");
const modalInfoSection = document.querySelector("[data-player-info-section]");
const modalSeasonsWrap = document.querySelector("[data-player-seasons-wrap]");
const modalSeasons = document.querySelector("[data-player-seasons]");
const modalAchievementWrap = document.querySelector("[data-player-achievement-wrap]");
const modalAchievement = document.querySelector("[data-player-achievement]");
const modalSocialSection = document.querySelector("[data-player-social-section]");
const modalSocials = document.querySelector("[data-player-socials]");
/* =========================================================
   INICIAR
========================================================= */
async function init() {
    await Promise.all([
        loadPlayers(),
        loadCategories(),
        loadStatsSettings()
    ]);
    sortPlayers();
    renderCategoryFilters();
    renderPlayers();
    renderWeeklyMvp();
}
/* =========================================================
   CARGAR JUGADORES
========================================================= */
async function loadPlayers() {
    try {
        const playersQuery = query(collection(db, "players"), where("published", "==", true));
        const snapshot = await getDocs(playersQuery);
        players =
            snapshot.docs.map((documentSnapshot) => {
                const data = documentSnapshot.data();
                const storedStats = data.stats || {};
                const playerStats = {
                    touchdowns: Number(storedStats.touchdowns ??
                        data.touchdowns ??
                        0),
                    intercepciones: Number(storedStats.intercepciones ??
                        data.interceptions ??
                        0),
                    partidos: Number(storedStats.partidos ??
                        data.gamesPlayed ??
                        0),
                    recepciones: numberOrUndefined(storedStats.recepciones ??
                        data.receptions),
                    yardas: numberOrUndefined(storedStats.yardas ??
                        data.yards),
                    tackles: numberOrUndefined(storedStats.tackles ??
                        data.tackles)
                };
                return {
                    id: documentSnapshot.id,
                    name: String(data.name || ""),
                    number: String(data.number ?? ""),
                    category: String(data.category || ""),
                    position: String(data.position || ""),
                    photo: String(data.photo || ""),
                    bio: String(data.bio || ""),
                    seasons: Number(data.seasons || 0),
                    achievement: String(data.achievement || ""),
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
                    instagram: String(data.instagram ??
                        data.instagramUrl ??
                        ""),
                    tiktok: String(data.tiktok ??
                        data.tiktokUrl ??
                        ""),
                    highlights: String(data.highlights ??
                        data.highlightsUrl ??
                        data.highlightUrl ??
                        ""),
                    published: data.published === true,
                    stats: playerStats
                };
            });
    }
    catch (error) {
        console.error("Error cargando jugadores:", error);
        players = [];
    }
}
/* =========================================================
   CARGAR CATEGORÍAS
========================================================= */
async function loadCategories() {
    try {
        const snapshot = await getDocs(collection(db, "categories"));
        categories =
            snapshot.docs
                .map((documentSnapshot) => {
                const data = documentSnapshot.data();
                return {
                    id: documentSnapshot.id,
                    name: String(data.name || ""),
                    order: Number(data.order || 0),
                    published: data.published === true
                };
            })
                .filter((category) => category.published &&
                category.name)
                .sort((a, b) => a.order - b.order);
    }
    catch (error) {
        console.warn("No se pudieron cargar las categorías:", error);
        categories = [];
    }
}
/* =========================================================
   SETTINGS / MVP
========================================================= */
async function loadStatsSettings() {
    try {
        const settingsRef = doc(db, "settings", "stats");
        const snapshot = await getDoc(settingsRef);
        if (snapshot.exists()) {
            weeklyMvpId =
                String(snapshot.data().weeklyMvp ||
                    "");
        }
    }
    catch (error) {
        console.warn("No se pudo cargar el MVP:", error);
    }
}
/* =========================================================
   ORDEN
========================================================= */
function sortPlayers() {
    players.sort((a, b) => {
        const categoryA = getCategoryOrder(a.category);
        const categoryB = getCategoryOrder(b.category);
        if (categoryA !==
            categoryB) {
            return (categoryA -
                categoryB);
        }
        const numberA = Number(a.number);
        const numberB = Number(b.number);
        if (Number.isFinite(numberA) &&
            Number.isFinite(numberB) &&
            numberA !==
                numberB) {
            return (numberA -
                numberB);
        }
        return (a.name.localeCompare(b.name, "es", {
            sensitivity: "base"
        }));
    });
}
function getCategoryOrder(name) {
    const category = categories.find((item) => item.name === name);
    return (category?.order ??
        999);
}
/* =========================================================
   FILTROS
========================================================= */
function renderCategoryFilters() {
    if (!filtersContainer) {
        return;
    }
    let visibleCategories = categories;
    if (!visibleCategories.length) {
        const playerCategories = Array.from(new Set(players
            .map((player) => player.category)
            .filter(Boolean)));
        visibleCategories =
            playerCategories.map((name, index) => ({
                id: name,
                name,
                order: index,
                published: true
            }));
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
    visibleCategories.forEach((category) => {
        const button = document.createElement("button");
        button.type =
            "button";
        button.className =
            "stats-filter";
        button.dataset.category =
            category.name;
        button.textContent =
            category.name;
        button.addEventListener("click", handleCategoryClick);
        filtersContainer.appendChild(button);
    });
    const allButton = filtersContainer.querySelector('[data-category="all"]');
    allButton?.addEventListener("click", handleCategoryClick);
}
/* =========================================================
   CLICK CATEGORÍA
========================================================= */
function handleCategoryClick(event) {
    const button = event.currentTarget;
    filtersContainer
        ?.querySelectorAll(".stats-filter")
        .forEach((element) => element.classList.remove("active"));
    button.classList.add("active");
    activeCategory =
        button.dataset.category ||
            "all";
    renderPlayers();
}
/* =========================================================
   FILTRAR
========================================================= */
function getFilteredPlayers() {
    const normalizedSearch = normalizeText(searchTerm);
    return players.filter((player) => {
        const matchesCategory = activeCategory ===
            "all" ||
            player.category ===
                activeCategory;
        if (!matchesCategory) {
            return false;
        }
        if (!normalizedSearch) {
            return true;
        }
        const searchableText = normalizeText(`

          ${player.name}

          ${player.number}

          ${player.category}

          ${player.position}

        `);
        return searchableText.includes(normalizedSearch);
    });
}
/* =========================================================
   RENDER JUGADORES
========================================================= */
function renderPlayers() {
    if (!grid) {
        return;
    }
    const filtered = getFilteredPlayers();
    if (count) {
        count.textContent =
            String(filtered.length);
    }
    if (!filtered.length) {
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
            .map(createPlayerCard)
            .join("");
    bindPlayerCards();
    initStatsReveal();
}
/* =========================================================
   TARJETA
========================================================= */
function createPlayerCard(player) {
    const photo = player.photo ||
        DEFAULT_PHOTO;
    const hasAchievement = Boolean(player.achievement);
    return `

    <article
      class="player-card stats-reveal"
      data-player-id="${escapeAttribute(player.id)}"
      tabindex="0"
      role="button"
      aria-label="Ver perfil de ${escapeAttribute(player.name)}"
    >


      <div class="player-card-media">


        <img
          src="${escapeAttribute(photo)}"
          alt="${escapeAttribute(player.name)}"
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

            ${escapeHtml(player.category)}

          </span>


          <span class="player-card-number">

            #${escapeHtml(player.number ||
        "00")}

          </span>


        </div>


        <div class="player-card-identity">


          <span class="player-card-team">
            PACKERS CANCÚN
          </span>


          <h3>

            ${escapeHtml(player.name)}

          </h3>


          <p>

            ${escapeHtml(player.position ||
        "Jugador")}

          </p>


        </div>


      </div>


      <div class="player-card-content">


        <div class="player-card-accent-line"></div>


        ${hasAchievement
        ? `

              <div class="player-card-achievement">

                <span>
                  DESTACADO
                </span>

                <strong>
                  ${escapeHtml(player.achievement)}
                </strong>

              </div>

            `
        : ""}


        <div class="player-card-stats">


          ${createCardStat(player.stats.touchdowns, "TD", "Touchdowns")}


          ${createCardStat(player.stats.intercepciones, "INT", "Intercepciones")}


          ${createCardStat(player.stats.partidos, "PJ", "Partidos")}


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
function createCardStat(value, label, title) {
    return `

    <div
      class="player-card-stat"
      title="${escapeAttribute(title)}"
    >

      <strong>
        ${value}
      </strong>

      <span>
        ${escapeHtml(label)}
      </span>

    </div>

  `;
}
/* =========================================================
   EVENTOS TARJETAS
========================================================= */
function bindPlayerCards() {
    if (!grid) {
        return;
    }
    grid
        .querySelectorAll("[data-player-id]")
        .forEach((card) => {
        const open = () => {
            const id = card.dataset.playerId;
            if (!id) {
                return;
            }
            const player = players.find((item) => item.id === id);
            if (!player) {
                return;
            }
            openPlayerModal(player);
        };
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
            if (event.key ===
                "Enter" ||
                event.key ===
                    " ") {
                event.preventDefault();
                open();
            }
        });
        const image = card.querySelector(".player-card-image");
        image?.addEventListener("error", () => {
            image.src =
                DEFAULT_PHOTO;
        }, {
            once: true
        });
    });
}
/* =========================================================
   MVP
========================================================= */
function renderWeeklyMvp() {
    if (!mvpSection ||
        !weeklyMvpId) {
        mvpSection?.classList.add("hidden");
        return;
    }
    const player = players.find((item) => item.id ===
        weeklyMvpId);
    if (!player) {
        mvpSection.classList.add("hidden");
        return;
    }
    mvpSection.classList.remove("hidden");
    if (mvpPhoto) {
        mvpPhoto.src =
            player.photo ||
                DEFAULT_PHOTO;
        mvpPhoto.alt =
            player.name;
        mvpPhoto.onerror =
            () => {
                mvpPhoto.src =
                    DEFAULT_PHOTO;
                mvpPhoto.onerror =
                    null;
            };
    }
    if (mvpCategory) {
        mvpCategory.textContent =
            player.category;
    }
    if (mvpNumber) {
        mvpNumber.textContent =
            `#${player.number || "00"}`;
    }
    if (mvpName) {
        mvpName.textContent =
            player.name;
    }
    if (mvpPosition) {
        mvpPosition.textContent =
            player.position ||
                "Jugador";
    }
    if (mvpAchievement &&
        player.achievement) {
        mvpAchievement.textContent =
            player.achievement;
        mvpAchievement.classList.remove("hidden");
    }
    else {
        mvpAchievement?.classList.add("hidden");
    }
    if (mvpStats) {
        mvpStats.innerHTML = `

      ${createMvpStat(player.stats.touchdowns, "TD")}

      ${createMvpStat(player.stats.intercepciones, "INT")}

      ${createMvpStat(player.stats.partidos, "PJ")}

    `;
    }
    if (mvpCard) {
        mvpCard.dataset.playerId =
            player.id;
    }
    if (mvpOpenButton) {
        mvpOpenButton.onclick =
            () => {
                openPlayerModal(player);
            };
    }
}
/* =========================================================
   MVP STAT
========================================================= */
function createMvpStat(value, label) {
    return `

    <div>

      <strong>
        ${value}
      </strong>

      <span>
        ${escapeHtml(label)}
      </span>

    </div>

  `;
}
/* =========================================================
   ABRIR MODAL
========================================================= */
function openPlayerModal(player) {
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
    renderModalStats(player.stats);
    renderPlayerInfo(player);
    renderPlayerSocials(player);
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow =
        "hidden";
    const closeButton = modal.querySelector(".player-modal-close");
    window.setTimeout(() => closeButton?.focus(), 30);
}
/* =========================================================
   PLAYER INFO
========================================================= */
function renderPlayerInfo(player) {
    const hasSeasons = player.seasons > 0;
    const hasAchievement = Boolean(player.achievement);
    if (!hasSeasons &&
        !hasAchievement) {
        modalInfoSection?.classList.add("hidden");
        return;
    }
    modalInfoSection?.classList.remove("hidden");
    if (hasSeasons &&
        modalSeasons &&
        modalSeasonsWrap) {
        modalSeasons.textContent =
            String(player.seasons);
        modalSeasonsWrap.classList.remove("hidden");
    }
    else {
        modalSeasonsWrap?.classList.add("hidden");
    }
    if (hasAchievement &&
        modalAchievement &&
        modalAchievementWrap) {
        modalAchievement.textContent =
            player.achievement;
        modalAchievementWrap.classList.remove("hidden");
    }
    else {
        modalAchievementWrap?.classList.add("hidden");
    }
}
/* =========================================================
   REDES SOCIALES
========================================================= */
function renderPlayerSocials(player) {
    if (!modalSocials ||
        !modalSocialSection) {
        return;
    }
    const links = [];
    const instagram = normalizeExternalUrl(player.instagram);
    const tiktok = normalizeExternalUrl(player.tiktok);
    const highlights = normalizeExternalUrl(player.highlights);
    if (instagram) {
        links.push({
            label: "Instagram",
            url: instagram,
            className: "instagram"
        });
    }
    if (tiktok) {
        links.push({
            label: "TikTok",
            url: tiktok,
            className: "tiktok"
        });
    }
    if (highlights) {
        links.push({
            label: "Highlights",
            url: highlights,
            className: "highlights"
        });
    }
    if (!links.length) {
        modalSocialSection.classList.add("hidden");
        modalSocials.innerHTML =
            "";
        return;
    }
    modalSocialSection.classList.remove("hidden");
    modalSocials.innerHTML =
        links
            .map((link) => `

          <a
            href="${escapeAttribute(link.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="
              player-social-link
              player-social-${escapeAttribute(link.className)}
            "
          >

            <span class="player-social-icon">

              ${getSocialInitial(link.label)}

            </span>


            <span class="player-social-copy">

              <small>
                VISITAR
              </small>

              <strong>
                ${escapeHtml(link.label)}
              </strong>

            </span>


            <span
              class="player-social-arrow"
              aria-hidden="true"
            >
              ↗
            </span>

          </a>

        `)
            .join("");
}
/* =========================================================
   ICONO SIMPLE RED SOCIAL
========================================================= */
function getSocialInitial(label) {
    if (label ===
        "Instagram") {
        return "IG";
    }
    if (label ===
        "TikTok") {
        return "TT";
    }
    return "▶";
}
/* =========================================================
   NORMALIZAR URL
========================================================= */
function normalizeExternalUrl(value) {
    let trimmed = String(value || "").trim();
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
    if (!/^https?:\/\//i.test(trimmed)) {
        trimmed =
            `https://${trimmed}`;
    }
    try {
        const url = new URL(trimmed);
        if (url.protocol !==
            "https:" &&
            url.protocol !==
                "http:") {
            return "";
        }
        return url.toString();
    }
    catch {
        return "";
    }
}
/* =========================================================
   MODAL STATS
========================================================= */
function renderModalStats(stats) {
    if (!modalStats) {
        return;
    }
    const availableStats = [
        {
            label: "Touchdowns",
            abbreviation: "TD",
            value: stats.touchdowns
        },
        {
            label: "Intercepciones",
            abbreviation: "INT",
            value: stats.intercepciones
        },
        {
            label: "Partidos",
            abbreviation: "PJ",
            value: stats.partidos
        },
        {
            label: "Recepciones",
            abbreviation: "REC",
            value: stats.recepciones
        },
        {
            label: "Yardas",
            abbreviation: "YDS",
            value: stats.yardas
        },
        {
            label: "Tackles",
            abbreviation: "TKL",
            value: stats.tackles
        }
    ].filter((stat) => typeof stat.value ===
        "number" &&
        Number.isFinite(stat.value));
    modalStats.innerHTML =
        availableStats
            .map((stat) => `

          <div class="player-stat">

            <span class="player-stat-label">

              ${escapeHtml(stat.abbreviation)}

            </span>

            <strong>
              ${stat.value}
            </strong>

            <small>

              ${escapeHtml(stat.label)}

            </small>

          </div>

        `)
            .join("");
}
/* =========================================================
   CERRAR MODAL
========================================================= */
function closePlayerModal() {
    if (!modal) {
        return;
    }
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow =
        "";
}
/* =========================================================
   EVENTOS CIERRE
========================================================= */
document
    .querySelectorAll("[data-player-close]")
    .forEach((element) => {
    element.addEventListener("click", closePlayerModal);
});
document.addEventListener("keydown", (event) => {
    if (event.key ===
        "Escape") {
        closePlayerModal();
    }
});
/* =========================================================
   SEARCH
========================================================= */
searchInput?.addEventListener("input", () => {
    searchTerm =
        searchInput.value;
    renderPlayers();
});
/* =========================================================
   REVEAL
========================================================= */
function initStatsReveal() {
    const elements = document.querySelectorAll(".stats-reveal");
    if (!elements.length) {
        return;
    }
    if (!("IntersectionObserver"
        in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08
    });
    elements.forEach((element) => observer.observe(element));
}
/* =========================================================
   NUMBER
========================================================= */
function numberOrUndefined(value) {
    if (value === undefined ||
        value === null ||
        value === "") {
        return undefined;
    }
    const number = Number(value);
    return Number.isFinite(number)
        ? number
        : undefined;
}
/* =========================================================
   NORMALIZAR TEXTO
========================================================= */
function normalizeText(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
/* =========================================================
   ESCAPE HTML
========================================================= */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */
function escapeAttribute(value) {
    return escapeHtml(value);
}
/* =========================================================
   START
========================================================= */
init();
