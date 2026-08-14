const VARIANTS={
  family:{label:'Family',prompt:'What’s happening right now?',actions:[['feed','Feed','timer'],['sleep','Sleep','timer'],['nappy','Nappy change','stamp'],['medicine','Medicine','stamp'],['play','Play','timer'],['outside','Outside','timer']]},
  enterprise:{label:'Enterprise',prompt:'What are you working on?',actions:[['start','Start work','stamp'],['project','Project / Job','timer'],['meeting','Meeting','timer'],['support','Support','timer'],['admin','Administration','timer'],['training','Training','timer'],['break','Break','timer'],['finish','Finish work','stamp']]},
  sport:{label:'Sport',prompt:'What are you doing in this session?',actions:[['warmup','Warm-up','timer'],['drill','Drill','timer'],['strength','Strength','timer'],['conditioning','Conditioning','timer'],['game','Match / Event','timer'],['recovery','Recovery','timer'],['hydration','Hydration','stamp'],['note','Session note','stamp']]}
};
const ICONS={
  timer:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5"/><path d="M9.5 2.8h5M12 5.5V3M12 13l3-2"/></svg>',
  stamp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>',
  finish:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7.5 12 3 3 6-7"/></svg>',
  trash:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4.5h6V7M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13"/></svg>'
};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let variant=localStorage.getItem('timestem.variant')||'enterprise';
let view=localStorage.getItem('timestem.view')||'today';
let ticker=null;
function key(){return `timestem.${variant}`}
function actionKey(){return `timestem.${variant}.actions`}
function load(){try{let s=JSON.parse(localStorage.getItem(key()))||{entries:[],activeTimers:[]};if(s.active&&!s.activeTimers){s.activeTimers=[s.active];delete s.active}if(!Array.isArray(s.entries))s.entries=[];if(!Array.isArray(s.activeTimers))s.activeTimers=[];return s}catch{return{entries:[],activeTimers:[]}}}
function save(s){localStorage.setItem(key(),JSON.stringify(s))}
function defaultActions(){return VARIANTS[variant].actions.map(a=>[...a])}
function loadActions(){try{let a=JSON.parse(localStorage.getItem(actionKey()));return Array.isArray(a)?a:defaultActions()}catch{return defaultActions()}}
function saveActions(actions){localStorage.setItem(actionKey(),JSON.stringify(actions))}
function now(){return Date.now()}
function fmtTime(v){return new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(v)}
function fmtDate(v){return new Intl.DateTimeFormat(undefined,{weekday:'short',day:'numeric',month:'short'}).format(v)}
function duration(ms){let m=Math.max(0,Math.round(ms/60000));return m<60?`${m} min`:`${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`}
function elapsed(ms){let sec=Math.max(0,Math.floor(ms/1000)),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`}
function sameDay(a,b){return new Date(a).toDateString()===new Date(b).toDateString()}
function startWeek(v=now()){let d=new Date(v),n=(d.getDay()+6)%7;d.setDate(d.getDate()-n);d.setHours(0,0,0,0);return d.getTime()}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function finishTimer(s,actionId,end=now()){let i=s.activeTimers.findIndex(x=>x.actionId===actionId);if(i<0)return null;let active=s.activeTimers[i],e={id:crypto.randomUUID(),actionId:active.actionId,label:active.label,mode:'timer',started:active.started,ended:end};s.entries.unshift(e);s.activeTimers.splice(i,1);return e}
function tap(action){let s=load(),t=now(),[id,label,mode]=action;if(mode==='stamp'){s.entries.unshift({id:crypto.randomUUID(),actionId:id,label,mode,started:t,ended:t})}else{let existing=s.activeTimers.find(x=>x.actionId===id);if(existing)finishTimer(s,id,t);else s.activeTimers.push({actionId:id,label,started:t})}save(s);render()}
function removeEntry(id){let s=load();s.entries=s.entries.filter(e=>e.id!==id);save(s);render()}
function setVariant(v){variant=v;localStorage.setItem('timestem.variant',v);document.body.dataset.variant=v;render()}
function setView(v){view=v;localStorage.setItem('timestem.view',v);render()}
function card(title,body=''){return `<section class="card empty-card"><div class="empty-icon">${ICONS.stamp}</div><div class="stack"><strong>${title}</strong>${body}</div></section>`}
function startTicker(){clearInterval(ticker);if(view!=='today')return;ticker=setInterval(()=>{$$('.elapsed-live').forEach(el=>{let started=Number(el.dataset.started);el.textContent=elapsed(now()-started)});},1000)}
function renderToday(main){
  let cfg=VARIANTS[variant],s=load(),actions=loadActions(),tpl=$('#today-template').content.cloneNode(true);main.appendChild(tpl);
  $('#variant-label').textContent=`TIMESTEM ${cfg.label.toUpperCase()}`;
  let h=new Date().getHours();$('#greeting').textContent=h<12?'Good morning':h<17?'Good afternoon':'Good evening';$('#prompt').textContent=cfg.prompt;
  if(s.activeTimers.length){
    $('#active-wrap').innerHTML=`<section class="active-section"><div class="section-head"><span>RUNNING NOW</span><small>${s.activeTimers.length} active</small></div><div class="active-list">${s.activeTimers.map(a=>`<article class="active-card"><div class="active-main"><div class="activity-icon live">${ICONS.timer}</div><div class="stack"><strong>${escapeHtml(a.label)}</strong><span class="muted">Started ${fmtTime(a.started)}</span></div></div><div class="active-actions"><strong class="elapsed-live" data-started="${a.started}">${elapsed(now()-a.started)}</strong><button class="finish-timer" data-id="${escapeHtml(a.actionId)}">${ICONS.finish}<span>Finish</span></button></div></article>`).join('')}</div></section>`;
    $$('.finish-timer').forEach(b=>b.onclick=()=>{let x=load();finishTimer(x,b.dataset.id);save(x);render()});
  }
  let grid=$('#action-grid');
  actions.forEach(a=>{let running=s.activeTimers.some(x=>x.actionId===a[0]),b=document.createElement('button');b.className='action-btn'+(running?' running':'');b.setAttribute('aria-pressed',running?'true':'false');b.innerHTML=`<span class="activity-icon">${ICONS[a[2]==='timer'?'timer':'stamp']}</span><span class="action-copy"><strong>${escapeHtml(a[1])}</strong><small>${a[2]==='timer'?(running?'Running · tap to stop':'Timer · tap to start'):'Timestamp · tap to record'}</small></span>${running?`<span class="running-badge"><i></i><span class="elapsed-live" data-started="${s.activeTimers.find(x=>x.actionId===a[0]).started}">${elapsed(now()-s.activeTimers.find(x=>x.actionId===a[0]).started)}</span></span>`:''}`;b.onclick=()=>tap(a);grid.appendChild(b)});
  let latest=s.entries.filter(e=>sameDay(e.started,now())).slice(0,4);
  $('#latest-wrap').innerHTML=latest.length?`<section><div class="section-head"><span>LATEST TODAY</span><button class="text-link" data-go-log>View timeline</button></div><div class="card log-list compact">${latest.map(e=>`<div class="log-row"><div class="activity-icon small">${ICONS[e.mode==='timer'?'timer':'stamp']}</div><div class="log-copy"><strong>${escapeHtml(e.label)}</strong><span class="muted">${fmtTime(e.started)}</span></div><strong>${e.ended>e.started?duration(e.ended-e.started):'Recorded'}</strong></div>`).join('')}</div></section>`:'';
  $('[data-go-log]')?.addEventListener('click',()=>setView('log'));
}
function renderLog(main){
  let s=load();main.innerHTML=`<section class="page-intro"><div><div class="eyebrow">${VARIANTS[variant].label.toUpperCase()} TIMELINE</div><h2>Your day, already captured.</h2><p>Review what happened without reconstructing it later.</p></div></section>`;
  let entries=s.entries;if(!entries.length){main.insertAdjacentHTML('beforeend',card('Nothing logged yet','<span class="muted">Timestamps and finished timers will appear here.</span>'));return}
  let wrap=document.createElement('section');wrap.className='timeline';entries.forEach(e=>{let row=document.createElement('article');row.className='timeline-row';row.innerHTML=`<div class="timeline-marker"><span>${ICONS[e.mode==='timer'?'timer':'stamp']}</span></div><div class="timeline-card"><div><strong>${escapeHtml(e.label)}</strong><div class="muted">${fmtDate(e.started)} · ${fmtTime(e.started)}${e.ended>e.started?` → ${fmtTime(e.ended)}`:''}</div></div><div class="timeline-meta"><strong>${e.ended>e.started?duration(e.ended-e.started):'Recorded'}</strong><button class="icon-action remove-entry" aria-label="Delete ${escapeHtml(e.label)}">${ICONS.trash}</button></div></div>`;row.querySelector('.remove-entry').onclick=()=>removeEntry(e.id);wrap.appendChild(row)});main.appendChild(wrap)
}
function renderSummary(main){
  let s=load(),start=startWeek(),end=start+7*86400000,entries=s.entries.filter(e=>e.started>=start&&e.started<end),totals={};entries.filter(e=>e.ended>e.started).forEach(e=>totals[e.label]=(totals[e.label]||0)+(e.ended-e.started));let total=Object.values(totals).reduce((a,b)=>a+b,0);
  let rows=Object.entries(totals).sort((a,b)=>b[1]-a[1]);
  main.innerHTML=`<section class="summary-hero"><div class="eyebrow">THIS WEEK · ${VARIANTS[variant].label.toUpperCase()}</div><div class="summary-number">${duration(total)}</div><p>${summaryCopy()}</p></section><section class="card summary-list">${rows.length?rows.map(([n,v])=>`<div class="summary-row"><div><strong>${escapeHtml(n)}</strong><div class="summary-track"><span style="width:${total?Math.max(8,(v/total)*100):0}%"></span></div></div><strong>${duration(v)}</strong></div>`).join(''):'<div class="empty-inline"><span class="activity-icon">${ICONS.timer}</span><span class="muted">No timed activity recorded this week.</span></div>'}</section><button class="primary wide" id="copy-summary">Copy weekly summary</button>`;
  $('#copy-summary').onclick=async()=>{let lines=[`TimeStem ${VARIANTS[variant].label} — Weekly Summary`,...rows.map(([n,v])=>`${n}: ${duration(v)}`),`Total tracked: ${duration(total)}`];try{await navigator.clipboard.writeText(lines.join('\n'));$('#copy-summary').textContent='✓ Summary copied'}catch{$('#copy-summary').textContent='Copy unavailable'}}
}
function summaryCopy(){if(variant==='enterprise')return 'A work log assembled from the moments you already captured.';if(variant==='family')return 'See where the week went without rebuilding it from memory.';return 'A simple picture of training time across the week.'}
function renderSettings(main){
  let actions=loadActions();main.innerHTML=`<section class="page-intro"><div><div class="eyebrow">SETTINGS</div><h2>Make TimeStem ${VARIANTS[variant].label} yours.</h2><p>Keep your most-used actions one tap away.</p></div></section><section class="settings-section"><div class="settings-heading"><div><strong>Quick activities</strong><p>Rename activities or choose whether each runs as a timer or records a timestamp.</p></div><button class="add-chip" id="add-action"><span>+</span> Add</button></div><div id="action-editor" class="action-editor"></div><button class="ghost-wide" id="reset-actions">Restore ${VARIANTS[variant].label} defaults</button></section><section class="settings-section"><div class="settings-heading"><div><strong>Appearance & data</strong><p>These preferences stay on this device.</p></div></div><div class="settings-row"><div><strong>Theme</strong><span class="muted">Light or dark appearance</span></div><button class="inline-control" id="settings-theme">${document.body.classList.contains('dark')?'Dark':'Light'}</button></div><div class="settings-row"><div><strong>Local data</strong><span class="muted">History for this mode only</span></div><button class="danger-link" id="clear-data">Clear data</button></div></section><div class="privacy-note">TimeStemWeb stores generic activity data locally in this browser. No credentials, private enterprise logic or protected backend IP are included in the public client.</div>`;
  let editor=$('#action-editor');
  function draw(){editor.innerHTML='';actions.forEach((a,i)=>{let row=document.createElement('article');row.className='edit-row';row.innerHTML=`<div class="edit-top"><span class="activity-icon small">${ICONS[a[2]==='timer'?'timer':'stamp']}</span><input class="action-name" value="${escapeHtml(a[1])}" aria-label="Activity name"><button class="icon-action remove-action" aria-label="Remove ${escapeHtml(a[1])}">${ICONS.trash}</button></div><div class="mode-toggle" role="group" aria-label="Activity type"><button type="button" class="mode-pill ${a[2]==='timer'?'active':''}" data-mode="timer">${ICONS.timer}<span>Timer</span></button><button type="button" class="mode-pill ${a[2]==='stamp'?'active':''}" data-mode="stamp">${ICONS.stamp}<span>Timestamp</span></button></div>`;let input=row.querySelector('input');input.onchange=()=>{actions[i][1]=input.value.trim()||'Untitled';saveActions(actions)};row.querySelectorAll('.mode-pill').forEach(btn=>btn.onclick=()=>{actions[i][2]=btn.dataset.mode;saveActions(actions);draw()});row.querySelector('.remove-action').onclick=()=>{actions.splice(i,1);saveActions(actions);draw()};editor.appendChild(row)})}
  draw();
  $('#add-action').onclick=()=>{actions.push([`custom-${crypto.randomUUID()}`,'New activity','stamp']);saveActions(actions);draw();setTimeout(()=>editor.lastElementChild?.querySelector('input')?.focus(),0)};
  $('#reset-actions').onclick=()=>{actions=defaultActions();saveActions(actions);draw()};
  $('#settings-theme').onclick=()=>toggleTheme();
  $('#clear-data').onclick=()=>{if(confirm(`Clear all ${VARIANTS[variant].label} browser data?`)){localStorage.removeItem(key());render()}}
}
function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem('timestem.dark',document.body.classList.contains('dark')?'1':'0');$('#settings-theme')&&( $('#settings-theme').textContent=document.body.classList.contains('dark')?'Dark':'Light')}
function render(){
  clearInterval(ticker);document.body.dataset.variant=variant;
  $$('.variant-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.variant===variant));
  $$('.bottom-nav button').forEach(b=>{let active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false')});
  $('#page-title').textContent=variant==='enterprise'?'Every tap builds your workday.':'Every tap builds your day.';
  let main=$('#main');main.innerHTML='';({today:renderToday,log:renderLog,summary:renderSummary,settings:renderSettings}[view]||renderToday)(main);startTicker()
}
$$('.variant-switcher button').forEach(b=>b.onclick=()=>setVariant(b.dataset.variant));
$$('.bottom-nav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#theme-toggle').onclick=toggleTheme;
if(localStorage.getItem('timestem.dark')==='1')document.body.classList.add('dark');
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();