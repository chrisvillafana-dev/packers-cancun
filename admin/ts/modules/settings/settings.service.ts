import { db } from "../../firebase";

import {
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";

import type { SiteSettings } from "./settings.types";


const SETTINGS_ID = "site";


/* ==========================================
   OBTENER CONFIGURACIÓN
========================================== */

export async function getSettings() {

    const settingsRef =
        doc(db, "settings", SETTINGS_ID);

    const snapshot =
        await getDoc(settingsRef);

    if (!snapshot.exists()) {

        return null;

    }

    return snapshot.data() as SiteSettings;

}


/* ==========================================
   GUARDAR CONFIGURACIÓN
========================================== */

export async function saveSettings(
    settings: SiteSettings
) {

    const settingsRef =
        doc(db, "settings", SETTINGS_ID);

    await setDoc(
        settingsRef,
        settings,
        {
            merge: true
        }
    );

}