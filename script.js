/* ===== Splash ===== */
(function () {
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');
  if (!splash || !vid) return;

  const finish = () => { if (!splash.classList.contains('hide')) splash.classList.add('hide'); };
  vid.addEventListener('ended', finish);
  splash.addEventListener('click', finish);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });

  const tryPlay = () => {
    if (vid.paused) { vid.play().catch(()=>{}); }
    window.removeEventListener('pointerdown', tryPlay);
  };
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

/* ===== Formspree ===== */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/your-form-id";
const form = document.getElementById('quoteForm');
if (form){
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
}

/* ===== Resources loader ===== */
(async function loadResources(){
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

/* ===== Mobile burger nav ===== */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('mobileNav');
  if (!toggle || !drawer) return;

  const closeBtn = drawer.querySelector('.nav-close');
  const backdrop = drawer.querySelector('.mobile-nav-backdrop');
  const links = Array.from(drawer.querySelectorAll('a'));
  const panel = drawer.querySelector('.mobile-nav-panel');

  // --- Add bottom CTAs if missing ---
  if (panel && !panel.querySelector('.mobile-cta')) {
    const cta = document.createElement('div');
    cta.className = 'mobile-cta';
    // Use index.html#quote so it works from any page
    cta.innerHTML = `
      <a class="button" href="index.html#quote">Get a Quote</a>
      <a class="button secondary" href="tel:+12155155975">Call Now</a>
    `;
    panel.appendChild(cta);
  }

  const open = () => {
    drawer.hidden = false;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => { links[0]?.focus(); }, 0);
  };
  const close = (focusToggle = true) => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
    if (focusToggle) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });
  closeBtn?.addEventListener('click', () => close());
  backdrop?.addEventListener('click', () => close());
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Handle in-page anchors / quote CTA so the drawer closes first
  const allDrawerLinks = Array.from(drawer.querySelectorAll('a'));
  allDrawerLinks.forEach(a => {
    const href = a.getAttribute('href') || '';

    // Get a Quote from any page:
    if (href.includes('#quote')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const onHome = /(^|\/)(index\.html)?$/.test(location.pathname);
        close(false);
        requestAnimationFrame(() => {
          if (onHome) {
            // Smooth-scroll on Home
            const el = document.getElementById('quote');
            if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
          } else {
            // Navigate to Home with hash
            window.location.href = 'index.html#quote';
          }
        });
      });
      return;
    }

    // Generic in-page hash links (if you add more later)
    if (href.startsWith('#')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        close(false);
        const id = href.slice(1);
        requestAnimationFrame(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
        });
      });
    }
  });
})();

/* ===== Mobile: set CSS var for header height so body can pad correctly ===== */
(function(){
  const header = document.querySelector('header');
  if (!header) return;

  const setHeaderH = () => {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  window.addEventListener('load', setHeaderH);
  window.addEventListener('resize', setHeaderH);
  const ro = new ResizeObserver(setHeaderH);
  ro.observe(header);
})();
