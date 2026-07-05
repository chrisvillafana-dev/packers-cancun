import "./common";

function initJoinForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-join-form]");
  const success = document.querySelector<HTMLElement>("[data-join-success]");
  if (!form || !success) return;

  form.addEventListener("submit", (event) => {
    // NOTA PARA TI: este sitio es estático (sin backend propio).
    // Para recibir estos datos en tu correo sin programar un servidor,
    // conecta el <form> a un servicio como Formspree o Getform:
    // 1) crea una cuenta gratis en https://formspree.io
    // 2) cambia el atributo action="" de este <form> por la URL que te den
    // 3) quita el event.preventDefault() de aquí abajo
    // Mientras tanto, esto solo simula el envío en el navegador.
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    success.classList.add("is-visible");
    success.setAttribute("role", "status");
    form.reset();
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

document.addEventListener("DOMContentLoaded", initJoinForm);
