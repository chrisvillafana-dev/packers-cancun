# Packers Cancún — Sitio web oficial

Landing page + 5 secciones (Partidos, Reels, Categorías, Stats, Únete a Nosotros) para el equipo de tocho bandera **Packers Cancún**.

## Sobre el stack (nota importante)

Pediste "HTML5 con JAVA y TS". **Java** (el lenguaje de Android/backends) no aplica aquí — no tiene ningún rol en un sitio web como este, y mezclarlo solo añadiría complejidad sin beneficio. Lo que sí construí, y que asumo era la intención real, es:

- **HTML5** semántico para la estructura
- **CSS3** con variables (custom properties) para el sistema de colores/tipografías
- **TypeScript (TS)** para toda la lógica: menú, animaciones, y sobre todo la carga de contenido (noticias, partidos, categorías, stats) desde archivos de datos
- **Vite** como herramienta de desarrollo: es lo que hace que TypeScript funcione en el navegador, con recarga instantánea mientras editas en Cursor

Si en algún momento quieres una parte del sitio con backend real (por ejemplo, un panel de administrador con login para cargar noticias sin tocar código), ahí sí tendría sentido un lenguaje de servidor — Java sería una opción, pero Node.js/TypeScript (el mismo lenguaje del frontend) suele ser más simple de mantener para un equipo pequeño. Podemos cruzar ese puente cuando llegue el momento.

## Estructura del proyecto

```
packers-cancun/
├─ index.html          → Landing page
├─ partidos.html       → Próximos partidos y resultados
├─ reels.html          → Galería de videos
├─ categorias.html     → Categorías del equipo
├─ stats.html          → Tabla de estadísticas
├─ unete.html          → Formulario para nuevos jugadores
├─ src/
│  ├─ styles/style.css → Todo el diseño (colores, tipografías, animaciones)
│  └─ ts/              → Lógica en TypeScript (una por página + común)
├─ public/
│  ├─ assets/          → Logo ya procesado (fondo transparente) y favicon
│  ├─ data/            → *** AQUÍ EDITAS EL CONTENIDO *** (JSON)
│  ├─ images/          → Sube aquí las fotos que uses en noticias/categorías
│  └─ videos/          → Sube aquí los videos cortos para Reels
├─ package.json
├─ vite.config.ts
└─ tsconfig.json
```

## 1. Cómo abrir esto en Cursor y verlo funcionando

1. Abre la carpeta `packers-cancun` completa en Cursor.
2. Abre una terminal integrada (`Ctrl+ñ` o `Terminal → New Terminal`).
3. Instala dependencias (una sola vez):
   ```bash
   npm install
   ```
4. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

**Importante:** no abras `index.html` haciendo doble clic desde el explorador de archivos. El sitio necesita un servidor (aunque sea local) para cargar los estilos, el TypeScript y los archivos de contenido JSON. `npm run dev` te da ese servidor.

## Categorías actuales

Ya están cargadas: **Under 6, Under 8, Under 14, Mixto Libre y Mixto Master** (`public/data/categories.json`). Cuando quieras sumar una categoría nueva, agrega un objeto más al arreglo con el mismo formato — se muestra sola tanto en `/categorias.html` como en la franja de chips del inicio (esa franja sí está escrita directo en `index.html`, así que si agregas una categoría nueva ahí también edita esa lista de 6 líneas para que aparezca como chip).

## 2. Cómo agregar contenido constantemente (sin tocar el diseño)

Todo el contenido dinámico vive en `public/data/*.json`. Edita esos archivos y el sitio se actualiza solo:

- **`news.json`** → tarjetas del tablero de noticias en el inicio
- **`games.json`** → próximos partidos y resultados
- **`categories.json`** → las categorías que se muestran en `/categorias.html`
- **`stats.json`** → la tabla de `/stats.html`
- **`reels.json`** → la galería de `/reels.html`
- **`team.json`** → ya preparado para cuando agreguemos biografías de jugadores (ver sección "Próximos pasos")

Ejemplo, para agregar una noticia nueva, solo añades un objeto al arreglo en `news.json`:

```json
{
  "id": "n4",
  "date": "2026-07-10",
  "tag": "Aviso",
  "title": "Tu título aquí",
  "excerpt": "Un resumen corto de la noticia.",
  "image": "/images/mi-foto.jpg"
}
```

Sube la foto a `public/images/mi-foto.jpg` y listo — no hay que tocar HTML ni CSS.

## 3. La imagen de fondo del estadio

Ya está integrada: `public/assets/stadium-hero.jpg` es la foto que nos diste (el estadio de noche con "Packers Cancún" pintado en la zona de anotación). Por eso quité el texto en perspectiva que antes generaba con CSS — ya no hacía falta, la foto trae el rótulo real. En su lugar, agregué el nombre del equipo como encabezado normal arriba (en la zona oscura del cielo), para que se lea siempre completo aunque en pantallas angostas (celular) la foto recorte por los lados y no se alcance a ver el rótulo completo pintado en el pasto.

Si en el futuro quieres cambiar esta foto, solo reemplaza el archivo `public/assets/stadium-hero.jpg` por otro con el mismo nombre — el degradado que oscurece la parte de arriba (para que el logo y el texto se lean bien) se ajusta solo.

