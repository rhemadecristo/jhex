// Menú móvil
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav__toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.nav__menu a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  })
);

// Fondo de la barra al hacer scroll
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Animación de entrada
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else {
  document.documentElement.classList.add('no-js');
}

// Videos de YouTube: miniatura y reproducción al hacer clic
document.querySelectorAll('.video').forEach((v) => {
  const id = v.dataset.id;
  if (!id) return;
  v.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
  v.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullScreen = true;
    iframe.title = v.getAttribute('aria-label');
    v.appendChild(iframe);
  }, { once: true });
});

// Formulario de booking: abre el correo con los datos
const form = document.querySelector('.form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const body = [
    `Nombre: ${d.get('nombre')}`,
    `Organización: ${d.get('organizacion')}`,
    `Fecha: ${d.get('fecha')}`,
    `Ciudad: ${d.get('ciudad')}`,
    '',
    d.get('mensaje'),
  ].join('\n');
  const subject = `Booking JHEX — ${d.get('nombre')}`;
  window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById('year').textContent = new Date().getFullYear();
