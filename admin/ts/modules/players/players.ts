import {

    createPlayer,

    editPlayer,

    getPlayers,

    removePlayer,

    togglePublished,

    getPlayerCategories,

    getStatsSettings,

    setWeeklyMvp

} from "./players.service";


import {
    uploadImage
} from "../../cloudinary";


/* ==========================================
   CATEGORÍAS DE RESPALDO
========================================== */

const FALLBACK_CATEGORIES = [

    "U-6",

    "U-8",

    "U-12",

    "U-14",

    "Libre Mixto",

    "Master Mixto"

];


/* ==========================================
   ELEMENTOS
========================================== */

const modal =
    document.querySelector(
        "#player-modal"
    ) as HTMLDivElement;


const modalTitle =
    document.querySelector(
        "#player-modal-title"
    ) as HTMLHeadingElement;


const form =
    document.querySelector(
        "#player-form"
    ) as HTMLFormElement;


const playersTable =
    document.querySelector(
        "#players-table"
    ) as HTMLTableSectionElement;


const searchInput =
    document.querySelector(
        "#search-player"
    ) as HTMLInputElement;


const categoryFilter =
    document.querySelector(
        "#filter-category"
    ) as HTMLSelectElement;


const newButton =
    document.querySelector(
        "#new-player-btn"
    ) as HTMLButtonElement;


const cancelButton =
    document.querySelector(
        "#cancel-player"
    ) as HTMLButtonElement;


const nameInput =
    document.querySelector(
        "#player-name"
    ) as HTMLInputElement;


const numberInput =
    document.querySelector(
        "#player-number"
    ) as HTMLInputElement;


const categoryInput =
    document.querySelector(
        "#player-category"
    ) as HTMLSelectElement;


const positionInput =
    document.querySelector(
        "#player-position"
    ) as HTMLInputElement;


const photoInput =
    document.querySelector(
        "#player-photo"
    ) as HTMLInputElement;


const photoPreview =
    document.querySelector(
        "#player-photo-preview"
    ) as HTMLDivElement;


const photoPreviewImg =
    document.querySelector(
        "#player-photo-preview-img"
    ) as HTMLImageElement;


const bioInput =
    document.querySelector(
        "#player-bio"
    ) as HTMLTextAreaElement;


const seasonsInput =
    document.querySelector(
        "#player-seasons"
    ) as HTMLInputElement;


const achievementInput =
    document.querySelector(
        "#player-achievement"
    ) as HTMLInputElement;


const instagramInput =
    document.querySelector(
        "#player-instagram"
    ) as HTMLInputElement;


const tiktokInput =
    document.querySelector(
        "#player-tiktok"
    ) as HTMLInputElement;


const highlightsInput =
    document.querySelector(
        "#player-highlights"
    ) as HTMLInputElement;


const touchdownsInput =
    document.querySelector(
        "#player-touchdowns"
    ) as HTMLInputElement;


const interceptionsInput =
    document.querySelector(
        "#player-interceptions"
    ) as HTMLInputElement;


const gamesPlayedInput =
    document.querySelector(
        "#player-games"
    ) as HTMLInputElement;


const publishedInput =
    document.querySelector(
        "#player-published"
    ) as HTMLInputElement;


const weeklyMvpInput =
    document.querySelector(
        "#weekly-mvp"
    ) as HTMLSelectElement;


const saveMvpButton =
    document.querySelector(
        "#save-mvp-btn"
    ) as HTMLButtonElement;


const saveButton =
    form.querySelector(
        "button[type='submit']"
    ) as HTMLButtonElement;


/* ==========================================
   ESTADO
========================================== */

let editingId:
    string | null =
    null;


let currentPhotoUrl =
    "";


/* ==========================================
   PREVIEW
========================================== */

function clearPhotoPreview(): void {

    photoInput.value =
        "";


    photoPreviewImg.src =
        "";


    photoPreview.classList.add(
        "hidden"
    );

}


/* ==========================================
   MOSTRAR FOTO
========================================== */

