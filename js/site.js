
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const rootPath = () => document.body.dataset.root || '.';
const asset = path => `${rootPath()}/${path}`.replace('/./','/');
const page = () => document.body.dataset.page || 'home';
const linkTo = slug => slug === 'home' ? `${rootPath()}/` : `${rootPath()}/${slug}/`;
const mapUrl = query => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const mapEmbed = query => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

function injectShell(site){
  const header = $('#site-header');
  const footer = $('#site-footer');
  const p = page();
  const nav = [
    ['home','Home'],['classes','Classes & timetable'],['about','About'],['gallery','Gallery'],['events','Events'],['contact','Contact']
  ];
  header.innerHTML = `<div class="container header-inner">
    <a class="brand" href="${linkTo('home')}" aria-label="CHeWs Dog Training home">
      <img src="${asset('assets/logo/chews-mark.png')}" alt=""><span class="brand-copy"><strong>CHeWs</strong><small>Dog Training</small></span>
    </a>
    <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">${nav.map(([slug,label])=>`<a class="${p===slug?'active':''}" href="${linkTo(slug)}">${label}</a>`).join('')}</nav>
    <a class="header-cta js-whatsapp" href="${esc(site.contact.whatsapp)}">Message Sarah →</a>
  </div>`;
  footer.innerHTML = `<div class="container footer-grid">
    <div class="footer-brand"><a class="brand" href="${linkTo('home')}"><img src="${asset('assets/logo/chews-mark.png')}" alt=""><span class="brand-copy"><strong>CHeWs</strong><small>Dog Training</small></span></a><p>${esc(site.brand.tagline)} in ${esc(site.brand.location)} using gentle, firm and reward-based methods.</p></div>
    <div><h4>Explore</h4><nav>${nav.slice(1).map(([slug,label])=>`<a href="${linkTo(slug)}">${label}</a>`).join('')}</nav></div>
    <div><h4>Contact</h4><div class="footer-links"><a href="tel:${esc(site.contact.phoneHref)}">${esc(site.contact.phoneDisplay)}</a><a href="${esc(site.contact.whatsapp)}">WhatsApp CHeWs</a>${(site.socials||[]).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div></div>
  </div><div class="container footer-bottom"><span>© <span id="year"></span> CHeWs Dog Training</span><span>Pet dog socialisation & training club · not a behaviourist service</span></div>`;
  const fab = $('#contact-fab-root');
  fab.innerHTML = `<div class="contact-fab-wrap"><div class="contact-panel" id="contact-panel" aria-hidden="true"><div class="contact-panel-head"><strong>Contact CHeWs</strong><button id="contact-close" aria-label="Close">×</button></div><a href="${esc(site.contact.whatsapp)}">WhatsApp Sarah</a><a href="tel:${esc(site.contact.phoneHref)}">Call ${esc(site.contact.phoneDisplay)}</a><a href="${linkTo('contact')}">Contact & venues</a></div><button class="contact-fab" id="contact-fab" aria-expanded="false">Contact us</button></div>`;
  if(site.notice?.enabled && site.notice.text){ const n=$('#site-notice'); n.hidden=false; n.textContent=site.notice.text; }
  $('#year').textContent = new Date().getFullYear();
  const menuBtn=$('#menu-toggle'), menu=$('#main-nav');
  menuBtn.addEventListener('click',()=>{const open=menuBtn.getAttribute('aria-expanded')==='true';menuBtn.setAttribute('aria-expanded',String(!open));menu.classList.toggle('open',!open)});
  const panel=$('#contact-panel'), btn=$('#contact-fab');
  const setPanel=open=>{panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));btn.setAttribute('aria-expanded',String(open))};
  btn.addEventListener('click',()=>setPanel(!panel.classList.contains('open'))); $('#contact-close').addEventListener('click',()=>setPanel(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setPanel(false)});
}

