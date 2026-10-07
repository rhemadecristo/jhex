/* JHEX — interacciones visuales: linterna, fotos glitch, letras que se dispersan y secreto */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gsap = window.gsap;

  /* ---------- Linterna ---------- */
  const stage = $('[data-flashlight]');
  if (stage) {
    let tx = 50, ty = 45, cx = 50, cy = 45, idle = true, visible = false, t = 0;
    const set = (x, y) => { stage.style.setProperty('--x', `${x}%`); stage.style.setProperty('--y', `${y}%`); };
    const aim = (e) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      idle = false;
      stage.classList.add('is-used');
    };
    stage.addEventListener('pointermove', aim);
    stage.addEventListener('pointerdown', aim);
    stage.addEventListener('pointerleave', () => { idle = true; });
    if (reduced) {
      stage.style.setProperty('--r', '70vmax'); // todo iluminado, sin movimiento
    } else {
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(stage);
      const loop = () => {
        if (visible) {
          if (idle) { // la luz recorre la escena sola mientras nadie la mueve
            t += 0.008;
            tx = 50 + Math.sin(t) * 28;
            ty = 45 + Math.sin(t * 1.7) * 16;
          }
          cx += (tx - cx) * 0.12;
          cy += (ty - cy) * 0.12;
          set(cx, cy);
        }
        requestAnimationFrame(loop);
      };
      loop();
    }
  }

  /* ---------- Fotos que se rompen (glitch) ---------- */
  if (!reduced) {
    $$('.shot').forEach((shot) => {
      const img = $('img', shot);
      const glitch = () => {
        if (shot.classList.contains('is-glitch')) return;
        shot.style.setProperty('--img', `url("${img.currentSrc || img.src}")`);
        shot.classList.add('is-glitch');
        setTimeout(() => shot.classList.remove('is-glitch'), 600);
      };
      shot.addEventListener(finePointer ? 'pointerenter' : 'pointerdown', glitch);
    });
  }

  /* ---------- Letras que se dispersan ---------- */
  const titles = $$('.drop__title, .head__t, .dark__title');
  titles.forEach((el) => {
    el.setAttribute('data-scatter', '');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    // Divide en letras conservando los <br>
    const parts = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        // Cada palabra va junta para que no se parta al cambiar de línea
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { parts.push(' '); return; }
          parts.push(`<span class="word" aria-hidden="true">${[...w].map((c) => `<span class="ch">${c}</span>`).join('')}</span>`);
        });
      }
      else if (n.nodeName === 'BR') parts.push('<br>');
    });
    el.innerHTML = parts.join('');
    el.classList.add('is-split');
  });

  if (gsap && !reduced) {
    titles.forEach((el) => {
      const chars = $$('.ch', el);
      const scatter = (px, py, force) => {
        chars.forEach((ch) => {
          const r = ch.getBoundingClientRect();
          const dx = r.left + r.width / 2 - px;
          const dy = r.top + r.height / 2 - py;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = r.height * 1.6;
          if (dist > reach) { gsap.to(ch, { x: 0, y: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' }); return; }
          const push = (1 - dist / reach) * force;
          gsap.to(ch, {
            x: (dx / dist) * push, y: (dy / dist) * push, rotation: (dx / dist) * push * 0.4,
            duration: 0.35, ease: 'power3.out', overwrite: 'auto',
          });
        });
      };
      const reset = () => gsap.to(chars, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.4)', stagger: 0.02, overwrite: 'auto' });
      if (finePointer) {
        el.addEventListener('pointermove', (e) => scatter(e.clientX, e.clientY, el.offsetHeight * 0.35));
        el.addEventListener('pointerleave', reset);
      } else {
        // En pantallas táctiles: tocar el título lo hace explotar y se vuelve a armar
        el.addEventListener('pointerdown', () => {
          gsap.timeline()
            .to(chars, {
              x: () => gsap.utils.random(-60, 60), y: () => gsap.utils.random(-50, 50), rotation: () => gsap.utils.random(-40, 40),
              duration: 0.35, ease: 'power3.out', stagger: 0.01,
            })
            .add(reset, '+=0.15');
        });
      }
    });
  }

  /* ---------- Secreto ---------- */
  const secret = $('#secreto');
  if (secret) {
    const canvas = $('.secret__sparks', secret);
    const ctx = canvas.getContext('2d');
    let sparks = [], raf = 0, lastFocus = null;

    const burst = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = innerWidth < 700 ? 90 : 160;
      sparks = Array.from({ length: n }, () => {
        const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 9;
        return { x: innerWidth / 2, y: innerHeight / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, s: 1 + Math.random() * 3, l: 1, g: 180 + Math.random() * 75 };
      });
      cancelAnimationFrame(raf);
      const tick = () => {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        sparks.forEach((p) => {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.12; p.l -= 0.011;
          if (p.l <= 0) return;
          ctx.globalAlpha = p.l;
          ctx.fillStyle = `rgb(${p.g},${p.g},${Math.min(255, p.g + 8)})`;
          ctx.fillRect(p.x, p.y, p.s, p.s);
        });
        sparks = sparks.filter((p) => p.l > 0);
        if (sparks.length) raf = requestAnimationFrame(tick);
      };
      tick();
    };

    const open = () => {
      if (!secret.hidden) return;
      lastFocus = document.activeElement;
      secret.hidden = false;
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
      if (!reduced) burst();
      $('.secret__close', secret).focus();
    };
    const close = () => {
      secret.hidden = true;
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
      cancelAnimationFrame(raf);
      if (lastFocus) lastFocus.focus();
    };
    $('.secret__close', secret).addEventListener('click', close);
    secret.addEventListener('click', (e) => { if (e.target === secret) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !secret.hidden) close(); });

    // Escribir R-E-N-D-I-D-O en el teclado
    const word = 'RENDIDO';
    let typed = '';
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea') || e.key.length !== 1) return;
      typed = (typed + e.key.toUpperCase()).slice(-word.length);
      if (typed === word) { typed = ''; open(); }
    });

    // Tocar el logo 5 veces seguidas
    const logo = $('.hero__logo-wrap');
    let taps = 0, tapTimer = 0;
    if (logo) logo.addEventListener('click', () => {
      taps += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 1500);
      if (taps >= 5) { taps = 0; open(); }
    });
  }
})();
