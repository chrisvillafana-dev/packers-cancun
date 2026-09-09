import "../../common";
import {

    createCategory,

    editCategory,

    getCategories,

    removeCategory,

    toggleCategoryPublished

} from "./categories.service";


/* ==========================================
   ELEMENTOS
========================================== */

const modal =
    document.querySelector(
        "#category-modal"
    ) as HTMLDivElement;


const modalTitle =
    document.querySelector(
        "#category-modal-title"
    ) as HTMLHeadingElement;


const form =
    document.querySelector(
        "#category-form"
    ) as HTMLFormElement;


const table =
    document.querySelector(
        "#categories-table"
    ) as HTMLTableSectionElement;


const searchInput =
    document.querySelector(
        "#search-category"
    ) as HTMLInputElement;


const newButton =
    document.querySelector(
        "#new-category-btn"
    ) as HTMLButtonElement;


const cancelButton =
    document.querySelector(
        "#cancel-category"
    ) as HTMLButtonElement;


const nameInput =
    document.querySelector(
        "#category-name"
    ) as HTMLInputElement;


const orderInput =
    document.querySelector(
        "#category-order"
    ) as HTMLInputElement;


const publishedInput =
    document.querySelector(
        "#category-published"
    ) as HTMLInputElement;


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


/* ==========================================
   NUEVA CATEGORÍA
========================================== */

newButton.addEventListener(
    "click",
    () => {

        editingId =
            null;


        form.reset();


        publishedInput.checked =
            true;


        orderInput.value =
            "1";


        modalTitle.textContent =
            "Nueva categoría";


        saveButton.textContent =
            "Guardar categoría";


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

        closeModal();

    }
);


/* ==========================================
   CERRAR MODAL
========================================== */

function closeModal(): void {

    editingId =
        null;


    form.reset();


    saveButton.disabled =
        false;


    saveButton.textContent =
        "Guardar categoría";


    modal.classList.add(
        "hidden"
    );

}


/* ==========================================
   GUARDAR
========================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            nameInput.value.trim();


        if (!name) {

            alert(
                "Escribe un nombre para la categoría."
            );

            return;

        }


        const categoryData = {

            name,

            slug:
                createSlug(
                    name
                ),

            order:
                Number(
                    orderInput.value
                ) || 0,

            published:
                publishedInput.checked

        };


        try {

            saveButton.disabled =
                true;


            saveButton.textContent =
                editingId
                    ? "Actualizando..."
                    : "Guardando...";


            if (editingId) {

                await editCategory(
                    editingId,
                    categoryData
                );


                alert(
                    "Categoría actualizada correctamente."
                );

            } else {

                await createCategory(
                    categoryData
                );


                alert(
                    "Categoría creada correctamente."
                );

            }


            closeModal();


            await loadCategories();


        } catch (error: any) {

            console.error(
                "Error guardando categoría:",
                error
            );


            alert(
                `No se pudo guardar la categoría: ${
                    error?.message ||
                    "Error desconocido"
                }`
            );


            saveButton.disabled =
                false;


            saveButton.textContent =
                editingId
                    ? "Actualizar categoría"
                    : "Guardar categoría";

        }

    }
);


/* ==========================================
   CARGAR CATEGORÍAS
========================================== */

async function loadCategories(): Promise<void> {

    table.innerHTML = "";


    try {

        const snapshot =
            await getCategories();


        const search =
            normalizeText(
                searchInput.value
            );


        snapshot.forEach(
            (item) => {

                const category =
                    item.data();


                const categoryName =
                    String(
                        category.name || ""
                    );


                if (
                    search &&
                    !normalizeText(
                        categoryName
                    ).includes(
                        search
                    )
                ) {

                    return;

                }


                const row =
                    document.createElement(
                        "tr"
                    );


                const published =
                    category.published === true;


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHtml(
                                categoryName
                            )}
                        </strong>
                    </td>


                    <td>

                        ${escapeHtml(
                            String(
                                category.slug ||
                                createSlug(
                                    categoryName
                                )
                            )
                        )}

                    </td>


                    <td>

                        ${Number(
                            category.order || 0
                        )}

                    </td>


                    <td>

                        <input
                            type="checkbox"
                            class="publish-toggle"
                            ${
                                published
                                    ? "checked"
                                    : ""
                            }
                        >

                    </td>


                    <td>

                        <button
                            type="button"
                            class="btn-edit"
                            title="Editar categoría"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="btn-delete"
                            title="Eliminar categoría"
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
                            categoryName;


                        orderInput.value =
                            String(
                                category.order ??
                                0
                            );


                        publishedInput.checked =
                            published;


                        modalTitle.textContent =
                            "Editar categoría";


                        saveButton.textContent =
                            "Actualizar categoría";


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
                    async () => {

                        const confirmed =
                            confirm(
                                `¿Deseas eliminar la categoría "${categoryName}"?\n\nSi ya existen jugadores en esta categoría, es preferible ocultarla en lugar de eliminarla.`
                            );


                        if (!confirmed) {

                            return;

                        }


                        try {

                            await removeCategory(
                                item.id
                            );


                            await loadCategories();


                        } catch (error) {

                            console.error(
                                error
                            );


                            alert(
                                "No se pudo eliminar la categoría."
                            );

                        }

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

                            await toggleCategoryPublished(

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


                table.appendChild(
                    row
                );

            }
        );


        if (
            !table.children.length
        ) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="
                            text-align:center;
                            padding:2.5rem;
                        "
                    >

                        No hay categorías registradas.

                    </td>

                </tr>

            `;

        }


    } catch (error) {

        console.error(
            "Error cargando categorías:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:2rem;
                    "
                >

                    No se pudieron cargar
                    las categorías.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    loadCategories
);


/* ==========================================
   SLUG
========================================== */

function createSlug(
    value: string
): string {

    return normalizeText(
        value
    )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


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

loadCategories();