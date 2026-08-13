import {
    createReel,
    editReel,
    getReels,
    removeReel,
    togglePublished
} from "./reels.service";


/* ==========================================
   ELEMENTOS
========================================== */

const modal =
    document.querySelector("#reel-modal") as HTMLDivElement;

const form =
    document.querySelector("#reel-form") as HTMLFormElement;

const reelsTable =
    document.querySelector("#reels-table") as HTMLTableSectionElement;

const searchInput =
    document.querySelector("#search-reel") as HTMLInputElement;

const newButton =
    document.querySelector("#new-reel-btn") as HTMLButtonElement;

const cancelButton =
    document.querySelector("#cancel-reel") as HTMLButtonElement;

const title =
    document.querySelector("#title") as HTMLInputElement;

const description =
    document.querySelector("#description") as HTMLTextAreaElement;

const platform =
    document.querySelector("#platform") as HTMLSelectElement;

const url =
    document.querySelector("#url") as HTMLInputElement;

const published =
    document.querySelector("#published") as HTMLInputElement;

const saveButton =
    form.querySelector(
        "button[type='submit']"
    ) as HTMLButtonElement;


let editingId: string | null = null;


/* ==========================================
   NUEVO REEL
========================================== */

newButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    saveButton.textContent =
        "Guardar Reel";

    modal.classList.remove("hidden");

});


/* ==========================================
   CANCELAR
========================================== */

cancelButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    saveButton.textContent =
        "Guardar Reel";

    modal.classList.add("hidden");

});


/* ==========================================
   GUARDAR / EDITAR
========================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        try {

            const reelData = {

                title: title.value,

                description: description.value,

                platform: platform.value,

                url: url.value,

                published: published.checked

            };


            if (editingId) {

                await editReel(
                    editingId,
                    reelData
                );

                alert(
                    "Reel actualizado correctamente."
                );

            } else {

                await createReel(
                    reelData
                );

                alert(
                    "Reel creado correctamente."
                );

            }


            editingId = null;

            form.reset();

            modal.classList.add("hidden");

            saveButton.textContent =
                "Guardar Reel";

            await loadReels();

        } catch (error) {

            console.error(error);

            alert(
                "Ocurrió un error al guardar el Reel."
            );

        }

    }
);


/* ==========================================
   ELIMINAR
========================================== */

async function deleteReel(id: string) {

    const confirmed = confirm(
        "¿Seguro que deseas eliminar este Reel?"
    );

    if (!confirmed) return;


    try {

        await removeReel(id);

        await loadReels();

        alert(
            "Reel eliminado correctamente."
        );

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el Reel."
        );

    }

}


/* ==========================================
   CARGAR REELS
========================================== */

async function loadReels(
    search = ""
) {

    reelsTable.innerHTML = "";


    try {

        const snapshot =
            await getReels();


        snapshot.forEach((item) => {

            const reel = item.data();


            const searchText = `
                ${reel.title}
                ${reel.platform}
                ${reel.description}
            `.toLowerCase();


            if (
                !searchText.includes(
                    search.toLowerCase()
                )
            ) {

                return;

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${reel.title}
                </td>

                <td>
                    ${reel.platform}
                </td>

                <td>

                    <a
                        href="${reel.url}"
                        target="_blank"
                        rel="noopener noreferrer">

                        Ver Reel

                    </a>

                </td>

                <td>

                    <input
                        type="checkbox"
                        class="publish-toggle"
                        ${reel.published ? "checked" : ""}>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        type="button">

                        ✏️

                    </button>

                    <button
                        class="btn-delete"
                        type="button">

                        🗑️

                    </button>

                </td>

            `;


            /* ==========================================
               EDITAR
            =========================================== */

            const editButton =
                row.querySelector(
                    ".btn-edit"
                ) as HTMLButtonElement;


            editButton.addEventListener(
                "click",
                () => {

                    editingId = item.id;

                    title.value =
                        reel.title;

                    description.value =
                        reel.description;

                    platform.value =
                        reel.platform;

                    url.value =
                        reel.url;

                    published.checked =
                        reel.published;

                    saveButton.textContent =
                        "Actualizar Reel";

                    modal.classList.remove(
                        "hidden"
                    );

                }
            );


            /* ==========================================
               ELIMINAR
            =========================================== */

            const deleteButton =
                row.querySelector(
                    ".btn-delete"
                ) as HTMLButtonElement;


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteReel(item.id);

                }
            );


            /* ==========================================
               PUBLICAR / OCULTAR
            =========================================== */

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

                        console.error(error);

                        alert(
                            "No se pudo cambiar el estado."
                        );

                        toggle.checked =
                            !toggle.checked;

                    }

                }
            );


            reelsTable.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(
            "No se pudieron cargar los Reels."
        );

    }

}


/* ==========================================
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    () => {

        loadReels(
            searchInput.value
        );

    }
);


/* ==========================================
   INICIAR
========================================== */

loadReels();