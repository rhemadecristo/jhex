# JHEX — Sitio oficial

Sitio estático (HTML, CSS y JS sin build) para JHEX, artista cristiano urbano.

## Ver en local

```bash
python3 -m http.server 8000
```

## Personalizar

- **Lanzamiento**: nombre, descripción y enlaces a plataformas en la sección `#musica` de `index.html`. Para la portada, pon la imagen en `assets/` y reemplaza el `<span>` de `.release__cover` por un `<img>`.
- **Videos**: en cada `<button class="video">`, pon el ID de YouTube en `data-id` (lo que va después de `v=`).
- **Foto principal**: en `styles.css`, regla `.hero`, hay un comentario con la línea para usar una foto.
- **Shows**: fechas, eventos y ciudades en `#shows`.
- **Booking**: correo y WhatsApp en `#booking`; el correo del formulario está en `data-email` del `<form>`.
- **Redes**: enlaces en el `<footer>`.
- **Colores**: variables en `:root` al inicio de `styles.css` (`--accent` es el verde neón).

## Publicar

Se puede desplegar tal cual en Vercel, Netlify o GitHub Pages.