function renderStats(site){ const el=$('#stats-grid'); if(el) el.innerHTML=site.stats.map(x=>`<div class="stat"><strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join(''); }
function venueLookup(data,id){return data.venues.find(v=>v.id===id)}
function venueLegend(data){return `<div class="venue-legend">${data.venues.map(v=>`<span class="venue-key ${esc(v.tone)}"><i class="venue-dot"></i>${esc(v.name)}</span>`).join('')}</div>`}

function renderClassCards(data, target='#class-grid'){
  const el=$(target); if(!el)return;
  el.innerHTML=data.classTypes.map(item=>`<article class="class-card ${item.featured?'featured':''}"><span class="class-badge">${esc(item.badge)}</span><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="class-price"><strong>${esc(item.price)}</strong><span>${esc(item.detail)}</span></div></article>`).join('');
}
function renderVenueSchedule(data){
  const el=$('#venue-view'); if(!el)return;
  el.innerHTML=data.venues.map(v=>{const sessions=data.schedule.filter(s=>s.venueId===v.id);const days=[...new Set(sessions.map(s=>s.day))];return `<article class="venue-card tone-${esc(v.tone)}"><div class="venue-card-head"><div><span class="venue-label">${esc(v.label)}</span><h3>${esc(v.name)}</h3><p>${esc(v.address)}</p></div><a class="directions" target="_blank" rel="noopener" href="${mapUrl(v.mapsQuery)}">Directions ↗</a></div><div class="venue-day-grid">${days.map(day=>`<section class="venue-day"><h4>${esc(day)}</h4>${sessions.filter(s=>s.day===day).map(s=>`<div class="session ${s.featured?'puppy':''}"><time>${esc(s.time)}</time><strong>${esc(s.class)}</strong></div>`).join('')}</section>`).join('')}</div></article>`}).join('');
}
function renderDaySchedule(data){
  const el=$('#day-view'); if(!el)return; const days=['Monday','Tuesday','Wednesday'];
  el.innerHTML=`<div class="day-cards">${days.map(day=>`<article class="day-card"><h3>${day}</h3>${data.schedule.filter(s=>s.day===day).map(s=>{const v=venueLookup(data,s.venueId);return `<div class="day-session tone-${esc(v.tone)}"><time>${esc(s.time)}</time><span><strong>${esc(s.class)}</strong><small>${esc(v.shortName)}</small></span></div>`}).join('')}</article>`).join('')}</div>`;
}
function renderFees(data){const el=$('#fees-grid'); if(el)el.innerHTML=data.fees.map(x=>`<div class="fee"><span>${esc(x.label)}</span><strong>${esc(x.amount)}</strong><small>${esc(x.detail)}</small></div>`).join('')}
function renderMaps(data,target='#map-grid'){
  const el=$(target); if(!el)return; el.innerHTML=data.venues.map(v=>`<article class="map-card tone-${esc(v.tone)}"><div class="map-bar"><div><h3>${esc(v.name)}</h3><p>${esc(v.address)}</p></div><a class="directions" target="_blank" rel="noopener" href="${mapUrl(v.mapsQuery)}">Directions ↗</a></div><div class="map-frame"><span class="map-pin-label">${esc(v.label)}</span><iframe title="Map showing ${esc(v.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapEmbed(v.mapsQuery)}"></iframe></div></article>`).join('')
}
function setupScheduleSwitch(){ $$('.view-btn').forEach(btn=>btn.addEventListener('click',()=>{$$('.view-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$$('.schedule-view').forEach(v=>v.classList.toggle('active',v.id===`${btn.dataset.view}-view`))})) }
function renderTeam(team){const el=$('#team-grid');if(!el)return;el.innerHTML=team.map(p=>`<article class="profile-card"><div class="profile-visual">${p.photo?`<img src="${asset(p.photo)}" alt="${esc(p.name)}" style="object-position:${esc(p.photoPosition||'50% 35%')}">`:`<div class="profile-placeholder"><img src="${asset('assets/logo/chews-mark.png')}" alt=""><span>Profile photo can be added here</span></div>`}</div><div class="profile-copy"><span class="eyebrow">${esc(p.role)}</span><h3>${esc(p.name)}</h3><p>${esc(p.intro)}</p><p>${esc(p.detail)}</p><div class="chips">${p.chips.map(c=>`<span>${esc(c)}</span>`).join('')}</div></div></article>`).join('')}
function renderGallery(items){
  const tabs=$('#gallery-tabs'),grid=$('#gallery-grid');if(!tabs||!grid)return;const years=[...new Set(items.map(i=>i.year))].sort((a,b)=>b.localeCompare(a));
  const draw=year=>{grid.innerHTML=items.filter(i=>i.year===year).map(i=>`<figure class="gallery-item" data-src="${asset(i.src)}" data-alt="${esc(i.alt)}"><button class="gallery-open" type="button"><img loading="lazy" src="${asset(i.src)}" alt="${esc(i.alt)}"><span class="gallery-caption"><strong>${esc(i.caption)}</strong><small>${esc(i.category)} · ${esc(i.year)}</small></span></button></figure>`).join('');$$('.gallery-open',grid).forEach(b=>b.addEventListener('click',()=>{const f=b.closest('.gallery-item');$('#lightbox-img').src=f.dataset.src;$('#lightbox-img').alt=f.dataset.alt;$('#lightbox').showModal()}))};
  tabs.innerHTML=years.map((y,i)=>`<button class="gallery-tab ${i===0?'active':''}" data-year="${esc(y)}">${esc(y)}</button>`).join('');$$('.gallery-tab',tabs).forEach(t=>t.addEventListener('click',()=>{$$('.gallery-tab',tabs).forEach(x=>x.classList.remove('active'));t.classList.add('active');draw(t.dataset.year)}));if(years[0])draw(years[0]);
  $('#lightbox-close').addEventListener('click',()=>$('#lightbox').close());$('#lightbox').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close()});
}
function eventCard(e){const d=new Date(`${e.date}T12:00:00`);return `<article class="event-card"><div class="event-date"><span>${d.toLocaleDateString('en-GB',{month:'short'}).toUpperCase()}</span><strong>${d.getDate()}</strong></div><div class="event-copy"><h3>${esc(e.title)}</h3><p class="event-meta">${esc(e.time)}</p><p>${esc(e.description)}</p><p><strong>${esc(e.venue)}</strong><br>${esc(e.address)}</p></div></article>`}
function renderEvents(events){const up=$('#upcoming-events'),past=$('#past-events');if(!up)return;const today=new Date();today.setHours(0,0,0,0);const published=events.filter(e=>e.published).sort((a,b)=>a.date.localeCompare(b.date));const future=published.filter(e=>new Date(`${e.date}T00:00:00`)>=today),old=published.filter(e=>new Date(`${e.date}T00:00:00`)<today).reverse();up.innerHTML=future.length?future.map(eventCard).join(''):`<div class="empty-state"><strong>No upcoming events listed yet.</strong><br>New dates will appear here once added.</div>`;if(past)past.innerHTML=old.length?old.map(eventCard).join(''):`<div class="empty-state">No archived events yet.</div>`}

function renderSocials(site){
  const el=$('#contact-socials'); if(!el)return;
  el.innerHTML=(site.socials||[]).map(x=>`<a class="social-link ${esc(x.id)}" href="${esc(x.url)}" target="_blank" rel="noopener"><span class="social-icon">${x.id==='instagram'?'◎':'f'}</span><span><strong>${esc(x.label)}</strong><small>${esc(x.handle||'')}</small></span><b>↗</b></a>`).join('');
}
function renderContactVenues(data){const el=$('#contact-venues');if(!el)return;el.innerHTML=data.venues.map(v=>`<article class="detail-card"><div class="venue-line"><i class="venue-dot" style="background:var(--${v.tone==='teal'?'teal':'amber'})"></i><h3>${esc(v.name)}</h3></div><p>${esc(v.address)}</p><p style="margin-top:12px"><a class="directions" href="${mapUrl(v.mapsQuery)}" target="_blank" rel="noopener">Directions ↗</a></p></article>`).join('')}

async function init(){
  try{
    const site=await CHEWS_CONTENT.site(); injectShell(site); renderStats(site); renderSocials(site);
    const p=page();
    if(p==='home') { const [classes,events]=await Promise.all([CHEWS_CONTENT.classes(),CHEWS_CONTENT.events()]); renderClassCards(classes,'#class-grid'); const now=new Date();now.setHours(0,0,0,0);const next=events.filter(e=>e.published&&new Date(`${e.date}T00:00:00`)>=now).sort((a,b)=>a.date.localeCompare(b.date))[0];const slot=$('#next-event');if(slot)slot.innerHTML=next?eventCard(next):`<div class="empty-state">No upcoming event currently listed.</div>`; }
    if(p==='classes') { const data=await CHEWS_CONTENT.classes(); $('#venue-legend-root').innerHTML=venueLegend(data); renderClassCards(data); renderVenueSchedule(data); renderDaySchedule(data);renderFees(data);renderMaps(data);setupScheduleSwitch(); }
    if(p==='about'){ const team=await CHEWS_CONTENT.team(); renderTeam(team); }
    if(p==='gallery'){ const g=await CHEWS_CONTENT.gallery(); renderGallery(g); }
    if(p==='events'){ const e=await CHEWS_CONTENT.events(); renderEvents(e); }
    if(p==='contact'){ const c=await CHEWS_CONTENT.classes(); renderContactVenues(c);renderMaps(c,'#contact-map-grid'); }
  }catch(err){console.error(err);const el=$('#prototype-error');if(el){el.hidden=false;el.textContent='Prototype content could not load. Serve the folder via GitHub Pages or a local web server rather than opening HTML files directly.'}}
}
document.addEventListener('DOMContentLoaded',init);
