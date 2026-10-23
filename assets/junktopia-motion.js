(function(){
'use strict';
// Rendering first, state second: all movement is painted at the *source* cell
// while final-state tiles stay visually empty behind the moving layer.
const SLIDE_MS=500, MERGE_MS=420, DELIVERY_MS=430;
const ease=t=>1-Math.pow(1-t,3);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function reducedMotion(options){
  if(options?.mode==='always')return false; // Explicit user opt-in.
  if(options?.mode==='off')return true;
  return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function relativeRect(el,root){
  const r=el.getBoundingClientRect(),p=root.getBoundingClientRect();
  return {x:r.left-p.left,y:r.top-p.top,w:r.width,h:r.height,cx:r.left-p.left+r.width/2,cy:r.top-p.top+r.height/2};
}
function moveTransform(dx,dy,scale){return 'translate3d('+dx.toFixed(2)+'px,'+dy.toFixed(2)+'px,0) scale('+scale.toFixed(3)+')';}
// RequestAnimationFrame is deliberately used instead of relying on Web Animations
// finished/commitStyles or CSS transitions on Safari. Watchdog prevents input locks
// if a background tab stops receiving animation frames.
function tween(duration,draw){
  return new Promise(resolve=>{
    let finished=false,frame=0,start=null;
    const finish=()=>{
      if(finished)return;
      finished=true;if(frame)cancelAnimationFrame(frame);clearTimeout(watchdog);
      draw(1);resolve();
    };
    const watchdog=setTimeout(finish,duration+250);
    const step=now=>{
      if(finished)return;
      if(start===null)start=now;
      const p=Math.min(1,(now-start)/duration);
      draw(ease(p));
      if(p>=1)finish();else frame=requestAnimationFrame(step);
    };
    draw(0);
    frame=requestAnimationFrame(step);
  });
}
function ghost(board,layer,tiles,track){
  if(!tiles[track.from]||!tiles[track.to])return null;
  const from=relativeRect(tiles[track.from],board),to=relativeRect(tiles[track.to],board);
  const el=document.createElement('div');
  el.className='motion-ghost '+({w:'motion-wood',e:'motion-electronic',g:'motion-glass'}[track.tile.k]||'motion-metal');
  el.dataset.from=String(track.from);el.dataset.to=String(track.to);
  el.style.left=from.x+'px';el.style.top=from.y+'px';
  el.style.width=from.w+'px';el.style.height=from.h+'px';
  el.innerHTML=window.JunktopiaArt.itemSVG(track.tile);
  layer.appendChild(el);
  return {el,dx:to.x-from.x,dy:to.y-from.y};
}
async function flash(board,tile,isReduced){
  const pos=relativeRect(tile,board),el=document.createElement('div');
  el.className='merge-flash'+(isReduced?' merge-flash-static':'');
  el.style.left=pos.cx+'px';el.style.top=pos.cy+'px';
  el.setAttribute('aria-hidden','true');board.appendChild(el);
  try{
    if(isReduced){await wait(330);return;}
    await tween(MERGE_MS,p=>{
      el.style.transform='translate(-50%,-50%) scale('+(0.55+p*1.3).toFixed(3)+')';
      el.style.opacity=String(.4+.6*Math.min(1,Math.max(0,p<.3?p/.3:(1-p)/.7)));
    });
  }finally{el.remove();}
}
async function fly(tile,target,merge,isReduced){
  if(!target)return;
  target.classList.remove('delivered');
  if(isReduced){target.classList.add('delivered');await wait(330);target.classList.remove('delivered');return;}
  const a=tile.getBoundingClientRect(),b=target.getBoundingClientRect();
  const sx=a.left+a.width/2,sy=a.top+a.height/2;
  const dx=b.left+b.width/2-sx,dy=b.top+b.height/2-sy;
  const el=document.createElement('div');
  el.className='delivery-flight';
  el.setAttribute('aria-hidden','true');
  el.style.left=sx+'px';el.style.top=sy+'px';
  el.innerHTML=window.JunktopiaArt.itemSVG(merge.tile);
  document.body.appendChild(el);
  try{await tween(DELIVERY_MS,p=>{
    el.style.transform='translate(-50%,-50%) '+moveTransform(dx*p,dy*p,1-.38*p);
    el.style.opacity=String(1-.16*p);
  });}finally{
    el.remove();target.classList.add('delivered');
    setTimeout(()=>target.classList.remove('delivered'),450);
  }
}
async function play(board,tracks,merges,options={}){
  if(!board||!document.createElement)return null;
  const tiles=Array.from(board.querySelectorAll('.tile'));
  if(tiles.length!==25)return null;
  const reduced=reducedMotion(options);
  let layer;
  try{
    if(!reduced){
      board.classList.add('motion-active');
      layer=document.createElement('div');
      layer.className='motion-layer';layer.setAttribute('aria-hidden','true');
      board.appendChild(layer);
      const moving=(tracks||[]).map(t=>ghost(board,layer,tiles,t)).filter(Boolean);
      await Promise.all(moving.map(g=>tween(SLIDE_MS,p=>{
        g.el.style.transform=moveTransform(g.dx*p,g.dy*p,1);
      })));
    }
  }finally{
    board.classList.remove('motion-active');
    if(layer)layer.remove();
  }
  const effects=[];
  for(const m of merges||[]){
    const tile=tiles[m.to];if(!tile)continue;
    effects.push(flash(board,tile,reduced));
    if(m.delivered){
      const target=board.parentElement?.querySelector('.mission-target[data-goal="'+m.id+'"]');
      if(target)effects.push(fly(tile,target,m,reduced));
    }
  }
  await Promise.all(effects);
}
window.JunktopiaMotion={play,reducedMotion};
})();