function showPhotoPreview(
    url: string
): void {

    if (!url) {

        clearPhotoPreview();

        return;

    }


    photoPreviewImg.src =
        url;


    photoPreview.classList.remove(
        "hidden"
    );

}


/* ==========================================
   SELECCIONAR FOTO
========================================== */

photoInput.addEventListener(
    "change",
    () => {

        const file =
            photoInput.files?.[0];


        if (!file) {

            if (currentPhotoUrl) {

                showPhotoPreview(
                    currentPhotoUrl
                );

            } else {

                clearPhotoPreview();

            }

            return;

        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Selecciona una imagen válida."
            );


            photoInput.value =
                "";


            return;

        }


        const previewUrl =
            URL.createObjectURL(
                file
            );


        photoPreviewImg.src =
            previewUrl;


        photoPreview.classList.remove(
            "hidden"
        );

    }
);


/* ==========================================
   CARGAR CATEGORÍAS
========================================== */

async function loadCategories(): Promise<void> {

    let categories:
        string[] =
        [];


    try {

        const snapshot =
            await getPlayerCategories();


        snapshot.forEach(
            (item) => {

                const data =
                    item.data();


                if (
                    data.published === true &&
                    data.name
                ) {

                    categories.push(
                        String(
                            data.name
                        )
                    );

                }

            }
        );


    } catch (error) {

        console.warn(
            "No se pudieron cargar las categorías de Firestore. Se usarán categorías de respaldo.",
            error
        );

    }


    /*
     * Mientras la colección categories
     * todavía no exista o esté vacía,
     * conservamos las categorías actuales.
     */

    if (!categories.length) {

        categories =
            [...FALLBACK_CATEGORIES];

    }


    renderCategoryOptions(
        categories
    );

}


/* ==========================================
   RENDER CATEGORÍAS
========================================== */

function renderCategoryOptions(
    categories: string[]
): void {

    const currentFilter =
        categoryFilter.value;


    const currentFormCategory =
        categoryInput.value;


    categoryFilter.innerHTML = `

        <option value="">
            Todas las categorías
        </option>

    `;


    categoryInput.innerHTML = `

        <option value="">
            Seleccionar categoría
        </option>

    `;


    categories.forEach(
        (category) => {

            const safeCategory =
                escapeHtml(
                    category
                );


            categoryFilter.insertAdjacentHTML(

                "beforeend",

                `
                    <option value="${safeCategory}">
                        ${safeCategory}
                    </option>
                `

            );


            categoryInput.insertAdjacentHTML(

                "beforeend",

                `
                    <option value="${safeCategory}">
                        ${safeCategory}
                    </option>
                `

            );

        }
    );


    if (
        currentFilter &&
        categories.includes(
            currentFilter
        )
    ) {

        categoryFilter.value =
            currentFilter;

    }


    /*
     * Importante para editar jugadores
     * cuya categoría posteriormente
     * haya sido ocultada.
     */

    if (
        currentFormCategory &&
        !categories.includes(
            currentFormCategory
        )
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            currentFormCategory;


        option.textContent =
            `${currentFormCategory} (actual)`;


        categoryInput.appendChild(
            option
        );

    }


    if (currentFormCategory) {

        categoryInput.value =
            currentFormCategory;

    }

}


/* ==========================================
   NUEVO JUGADOR
========================================== */

newButton.addEventListener(
    "click",
    () => {

        editingId =
            null;


        currentPhotoUrl =
            "";


        form.reset();


        clearPhotoPreview();


        modalTitle.textContent =
            "Nuevo jugador";


        saveButton.textContent =
            "Guardar jugador";


        saveButton.disabled =
            false;


        modal.classList.remove(
            "hidden"
        );

    }
);


/* ==========================================
   CANCELAR
========================================== */

cancelButton.addEventListener(
    "click",
    () => {

        closePlayerModal();

    }
);


/* ==========================================
   CERRAR MODAL
========================================== */

