(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const invite = 'https://chat.whatsapp.com/DScUdJlVTf11HXQwdzAbPg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storage = {get(key, fallback) {try {return JSON.parse(localStorage.getItem('tech-orbit-' + key)) ?? fallback;} catch {return fallback;}}, set(key, value) {try {localStorage.setItem('tech-orbit-' + key, JSON.stringify(value));return true;} catch {return false;}}};
  async function copy(text, status) {
    try {if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent = 'Copied. Ready to share when you choose.';} catch {status.textContent = 'Copying is unavailable here. Select and copy the draft text instead.';}
  }
  const menu = $('.menu-toggle'), nav = $('#main-navigation');
  function closeMenu(returnFocus=false) {menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');nav.classList.remove('is-open');if(returnFocus)menu.focus();}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('is-open',open);});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')closeMenu(true);});
  document.addEventListener('click',e=>{if(menu.getAttribute('aria-expanded')==='true'&&!e.target.closest('header'))closeMenu();});
  matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
  $('#share-button').addEventListener('click',()=>copy('Join Tech Orbit Hub — learn, build, and grow together. '+invite,$('#share-status')));
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('js-motion');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.04});
    $$('.reveal').forEach(el=>observer.observe(el));
    reduced.addEventListener('change',e=>{if(e.matches)document.documentElement.classList.remove('js-motion');});
  }
  const ticker=$('.ticker-track');
  if(ticker&&!reduced.matches){const clone=document.createElement('span');clone.className='ticker-copy';clone.setAttribute('aria-hidden','true');[...ticker.children].forEach(el=>clone.append(el.cloneNode(true)));ticker.append(clone);}
  let scrollQueued=false;
  function progress(){const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--progress',max>0?String(scrollY/max):'0');scrollQueued=false;}
  addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress,{passive:true});progress();
  const heroArt=$('.hero-art');
  if(heroArt&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduced.matches){heroArt.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=heroArt.getBoundingClientRect();heroArt.style.setProperty('--art-rotation',((e.clientX-r.left)/r.width-.5)*3+'deg');});heroArt.addEventListener('pointerleave',()=>heroArt.style.setProperty('--art-rotation','0deg'));}
  const recommendations={build:['Builders','Start with a small project, a clear question, or a demo you’d like feedback on.'],learn:['Learning Circle','Share what you’re learning and a focused question. Beginners are welcome.'],connect:['General','Introduce yourself and join a conversation beyond your usual field.'],updates:['Announcements','Follow community updates and confirmed plans shared by the admins.']};
  $$('[data-intent]').forEach(b=>b.addEventListener('click',()=>{const [circle,description]=recommendations[b.dataset.intent];$$('[data-intent]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));const output=$('#circle-recommendation');output.replaceChildren();const strong=document.createElement('strong');strong.textContent=circle+' is a good place to start. ';output.append(strong,document.createTextNode(description));}));
  const saved=new Set(storage.get('saved-projects',[]));
  const filters=[];
  $$('[data-filter-group]').forEach(group=>{
    const name=group.dataset.filterGroup,list=$('[data-filter-list="'+name+'"]'),cards=[...list.querySelectorAll('article')];let selected='all';
    const search=group.querySelector('[data-search]'),buttons=[...group.querySelectorAll('[data-filter]')];
    const refresh=()=>{const term=search.value.trim().toLowerCase();let count=0;cards.forEach(card=>{const category=selected==='all'||(selected==='saved'?saved.has(card.dataset.projectId):card.dataset.category===selected);const match=category&&card.textContent.toLowerCase().includes(term);card.hidden=!match;if(match){count++;card.classList.add('is-visible');}});group.querySelector('.result-count').textContent=count+' '+(name==='lessons'?'starter guide':'starter idea')+(count===1?'':'s');$('[data-empty="'+name+'"]').hidden=count!==0;};
    buttons.forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.filter;buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));refresh();}));search.addEventListener('input',refresh);filters.push(refresh);
  });
  $$('[data-save]').forEach(b=>{const card=b.closest('[data-project-id]'),id=card.dataset.projectId,title=card.querySelector('h3').textContent;function render(){const active=saved.has(id);b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',(active?'Unsave ':'Save ')+title);b.textContent=active?'✓ Saved idea':'＋ Save idea';}render();b.addEventListener('click',()=>{if(saved.has(id))saved.delete(id);else saved.add(id);const retained=storage.set('saved-projects',[...saved]);render();if(!retained)card.querySelector('.copy-status').textContent='Saved for this visit. Browser storage is unavailable.';filters.forEach(refresh=>refresh());});});
  $$('[data-copy-brief]').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('article');copy(card.querySelector('h3').textContent+'\n\n'+card.querySelector('.brief').innerText,card.querySelector('.copy-status'));}));
  $$('[data-copy-target]').forEach(b=>b.addEventListener('click',()=>copy($('#'+b.dataset.copyTarget).textContent,b.parentElement.closest('[id$="-output"]').querySelector('.copy-status'))));
  $$('[data-checklist]').forEach(list=>{const key='checklist-'+list.dataset.checklist,inputs=[...list.querySelectorAll('input')],stored=new Set(storage.get(key,[]));inputs.forEach(i=>{i.checked=stored.has(i.value);});const status=list.querySelector('.checklist-status');const refresh=(persist=false)=>{const checked=inputs.filter(i=>i.checked);status.textContent=checked.length+' of '+inputs.length+' completed';if(persist&&!storage.set(key,checked.map(i=>i.value)))status.textContent+=' — progress kept for this visit.';};inputs.forEach(i=>i.addEventListener('change',()=>refresh(true)));list.querySelector('[data-reset-checklist]').addEventListener('click',()=>{inputs.forEach(i=>{i.checked=false;});refresh(true);});refresh();});
  const meeting=$('#meeting-form');
  if(meeting)meeting.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(meeting),minutes=Number(data.get('duration')),topic=String(data.get('topic')).trim();if(!topic){meeting.elements.topic.setCustomValidity('Please enter a topic.');meeting.elements.topic.reportValidity();return;}meeting.elements.topic.setCustomValidity('');const discussion=minutes===30?10:15,main=minutes-10-discussion;$('#meeting-draft').textContent='Tech Orbit gathering suggestion\n\nTopic: '+topic+'\nFormat: '+data.get('format')+'\nMeet: '+data.get('mode')+'\nDuration: '+minutes+' minutes\nDate and joining details: to agree with admins\n\nDraft agenda\n• 5 min — Welcome and the session goal\n• '+main+' min — Explore the topic or show a demo\n• '+discussion+' min — Questions, discussion, or a practical activity\n• 5 min — Recap and one next step\n\nWho would like to help shape this session?';$('#meeting-output').hidden=false;$('#meeting-output .copy-status').textContent='';});
  if(meeting)meeting.elements.topic.addEventListener('input',()=>meeting.elements.topic.setCustomValidity(''));
  const intro=$('#intro-form');
  if(intro)intro.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(intro),name=String(d.get('name')).trim(),goal=String(d.get('goal')).trim(),offer=String(d.get('offer')).trim();for(const [field,value] of [['name',name],['goal',goal]]){intro.elements[field].setCustomValidity(value?'':'Please enter a little more detail.');if(!value){intro.elements[field].reportValidity();return;}}$('#intro-draft').textContent='Hi Tech Orbit! I’m '+name+'.\n\nMy focus is '+String(d.get('focus')).toLowerCase()+'. I’d love to explore '+goal+'.'+(offer?'\n\nI can share '+offer+'.':'')+'\n\nLooking forward to learning, building, and connecting with you!';$('#intro-output').hidden=false;$('#intro-output .copy-status').textContent='';});
  if(intro)['name','goal'].forEach(field=>intro.elements[field].addEventListener('input',()=>intro.elements[field].setCustomValidity('')));
})();
