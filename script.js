/* JHEX — interacciones y animaciones */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGsap && !reduced;
  if (animate) root.classList.add('anim');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (animate && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  /* ---------- Navegación ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    scrollTo(target);
    history.replaceState(null, '', id);
  }));

  let lastY = 0;
  const floatCta = $('.float-cta');
  const hero = $('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;
    if (floatCta) {
      const pastHero = y > hero.offsetHeight * 0.75;
      const nearEnd = window.innerHeight + y > document.body.scrollHeight - 260;
      floatCta.classList.toggle('is-visible', pastHero && !nearEnd);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Loader ---------- */
  const loader = $('.loader');
  let introPlayed = false;
  const finishLoad = () => {
    if (introPlayed) return;
    introPlayed = true;
    loader && loader.classList.add('is-done');
    if (animate) intro();
  };
  if (document.readyState === 'complete') setTimeout(finishLoad, 900);
  else window.addEventListener('load', () => setTimeout(finishLoad, 500));
  setTimeout(finishLoad, 2600); // nunca bloquear más de 2.6 s

  /* ---------- Spotify (carga bajo demanda) ---------- */
  const frame = $('.player__frame');
  if (frame) {
    $('.player__load', frame).addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = frame.dataset.spotify;
      iframe.title = 'JHEX en Spotify';
      iframe.loading = 'lazy';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      frame.replaceChildren(iframe);
    }, { once: true });
  }

  /* ---------- Formulario de booking ---------- */
  const form = $('.form');
  if (form) {
    const status = $('.form__status', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((el) => {
        const bad = !el.value.trim();
        el.closest('.field').classList.toggle('is-invalid', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) { status.textContent = 'Completa tu nombre y el mensaje.'; return; }
      const to = form.dataset.email;
      if (!to) { status.textContent = 'El booking se habilita muy pronto. ¡Gracias por tu interés!'; return; }
      const d = new FormData(form);
      const body = [
        `Nombre: ${d.get('nombre')}`,
        `Organización: ${d.get('organizacion') || '-'}`,
        `Fecha: ${d.get('fecha') || '-'}`,
        `Ciudad: ${d.get('ciudad') || '-'}`,
        '',
        d.get('mensaje'),
      ].join('\n');
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(`Booking JHEX — ${d.get('nombre')}`)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Abriendo tu correo para enviar la solicitud…';
    });
    $$('input, textarea', form).forEach((el) => el.addEventListener('input', () => el.closest('.field').classList.remove('is-invalid')));
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Cursor y botones magnéticos (escritorio) ---------- */
  if (finePointer && !reduced) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });
    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
    $$('a, button, summary, input, textarea').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add(el.matches('[data-play], .player__load') ? 'is-play' : 'is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover', 'is-play'));
    });

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  if (!animate) return;

  /* =========================================================
     Animaciones GSAP
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // Intro del hero
  function intro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('.hero__img', { scale: 1.25, filter: 'brightness(0)' }, { scale: 1.08, filter: 'brightness(1)', duration: 2.2 }, 0)
      .fromTo('.hero__logo-wrap', { opacity: 0, y: 60, scale: 0.85, filter: 'blur(18px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.6 }, 0.25)
      .fromTo('[data-hero]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12 }, 0.7);
  }

  // Parallax del hero al hacer scroll
  gsap.to('.hero__img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

  // Logo cromado: inclinación 3D, imán hacia el cursor y brillo que sigue al mouse
  if (finePointer) {
    const logo = $('[data-tilt]');
    const rotX = gsap.quickTo(logo, 'rotationX', { duration: 0.8, ease: 'power3' });
    const rotY = gsap.quickTo(logo, 'rotationY', { duration: 0.8, ease: 'power3' });
    const moveX = gsap.quickTo(logo, 'x', { duration: 1, ease: 'power3' });
    const moveY = gsap.quickTo(logo, 'y', { duration: 1, ease: 'power3' });
    const glow = gsap.quickTo(logo, '--glow', { duration: 0.6, ease: 'power2' });
    gsap.set(logo, { transformPerspective: 900, '--glow': 0 });
    hero.addEventListener('pointermove', (e) => {
      rotY((e.clientX / innerWidth - 0.5) * 22);
      rotX((e.clientY / innerHeight - 0.5) * -16);
      const r = logo.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const pull = Math.max(0, 1 - Math.hypot(dx, dy) / Math.max(r.width, r.height)); // 1 encima del logo, 0 lejos
      moveX(dx * 0.12 * pull);
      moveY(dy * 0.12 * pull);
      logo.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      logo.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      glow(0.35 + pull * 0.65);
      logo.classList.add('is-active');
    });
    hero.addEventListener('pointerleave', () => {
      rotX(0); rotY(0); moveX(0); moveY(0); glow(0);
      logo.classList.remove('is-active');
    });
  }

  // Ticker: reacciona a la velocidad del scroll
  const track = $('.ticker__track');
  const tickerAnim = track.getAnimations ? track.getAnimations()[0] : null;
  const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
  ScrollTrigger.create({
    trigger: '.ticker', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity();
      skew(gsap.utils.clamp(-12, 12, v / -250));
      if (tickerAnim) tickerAnim.playbackRate = gsap.utils.clamp(-4, 4, 1 + v / 600) || 1;
    },
  });

  // Lanzamiento de Rendido: el título se abre y la foto se mueve
  gsap.fromTo('[data-drop-title]', { letterSpacing: '0.35em', scale: 0.7, opacity: 0 }, {
    letterSpacing: '-0.01em', scale: 1, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.drop', start: 'top 85%', end: 'center 60%', scrub: 0.6 },
  });
  gsap.from('.drop__kicker, .drop__copy, .drop__actions', {
    y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '.drop__title', start: 'top 70%' },
  });

  // Manifiesto: las palabras se encienden al hacer scroll
  const manifesto = $('[data-words]');
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  gsap.to($$('.w', manifesto), {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });

  // Aparición de bloques
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, overwrite: true }),
  });

  // Títulos de sección: entrada con recorte
  $$('.head__t').forEach((t) => {
    gsap.fromTo(t, { clipPath: 'inset(0 0 100% 0)', y: 40 }, {
      clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: t, start: 'top 90%' },
    });
  });

  // Foto de historia: revelado + parallax
  gsap.fromTo('[data-clip]', { clipPath: 'inset(18% 18% 18% 18% round 6px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none',
    scrollTrigger: { trigger: '[data-clip]', start: 'top 90%', end: 'center 55%', scrub: true },
  });
  gsap.fromTo('[data-parallax]', { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '[data-clip]', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.fromTo('[data-parallax]', { filter: 'grayscale(1) contrast(1.1)' }, {
    filter: 'grayscale(0) contrast(1.05)', ease: 'none',
    scrollTrigger: { trigger: '[data-clip]', start: 'center 70%', end: 'bottom 30%', scrub: true },
  });

  // Portada de Rendido: zoom suave al entrar
  gsap.fromTo('.release__art img', { scale: 1.25 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.release__art', start: 'top bottom', end: 'center center', scrub: true },
  });

  // Contadores
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const obj = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(obj, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = obj.v.toFixed(dec); },
    });
  });

  // Galería horizontal fijada (escritorio y tablet horizontal)
  mm.add('(min-width: 900px)', () => {
    const section = $('.gallery');
    const trackEl = $('.gallery__track');
    section.classList.add('is-pinned');
    const distance = () => Math.max(0, trackEl.scrollWidth - innerWidth);
    const tween = gsap.to(trackEl, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    $$('.shot', trackEl).forEach((shot) => {
      gsap.fromTo($('img', shot), { scale: 1.2 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: shot, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true },
      });
    });
    return () => section.classList.remove('is-pinned');
  });

  // Recalcular al cargar imágenes
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
