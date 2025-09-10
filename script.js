/* ===== Splash ===== */
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

  const open = () => {
    drawer.hidden = false;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => { links[0]?.focus(); }, 0);
  };
  const close = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
    toggle.focus();
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
  });
  closeBtn?.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  backdrop?.addEventListener('click', close);

  // Let default navigation proceed; just close the drawer too
  links.forEach(a => {
    a.addEventListener('click', () => { close(); }, { passive:true });
  });

  // Close on ESC or click outside panel
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', (e) => {
    if (!drawer.hidden && !e.target.closest('.mobile-nav-panel') && !e.target.closest('.nav-toggle')) close();
  });
})();

/* ===== Fixed header height compensation (robust) ===== */
(function(){
  const header = document.querySelector('header');
  if (!header) return;

  let lastH = 0;
  const setPad = () => {
    const h = Math.round(header.getBoundingClientRect().height);
    if (h !== lastH) {
      document.documentElement.style.setProperty('--header-h', h + 'px');
      document.body.style.paddingTop = h + 'px';
      lastH = h;
    }
  };

  setPad();
  window.addEventListener('resize', setPad);
  window.addEventListener('load', setPad);

  // Recalc if the wordmark loads later
  const logo = document.querySelector('.brand-wordmark');
  if (logo && !logo.complete) {
    logo.addEventListener('load', setPad, { once:true });
  }
})();
