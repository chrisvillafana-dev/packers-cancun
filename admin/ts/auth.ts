import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const form = document.querySelector("#login-form") as HTMLFormElement;

const emailInput = document.querySelector("#email") as HTMLInputElement;
const passwordInput = document.querySelector("#password") as HTMLInputElement;

const errorText = document.querySelector("#login-error") as HTMLParagraphElement;

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    errorText.textContent = "";

    try {

        await signInWithEmailAndPassword(

            auth,

            emailInput.value,

            passwordInput.value

        );

        window.location.href = "./dashboard.html";

    } catch (error) {

        errorText.textContent =
            "Correo o contraseña incorrectos.";

        console.error(error);

    }

});