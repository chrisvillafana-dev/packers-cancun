import "./common";
import { db } from "./../../admin/ts/firebase";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
/* =========================================================
   ELEMENTOS
========================================================= */
const form = document.querySelector("[data-join-form]");
const success = document.querySelector("[data-join-success]");
const errorBox = document.querySelector("[data-join-error]");
const submitButton = document.querySelector("[data-join-submit]");
const nameInput = document.querySelector("#nombre");
const ageInput = document.querySelector("#edad");
const categoryInput = document.querySelector("#categoria");
const phoneInput = document.querySelector("#telefono");
const experienceInput = document.querySelector("#experiencia");
const consentInput = document.querySelector("#consentimiento");
const honeypotInput = document.querySelector("#website");
/* =========================================================
   CATEGORÍAS DE RESPALDO
========================================================= */
const FALLBACK_CATEGORIES = [
    "U-6",
    "U-8",
    "U-12",
    "U-14",
    "Libre Mixto",
    "Master Mixto"
];
/* =========================================================
   CARGAR CATEGORÍAS
========================================================= */
async function loadCategories() {
    if (!categoryInput) {
        return;
    }
    let categories = [];
    try {
        const categoriesQuery = query(collection(db, "categories"), where("published", "==", true));
        const snapshot = await getDocs(categoriesQuery);
        categories =
            snapshot.docs
                .map((documentSnapshot) => {
                const data = documentSnapshot.data();
                return {
                    name: String(data.name || ""),
                    order: Number(data.order || 0)
                };
            })
                .filter((category) => Boolean(category.name))
                .sort((a, b) => a.order - b.order);
    }
    catch (error) {
        console.warn("No se pudieron cargar las categorías:", error);
    }
    if (!categories.length) {
        categories =
            FALLBACK_CATEGORIES.map((name, index) => ({
                name,
                order: index + 1
            }));
    }
    categoryInput.innerHTML = `

    <option
      value=""
      disabled
      selected
    >
      Selecciona una opción
    </option>

  `;
    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value =
            category.name;
        option.textContent =
            category.name;
        categoryInput.appendChild(option);
    });
    const unsureOption = document.createElement("option");
    unsureOption.value =
        "No estoy seguro/a";
    unsureOption.textContent =
        "No estoy seguro/a";
    categoryInput.appendChild(unsureOption);
}
/* =========================================================
   FORMULARIO
========================================================= */
function initJoinForm() {
    if (!form ||
        !success ||
        !submitButton ||
        !nameInput ||
        !ageInput ||
        !categoryInput ||
        !phoneInput ||
        !experienceInput ||
        !consentInput) {
        return;
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideMessages();
        /* =============================================
           VALIDACIÓN NATIVA
        ============================================== */
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        /* =============================================
           HONEYPOT
        ============================================== */
        if (honeypotInput?.value.trim()) {
            /*
             * Bots suelen rellenar este campo oculto.
             * Fingimos éxito y no enviamos nada.
             */
            showSuccess();
            form.reset();
            return;
        }
        /* =============================================
           DATOS
        ============================================== */
        const name = nameInput.value.trim();
        const age = Number(ageInput.value);
        const category = categoryInput.value.trim();
        const phone = phoneInput.value.trim();
        const experience = experienceInput.value.trim();
        /* =============================================
           VALIDACIONES ADICIONALES
        ============================================== */
        if (name.length < 3 ||
            name.length > 80) {
            showError("Escribe un nombre válido.");
            return;
        }
        if (!Number.isFinite(age) ||
            age < 4 ||
            age > 80) {
            showError("Escribe una edad válida.");
            return;
        }
        if (!category) {
            showError("Selecciona una categoría.");
            return;
        }
        if (phone.length < 7 ||
            phone.length > 25) {
            showError("Escribe un teléfono o WhatsApp válido.");
            return;
        }
        if (experience.length > 600) {
            showError("La descripción de experiencia es demasiado larga.");
            return;
        }
        if (!consentInput.checked) {
            showError("Debes aceptar el uso de tus datos para poder enviar la solicitud.");
            return;
        }
        /* =============================================
           ENVIAR
        ============================================== */
        try {
            setSubmitting(true);
            await addDoc(collection(db, "joinRequests"), {
                name,
                age,
                category,
                phone,
                experience,
                consent: true,
                status: "new",
                source: "website",
                createdAt: serverTimestamp()
            });
            form.reset();
            showSuccess();
            success.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
        catch (error) {
            console.error("Error enviando solicitud:", error);
            showError("No pudimos enviar tu solicitud. Inténtalo nuevamente en unos momentos.");
        }
        finally {
            setSubmitting(false);
        }
    });
}
/* =========================================================
   ESTADO BOTÓN
========================================================= */
function setSubmitting(submitting) {
    if (!submitButton) {
        return;
    }
    submitButton.disabled =
        submitting;
    submitButton.textContent =
        submitting
            ? "Enviando solicitud..."
            : "Enviar solicitud";
}
/* =========================================================
   ÉXITO
========================================================= */
function showSuccess() {
    if (!success) {
        return;
    }
    success.classList.add("is-visible");
    success.setAttribute("role", "status");
}
/* =========================================================
   ERROR
========================================================= */
function showError(message) {
    if (!errorBox) {
        return;
    }
    errorBox.textContent =
        message;
    errorBox.hidden =
        false;
}
/* =========================================================
   OCULTAR MENSAJES
========================================================= */
function hideMessages() {
    success?.classList.remove("is-visible");
    if (errorBox) {
        errorBox.hidden =
            true;
    }
}
/* =========================================================
   START
========================================================= */
async function init() {
    await loadCategories();
    initJoinForm();
}
document.addEventListener("DOMContentLoaded", init);
