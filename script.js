/* ===== Splash ===== */
/* ===== Splash (iOS-safe) ===== */
(function () {
  var splash = document.getElementById('splash');
  var vid = document.getElementById('splashVideo');
  if (!splash || !vid) return;

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    if (!splash.classList.contains('hide')) splash.classList.add('hide');
  }

  // Primary: end of video
  vid.addEventListener('ended', finish);

  // User actions
  splash.addEventListener('click', finish);
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });

  // Try to kick autoplay on iOS when user touches
  function tryPlay() {
    if (vid.paused) { try { vid.play(); } catch (e) {} }
    window.removeEventListener('pointerdown', tryPlay);
    window.removeEventListener('touchstart', tryPlay);
  }
  window.addEventListener('pointerdown', tryPlay, false);
  window.addEventListener('touchstart', tryPlay, false);

  // Failsafes:
  // 1) Absolute max timeout: 10s
  var hardTimer = setTimeout(finish, 10000);

  // 2) If metadata loads, wait for (duration + 800ms) capped at 10s
  function setDurationTimer() {
    if (finished) return;
    clearTimeout(hardTimer);
    var dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 6;
    var ms = Math.min((dur * 1000) + 800, 10000);
    hardTimer = setTimeout(finish, ms);
  }

  if (isFinite(vid.duration) && vid.duration > 0) setDurationTimer();
  else vid.addEventListener('loadedmetadata', setDurationTimer, { once: true });

  // 3) If the video errors/stalls, hide quickly
  vid.addEventListener('error', function(){ setTimeout(finish, 1200); }, { once: true });
  vid.addEventListener('stalled', function(){ setTimeout(finish, 2000); });
  vid.addEventListener('waiting', function(){ /* just keep hardTimer */ });

  // 4) If tab becomes visible again later, ensure we don't linger
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'visible' && !finished) {
      // Kick playback; if it still won't play, hardTimer will fire
      tryPlay();
    }
  });
})();

/* ===== Formspree ===== */
var FORMSPREE_ENDPOINT = "https://formspree.io/f/your-form-id";
(function(){
  var form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var status = document.getElementById('form-status');
    status.className = "notice";
    status.textContent = "Submitting...";
    status.classList.remove('hidden');
    var data = new FormData(form);

    fetch(FORMSPREE_ENDPOINT, { method: 'POST', headers: { 'Accept':'application/json' }, body: data })
      .then(function(res){
        if (res.ok) {
          status.className = "notice success";
          status.textContent = "Thanks! Your request has been sent. We'll reach out within one business day.";
          form.reset();
        } else {
          return res.json().then(function(msg){
            status.className = "notice alert";
            status.textContent = (msg && msg.errors && msg.errors[0] && msg.errors[0].message) || "Something went wrong. Please try again or call us.";
          }).catch(function(){
            status.className = "notice alert";
            status.textContent = "Something went wrong. Please try again or call us.";
          });
        }
      })
      .catch(function(){
        status.className = "notice alert";
        status.textContent = "Network error. Please try again or call us.";
      });
  });
})();

/* ===== Resources loader ===== */
(function(){
  var list = document.getElementById('pdfList');
  if (!list) return;

  fetch('assets/resources.json')
    .then(function(res){ if (!res.ok) throw new Error('no'); return res.json(); })
    .then(function(items){
      if (!items || !items.length) {
        list.innerHTML = '<div class="muted">No resources yet. Check back soon.</div>';
        return;
      }
      var html = items.map(function(item){
        return '<div class="card">'
          + '<h3>' + (item.title || 'Document') + '</h3>'
          + '<p class="muted">' + (item.description || '') + '</p>'
          + '<a class="button" href="' + item.href + '" download>Download PDF</a>'
          + '</div>';
      }).join('');
      list.innerHTML = html;
    })
    .catch(function(){
      list.innerHTML = '<div class="muted">No resources yet. Check back soon.</div>';
    });
})();

/* ===== Mobile burger nav (ES5-safe) ===== */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('mobileNav');
  if (!toggle || !drawer) return;

  var closeBtn = drawer.querySelector('.nav-close');
  var backdrop = drawer.querySelector('.mobile-nav-backdrop');
  var links = Array.prototype.slice.call(drawer.querySelectorAll('a'));

  function open() {
    drawer.hidden = false;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(function(){ if (links[0]) links[0].focus(); }, 0);
  }
  function close() {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;
    toggle.focus();
  }

  toggle.addEventListener('click', function(e){
    e.stopPropagation();
    (toggle.getAttribute('aria-expanded') === 'true') ? close() : open();
  });

  if (closeBtn) closeBtn.addEventListener('click', function(e){ e.stopPropagation(); close(); });
  if (backdrop) backdrop.addEventListener('click', close);

  // Let navigation proceed; just close the drawer too
  links.forEach(function(a){
    a.addEventListener('click', function(){ close(); }, false);
  });

  // Close on ESC or clicking outside panel
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  document.addEventListener('click', function(e){
    if (!drawer.hidden && !closest(e.target, '.mobile-nav-panel') && !closest(e.target, '.nav-toggle')) close();
  });

  // Tiny helper for closest in ES5
  function closest(el, sel){
    while (el && el.nodeType === 1) {
      if (matches(el, sel)) return el;
      el = el.parentNode;
    }
    return null;
  }
  function matches(el, sel){
    var p = Element.prototype;
    var f = p.matches || p.msMatchesSelector || p.webkitMatchesSelector;
    return f.call(el, sel);
  }
})();

