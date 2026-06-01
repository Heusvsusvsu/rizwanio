/* ===================================================
   NAFEES SHAIKH — PORTFOLIO SCRIPT
   Canvas BG · Typing · Counters · Radar · Scroll FX
   =================================================== */

'use strict';

/* ── Loader ─────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1800);
});

/* ── Custom Cursor ──────────────────────────────── */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function ringAnim() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(ringAnim);
})();

document.querySelectorAll('a, button, .proj-card, .cert-card, .about-card, .skill-chip, .hex').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

/* ── Sticky Nav ─────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ── Hamburger ──────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Canvas Neural Network BG ───────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, nodes = [], lines = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODE_COUNT = 80;
  const CONNECT_DIST = 160;
  const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#3b82f6'];

  class Node {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r  = Math.random() * 2 + 1;
      this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.pulse += 0.03;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      const alpha = 0.5 + 0.5 * Math.sin(this.pulse);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + Math.floor(alpha * 200).toString(16).padStart(2,'0');
      ctx.fill();
      // Glow pulse
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
      g.addColorStop(0, this.col + '33');
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());

  // Floating data stream particles
  const streams = Array.from({length: 20}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vy: Math.random() * 0.8 + 0.2,
    col: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random()
  }));

  function drawStreams() {
    streams.forEach(s => {
      s.y += s.vy;
      s.alpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.001 + s.x);
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + 40);
      const g = ctx.createLinearGradient(s.x, s.y, s.x, s.y + 40);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, s.col + Math.floor(s.alpha * 80).toString(16).padStart(2,'0'));
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.8);
    bg.addColorStop(0, 'rgba(124,58,237,0.04)');
    bg.addColorStop(0.5, 'rgba(0,212,255,0.02)');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawStreams();

    // Connect nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = 1 - dist / CONNECT_DIST;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => { n.update(); n.draw(); });
    animId = requestAnimationFrame(animate);
  }
  animate();
})();

/* ── Typing Animation ───────────────────────────── */
(function initTyping() {
  const el     = document.getElementById('typed');
  const phrases = [
    'Data Pipelines',
    'ML Models',
    'Analytics Dashboards',
    'Python Applications',
    'Intelligent Systems',
    'Data Visualizations',
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.substring(0, ci + 1);
      ci++;
      if (ci === phrase.length) {
        setTimeout(() => { deleting = true; tick(); }, 1800);
        return;
      }
    } else {
      el.textContent = phrase.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    tick();
  }

  function tick() {
    setTimeout(type, deleting ? 60 : 95);
  }
  type();
})();

/* ── Intersection Observer (Reveal + Skill Bars + Counters) ── */
const revealEls = document.querySelectorAll('.reveal-fade, .reveal-left, .reveal-right');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObs.observe(el));

/* Skill bars */
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sb-fill').forEach(fill => fill.classList.add('animate'));
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skills-bars').forEach(el => barObs.observe(el));

/* Animated counters */
function animateCounter(el, target, duration = 1600) {
  let start = 0, startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
        animateCounter(el, +el.dataset.target);
      });
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObs.observe(heroStats);

