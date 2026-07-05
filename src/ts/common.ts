/**
 * common.ts
 * Se importa en TODAS las páginas. Controla:
 *  - Menú móvil (hamburguesa)
 *  - Sombra/fondo del nav al hacer scroll
 *  - Resaltar la pestaña activa según la URL actual
 *  - Animaciones "reveal" al hacer scroll (IntersectionObserver)
 */

function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const links = document.querySelector<HTMLElement>("[data-nav-links]");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

function initNavScrollState(): void {
  const nav = document.querySelector<HTMLElement>("[data-site-nav]");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function fileName(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  const last = clean.split("/").pop() || "";
  return last === "" ? "index.html" : last;
}

function markActiveNavLink(): void {
  const current = fileName(window.location.pathname);
  document.querySelectorAll<HTMLAnchorElement>("[data-nav-links] a").forEach((link) => {
    const href = fileName(link.getAttribute("href") || "");
    if (href === current) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function initRevealOnScroll(): void {
  const items = document.querySelectorAll<HTMLElement>(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

export function initCommon(): void {
  initMobileNav();
  initNavScrollState();
  markActiveNavLink();
  initRevealOnScroll();
}

document.addEventListener("DOMContentLoaded", initCommon);
