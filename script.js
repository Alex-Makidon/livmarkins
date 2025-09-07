
// Video splash logic
(function(){
  const splash = document.getElementById('splash');
  const vid = document.getElementById('splashVideo');
  if(!splash || !vid) return;
  const finish = () => splash.classList.add('hide');
  vid.addEventListener('ended', finish);
  setTimeout(finish, 7000);
  splash.addEventListener('click', finish);
  vid.addEventListener('error', () => setTimeout(finish, 1200));
})();

// Replace with your Formspree/Getform endpoint:
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
