(function(){
  'use strict';
  // Browser-only, cosmetic motion layer. The puzzle engine remains authoritative.
  function cellCenter(tiles, i, boardRect){
    const t=tiles[i].getBoundingClientRect();
    return {x:t.left-boardRect.left+t.width/2,y:t.top-boardRect.top+t.height/2,w:t.width,h:t.height};
  }
  function reduced(){
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function play(board, tracks, merges){
    if(!board || typeof board.querySelectorAll!=='function' ||
       typeof document.createElement!=='function' || reduced() || !Element.prototype.animate) return null;
    const tiles=Array.from(board.querySelectorAll('.tile'));
    if(tiles.length!==25)return null;
    const rect=board.getBoundingClientRect();
    const center=i=>cellCenter(tiles,i,rect);
    const layer=document.createElement('div');
    layer.className='motion-layer';
    layer.setAttribute('aria-hidden','true');
    board.classList.add('motion-active');
    board.appendChild(layer);
    const jobs=[];
    for(const t of tracks){
      if(!tiles[t.from] || !tiles[t.to])continue;
      const from=center(t.from),to=center(t.to);
      const ghost=document.createElement('span');
      ghost.className='motion-ghost';
      ghost.style.left=from.x+'px';
      ghost.style.top=from.y+'px';
      ghost.style.width=from.w+'px';
      ghost.style.height=from.h+'px';
      ghost.innerHTML=window.JunktopiaArt.itemSVG(t.tile);
      layer.appendChild(ghost);
      const animation=ghost.animate([
        {transform:'translate(-50%, -50%) scale(1)',opacity:1},
        {transform:'translate(calc(-50% + '+(to.x-from.x)+'px),calc(-50% + '+(to.y-from.y)+'px)) scale('+(t.merged?'.88':'1')+')',opacity:t.merged?'.65':'1'}
      ],{duration:190,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'});
      jobs.push(animation.finished.catch(()=>{}));
    }
    const finish=()=>{
      layer.remove();
      board.classList.remove('motion-active');
      const extras=[];
      for(const m of merges){
        if(!tiles[m.to])continue;
        const c=center(m.to);
        const star=document.createElement('div');
        star.className='merge-flash';
        star.style.left=c.x+'px';
        star.style.top=c.y+'px';
        star.setAttribute('aria-hidden','true');
        board.appendChild(star);
        const flash=star.animate([
          {transform:'translate(-50%, -50%) scale(.25)',opacity:0},
          {transform:'translate(-50%, -50%) scale(1.2)',opacity:.95,offset:.4},
          {transform:'translate(-50%, -50%) scale(1.65)',opacity:0}
        ],{duration:260,easing:'ease-out'});
        extras.push(flash.finished.catch(()=>{}).then(()=>star.remove()));
        if(m.delivered && document.body){
          const target=board.parentElement?.querySelector('.mission-target[data-goal="'+m.id+'"]');
          if(target){
            const goal=target.getBoundingClientRect();
            const start=tiles[m.to].getBoundingClientRect();
            const fx=document.createElement('span');
            fx.className='delivery-flight';
            fx.setAttribute('aria-hidden','true');
            fx.style.left=(start.left+start.width/2)+'px';
            fx.style.top=(start.top+start.height/2)+'px';
            fx.innerHTML=window.JunktopiaArt.itemSVG(m.tile);
            document.body.appendChild(fx);
            const dx=goal.left+goal.width/2-(start.left+start.width/2);
            const dy=goal.top+goal.height/2-(start.top+start.height/2);
            const flying=fx.animate([
              {transform:'translate(-50%,-50%) scale(1)',opacity:1},
              {transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.55)',opacity:.35}
            ],{duration:240,easing:'ease-in',fill:'forwards'});
            extras.push(flying.finished.catch(()=>{}).then(()=>{fx.remove();target.classList.add('delivered');}));
          }
        }
      }
      return Promise.all(extras).then(()=>{});
    };
    return Promise.all(jobs).then(finish,()=>{layer.remove();board.classList.remove('motion-active');});
  }
  window.JunktopiaMotion={play};
})();