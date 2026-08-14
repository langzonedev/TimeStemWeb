(()=>{
  const PALETTES={family:'#b45f86',enterprise:'#3d648f',sport:'#35665a'};
  function activeVariant(){return localStorage.getItem('timestem.variant')||'enterprise'}
  function applyChrome(){const v=activeVariant();document.body.dataset.variant=v;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',PALETTES[v]||PALETTES.enterprise)}
  function feedback(message){document.querySelector('.tap-feedback')?.remove();const el=document.createElement('div');el.className='tap-feedback';el.innerHTML=`<span>✓</span><strong>${message}</strong>`;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),190)},1350)}
  document.addEventListener('click',event=>{
    const switchButton=event.target.closest('.variant-switcher button');if(switchButton){setTimeout(applyChrome,0);return}
    const action=event.target.closest('.action-btn');if(!action)return;
    const hint=action.querySelector('.action-copy small')?.textContent||'';
    if(hint.includes('Timestamp')){const label=action.querySelector('strong')?.textContent||'Activity';setTimeout(()=>feedback(`${label} recorded`),30)}
  });
  window.addEventListener('storage',applyChrome);document.addEventListener('DOMContentLoaded',applyChrome);applyChrome();
})();