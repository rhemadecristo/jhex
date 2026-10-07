# JHEX — Sitio oficial

Sitio estático (HTML, CSS y JS sin build) de JHEX, artista de música urbana con propósito (ESCOL Records).

- Animaciones: GSAP + ScrollTrigger y scroll suave con Lenis (en `js/vendor/`, sin CDN).
- Imágenes y logo: servidos desde Cloudinary (`dawxjcvf`) con `f_auto,q_auto` y tamaños responsive.
- SEO/GEO: meta tags, Open Graph, JSON-LD (`MusicGroup`, `FAQPage`, `WebSite`), `sitemap.xml`, `robots.txt` (permite bots de IA) y `llms.txt`.

## Ver en local

```bash
python3 -m http.server 8000
```

## Editar contenido

| Qué | Dónde |
| --- | --- |
| Pre-save de “Rendido” | `https://escol.io/rendido` en `index.html` (busca `escol.io`) |
| Correo de booking | `data-email` del `<form class="form">` en `index.html` |
| Instagram / TikTok / YouTube | `href=""` en el `<footer>` (los vacíos se ocultan solos). Agrégalos también a `sameAs` en el JSON-LD |
| Cifras | Sección `#numeros` (`data-count`) y `llms.txt` |
| Fotos | URLs de Cloudinary en `index.html` |
| Dominio | Reemplaza `https://jhex.vercel.app` en `index.html`, `robots.txt`, `sitemap.xml` y `llms.txt` |
| Colores | Variables en `:root` de `styles.css` |

## Caché

Al cambiar `styles.css`, `script.js` o `js/interactive.js`, sube el número `?v=` de esos archivos en `index.html` para que los navegadores descarguen la versión nueva.

## Publicar

Conectado a Vercel: cada push a `main` se publica solo.
