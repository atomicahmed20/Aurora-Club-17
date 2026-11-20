document.addEventListener('DOMContentLoaded',()=>{
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const nav=$('nav ul'),toggle=$('.menu-toggle'),header=$('header'),curtain=$('.curtain');
  const canHover=matchMedia('(hover:hover)').matches;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const lite=document.documentElement.classList.contains('lite');
  const NS='http://www.w3.org/2000/svg';

  /* ================= iris page transition ================= */
  const iris=!lite&&window.CSS&&CSS.supports&&CSS.registerProperty&&CSS.supports('(--r:0px)');
  if(!iris)document.documentElement.classList.add('no-iris');
  const OUT=iris?1100:420;
  const openCurtain=()=>{if(!curtain)return;curtain.style.setProperty('--cx','50%');curtain.style.setProperty('--cy','50%');curtain.classList.add('open')};
  if(curtain&&!reduce){
    const go=()=>setTimeout(openCurtain,lite?100:450);
    document.readyState==='complete'?go():addEventListener('load',go);
    setTimeout(openCurtain,3500);                       // safety net
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]');
      if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0||a.target==='_blank')return;
      const u=new URL(a.href,location.href);
      if(u.origin!==location.origin&&u.protocol!=='file:')return;
      if(!/\.html?$/.test(u.pathname)||u.pathname===location.pathname)return;
      e.preventDefault();nav&&nav.classList.remove('open');
      curtain.style.setProperty('--cx',e.clientX+'px');curtain.style.setProperty('--cy',e.clientY+'px');
      curtain.classList.remove('open');
      setTimeout(()=>location.href=u.href,OUT);
    });
    addEventListener('pageshow',e=>{if(e.persisted){curtain.classList.remove('open');setTimeout(openCurtain,150)}});
  }else if(curtain)curtain.remove();

  /* ================= drawn SVG decorations ================= */
  const el=(t,a={},p)=>{const n=document.createElementNS(NS,t);for(const k in a)n.setAttribute(k,a[k]);p&&p.appendChild(n);return n};
  const gearD=(r,teeth,depth)=>{let d='';const w=2*Math.PI/teeth;
    for(let t=0;t<teeth;t++){const a=t*w,R=r+depth;
      [[r,0],[R,.14],[R,.5],[r,.64]].forEach(([q,f],i)=>{const x=(q*Math.cos(a+f*w)).toFixed(1),y=(q*Math.sin(a+f*w)).toFixed(1);d+=(t===0&&i===0?'M':'L')+x+' '+y+' '});}
    return d+'Z'};
  const gearSVG=(cls,teeth=14)=>{const s=el('svg',{viewBox:'-110 -110 220 220',class:'gear '+cls});
    el('path',{d:gearD(84,teeth,16)},s);el('circle',{r:46},s);el('circle',{r:12},s);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;el('line',{x1:(14*Math.cos(a)).toFixed(1),y1:(14*Math.sin(a)).toFixed(1),x2:(44*Math.cos(a)).toFixed(1),y2:(44*Math.sin(a)).toFixed(1)},s)}
    return s};
  const traceSVG=cls=>{const s=el('svg',{viewBox:'0 0 400 300',class:'trace '+cls});
    ['M0 40H120L160 80H290','M0 130H70L115 175H230L262 143H340','M0 220H110L150 260H320'].forEach(d=>el('path',{d,pathLength:1},s));
    [[290,80],[340,143],[320,260]].forEach(([cx,cy])=>el('circle',{cx,cy,r:6},s));return s};
  const atomSVG=()=>{const s=el('svg',{viewBox:'-100 -100 200 200',class:'atom'});
    [0,60,120].forEach(r=>el('ellipse',{rx:92,ry:34,transform:`rotate(${r})`},s));
    el('circle',{r:9,class:'e'},s);el('circle',{cx:92,cy:0,r:5,class:'e'},s);return s};
  const addDecor=(host,kids)=>{if(!host||reduce||lite)return;const d=document.createElement('div');d.className='decor';d.setAttribute('aria-hidden','true');kids.forEach(k=>d.appendChild(k));host.appendChild(d)};
  addDecor($('.hero'),[gearSVG('g1'),gearSVG('g2',10),traceSVG('tl'),traceSVG('tr'),atomSVG()]);
  addDecor($('.page-hero'),[gearSVG('g1'),gearSVG('g3',12),traceSVG('tl'),traceSVG('tr')]);
  addDecor($('footer'),[gearSVG('g3',16)]);

  /* circuit dividers between consecutive sections */
  const divObs='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('drawn');divObs.unobserve(e.target)}}),{threshold:.9}):null;
  $$('section.container').forEach(sec=>{
    const nx=sec.nextElementSibling;if(!nx||!nx.matches('section.container'))return;
    const s=el('svg',{viewBox:'0 0 600 48',class:'divider','aria-hidden':'true'});
    el('path',{d:'M0 24H226L244 8H268',pathLength:1},s);el('path',{d:'M600 24H374L356 8H332',pathLength:1},s);
    el('circle',{cx:268,cy:8,r:4},s);el('circle',{cx:332,cy:8,r:4},s);
    const g=el('g',{class:'gr'},s);el('path',{d:gearD(8,8,4).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g,(m,x,y)=>(300+ +x)+' '+(24+ +y)),pathLength:1,style:'stroke-dashoffset:0;stroke-dasharray:none'},g);
    el('circle',{cx:300,cy:24,r:2.5,style:'opacity:1;fill:var(--accent)'},g);
    sec.after(s);divObs&&!lite?divObs.observe(s):s.classList.add('drawn');
  });

  /* ================= mobile menu ================= */
  document.addEventListener('click',e=>{if(nav&&nav.classList.contains('open')&&!nav.contains(e.target)&&!toggle.contains(e.target))nav.classList.remove('open')});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&nav)nav.classList.remove('open')});

  /* ================= progress bar + smart header ================= */
  const bar=document.createElement('div');bar.id='progress';document.body.prepend(bar);
  let ticking=false,lastY=0;
  const update=()=>{
    const h=document.documentElement,y=h.scrollTop;
    bar.style.width=(y/Math.max(1,h.scrollHeight-h.clientHeight))*100+'%';
    if(header){header.classList.toggle('scrolled',y>40);
      header.classList.toggle('hide-up',y>lastY+4&&y>420&&!(nav&&nav.classList.contains('open')));
      if(y<lastY-4||y<420)header.classList.remove('hide-up')}
    lastY=y;ticking=false};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});update();

  /* ================= cursor glow ================= */
  if(canHover&&!reduce&&!lite){
    const g=document.createElement('div');g.id='cursor-glow';document.body.appendChild(g);
    addEventListener('mousemove',e=>{g.style.opacity=1;g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'},{passive:true});
    document.addEventListener('mouseleave',()=>g.style.opacity=0);
  }

  /* ================= scroll reveal (starts after the iris opens) ================= */
  const targets=$$('.card,.step,.rule-item,.contact-card,.section-title,.section-subtitle,.split>*,.stat,.cta-box,.note');
  if('IntersectionObserver' in window&&!reduce){
    const io=new IntersectionObserver(es=>es.forEach(e=>{
      if(!e.isIntersecting)return;
      e.target.classList.add('in');io.unobserve(e.target);
      e.target.addEventListener('animationend',()=>e.target.classList.remove('reveal','in'),{once:true});
    }),{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    targets.forEach((t,i)=>{t.classList.add('reveal');t.style.setProperty('--d',(i%4)*0.09+'s')});
    setTimeout(()=>targets.forEach(t=>io.observe(t)),900);
  }

  /* ================= 3D tilt ================= */
  if(canHover&&!reduce&&!lite){
    $$('.card,.contact-card').forEach(c=>{
      c.addEventListener('mousemove',e=>{
        const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
        c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');
        c.style.transform=`rotateY(${((x/r.width)-.5)*-14}deg) rotateX(${((y/r.height)-.5)*14}deg) translateY(-8px)`;
      });
      c.addEventListener('mouseleave',()=>c.style.transform='');
    });
  }

  /* ================= particles ================= */
  const p=$('.particles');
  if(p&&!reduce&&!lite)for(let i=0;i<24;i++){
    const s=document.createElement('i'),z=3+Math.random()*6;
    s.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${8+Math.random()*10}s;animation-delay:${-Math.random()*14}s`;
    p.appendChild(s);
  }

  /* ================= typewriter ================= */
  const h1=$('.hero h1');
  if(h1&&!h1.dataset.done&&!reduce&&!lite){
    const t=h1.textContent.trim();h1.setAttribute('aria-label',t);h1.textContent='';h1.dataset.done=1;h1.classList.add('typing');
    let i=0;const tick=()=>{if(i<t.length){h1.textContent+=t[i++];setTimeout(tick,70)}else setTimeout(()=>h1.classList.remove('typing'),1200)};
    setTimeout(tick,1700);
  }

  /* ================= counters ================= */
  const nums=$$('[data-count]');
  if('IntersectionObserver' in window){
    const co=new IntersectionObserver(es=>es.forEach(e=>{
      if(!e.isIntersecting)return;co.unobserve(e.target);
      const t=e.target,end=+t.dataset.count,suf=t.dataset.suffix||'';let n=0;
      if(lite){t.textContent=end+suf;return}
      const step=()=>{n+=1;t.textContent=n+suf;if(n<end)setTimeout(step,260)};step();
    }),{threshold:.6});
    nums.forEach(t=>co.observe(t));
  }else nums.forEach(t=>t.textContent=t.dataset.count+(t.dataset.suffix||''));

  /* ================= lite-mode toggle (footer) ================= */
  const lt=$('.lite-toggle');
  if(lt){
    lt.textContent='الوضع الخفيف: '+(lite?'مفعّل':'معطّل');
    lt.addEventListener('click',()=>{try{localStorage.setItem('aurora-lite',lite?'0':'1')}catch(e){}location.reload()});
  }

  /* ================= rules: open / close all ================= */
  const accBtn=$('[data-acc-toggle]');
  if(accBtn){
    accBtn.addEventListener('click',()=>{
      const ds=$$('.acc details'),allOpen=ds.every(d=>d.open);
      ds.forEach(d=>d.open=!allOpen);
      accBtn.textContent=allOpen?'فتح كل الأقسام':'طيّ كل الأقسام';
    });
  }


});
