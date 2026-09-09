import "../../common";
import {
    createNews,
    editNews,
    getNews,
    removeNews,
    togglePublished
} from "./news.service";

import { uploadImage } from "../../cloudinary";


/* ==========================================
   ELEMENTOS
========================================== */

const modal =
    document.querySelector("#news-modal") as HTMLDivElement;

const form =
    document.querySelector("#news-form") as HTMLFormElement;

const newsTable =
    document.querySelector("#news-table") as HTMLTableSectionElement;

const searchInput =
    document.querySelector("#search-news") as HTMLInputElement;

const newButton =
    document.querySelector("#new-news-btn") as HTMLButtonElement;

const cancelButton =
    document.querySelector("#cancel-news") as HTMLButtonElement;

const title =
    document.querySelector("#title") as HTMLInputElement;

const description =
    document.querySelector("#description") as HTMLTextAreaElement;

const imageInput =
    document.querySelector("#image") as HTMLInputElement;

const category =
    document.querySelector("#category") as HTMLSelectElement;

const published =
    document.querySelector("#published") as HTMLInputElement;

const imagePreview =
    document.querySelector("#image-preview") as HTMLDivElement;

const imagePreviewImg =
    document.querySelector("#image-preview-img") as HTMLImageElement;

const saveButton =
    form.querySelector(
        "button[type='submit']"
    ) as HTMLButtonElement;


/* ==========================================
   ESTADO
========================================== */

let editingId: string | null = null;

/*
 * URL actual de la imagen.
 *
 * Puede ser:
 * - La imagen existente de Cloudinary al editar.
 * - La nueva imagen subida a Cloudinary.
 * - Una cadena vacía si no existe imagen.
 */
let currentImageUrl = "";


/* ==========================================
   LIMPIAR PREVIEW
========================================== */

function clearImagePreview(): void {

    currentImageUrl = "";

    imageInput.value = "";

    imagePreviewImg.src = "";

    imagePreview.classList.add("hidden");

}


/* ==========================================
   MOSTRAR PREVIEW
========================================== */

function showImagePreview(
    url: string
): void {

    if (!url) {

        clearImagePreview();

        return;

    }

    imagePreviewImg.src = url;

    imagePreview.classList.remove(
        "hidden"
    );

}


/* ==========================================
   PREVIEW DE ARCHIVO LOCAL
========================================== */

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files?.[0];

        if (!file) {
            return;
        }


        /*
         * Esta URL SOLO se utiliza para
         * mostrar la vista previa local.
         *
         * NO se guarda en Firestore.
         */
        const previewUrl =
            URL.createObjectURL(file);


        imagePreviewImg.src =
            previewUrl;

        imagePreview.classList.remove(
            "hidden"
        );

    }
);


/* ==========================================
   NUEVA NOTICIA
========================================== */

newButton.addEventListener(
    "click",
    () => {

        editingId = null;

        form.reset();

        clearImagePreview();

        saveButton.textContent =
            "Guardar noticia";

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

        editingId = null;

        form.reset();

        clearImagePreview();

        saveButton.textContent =
            "Guardar noticia";

        modal.classList.add(
            "hidden"
        );

    }
);


/* ==========================================
   GUARDAR / EDITAR
========================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            saveButton.disabled = true;

            saveButton.textContent =
                "Guardando...";


            /*
             * =====================================
             * IMAGEN
             * =====================================
             *
             * Si el usuario seleccionó una nueva
             * imagen, la subimos a Cloudinary.
             *
             * Si está editando y no seleccionó
             * una nueva, conservamos la imagen
             * existente.
             */

            let finalImageUrl =
                currentImageUrl;


            const selectedFile =
                imageInput.files?.[0];


            if (selectedFile) {

                saveButton.textContent =
                    "Subiendo imagen...";


                finalImageUrl =
                    await uploadImage(
                        selectedFile
                    );

            }


            /*
             * =====================================
             * DATOS DE LA NOTICIA
             * =====================================
             */

            const newsData = {

                title:
                    title.value.trim(),

                description:
                    description.value.trim(),

                category:
                    category.value,

                image:
                    finalImageUrl,

                published:
                    published.checked

            };


            /*
             * =====================================
             * EDITAR
             * =====================================
             */

            if (editingId) {

                await editNews(
                    editingId,
                    newsData
                );


                alert(
                    "Noticia actualizada correctamente."
                );

            }


            /*
             * =====================================
             * CREAR
             * =====================================
             */

            else {

                await createNews(
                    newsData
                );


                alert(
                    "Noticia creada correctamente."
                );

            }


            /*
             * =====================================
             * LIMPIAR
             * =====================================
             */

            editingId = null;

            form.reset();

            clearImagePreview();

            modal.classList.add(
                "hidden"
            );

            saveButton.textContent =
                "Guardar noticia";

            saveButton.disabled =
                false;


            await loadNews();


        } catch (error: any) {

            console.error(
                "Error en Noticias:",
                error
            );


            alert(
                `Error: ${
                    error?.message ||
                    "No se pudo guardar la noticia."
                }`
            );


            saveButton.disabled =
                false;

            saveButton.textContent =
                editingId
                    ? "Actualizar noticia"
                    : "Guardar noticia";

        }

    }
);


