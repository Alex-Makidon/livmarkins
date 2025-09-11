/* =========================================
   LivMarkins — script.js (mobile nav rebuild)
   ========================================= */

/* ===== Splash (home only, safe no-op elsewhere) ===== */
(function () {
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');
  if (!splash || !vid) return;

  const finish = () => { if (!splash.classList.contains('hide')) splash.classList.add('hide'); };
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

/* ===== Mobile burger nav — clean, reliable ===== */
(function () {
  const drawer = document.getElementById('mobileNav');
  const toggle = document.querySelector('.nav-toggle');
  if (!drawer || !toggle) return;

  const panel = drawer.querySelector('.mobile-nav-panel');
  const closeBtn = drawer.querySelector('.nav-close');
  const backdrop = drawer.querySelector('.mobile-nav-backdrop');

  // Inject bottom CTAs exactly once
  if (panel) {
    const existingCTA = panel.querySelector('.mobile-cta');
    if (existingCTA) existingCTA.remove();
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
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = (focusToggle = true) => {
    if (drawer.hidden) return;
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
    if (focusToggle) try { toggle.focus(); } catch {}
  };

  // Make sure previous listeners (if any) don't double-handle:
  toggle.replaceWith(toggle.cloneNode(true));
  const freshToggle = document.querySelector('.nav-toggle');

  const handlePress = (e) => {
    // Only react to taps/clicks on the button itself
    if (!e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    const expanded = freshToggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  };

  // Bind only to the toggle, with both click & touchend for iOS
  ['click','touchend'].forEach(ev => {
    freshToggle.addEventListener(ev, handlePress, { passive: false });
  });

  // Close interactions
  closeBtn?.addEventListener('click', () => close());
  backdrop?.addEventListener('click', () => close());
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Close menu on any nav link tap (desktop menu unaffected)
  panel?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => close(false));
  });

  // Also close before navigating via bottom CTA (prevents "double icons" flash)
  panel?.querySelectorAll('.mobile-cta a').forEach(a => {
    a.addEventListener('click', () => close(false));
  });
})();