## 4. El logo

Tomé el logo que compartiste y le quité el fondo negro (ahora es transparente), lo recorté y generé dos versiones optimizadas en `public/assets/`:
- `logo-nav.png` → usado en el menú, footer y hero
- `favicon-256.png` → usado como ícono de pestaña del navegador

El archivo original está intacto por si necesitas la versión con fondo negro en algún otro contexto (redes sociales, playeras, etc.) — solo pídemelo y te lo regreso en otro formato.

## 5. Conectar el formulario de "Únete a Nosotros"

Como el sitio es estático (sin servidor propio), el formulario necesita un servicio externo gratuito para que te lleguen las solicitudes a tu correo:

1. Crea una cuenta gratis en **[formspree.io](https://formspree.io)**.
2. Crea un formulario nuevo y copia la URL que te dan (algo como `https://formspree.io/f/xxxxxx`).
3. En `unete.html`, cambia `<form data-join-form novalidate>` por:
   ```html
   <form data-join-form novalidate action="https://formspree.io/f/xxxxxx" method="POST">
   ```
4. En `src/ts/unete.ts`, quita la línea `event.preventDefault();` (está marcada con un comentario que explica esto).

Así, cada solicitud te llega directo a tu correo sin necesidad de programar un backend.

## 6. Dónde publicarlo gratis

Mi recomendación principal es **Netlify** (o su equivalente directo, **Vercel**) por esta combinación: plan gratuito generoso, deploy automático cada vez que subes cambios, soporte real para sitios con imágenes/video, y dominio propio gratis si más adelante compras uno personalizado.

| Opción | Por qué | Límite gratis a considerar |
|---|---|---|
| **Netlify** (recomendado) | Conectas tu repo de GitHub y cada cambio se publica solo. Fácil rollback si algo sale mal. | ~100GB de transferencia/mes — de sobra para fotos, ajustado si abusas de video pesado |
| **Vercel** | Prácticamente igual que Netlify, muy buena si luego quieres crecer el proyecto | Similar a Netlify |
| **Cloudflare Pages** | Igual de fácil, transferencia ilimitada en el plan gratis | Menos plugins "sin código" que Netlify |
| **GitHub Pages** | 100% gratis y simple | No tiene formularios ni redirects nativos; para tu caso, Netlify es más cómodo |

### Pasos para publicar con Netlify
1. Sube esta carpeta a un repositorio de **GitHub** (puedes hacerlo desde Cursor con `git init`, `git add .`, `git commit`, y luego "Publish to GitHub" en la barra lateral).
2. Entra a [netlify.com](https://netlify.com), inicia sesión con GitHub.
3. "Add new site" → "Import an existing project" → selecciona tu repositorio.
4. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Deploy. Cada vez que hagas `git push`, Netlify actualiza el sitio solo.

### Sobre subir fotos y videos constantemente
Las imágenes ligeras (fotos de noticias, categorías) están bien subiéndolas directo a `public/images/`. Para **videos**, evita subir archivos pesados directo al repositorio (satura tu límite gratuito y hace lento el sitio): mejor sube el video a YouTube o Instagram y usa el enlace, o si quieres el video incrustado como en Reels, comprímelo bien (menos de ~10MB) antes de subirlo a `public/videos/`.

## 7. Próximos pasos que ya dejé preparados

- **Biografías de jugadores con video de fondo:** ya existe `public/data/team.json` con el formato listo (`nombre`, `numero`, `posicion`, `bio`, `foto`, `videoFondo`). El truco de "video en loop que se reproduce en hover" que ya ves funcionando en `/reels.html` es exactamente la misma técnica que usaremos para las tarjetas de jugadores — cuando tengas los videos grabados (uniforme, sonriendo, movimiento sutil), lo conectamos en una tarde de trabajo.
- **Más info por categoría:** cada categoría en `categories.json` puede crecer con roster, horarios detallados y logros — el diseño en tarjetas ya está pensado para eso.

## 8. Decisiones de diseño (por qué se ve así)

- **Paleta:** verde selva casi negro de fondo, oro envejecido como acento (tomado directo de tu escudo) y un jade verde como color secundario — referencia a la piedra de jade maya, no es un verde cualquiera de "equipo deportivo genérico".
- **Tipografías:** una condensada deportiva (Anton) para títulos grandes, una serif ceremonial (Cinzel) para etiquetas y acentos —inspirada en cómo se "talla" el texto en tu logo— y una sans limpia (Work Sans) para todo el texto de lectura. Los números de stats usan una cuarta, más técnica (Rajdhani), como un marcador digital.
- **El elemento firma del sitio:** tu propia foto del estadio con "Packers Cancún" pintado en la zona de anotación, exactamente desde el ángulo que pediste. El degradado sobre la imagen está calculado a propósito para oscurecer solo la zona de las luces (arriba, donde va nuestro logo y encabezado) y dejar casi intacto el campo y el rótulo real de abajo — nada de plantilla genérica.
- **Animaciones:** todos los botones usan una curva de aceleración suave (`cubic-bezier`) en vez de transiciones lineales, y el sitio respeta la preferencia de "reducir movimiento" del sistema operativo del visitante.
