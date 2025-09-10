/* ===== Splash (home-only; safe; short timeout) v13 ===== */
(function () {
  var splash = document.getElementById('splash');
  var vid = document.getElementById('splashVideo');
  if (!splash || !vid) return;

  var path = location.pathname || "/";
  var onHome = /(?:^|\/)(index\.html)?$/.test(path);
  if (!onHome || document.body.classList.contains('no-splash')) {
    splash.classList.add('hide'); splash.style.display = 'none';
    return;
  }

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    if (!splash.classList.contains('hide')) splash.classList.add('hide');
  }
  splash.addEventListener('transitionend', function (e) {
    if (e && e.target === splash && splash.classList.contains('hide')) {
      splash.style.display = 'none';
    }
  }, false);
  vid.addEventListener('ended', finish, false);
  splash.addEventListener('click', finish, false);
  window.addEventListener('keydown', function (e) { if (e && e.key === 'Escape') finish(); }, false);

  function tryPlay(){ if (vid.paused) { try { vid.play(); } catch(e){} } }
  window.addEventListener('pointerdown', tryPlay, false);
  window.addEventListener('touchstart', tryPlay, false);

  var hardTimer = setTimeout(finish, 5000);
  function setDurationTimer() {
    if (finished) return;
    clearTimeout(hardTimer);
    var dur = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : 4;
    var ms = Math.min((dur * 1000) + 400, 6000);
    hardTimer = setTimeout(finish, ms);
  }
  if (isFinite(vid.duration) && vid.duration > 0) setDurationTimer();
  else vid.addEventListener('loadedmetadata', setDurationTimer, false);
  vid.addEventListener('error', function(){ setTimeout(finish, 800); }, false);
})();