function closePlayerModal(): void {

    editingId =
        null;


    currentPhotoUrl =
        "";


    form.reset();


    clearPhotoPreview();


    modalTitle.textContent =
        "Nuevo jugador";


    saveButton.textContent =
        "Guardar jugador";


    saveButton.disabled =
        false;


    modal.classList.add(
        "hidden"
    );

}


/* ==========================================
   GUARDAR / EDITAR
========================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (
            !categoryInput.value
        ) {

            alert(
                "Selecciona una categoría."
            );

            return;

        }


        try {

            saveButton.disabled =
                true;


            saveButton.textContent =
                editingId
                    ? "Actualizando..."
                    : "Guardando...";


            /* ==================================
               FOTO
            ================================== */

            let photoUrl =
                currentPhotoUrl;


            const selectedFile =
                photoInput.files?.[0];


            if (selectedFile) {

                saveButton.textContent =
                    "Subiendo fotografía...";


                photoUrl =
                    await uploadImage(
                        selectedFile
                    );

            }


            /* ==================================
               DATOS
            ================================== */

            const playerData = {

                name:
                    nameInput.value.trim(),


                number:
                    Number(
                        numberInput.value
                    ),


                category:
                    categoryInput.value,


                position:
                    positionInput.value.trim(),


                photo:
                    photoUrl,


                bio:
                    bioInput.value.trim(),


                seasons:
                    Number(
                        seasonsInput.value
                    ) || 0,


                achievement:
                    achievementInput.value.trim(),


                instagram:
                    instagramInput.value.trim(),


                tiktok:
                    tiktokInput.value.trim(),


                highlights:
                    highlightsInput.value.trim(),


                touchdowns:
                    Number(
                        touchdownsInput.value
                    ) || 0,


                interceptions:
                    Number(
                        interceptionsInput.value
                    ) || 0,


                gamesPlayed:
                    Number(
                        gamesPlayedInput.value
                    ) || 0,


                published:
                    publishedInput.checked

            };


            /* ==================================
               EDITAR
            ================================== */

            if (editingId) {

                await editPlayer(

                    editingId,

                    playerData

                );


                alert(
                    "Jugador actualizado correctamente."
                );


            } else {

                /* ==================================
                   CREAR
                ================================== */

                await createPlayer(
                    playerData
                );


                alert(
                    "Jugador agregado correctamente."
                );

            }


            closePlayerModal();


            await loadPlayers();


        } catch (error: any) {

            console.error(
                "Error en jugadores:",
                error
            );


            alert(
                `Error: ${
                    error?.message ||
                    "No se pudo guardar el jugador."
                }`
            );


            saveButton.disabled =
                false;


            saveButton.textContent =
                editingId
                    ? "Actualizar jugador"
                    : "Guardar jugador";

        }

    }
);


/* ==========================================
   ELIMINAR
========================================== */

async function deletePlayer(
    id: string
): Promise<void> {

    const confirmed =
        confirm(
            "¿Seguro que deseas eliminar este jugador?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await removePlayer(
            id
        );


        await loadPlayers();


        alert(
            "Jugador eliminado correctamente."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "No se pudo eliminar el jugador."
        );

    }

}


/* ==========================================
   CARGAR JUGADORES
========================================== */