/* ===== Fixed header height compensation (ES5-safe) ===== */
(function(){
  var header = document.querySelector('header');
  if (!header) return;

  var lastH = 0;
  function setPad(){
    var rect = header.getBoundingClientRect();
    var h = Math.round(rect.height || 0);
    if (h !== lastH) {
      document.documentElement.style.setProperty('--header-h', h + 'px');
      document.body.style.paddingTop = h + 'px';
      lastH = h;
    }
  }

  setPad();
  window.addEventListener('resize', setPad);
  window.addEventListener('load', setPad);

  var logo = document.querySelector('.brand-wordmark');
  if (logo && !logo.complete) logo.addEventListener('load', function(){ setPad(); }, { once: true });
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
index.html (v10)
html
Copy code
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>LivMarkins Insurance — Coverage with Clarity</title>
  <meta name="description" content="LivMarkins Insurance offers Health, Life, Home, Auto, Trucking, and Tower Climber coverage with personalized service."/>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="LivMarkins Insurance">
  <meta property="og:title" content="LivMarkins Insurance — Coverage with Clarity">
  <meta property="og:description" content="Helping families and businesses protect what matters — Health, Life, Home & Auto, Trucking, and Tower Climbers coverage.">
  <meta property="og:url" content="https://alex-makidon.github.io/livmarkins/">
  <meta property="og:image" content="https://alex-makidon.github.io/livmarkins/assets/share-image.png?v=10">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="LivMarkins Insurance — Coverage with Clarity">
  <meta name="twitter:description" content="Helping families and businesses protect what matters most.">
  <meta name="twitter:image" content="https://alex-makidon.github.io/livmarkins/assets/share-image.png?v=10">

  <link rel="icon" type="image/png" href="assets/favicon.png?v=10">
  <link rel="stylesheet" href="styles.css?v=10"/>
</head>
<body>
  <!-- Splash -->
  <div id="splash" class="splash" aria-hidden="true">
    <div class="splash-video-wrap">
      <video id="splashVideo" class="splash-video" autoplay muted playsinline preload="metadata" poster="assets/splash_poster.jpg">
        <source src="assets/splash.webm" type="video/webm"/>
        <source src="assets/splash.mp4" type="video/mp4"/>
        <img src="assets/logo.png" alt="">
      </video>
      <noscript><img src="assets/splash_poster.jpg" alt="LivMarkins splash"></noscript>
    </div>
  </div>

  <!-- Header (hidden during splash via CSS) -->
  <header>
    <div class="container nav">
      <div class="brand">
        <img src="assets/logo_name.png?v=10" alt="LivMarkins" class="brand-wordmark"/>
      </div>

      <nav class="nav-desktop" aria-label="Primary">
        <ul>
          <li><a href="index.html" class="active" aria-current="page">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="resources.html">Forms&nbsp;&amp;&nbsp;Resources</a></li>
        </ul>
      </nav>

      <button class="nav-toggle" aria-label="Open menu" aria-controls="mobileNav" aria-expanded="false">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </button>
    </div>

    <!-- Mobile drawer -->
    <div id="mobileNav" class="mobile-nav" hidden>
      <div class="mobile-nav-panel">
        <button class="nav-close" aria-label="Close menu">✕</button>
        <ul>
          <li><a href="index.html" aria-current="page">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="resources.html">Forms &amp; Resources</a></li>
        </ul>
      </div>
      <div class="mobile-nav-backdrop"></div>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-inner">
      <div>
        <img src="assets/logo.png" alt="LivMarkins Insurance" class="hero-full-logo"/>
        <h1>Coverage that fits your life.</h1>
        <p>LivMarkins Insurance helps families and businesses protect what matters—without the jargon.
           Health, Life, Home & Auto, Trucking, and specialized coverage for Tower Climbers.</p>
        <div class="cta">
          <a class="button" href="#quote">Get a Quote</a>
          <a class="button secondary" href="about.html">About Us</a>
        </div>
      </div>

      <aside class="card accordion-panel" aria-label="Why Insurance">
        <span class="badge">Why Insurance?</span>
        <p>Insurance transfers risk—from you to your carrier—so one unexpected event doesn’t become a financial crisis.
           The right policy provides predictable costs, legal compliance, and peace of mind.</p>

        <details open>
          <summary>Health</summary>
          <p>From preventive care to major medical events, the right plan keeps costs predictable and access consistent.</p>
        </details>
        <details>
          <summary>Life</summary>
          <p>Protect your family or partners with income replacement, debt coverage, and legacy planning.</p>
        </details>
        <details>
          <summary>Home & Auto</summary>
          <p>Home policies cover dwelling, personal property, and liability. Auto policies protect against collision,
             comprehensive, and liability events.</p>
        </details>
        <details>
          <summary>Trucking</summary>
          <p>Meets federal/state requirements and protects your rig, cargo, and liability exposures—vital for owner-operators and fleets.</p>
        </details>
        <details>
          <summary>Tower Climbers</summary>
          <p>Specialized coverage for high-risk work: workers’ comp, general liability, inland marine, and equipment.</p>
        </details>
      </aside>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2>What we insure</h2>
      <div class="grid ins-list" role="list">
        <div class="card" role="listitem"><h3>Health</h3><p>Plans for individuals, families, and small businesses.</p></div>
        <div class="card" role="listitem"><h3>Life</h3><p>Term and whole life options for income protection and legacy.</p></div>
        <div class="card" role="listitem"><h3>Home</h3><p>Protection for your home, belongings, and personal liability.</p></div>
        <div class="card" role="listitem"><h3>Auto</h3><p>Liability, collision, comprehensive, and more—built around your driving needs.</p></div>
        <div class="card" role="listitem"><h3>Trucking</h3><p>Primary liability, physical damage, cargo, and non-trucking liability.</p></div>
        <div class="card" role="listitem"><h3>Tower Climbers</h3><p>Tailored coverage for high-risk operations and equipment.</p></div>
      </div>
    </div>
  </section>

  <section id="quote" class="section">
    <div class="container">
      <h2>Get a Quote</h2>
      <p class="muted">Complete this form and our team will follow up within one business day.</p>
      <div id="form-status" class="notice hidden" role="status" aria-live="polite"></div>

      <form id="quoteForm" action="https://formspree.io/f/your-form-id" method="POST" novalidate>
        <div class="form-row">
          <div class="input">
            <label for="name">Full Name *</label>
            <input id="name" name="name" type="text" required autocomplete="name"/>
          </div>
          <div class="input">
            <label for="phone">Phone *</label>
            <input id="phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" pattern="^[0-9()+\\-.\\s]{7,}$"/>
          </div>
        </div>
        <div class="form-row">
          <div class="input">
            <label for="email">Email *</label>
            <input id="email" name="email" type="email" required autocomplete="email" inputmode="email"/>
          </div>
          <div class="input">
            <label for="type">Insurance Type *</label>
            <select id="type" name="insurance_type" required>
              <option value="">Select one</option>
              <option>Health</option>
              <option>Life</option>
              <option>Home</option>
              <option>Auto</option>
              <option>Trucking</option>
              <option>Tower Climbers</option>
            </select>
          </div>
        </div>
        <div class="input">
          <label for="message">Notes</label>
          <textarea id="message" name="message" rows="4" placeholder="Tell us a bit about your needs (drivers, property, business, etc.)"></textarea>
        </div>
        <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">
        <button class="button" type="submit">Submit</button>
      </form>

      <p class="muted" style="margin-top:8px">Prefer phone? Call <a href="tel:+12155155975"><strong>215-515-5975</strong></a>.</p>
    </div>
  </section>

  <footer>
    <div class="container footer-grid">
      <div>
        <div class="brand" style="margin-bottom:10px"><strong>LivMarkins Insurance</strong></div>
        <div class="muted">Phone: <a href="tel:+12155155975">215-515-5975</a><br/><a href="https://livmarkins.com">livmarkins.com</a></div>
      </div>
      <div>
        <strong>Lines We Cover</strong>
        <ul class="muted">
          <li>Health</li><li>Life</li><li>Home &amp; Auto</li><li>Trucking</li><li>Tower Climbers</li>
        </ul>
      </div>
      <div>
        <strong>Company</strong>
        <ul class="muted">
          <li><a href="about.html">About Us</a></li>
          <li><a href="resources.html">Forms &amp; Resources</a></li>
        </ul>
      </div>
    </div>
    <div class="container"><small>© <span id="year"></span> LivMarkins Insurance. All rights reserved.</small></div>
  </footer>

  <script>document.getElementById('year').textContent=new Date().getFullYear()</script>
  <script src="script.js?v=10" defer></script>
</body>
</html>

// After calling finish(), remove splash from layout once fade completes
splash.addEventListener('transitionend', function (e) {
  if (e.target === splash && splash.classList.contains('hide')) {
    splash.style.display = 'none';
  }
}, false);
