import "../../common";
import {
    createMatch,
    editMatch,
    getMatches,
    removeMatch,
    togglePublished
} from "./matches.service";

const modal =
    document.querySelector("#match-modal") as HTMLDivElement;

const form =
    document.querySelector("#match-form") as HTMLFormElement;

const matchesTable =
    document.querySelector("#matches-table") as HTMLTableSectionElement;

const searchInput =
    document.querySelector("#search-match") as HTMLInputElement;

const newButton =
    document.querySelector("#new-match-btn") as HTMLButtonElement;

const cancelButton =
    document.querySelector("#cancel-match") as HTMLButtonElement;

const rival =
    document.querySelector("#rival") as HTMLInputElement;

const date =
    document.querySelector("#date") as HTMLInputElement;

const time =
    document.querySelector("#time") as HTMLInputElement;

const location =
    document.querySelector("#location") as HTMLInputElement;

const category =
    document.querySelector("#category") as HTMLSelectElement;

const result =
    document.querySelector("#result") as HTMLInputElement;

const published =
    document.querySelector("#published") as HTMLInputElement;

const saveButton =
    form.querySelector(
        "button[type='submit']"
    ) as HTMLButtonElement;

let editingId: string | null = null;


/* ==========================================
   ABRIR NUEVO PARTIDO
========================================== */

newButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    saveButton.textContent = "Guardar Partido";

    modal.classList.remove("hidden");

});


/* ==========================================
   CANCELAR
========================================== */

cancelButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    saveButton.textContent = "Guardar Partido";

    modal.classList.add("hidden");

});


/* ==========================================
   GUARDAR / EDITAR PARTIDO
========================================== */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    try {

        if (editingId) {

            await editMatch(
                editingId,
                {
                    rival: rival.value,
                    date: date.value,
                    time: time.value,
                    location: location.value,
                    category: category.value,
                    result: result.value,
                    published: published.checked
                }
            );

            alert(
                "Partido actualizado correctamente."
            );

        } else {

            await createMatch(
                {
                    rival: rival.value,
                    date: date.value,
                    time: time.value,
                    location: location.value,
                    category: category.value,
                    result: result.value,
                    published: published.checked
                }
            );

            alert(
                "Partido creado correctamente."
            );

        }

        editingId = null;

        form.reset();

        modal.classList.add("hidden");

        saveButton.textContent =
            "Guardar Partido";

        await loadMatches();

    } catch (error) {

        console.error(error);

        alert(
            "Ocurrió un error al guardar el partido."
        );

    }

});


/* ==========================================
   ELIMINAR PARTIDO
========================================== */

async function deleteMatch(id: string) {

    const confirmed = confirm(
        "¿Seguro que deseas eliminar este partido?"
    );

    if (!confirmed) return;

    try {

        await removeMatch(id);

        await loadMatches();

        alert(
            "Partido eliminado correctamente."
        );

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el partido."
        );

    }

}


/* ==========================================
   CARGAR PARTIDOS
========================================== */

async function loadMatches(search = "") {

    matchesTable.innerHTML = "";

    try {

        const snapshot = await getMatches();

        snapshot.forEach((item) => {

            const match = item.data();

            const searchText = `
                ${match.rival}
                ${match.category}
                ${match.location}
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
                    ${match.rival}
                </td>

                <td>
                    ${formatDate(match.date)}
                    <br>
                    <small>
                        ${match.time}
                    </small>
                </td>

                <td>

                    <input
                        type="checkbox"
                        class="publish-toggle"
                        ${match.published ? "checked" : ""}
                    >

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
               BOTÓN EDITAR
            ========================================== */

            const editButton =
                row.querySelector(
                    ".btn-edit"
                ) as HTMLButtonElement;

            editButton.addEventListener(
                "click",
                () => {

                    editingId = item.id;

                    rival.value =
                        match.rival;

                    date.value =
                        match.date;

                    time.value =
                        match.time;

                    location.value =
                        match.location;

                    category.value =
                        match.category;

                    result.value =
                        match.result || "";

                    published.checked =
                        match.published;

                    saveButton.textContent =
                        "Actualizar Partido";

                    modal.classList.remove(
                        "hidden"
                    );

                }
            );


            /* ==========================================
               BOTÓN ELIMINAR
            ========================================== */

            const deleteButton =
                row.querySelector(
                    ".btn-delete"
                ) as HTMLButtonElement;

            deleteButton.addEventListener(
                "click",
                () => {

                    deleteMatch(item.id);

                }
            );


            /* ==========================================
               PUBLICAR / OCULTAR
            ========================================== */

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
                            "No se pudo cambiar el estado del partido."
                        );

                        toggle.checked =
                            !toggle.checked;

                    }

                }
            );


            matchesTable.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(
            "No se pudieron cargar los partidos."
        );

    }

}


/* ==========================================
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    () => {

        loadMatches(
            searchInput.value
        );

    }
);


/* ==========================================
   FORMATEAR FECHA
========================================== */

function formatDate(dateString: string) {

    if (!dateString) {
        return "Sin fecha";
    }

    const [year, month, day] =
        dateString.split("-");

    return `${day}/${month}/${year}`;

}


/* ==========================================
   INICIAR MÓDULO
========================================== */

loadMatches();