/* ==========================================
   ELIMINAR
========================================== */

async function deleteNews(
    id: string
): Promise<void> {

    const confirmed =
        confirm(
            "¿Eliminar esta noticia?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await removeNews(id);

        await loadNews();

    } catch (error) {

        console.error(
            "Error eliminando noticia:",
            error
        );

        alert(
            "No se pudo eliminar la noticia."
        );

    }

}


/* ==========================================
   CARGAR NOTICIAS
========================================== */

async function loadNews(
    search = ""
): Promise<void> {

    newsTable.innerHTML = "";


    try {

        const snapshot =
            await getNews();


        snapshot.forEach(
            (item) => {

                const news =
                    item.data();


                const newsTitle =
                    news.title || "";


                const searchText =
                    newsTitle.toLowerCase();


                if (
                    !searchText.includes(
                        search.toLowerCase()
                    )
                ) {

                    return;

                }


                const row =
                    document.createElement(
                        "tr"
                    );


                /*
                 * ==================================
                 * FILA
                 * ==================================
                 */

                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            news.title || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            news.category || ""
                        )}
                    </td>

                    <td>

                        <input
                            type="checkbox"
                            class="publish-toggle"
                            ${
                                news.published
                                    ? "checked"
                                    : ""
                            }
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


                /*
                 * ==================================
                 * BOTÓN EDITAR
                 * ==================================
                 */

                const editButton =
                    row.querySelector(
                        ".btn-edit"
                    ) as HTMLButtonElement;


                editButton.addEventListener(
                    "click",
                    () => {

                        editingId =
                            item.id;


                        title.value =
                            news.title || "";


                        description.value =
                            news.description || "";


                        category.value =
                            news.category ||
                            "General";


                        published.checked =
                            news.published === true;


                        /*
                         * IMPORTANTE:
                         *
                         * NO hacemos:
                         *
                         * imageInput.value =
                         * news.image
                         *
                         * porque los navegadores
                         * no permiten establecer
                         * programáticamente un
                         * input type="file".
                         */


                        imageInput.value =
                            "";


                        /*
                         * Conservamos la URL
                         * existente.
                         */

                        currentImageUrl =
                            news.image || "";


                        if (
                            currentImageUrl
                        ) {

                            showImagePreview(
                                currentImageUrl
                            );

                        } else {

                            clearImagePreview();

                        }


                        saveButton.textContent =
                            "Actualizar noticia";


                        modal.classList.remove(
                            "hidden"
                        );

                    }
                );


                /*
                 * ==================================
                 * BOTÓN ELIMINAR
                 * ==================================
                 */

                const deleteButton =
                    row.querySelector(
                        ".btn-delete"
                    ) as HTMLButtonElement;


                deleteButton.addEventListener(
                    "click",
                    () => {

                        deleteNews(
                            item.id
                        );

                    }
                );


                /*
                 * ==================================
                 * PUBLICAR / BORRADOR
                 * ==================================
                 */

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
                                "Error cambiando estado:",
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


                newsTable.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Error cargando noticias:",
            error
        );

        alert(
            "No se pudieron cargar las noticias."
        );

    }

}


/* ==========================================
   ESCAPAR HTML
========================================== */

function escapeHTML(
    value: string
): string {

    return value
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
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    () => {

        loadNews(
            searchInput.value
        );

    }
);


/* ==========================================
   INICIAR
========================================== */

loadNews();