import "../../common";
import {
    createGalleryItem,
    editGalleryItem,
    getGallery,
    removeGalleryItem,
    togglePublished
} from "./gallery.service";

import { uploadImage } from "../../cloudinary";


/* ==========================================
   ELEMENTOS
========================================== */

const modal =
    document.querySelector("#gallery-modal") as HTMLDivElement;

const form =
    document.querySelector("#gallery-form") as HTMLFormElement;

const galleryTable =
    document.querySelector("#gallery-table") as HTMLTableSectionElement;

const searchInput =
    document.querySelector("#search-gallery") as HTMLInputElement;

    const newButton =
    document.querySelector("#new-gallery-btn") as HTMLButtonElement;

const cancelButton =
    document.querySelector("#cancel-gallery") as HTMLButtonElement;

const title =
    document.querySelector("#title") as HTMLInputElement;

const description =
    document.querySelector("#description") as HTMLTextAreaElement;

    const imageInput =
    document.querySelector("#image") as HTMLInputElement;

const imagePreview =
    document.querySelector("#image-preview") as HTMLDivElement;

const imagePreviewImg =
    document.querySelector("#image-preview-img") as HTMLImageElement;

let imageUrl = "";

const category =
    document.querySelector("#category") as HTMLSelectElement;

const published =
    document.querySelector("#published") as HTMLInputElement;

const saveButton =
    form.querySelector(
        "button[type='submit']"
    ) as HTMLButtonElement;


let editingId: string | null = null;

function clearImagePreview() {

    imageUrl = "";

    imageInput.value = "";

    imagePreviewImg.src = "";

    imagePreview.classList.add("hidden");

}

imageInput.addEventListener("change", () => {

    const file = imageInput.files?.[0];

    if (!file) {
        clearImagePreview();
        return;
    }

    const previewUrl = URL.createObjectURL(file);

    imagePreviewImg.src = previewUrl;

    imagePreview.classList.remove("hidden");

});

/* ==========================================
   NUEVA IMAGEN
========================================== */

newButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    clearImagePreview();

    saveButton.textContent =
        "Guardar imagen";

    modal.classList.remove("hidden");

});


/* ==========================================
   CANCELAR
========================================== */

cancelButton.addEventListener("click", () => {

    editingId = null;

    form.reset();

    clearImagePreview();

    saveButton.textContent =
        "Guardar imagen";

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

            const file = imageInput.files?.[0];

            /*
             * ==========================================
             * SUBIR IMAGEN NUEVA
             * ==========================================
             */

            if (file) {

                imageUrl = await uploadImage(file);

            }


            /*
             * ==========================================
             * VALIDAR IMAGEN
             * ==========================================
             */

            if (!imageUrl) {

                alert(
                    "Selecciona una imagen antes de continuar."
                );

                return;

            }


            /*
             * ==========================================
             * DATOS
             * ==========================================
             */

            const galleryData = {

                title: title.value,

                description: description.value,

                imageUrl: imageUrl,

                category: category.value,

                published: published.checked

            };


            /*
             * ==========================================
             * CREAR / EDITAR
             * ==========================================
             */

            if (editingId) {

                await editGalleryItem(
                    editingId,
                    galleryData
                );

                alert(
                    "Imagen actualizada correctamente."
                );

            } else {

                await createGalleryItem(
                    galleryData
                );

                alert(
                    "Imagen agregada correctamente."
                );

            }


            /*
             * ==========================================
             * LIMPIAR
             * ==========================================
             */

            editingId = null;

            form.reset();

            clearImagePreview();

            modal.classList.add("hidden");

            saveButton.textContent =
                "Guardar imagen";

            await loadGallery();

        } catch (error: any) {

            console.error(
                "Error en Galería:",
                error
            );

            alert(
                `Error: ${error.message}`
            );

        }

    }
);


/* ==========================================
   ELIMINAR
========================================== */

async function deleteGalleryItem(
    id: string
) {

    const confirmed = confirm(
        "¿Seguro que deseas eliminar esta imagen?"
    );

    if (!confirmed) return;


    try {

        await removeGalleryItem(id);

        await loadGallery();

        alert(
            "Imagen eliminada correctamente."
        );

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo eliminar la imagen."
        );

    }

}


/* ==========================================
   CARGAR GALERÍA
========================================== */

async function loadGallery(
    search = ""
) {

    galleryTable.innerHTML = "";


    try {

        const snapshot =
            await getGallery();


        snapshot.forEach((item) => {

            const galleryItem =
                item.data();


            const searchText = `
                ${galleryItem.title}
                ${galleryItem.category}
                ${galleryItem.description}
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

                    <img
                        src="${galleryItem.imageUrl}"
                        alt="${galleryItem.title}"
                        style="
                            width: 70px;
                            height: 50px;
                            object-fit: cover;
                            border-radius: 6px;
                        "
                    >

                </td>

                <td>
                    ${galleryItem.title}
                </td>

                <td>
                    ${galleryItem.category}
                </td>

                <td>

                    <input
                        type="checkbox"
                        class="publish-toggle"
                        ${galleryItem.published ? "checked" : ""}>

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
                        galleryItem.title;

                    description.value =
                        galleryItem.description;

                        imageUrl =
                        galleryItem.imageUrl;

                    category.value =
                        galleryItem.category;

                    published.checked =
                        galleryItem.published;

                    saveButton.textContent =
                        "Actualizar imagen";

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

                    deleteGalleryItem(
                        item.id
                    );

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


            galleryTable.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo cargar la galería."
        );

    }

}


/* ==========================================
   BUSCADOR
========================================== */

searchInput.addEventListener(
    "input",
    () => {

        loadGallery(
            searchInput.value
        );

    }
);


/* ==========================================
   INICIAR
========================================== */

loadGallery();