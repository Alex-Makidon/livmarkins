/* ===== Splash (very compatible, v12) ===== */
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

  // Remove from layout after fade transition
  splash.addEventListener('transitionend', function (e) {
    if (e && e.target === splash && splash.classList.contains('hide')) {
      splash.style.display = 'none';
    }
  }, false);

  // Primary: end of video
  vid.addEventListener('ended', finish, false);

  // User actions
  splash.addEventListener('click', finish, false);
  window.addEventListener('keydown', function (e) { if (e && e.key === 'Escape') finish(); }, false);

  // Kick autoplay on mobile when user touches
  function tryPlay() {
    if (vid.paused) { try { vid.play(); } catch (e) {} }
    window.removeEventListener('pointerdown', tryPlay, false);
    window.removeEventListener('touchstart', tryPlay, false);
  }
  window.addEventListener('pointerdown', tryPlay, false);
  window.addEventListener('touchstart', tryPlay, false);

  // Failsafes
  var hardTimer = setTimeout(finish, 10000); // absolute max

  function setDurationTimer() {
    if (finished) return;
    clearTimeout(hardTimer);
    var dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 6;
    var ms = Math.min((dur * 1000) + 800, 10000);
    hardTimer = setTimeout(finish, ms);
  }

  if (isFinite(vid.duration) && vid.duration > 0) setDurationTimer();
  else vid.addEventListener('loadedmetadata', setDurationTimer, false);

  vid.addEventListener('error', function(){ setTimeout(finish, 1200); }, false);
  vid.addEventListener('stalled', function(){ setTimeout(finish, 2000); }, false);
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'visible' && !finished) tryPlay();
  }, false);
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
  }, false);
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

/* ===== Mobile burger nav ===== */
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
    try { toggle.focus(); } catch (e) {}
  }

  toggle.addEventListener('click', function(e){
    e.stopPropagation();
    (toggle.getAttribute('aria-expanded') === 'true') ? close() : open();
  }, false);

  if (closeBtn) closeBtn.addEventListener('click', function(e){ e.stopPropagation(); close(); }, false);
  if (backdrop) backdrop.addEventListener('click', close, false);

  links.forEach(function(a){ a.addEventListener('click', function(){ close(); }, false); });

  window.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); }, false);
  document.addEventListener('click', function(e){
    if (!drawer.hidden && !closest(e.target, '.mobile-nav-panel') && !closest(e.target, '.nav-toggle')) close();
  }, false);

  function closest(el, sel){
    while (el && el.nodeType === 1) { if (matches(el, sel)) return el; el = el.parentNode; }
    return null;
  }
  function matches(el, sel){
    var p = Element.prototype;
    var f = p.matches || p.msMatchesSelector || p.webkitMatchesSelector;
    return f.call(el, sel);
  }
})();

/* ===== Fixed header height compensation ===== */
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
  window.addEventListener('resize', setPad, false);
  window.addEventListener('load', setPad, false);

  var logo = document.querySelector('.brand-wordmark');
  if (logo && !logo.complete) logo.addEventListener('load', function(){ setPad(); }, false);
})();
