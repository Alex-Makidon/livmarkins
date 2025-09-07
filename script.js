
// Video splash logic
(function () {
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');
  if (!splash || !vid) return;

  const finish = () => {
    // guard against multiple calls
    if (!splash.classList.contains('hide')) splash.classList.add('hide');
  };

  // Hide when video ends
  vid.addEventListener('ended', finish);

  // Let users skip
  splash.addEventListener('click', finish);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });

  // If autoplay was blocked, try playing on first interaction
  const tryPlay = () => {
    if (vid.paused) {
      vid.play().catch(() => {/* ignore */});
    }
    window.removeEventListener('pointerdown', tryPlay, { passive: true });
  };
  window.addEventListener('pointerdown', tryPlay, { passive: true });

  // Safety timeout based on actual duration (fallbacks included)
  let safetyTimer = setTimeout(finish, 9000); // generic fallback
  const setDurationTimer = () => {
    clearTimeout(safetyTimer);
    const dur = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 6; // seconds
    // give it a small buffer, but cap at 12s
    const ms = Math.min((dur * 1000) + 800, 12000);
    safetyTimer = setTimeout(finish, ms);
  };
  if (isFinite(vid.duration) && vid.duration > 0) {
    setDurationTimer();
  } else {
    vid.addEventListener('loadedmetadata', setDurationTimer, { once: true });
  }

  // If the video errors or stalls badly, hide quickly
  vid.addEventListener('error', () => setTimeout(finish, 1200), { once: true });
})();// Replace with your Formspree/Getform endpoint:
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
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept':'application/json' },
        body: data
      });
      if (res.ok){
        status.className = "notice success";
        status.textContent = "Thanks! Your request has been sent. We'll reach out within one business day.";
        form.reset();
      } else {
        const msg = await res.json().catch(()=>({}));
        status.className = "notice alert";
        status.textContent = (msg && msg.errors && msg.errors[0] && msg.errors[0].message) || "Something went wrong. Please try again or call us.";
      }
    } catch(err){
      status.className = "notice alert";
      status.textContent = "Network error. Please try again or call us.";
    }
  });
}

// Load resources.json
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