async function loadPlayers(): Promise<void> {

    playersTable.innerHTML =
        "";


    weeklyMvpInput.innerHTML = `

        <option value="">
            Sin MVP seleccionado
        </option>

    `;


    try {

        const snapshot =
            await getPlayers();


        const search =
            normalizeText(
                searchInput.value
            );


        const category =
            categoryFilter.value;


        snapshot.forEach(
            (item) => {

                const player =
                    item.data();


                const searchText =
                    normalizeText(`

                        ${player.name || ""}

                        ${player.category || ""}

                        ${player.position || ""}

                        ${player.number ?? ""}

                    `);


                /* ==============================
                   MVP SELECT
                ============================== */

                if (
                    player.published === true
                ) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        item.id;


                    option.textContent =
                        `#${player.number ?? ""} — ${player.name || "Jugador"} · ${player.category || ""}`;


                    weeklyMvpInput.appendChild(
                        option
                    );

                }


                /* ==============================
                   BUSCADOR
                ============================== */

                if (
                    search &&
                    !searchText.includes(
                        search
                    )
                ) {

                    return;

                }


                /* ==============================
                   FILTRO
                ============================== */

                if (
                    category &&
                    player.category !== category
                ) {

                    return;

                }


                /* ==============================
                   FILA
                ============================== */

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:10px;
                            "
                        >

                            ${
                                player.photo

                                    ? `

                                        <img

                                            src="${escapeHtml(
                                                String(
                                                    player.photo
                                                )
                                            )}"

                                            alt="${escapeHtml(
                                                String(
                                                    player.name ||
                                                    "Jugador"
                                                )
                                            )}"

                                            style="
                                                width:50px;
                                                height:50px;
                                                object-fit:cover;
                                                border-radius:50%;
                                            "

                                        >

                                    `

                                    : `

                                        <div
                                            style="
                                                width:50px;
                                                height:50px;
                                                border-radius:50%;
                                                background:#16301f;
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                color:#fff;
                                                font-weight:700;
                                            "
                                        >
                                            PC
                                        </div>

                                    `
                            }


                            <div>

                                <strong>
                                    ${escapeHtml(
                                        String(
                                            player.name ||
                                            ""
                                        )
                                    )}
                                </strong>

                                ${
                                    player.achievement

                                        ? `

                                            <div
                                                style="
                                                    margin-top:3px;
                                                    font-size:.75rem;
                                                    opacity:.65;
                                                "
                                            >
                                                ${escapeHtml(
                                                    String(
                                                        player.achievement
                                                    )
                                                )}
                                            </div>

                                        `

                                        : ""
                                }

                            </div>

                        </div>

                    </td>


                    <td>

                        #${escapeHtml(
                            String(
                                player.number ??
                                ""
                            )
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            String(
                                player.category ||
                                ""
                            )
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            String(
                                player.position ||
                                ""
                            )
                        )}

                    </td>


                    <td>

                        <input
                            type="checkbox"
                            class="publish-toggle"
                            ${
                                player.published
                                    ? "checked"
                                    : ""
                            }
                        >

                    </td>


                    <td>

                        <button
                            type="button"
                            class="btn-edit"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="btn-delete"
                        >
                            Eliminar
                        </button>

                    </td>

                `;


                /* ==============================
                   EDITAR
                ============================== */

                const editButton =
                    row.querySelector(
                        ".btn-edit"
                    ) as HTMLButtonElement;


                editButton.addEventListener(
                    "click",
                    () => {

                        editingId =
                            item.id;


                        nameInput.value =
                            player.name || "";


                        numberInput.value =
                            String(
                                player.number ??
                                0
                            );


                        /*
                         * Si se editó/ocultó una categoría
                         * después de crear al jugador,
                         * preservamos su valor.
                         */

                        if (
                            player.category &&
                            !Array.from(
                                categoryInput.options
                            ).some(
                                option =>
                                    option.value ===
                                    player.category
                            )
                        ) {

                            const option =
                                document.createElement(
                                    "option"
                                );


                            option.value =
                                player.category;


                            option.textContent =
                                `${player.category} (actual)`;


                            categoryInput.appendChild(
                                option
                            );

                        }


                        categoryInput.value =
                            player.category || "";


                        positionInput.value =
                            player.position || "";


                        bioInput.value =
                            player.bio || "";


                        seasonsInput.value =
                            String(
                                player.seasons ??
                                0
                            );


                        achievementInput.value =
                            player.achievement ||
                            "";


                        instagramInput.value =
                            player.instagram ||
                            "";


                        tiktokInput.value =
                            player.tiktok ||
                            "";


                        highlightsInput.value =
                            player.highlights ||
                            "";


                        touchdownsInput.value =
                            String(
                                player.touchdowns ??
                                0
                            );


                        interceptionsInput.value =
                            String(
                                player.interceptions ??
                                0
                            );


                        gamesPlayedInput.value =
                            String(
                                player.gamesPlayed ??
                                0
                            );


                        publishedInput.checked =
                            player.published === true;


                        currentPhotoUrl =
                            player.photo || "";


                        photoInput.value =
                            "";


                        if (currentPhotoUrl) {

                            showPhotoPreview(
                                currentPhotoUrl
                            );

                        } else {

                            clearPhotoPreview();

                        }


                        modalTitle.textContent =
                            "Editar jugador";


                        saveButton.textContent =
                            "Actualizar jugador";


                        saveButton.disabled =
                            false;


                        modal.classList.remove(
                            "hidden"
                        );

                    }
                );


                /* ==============================
                   ELIMINAR
                ============================== */

                const deleteButton =
                    row.querySelector(
                        ".btn-delete"
                    ) as HTMLButtonElement;


                deleteButton.addEventListener(
                    "click",
                    () => {

                        deletePlayer(
                            item.id
                        );

                    }
                );


                /* ==============================
                   PUBLICAR
                ============================== */

                const toggle =
                    row.querySelector(
                        ".publish-toggle"
                    ) as HTMLInputElement;


                toggle.addEventListener(
                    "change",
                    async () => {

                        try {

                            await togglePublished(

                                item.id,

                                toggle.checked

                            );


                        } catch (error) {

                            console.error(
                                error
                            );


                            alert(
                                "No se pudo cambiar el estado."
                            );


                            toggle.checked =
                                !toggle.checked;

                        }

                    }
                );


                playersTable.appendChild(
                    row
                );

            }
        );


        if (
            !playersTable.children.length
        ) {

            playersTable.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            padding:2rem;
                        "
                    >

                        No se encontraron jugadores.

                    </td>

                </tr>

            `;

        }


        await loadCurrentMvp();


    } catch (error) {

        console.error(
            "Error cargando jugadores:",
            error
        );


        playersTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:2rem;
                    "
                >

                    No se pudieron cargar
                    los jugadores.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   MVP ACTUAL
========================================== */

async function loadCurrentMvp(): Promise<void> {

    try {

        const settings =
            await getStatsSettings();


        if (
            settings.exists()
        ) {

            const data =
                settings.data();


            const playerId =
                String(
                    data.weeklyMvp ||
                    ""
                );


            if (
                playerId &&
                Array.from(
                    weeklyMvpInput.options
                ).some(
                    option =>
                        option.value ===
                        playerId
                )
            ) {

                weeklyMvpInput.value =
                    playerId;

            }

        }


    } catch (error) {

        console.warn(
            "No se pudo cargar el MVP:",
            error
        );

    }

}


/* ==========================================
   GUARDAR MVP
========================================== */

saveMvpButton.addEventListener(
    "click",
    async () => {

        const playerId =
            weeklyMvpInput.value;


        if (!playerId) {

            alert(
                "Selecciona un jugador para el MVP."
            );

            return;

        }


        try {

            saveMvpButton.disabled =
                true;


            saveMvpButton.textContent =
                "Guardando...";


            await setWeeklyMvp(
                playerId
            );


            alert(
                "MVP de la semana actualizado correctamente."
            );


        } catch (error: any) {

            console.error(
                "Error guardando MVP:",
                error
            );


            alert(
                `No se pudo guardar el MVP: ${
                    error?.message ||
                    "Error desconocido"
                }`
            );


        } finally {

            saveMvpButton.disabled =
                false;


            saveMvpButton.textContent =
                "Guardar MVP";

        }

    }
);


/* ==========================================
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    loadPlayers
);


/* ==========================================
   FILTRO
========================================== */

categoryFilter.addEventListener(
    "change",
    loadPlayers
);


/* ==========================================
   NORMALIZAR
========================================== */

function normalizeText(
    value: string
): string {

    return String(value)

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


/* ==========================================
   SEGURIDAD HTML
========================================== */

function escapeHtml(
    value: string
): string {

    return String(value)

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


/* ==========================================
   INICIAR
========================================== */

async function init(): Promise<void> {

    await loadCategories();

    await loadPlayers();

}


init();