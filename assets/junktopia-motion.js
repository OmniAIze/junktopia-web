(function(){
  'use strict';
  // Only visual effects live here. The puzzle engine, including score/save/goal state,
  // has already applied the authoritative move before play() is called.
  const SLIDE_MS=360, MERGE_MS=470, DELIVERY_MS=440;
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function reducedMotion(){
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function rectRelative(element,ancestor){
    const r=element.getBoundingClientRect(),p=ancestor.getBoundingClientRect();
    return {x:r.left-p.left,y:r.top-p.top,w:r.width,h:r.height,cx:r.left-p.left+r.width/2,cy:r.top-p.top+r.height/2};
  }
  // WAAPI can be absent or reject on embedded/iOS browsers. CSS transitions remain
  // available as a real animation fallback. Neither path can strand the turn lock.
  async function animate(element,frames,duration,easing='ease-out'){
    if(typeof element.animate==='function'){
      try{
        const effect=element.animate(frames,{duration,easing,fill:'forwards'});
        await Promise.race([effect.finished.catch(()=>{}),wait(duration+150)]);
        try{effect.commitStyles?.();}catch(_){}
        try{effect.cancel();}catch(_){}
        return;
      }catch(_){/* Fall through to CSS transition. */}
    }
    const first=frames[0],last=frames[frames.length-1];
    for(const key of Object.keys(first))element.style[key]=String(first[key]);
    // Force style recalculation before applying transition endpoints.
    void element.offsetWidth;
    element.style.transition='transform '+duration+'ms '+easing+', opacity '+duration+'ms '+easing;
    await new Promise(resolve=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        for(const key of Object.keys(last))element.style[key]=String(last[key]);
        setTimeout(resolve,duration+80);
      }));
    });
  }
  function ghost(board,layer,from,to,track){
    const source=rectRelative(from,board),dest=rectRelative(to,board);
    const el=document.createElement('div');
    el.className='motion-ghost '+(track.tile.k==='w'?'motion-wood':'motion-metal');
    el.dataset.from=String(track.from);
    el.dataset.to=String(track.to);
    el.style.left=source.x+'px';
    el.style.top=source.y+'px';
    el.style.width=source.w+'px';
    el.style.height=source.h+'px';
    el.innerHTML=window.JunktopiaArt.itemSVG(track.tile);
    layer.appendChild(el);
    return {el,dx:dest.x-source.x,dy:dest.y-source.y};
  }
  async function flash(board,tile,merge,isReduced){
    const point=rectRelative(tile,board);
    const el=document.createElement('div');
    el.className='merge-flash'+(isReduced?' merge-flash-static':'');
    el.style.left=point.cx+'px';
    el.style.top=point.cy+'px';
    el.setAttribute('aria-hidden','true');
    board.appendChild(el);
    try{
      if(isReduced)await wait(330);
      else await animate(el,[
        {transform:'translate(-50%,-50%) scale(.45)',opacity:'0.35'},
        {transform:'translate(-50%,-50%) scale(1.15)',opacity:'1',offset:.35},
        {transform:'translate(-50%,-50%) scale(1.8)',opacity:'0'}
      ],MERGE_MS,'ease-out');
    }finally{el.remove();}
  }
  async function deliver(board,tile,target,merge,isReduced){
    // Reduced-motion still calls out the result with a legible stationary highlight.
    if(!target)return;
    target.classList.remove('delivered');
    if(isReduced){
      target.classList.add('delivered');
      await wait(330);
      target.classList.remove('delivered');
      return;
    }
    const from=tile.getBoundingClientRect(),to=target.getBoundingClientRect();
    const x=from.left+from.width/2,y=from.top+from.height/2;
    const el=document.createElement('div');
    el.className='delivery-flight';
    el.setAttribute('aria-hidden','true');
    el.style.left=x+'px';
    el.style.top=y+'px';
    el.innerHTML=window.JunktopiaArt.itemSVG(merge.tile);
    document.body.appendChild(el);
    const dx=to.left+to.width/2-x,dy=to.top+to.height/2-y;
    try{
      await animate(el,[
        {transform:'translate(-50%,-50%) translate3d(0,0,0) scale(1)',opacity:'1'},
        {transform:'translate(-50%,-50%) translate3d('+dx+'px,'+dy+'px,0) scale(.62)',opacity:'.85'}
      ],DELIVERY_MS,'cubic-bezier(.2,.65,.3,1)');
    }finally{
      el.remove();
      target.classList.add('delivered');
      setTimeout(()=>target.classList.remove('delivered'),350);
    }
  }
  async function play(board,tracks,merges){
    if(!board || !document.createElement)return null;
    const tiles=Array.from(board.querySelectorAll('.tile'));
    if(tiles.length!==25)return null;
    const isReduced=reducedMotion();
    let layer=null;
    try{
      if(!isReduced){
        layer=document.createElement('div');
        layer.className='motion-layer';
        layer.setAttribute('aria-hidden','true');
        board.appendChild(layer);
        const movements=(tracks||[]).filter(t=>tiles[t.from]&&tiles[t.to]).map(t=>{
          const {el,dx,dy}=ghost(board,layer,tiles[t.from],tiles[t.to],t);
          return animate(el,[
            {transform:'translate3d(0,0,0) scale(1)',opacity:'1'},
            {transform:'translate3d('+dx+'px,'+dy+'px,0) scale('+(t.merged?'.96':'1')+')',opacity:'1'}
          ],SLIDE_MS,'cubic-bezier(.2,.7,.25,1)');
        });
        // Hide the new-state pieces only when their visible ghosts are mounted.
        if(movements.length)board.classList.add('motion-active');
        await Promise.all(movements);
      }
    }finally{
      board.classList.remove('motion-active');
      if(layer)layer.remove();
    }
    const effects=[];
    for(const m of merges||[]){
      const tile=tiles[m.to];if(!tile)continue;
      effects.push(flash(board,tile,m,isReduced));
      if(m.delivered){
        const target=board.parentElement?.querySelector('.mission-target[data-goal="'+m.id+'"]');
        if(target)effects.push(deliver(board,tile,target,m,isReduced));
      }
    }
    await Promise.all(effects);
  }
  window.JunktopiaMotion={play};
})();
