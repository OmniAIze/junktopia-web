(function(){
'use strict';
const entries=[
{id:"signal",title:"記録01　止まった時計",by:"星の観測ログ",unlock:r=>true,body:"小さな惑星の作業場で、修理用ロボットが一体眠っている。胸のライトは消えたまま。集めた部品で、また起こせるかもしれない。"},
{id:"robot",title:"記録02　ポンコの記憶",by:"ポンコ",unlock:r=>!!r.robot,body:"「ボク、昔は見習いだったんだ。難しい修理は先輩に助けてもらってた。……でも、今度はボクが誰かの力になりたいな。」"},
{id:"work",title:"記録03　工房の約束",by:"工房に残されたメモ",unlock:r=>!!r.work,body:"「壊れても、すぐには捨てない。直す方法を探す。ひとりで直せなかったら、仲間に頼る。」これは星の工房に残された約束。"},
{id:"choice",title:"記録04　灯りか、花か",by:"ポンコ",unlock:r=>!!(r.lamp||r.flower),body:"「どちらも大切だよ。道を照らすことも、花を咲かせることも。ボクたちは好きな順番で星を戻していけるんだね。」"},
{id:"beacon",title:"記録05　遠くからの信号",by:"古い通信ログ",unlock:r=>!!r.beacon,body:"星の奥から、小さな信号が届いた。「……記録は、残っている……」ポンコは耳を澄ませた。この星には、まだ知らない物語がある。"}
];
window.JunktopiaLore={available(repaired){const r=repaired||{};return entries.map(e=>({id:e.id,title:e.title,by:e.by,unlocked:e.unlock(r),body:e.unlock(r)?e.body:null}));}};
})();