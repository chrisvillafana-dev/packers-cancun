import "./common";

import {
    getMatches
} from "./matches.service";

import type {
    PublicMatch
} from "./matches.service";


function formatDate(
    dateValue: any
): string {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    return date.toLocaleDateString(
        "es-MX",
        {
            weekday: "long",
            day: "2-digit",
            month: "long"
        }
    );

}


function renderUpcoming(
    games: PublicMatch[]
): void {

    const wrap =
        document.querySelector<HTMLElement>(
            "[data-upcoming-games]"
        );


    if (!wrap) {
        return;
    }


    if (!games.length) {

        wrap.innerHTML = `
            <p class="news-empty">
                Aún no hay partidos programados.
            </p>
        `;

        return;

    }


    wrap.innerHTML = games
        .map(

            (game) => `

                <article class="card reveal">

                    <span class="badge">
                        ${game.category}
                    </span>


                    <h3
                        class="section-title"
                        style="font-size:1.4rem;margin-top:0.8rem;"
                    >
                        Packers Cancún vs ${game.rival}
                    </h3>


                    <p
                        class="news-excerpt"
                        style="margin-top:0.5rem;"
                    >

                        ${formatDate(game.date)}
                        ·
                        ${game.time} hrs

                        <br />

                        ${game.location}

                    </p>

                </article>

            `

        )
        .join("");


    initReveal(wrap);

}


function renderResults(
    games: PublicMatch[]
): void {

    const wrap =
        document.querySelector<HTMLElement>(
            "[data-results-games]"
        );


    if (!wrap) {
        return;
    }


    if (!games.length) {

        wrap.innerHTML = `
            <p class="news-empty">
                Aún no hay resultados capturados.
            </p>
        `;

        return;

    }


    wrap.innerHTML = games
        .map(

            (game) => {

                const badgeClass =
                    game.outcome === "victoria"
                        ? "badge"
                        : "badge badge-outline";


                return `

                    <article class="card reveal">

                        <span class="${badgeClass}">
                            ${game.outcome ?? "Resultado"}
                        </span>


                        <h3
                            class="section-title"
                            style="font-size:1.4rem;margin-top:0.8rem;"
                        >
                            vs ${game.rival}
                        </h3>


                        <p
                            class="news-excerpt"
                            style="margin-top:0.5rem;"
                        >

                            ${formatDate(game.date)}
                            ·
                            ${game.category}

                            <br />

                            <strong
                                style="color:var(--gold-300)"
                            >
                                ${game.result ?? ""}
                            </strong>

                        </p>

                    </article>

                `;

            }

        )
        .join("");


    initReveal(wrap);

}


function initReveal(
    container: HTMLElement
): void {

    const elements =
        container.querySelectorAll(
            ".reveal"
        );


    if (
        !elements.length
    ) {
        return;
    }


    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =
            new IntersectionObserver(

                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target
                                    .classList
                                    .add(
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

    } else {

        elements.forEach(
            (element) => {

                element.classList.add(
                    "is-visible"
                );

            }
        );

    }

}


async function loadGames(): Promise<void> {

    const upcoming =
        document.querySelector<HTMLElement>(
            "[data-upcoming-games]"
        );


    const results =
        document.querySelector<HTMLElement>(
            "[data-results-games]"
        );


    try {

        const games =
            await getMatches();


        const now =
            new Date();


        /*
         * Los partidos cuya fecha ya pasó
         * se consideran resultados.
         *
         * Los partidos de hoy o futuros
         * aparecen como próximos.
         */

        const upcomingGames =
            games.filter(
                (game) => {

                    const gameDate =
                        new Date(
                            `${game.date}T23:59:59`
                        );

                    return gameDate >= now;

                }
            );


        const resultGames =
            games.filter(
                (game) => {

                    const gameDate =
                        new Date(
                            `${game.date}T23:59:59`
                        );

                    return gameDate < now;

                }
            );


        renderUpcoming(
            upcomingGames
        );


        renderResults(
            resultGames
        );


    } catch (error) {

        console.error(
            "Error cargando partidos:",
            error
        );


        if (upcoming) {

            upcoming.innerHTML = `
                <p class="news-empty">
                    No se pudieron cargar los próximos partidos.
                </p>
            `;

        }


        if (results) {

            results.innerHTML = `
                <p class="news-empty">
                    No se pudieron cargar los resultados.
                </p>
            `;

        }

    }

}


document.addEventListener(
    "DOMContentLoaded",
    loadGames
);