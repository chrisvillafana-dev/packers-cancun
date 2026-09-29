import "../../common";
import {
    getSettings,
    saveSettings
} from "./settings.service";


const form =
    document.querySelector(
        "#settings-form"
    ) as HTMLFormElement;


const teamName =
    document.querySelector(
        "#team-name"
    ) as HTMLInputElement;


const description =
    document.querySelector(
        "#description"
    ) as HTMLTextAreaElement;


const location =
    document.querySelector(
        "#location"
    ) as HTMLInputElement;


const email =
    document.querySelector(
        "#email"
    ) as HTMLInputElement;


const phone =
    document.querySelector(
        "#phone"
    ) as HTMLInputElement;


const instagram =
    document.querySelector(
        "#instagram"
    ) as HTMLInputElement;


const tiktok =
    document.querySelector(
        "#tiktok"
    ) as HTMLInputElement;


const facebook =
    document.querySelector(
        "#facebook"
    ) as HTMLInputElement;

const youtube = document.querySelector("#youtube") as HTMLInputElement;


const website =
    document.querySelector(
        "#website"
    ) as HTMLInputElement;


const siteActive =
    document.querySelector(
        "#site-active"
    ) as HTMLInputElement;


/* ==========================================
   CARGAR CONFIGURACIÓN
========================================== */

async function loadSettings() {

    try {

        const settings =
            await getSettings();


        if (!settings) {

            return;

        }


        teamName.value =
            settings.teamName || "";

        description.value =
            settings.description || "";

        location.value =
            settings.location || "";

        email.value =
            settings.email || "";

        phone.value =
            settings.phone || "";

        instagram.value =
            settings.instagram || "";

        tiktok.value =
            settings.tiktok || "";

        facebook.value =
            settings.facebook || "";

        youtube.value = settings.youtube || "";

        website.value =
            settings.website || "";

        siteActive.checked =
            settings.siteActive ?? true;


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo cargar la configuración."
        );

    }

}


/* ==========================================
   GUARDAR
========================================== */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            await saveSettings({

                teamName:
                    teamName.value.trim(),

                description:
                    description.value.trim(),

                location:
                    location.value.trim(),

                email:
                    email.value.trim(),

                phone:
                    phone.value.trim(),

                instagram:
                    instagram.value.trim(),

                tiktok:
                    tiktok.value.trim(),

                facebook:
                    facebook.value.trim(),

                youtube:
                    youtube.value.trim(),

                website:
                    website.value.trim(),

                siteActive:
                    siteActive.checked

            });


            alert(
                "Configuración guardada correctamente."
            );


        } catch (error) {

            console.error(error);

            alert(
                "No se pudo guardar la configuración."
            );

        }

    }
);


/* ==========================================
   INICIAR
========================================== */

loadSettings();