/* ── Radar Chart ─────────────────────────────────── */
(function drawRadar() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, maxR = W * 0.42;

  const labels = ['Python', 'SQL', 'ML', 'Analysis', 'Viz', 'BI Tools'];
  const values = [0.9, 0.8, 0.82, 0.85, 0.78, 0.74];
  const N = labels.length;
  const angle = (Math.PI * 2) / N;

  const radarObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let progress = 0;
      function draw(p) {
        ctx.clearRect(0, 0, W, H);

        // Grid rings
        for (let r = 1; r <= 5; r++) {
          ctx.beginPath();
          for (let i = 0; i < N; i++) {
            const a = angle * i - Math.PI / 2;
            const x = cx + Math.cos(a) * maxR * (r / 5);
            const y = cy + Math.sin(a) * maxR * (r / 5);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = 'rgba(0,212,255,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Axes
        for (let i = 0; i < N; i++) {
          const a = angle * i - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
          ctx.strokeStyle = 'rgba(0,212,255,0.08)';
          ctx.stroke();
        }

        // Data polygon
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const a = angle * i - Math.PI / 2;
          const r = maxR * values[i] * p;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        grad.addColorStop(0, 'rgba(124,58,237,0.4)');
        grad.addColorStop(1, 'rgba(0,212,255,0.15)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,212,255,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Labels
        for (let i = 0; i < N; i++) {
          const a = angle * i - Math.PI / 2;
          const x = cx + Math.cos(a) * (maxR + 18);
          const y = cy + Math.sin(a) * (maxR + 18);
          ctx.fillStyle = '#64748b';
          ctx.font = '500 10px DM Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labels[i], x, y);
        }

        // Dots
        for (let i = 0; i < N; i++) {
          const a = angle * i - Math.PI / 2;
          const r = maxR * values[i] * p;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00d4ff';
          ctx.fill();
        }
      }

      let start = null;
      function anim(ts) {
        if (!start) start = ts;
        progress = Math.min((ts - start) / 1200, 1);
        draw(1 - Math.pow(1 - progress, 3));
        if (progress < 1) requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
      radarObs.disconnect();
    }
  }, { threshold: 0.3 });

  radarObs.observe(canvas);
})();

/* ── Project Filter & Search ─────────────────────── */
(function initProjects() {
  const cards  = document.querySelectorAll('.proj-card');
  const btns   = document.querySelectorAll('.filter-btn');
  const search = document.getElementById('projSearch');
  const noRes  = document.getElementById('noResults');
  let activeFilter = 'all';

  function filterCards() {
    const query = search.value.toLowerCase().trim();
    let visible = 0;

    cards.forEach(card => {
      const cats   = card.dataset.cat || '';
      const title  = card.querySelector('.proj-title')?.textContent.toLowerCase() || '';
      const desc   = card.querySelector('.proj-desc')?.textContent.toLowerCase()  || '';
      const tech   = Array.from(card.querySelectorAll('.proj-tech span')).map(s => s.textContent.toLowerCase()).join(' ');

      const matchFilter = activeFilter === 'all' || cats.includes(activeFilter);
      const matchSearch = !query || title.includes(query) || desc.includes(query) || tech.includes(query);

      if (matchFilter && matchSearch) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    noRes.style.display = visible === 0 ? 'block' : 'none';
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      filterCards();
    });
  });

  search.addEventListener('input', filterCards);
})();

/* ── Contact Form → WhatsApp ─────────────────────── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('submitBtn');
  const WA_NUM  = '919284861005';

  function getVal(id)  { return document.getElementById(id).value.trim(); }
  function setErr(id, msg) { document.getElementById(id).textContent = msg; }
  function clearErrs()  {
    ['fnameErr', 'femailErr', 'fmsgErr'].forEach(id => setErr(id, ''));
  }

  function validate() {
    let ok = true;
    const name  = getVal('fname');
    const email = getVal('femail');
    const msg   = getVal('fmsg');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name)  { setErr('fnameErr', 'Name is required.'); ok = false; }
    if (!email || !emailRx.test(email)) { setErr('femailErr', 'Valid email required.'); ok = false; }
    if (!msg)   { setErr('fmsgErr', 'Message is required.'); ok = false; }
    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrs();
    if (!validate()) return;

    const name  = getVal('fname');
    const email = getVal('femail');
    const phone = getVal('fphone');
    const msg   = getVal('fmsg');

    const text = encodeURIComponent(
      `👋 Hello Nafees!\n\n` +
      `📌 *Portfolio Contact Form*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      (phone ? `📱 *Phone:* ${phone}\n` : '') +
      `\n💬 *Message:*\n${msg}\n\n` +
      `—Sent from nafees-portfolio`
    );

    btn.disabled = true;
    btn.textContent = 'Opening WhatsApp...';
    success.style.display = 'block';
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUM}?text=${text}`, '_blank');
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Send via WhatsApp`;
    }, 800);
  });
})();

/* ── Smooth scroll for anchor links ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── Page Transitions (subtle) ───────────────────── */
document.body.style.opacity = '0';
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
});
