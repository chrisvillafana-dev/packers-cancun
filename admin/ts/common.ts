import {
    onAuthStateChanged,
    signOut
  } from "firebase/auth";

  import {
    auth
  } from "./firebase";


  /* ==========================================
     PROTECCIÓN DEL CMS
  ========================================== */

  document.documentElement.style.visibility =
    "hidden";


  onAuthStateChanged(
    auth,
    (user) => {

      if (!user) {

        window.location.replace(
          "./login.html"
        );

        return;

      }


      document.documentElement.style.visibility =
        "visible";

    }
  );


  /* ==========================================
     CERRAR SESIÓN
  ========================================== */

  const logoutButton =
    document.querySelector<HTMLButtonElement>(
      "#logout-btn"
    );


  logoutButton?.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.replace(
          "./login.html"
        );

      } catch (error) {

        console.error(
          "No se pudo cerrar la sesión:",
          error
        );

      }

    }
  );