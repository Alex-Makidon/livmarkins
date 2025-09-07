
// Splash logic (uses separate images: assets/logo_name.png + assets/logo_branch.png)
(function(){
  const splash = document.getElementById('splash');
  if(!splash) return;
  const finish = () => splash.classList.add('hide');
  setTimeout(finish, 1800); // allow animations to run
  splash.addEventListener('click', finish); // allow skip on click/tap
})();

// Replace with your Formspree/Getform endpoint so the form emails owners:
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

// Render resources list if resources.json exists
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
