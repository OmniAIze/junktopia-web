(function(root){
  'use strict';
  // Pure 5×5 transition: no DOM, clocks, random, audio, storage, or mutation.
  const WIDTH=5;
  const DIRS=['left','right','up','down'];
  function same(a,b){return !!(a&&b&&a.k===b.k&&a.l===b.l&&a.l<4);}
  function indicesFor(dir,n){
    if(!DIRS.includes(dir)||!Number.isInteger(n)||n<0||n>=WIDTH)throw Error('invalid direction/line');
    const ids=[];
    for(let v=0;v<WIDTH;v++){
      let x=(dir==='left'?v:dir==='right'?WIDTH-1-v:n),
          y=(dir==='up'?v:dir==='down'?WIDTH-1-v:n);
      if(dir==='up'||dir==='down')x=n;else y=n;
      ids.push(y*WIDTH+x);
    }
    return ids;
  }
  function transition(board,dir,goals,completed){
    if(!Array.isArray(board)||board.length!==WIDTH*WIDTH)throw Error('board must contain 25 cells');
    if(!DIRS.includes(dir))throw Error('invalid direction');
    const need=goals||{},done={...(completed||{})},after=board.slice();
    const tracks=[],merges=[];let changed=false,scoreDelta=0;
    for(let line=0;line<WIDTH;line++){
      const ids=indicesFor(dir,line);
      const row=ids.map(from=>({tile:board[from],from})).filter(x=>x.tile);
      const out=[];
      for(let i=0;i<row.length;i++){
        const first=row[i],second=row[i+1];
        if(second&&same(first.tile,second.tile)){
          const tile={k:first.tile.k,l:first.tile.l+1},id=tile.k+tile.l;
          const to=ids[out.length];
          const delivered=(need[id]||0)>(done[id]||0);
          if(delivered)done[id]=(done[id]||0)+1;
          else out.push(tile);
          tracks.push({from:first.from,to,tile:first.tile,merged:true});
          tracks.push({from:second.from,to,tile:second.tile,merged:true});
          merges.push({to,tile,id,delivered});
          scoreDelta+=10*(2**tile.l);
          i++;
        }else{
          const to=ids[out.length];
          out.push(first.tile);
          tracks.push({from:first.from,to,tile:first.tile,merged:false});
        }
      }
      ids.forEach((index,i)=>{
        const value=out[i]||null,old=board[index];
        if((old?old.k+old.l:'')!==(value?value.k+value.l:''))changed=true;
        after[index]=value;
      });
    }
    const targetsDone=Object.entries(need).every(([id,n])=>(done[id]||0)>=n);
    return {changed,board:after,done,tracks,merges,scoreDelta,targetsDone};
  }
  const api=Object.freeze({WIDTH,DIRS,indicesFor,same,transition});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.JunktopiaCore=api;
})(typeof window!=='undefined'?window:null);
