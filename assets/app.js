const $ = (s) => document.querySelector(s);
const content = $('#content');
const toc = $('#toc');

const groups = [
  ['Getting Started', ['What is system design?']],
  ['Chapter I · Foundations', ['IP','OSI Model','TCP and UDP','Domain Name System (DNS)','Load Balancing','Clustering','Caching','Content Delivery Network (CDN)','Proxy','Availability','Scalability','Storage']],
  ['Chapter II · Data', ['Databases and DBMS','SQL databases','NoSQL databases','SQL vs NoSQL databases','Database Replication','Indexes','Normalization and Denormalization','ACID and BASE consistency models','CAP theorem','PACELC Theorem','Transactions','Distributed Transactions','Sharding','Consistent Hashing','Database Federation']],
  ['Chapter III · Architecture', ['N-tier architecture','Message Brokers','Message Queues','Publish-Subscribe','Enterprise Service Bus (ESB)','Monoliths and Microservices','Event-Driven Architecture (EDA)','Event Sourcing','Command and Query Responsibility Segregation (CQRS)','API Gateway','REST, GraphQL, gRPC','Long polling, WebSockets, Server-Sent Events (SSE)']],
  ['Chapter IV · Production', ['Geohashing and Quadtrees','Circuit breaker','Rate Limiting','Service Discovery','SLA, SLO, SLI','Disaster recovery','Virtual Machines (VMs) and Containers','OAuth 2.0 and OpenID Connect (OIDC)','Single Sign-On (SSO)','SSL, TLS, mTLS']],
  ['Chapter V · Case Studies', ['System Design Interviews','URL Shortener','WhatsApp','Twitter','Netflix','Uber']],
  ['Appendix', ['Next Steps','References']]
];

const slug = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function buildNav() {
  const headings = [...content.querySelectorAll('h1,h2,h3')];
  toc.innerHTML = '';
  headings.forEach((h, i) => {
    if (!h.id) h.id = slug(h.textContent) || `section-${i}`;
  });
  groups.forEach(([group, items]) => {
    const label = document.createElement('div'); label.className='group'; label.textContent=group; toc.appendChild(label);
    items.forEach(name => {
      const h = headings.find(x => x.textContent.trim().toLowerCase() === name.toLowerCase());
      if (!h) return;
      const a = document.createElement('a'); a.href='#'+h.id; a.textContent=name; a.dataset.target=h.id;
      a.addEventListener('click',()=>$('#sidebar').classList.remove('open'));
      toc.appendChild(a);
    });
  });
  setupObserver(headings);
  updateProgress();
}

function setupObserver(headings) {
  const links = [...toc.querySelectorAll('a')];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ links.forEach(a=>a.classList.toggle('active',a.dataset.target===e.target.id)); } });
  }, {rootMargin:'-15% 0px -70% 0px'});
  headings.forEach(h=>obs.observe(h));
}

function updateProgress(){
  const headings=[...content.querySelectorAll('h1,h2,h3')];
  const seen = headings.filter(h=>h.getBoundingClientRect().top < window.innerHeight*.55).length;
  const pct=headings.length?Math.min(100,Math.round(seen/headings.length*100)):0;
  $('#progressText').textContent=pct+'%'; $('#progressBar').style.width=pct+'%';
  $('#mobileProgressText').textContent=pct+'%'; $('#mobileProgressBar').style.width=pct+'%';
  $('#progressMeta').textContent=`${seen} of ${headings.length} sections read`;
}

async function load(){
  try{
    const r=await fetch('./README.md');
    if(!r.ok) throw new Error('README unavailable');
    const md=await r.text();
    marked.setOptions({headerIds:false, mangle:false});
    content.innerHTML=DOMPurify.sanitize(marked.parse(md));
    buildNav();
  }catch(e){
    content.innerHTML=`<h2>Couldn’t load the course</h2><p>Open the <a href="./README.md">README.md</a> directly, or refresh the page.</p>`;
  }
}

$('#searchInput').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  [...toc.querySelectorAll('a')].forEach(a=>a.style.display=(!q||a.textContent.toLowerCase().includes(q))?'block':'none');
});

document.addEventListener('keydown',e=>{if(e.key==='/' && document.activeElement!==$('#searchInput')){e.preventDefault();$('#searchInput').focus()}});
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('light'); localStorage.setItem('sd-theme',document.body.classList.contains('light')?'light':'dark')});
if(localStorage.getItem('sd-theme')==='light')document.body.classList.add('light');
$('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.add('open'));
$('#closeMenu').addEventListener('click',()=>$('#sidebar').classList.remove('open'));
window.addEventListener('scroll',updateProgress,{passive:true});
load();
