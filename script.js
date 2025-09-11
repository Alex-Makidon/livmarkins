/* =========================================
   LivMarkins — script.js (mobile nav rebuild)
   ========================================= */

/* ===== Splash (home only, safe no-op elsewhere) ===== */
(function () {
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');

  // If there's a splash but no video (e.g., non-home pages), force-hide it so it can’t intercept taps.
  if (splash && !vid) {
    splash.classList.add('hide');
    splash.style.pointerEvents = 'none';
    return;
  }

  if (!splash || !vid) return;

  const finish = () => { if (!splash.classList.contains('hide')) splash.classList.add('hide'); splash.style.pointerEvents = 'none'; };
  vid.addEventListener('ended', finish);
  splash.addEventListener('click', finish);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });

  const tryPlay = () => { if (vid.paused) { vid.play().catch(()=>{}); } window.removeEventListener('pointerdown', tryPlay, { passive:true }); };
  window.addEventListener('pointerdown', tryPlay, { passive:true });

  let safetyTimer = setTimeout(finish, 12000);
  const setDurationTimer = () => {
    clearTimeout(safetyTimer);
    const dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 6;
    const ms = Math.min((dur * 1000) + 800, 12000);
    safetyTimer = setTimeout(finish, ms);
  };
  if (isFinite(vid.duration) && vid.duration > 0) setDurationTimer();
  else vid.addEventListener('loadedmetadata', setDurationTimer, { once:true });

  vid.addEventListener('error', () => setTimeout(finish, 1200), { once:true });
})();

/* ===== Formspree submit ===== */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/your-form-id"; // <-- replace with your real ID
(function () {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const status = document.getElementById('form-status');
    status.className = "notice";
    status.textContent = "Submitting...";
    status.classList.remove('hidden');
    const data = new FormData(form);
    try{
      const res = await fetch(FORMSPREE_ENDPOINT, { method: 'POST', headers: { 'Accept':'application/json' }, body: data });
      if (res.ok){
        status.className = "notice success";
        status.textContent = "Thanks! Your request has been sent. We'll reach out within one business day.";
        form.reset();
      } else {
        const msg = await res.json().catch(()=>({}));
        status.className = "notice alert";
        status.textContent = (msg && msg.errors && msg.errors[0] && msg.errors[0].message) || "Something went wrong. Please try again or call us.";
      }
    } catch{
      status.className = "notice alert";
      status.textContent = "Network error. Please try again or call us.";
    }
  });
})();

/* ===== Resources loader (resources.html only) ===== */
(async function () {
  const list = document.getElementById('pdfList');
  if (!list) return;
  try{
    const res = await fetch('assets/resources.json');
    if (!res.ok) throw new Error('No resources.json yet');
    const items = await res.json();
    if (!Array.isArray(items) || !items.length){
      list.innerHTML = '<div class="muted">No resources yet. Check back soon.</div>';
      return;
    }
    const html = items.map(item => `
      <div class="card">
        <h3>${item.title || 'Document'}</h3>
        <p class="muted">${item.description || ''}</p>
        <a class="button" href="${item.href}" download>Download PDF</a>
      </div>
    `).join('');
    list.innerHTML = html;
  } catch{
    list.innerHTML = '<div class="muted">No resources yet. Check back soon.</div>';
  }
})();

/* ===== Mobile burger nav — portal + single-pointer binding ===== */
(function () {
  const drawer = document.getElementById('mobileNav');
  const origToggle = document.querySelector('.nav-toggle');
  if (!drawer || !origToggle) return;

  const panel = drawer.querySelector('.mobile-nav-panel');
  const closeBtn = drawer.querySelector('.nav-close');
  const backdrop = drawer.querySelector('.mobile-nav-backdrop');

  // Inject bottom CTAs exactly once
  if (panel) {
    panel.querySelector('.mobile-cta')?.remove();
    const cta = document.createElement('div');
    cta.className = 'mobile-cta';
    cta.innerHTML = `
      <a class="button" href="quote.html">Get a Quote</a>
      <a class="button secondary" href="tel:+12155155975">Call Now</a>
    `;
    panel.appendChild(cta);
  }

  const open = () => {
    if (!drawer.hidden) return;
    drawer.hidden = false;
    document.body.classList.add('menu-open');
    portalToggle.setAttribute('aria-expanded', 'true');
  };
  const close = (focusToggle = true) => {
    if (drawer.hidden) return;
    document.body.classList.remove('menu-open');
    portalToggle.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
    if (focusToggle) try { portalToggle.focus(); } catch {}
  };

  // --- Create a PORTAL copy of the toggle at <body> level ---
  // Hide the original (only on mobile via CSS; safe to also hide here)
  origToggle.setAttribute('data-hidden-mobile', 'true');

  const portalToggle = origToggle.cloneNode(true);
  portalToggle.classList.add('nav-toggle-portal');
  portalToggle.setAttribute('aria-expanded', 'false');

  // Ensure there is only one portal button
  document.querySelectorAll('.nav-toggle-portal').forEach(n => n.remove());
  document.body.appendChild(portalToggle);

  // Single, robust handler (avoid touchend+click double-fire)
  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const expanded = portalToggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  };

  if (window.PointerEvent) {
    portalToggle.addEventListener('pointerup', handle, { passive: false });
  } else {
    portalToggle.addEventListener('click', handle, { passive: false });
  }

  // Close interactions
  closeBtn?.addEventListener('click', () => close());
  backdrop?.addEventListener('click', () => close());
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Close menu on any nav link tap
  panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));
  panel?.querySelectorAll('.mobile-cta a').forEach(a => a.addEventListener('click', () => close(false)));
})();
