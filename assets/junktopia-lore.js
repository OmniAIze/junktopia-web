(function(){
'use strict';
const entries=[
{id:"signal",title:"記録01　止まった時計",by:"星の観測ログ",unlock:r=>true,body:"小さな惑星の作業場で、修理用ロボットが一体眠っている。胸のライトは消えたまま。集めた部品で、また起こせるかもしれない。"},
{id:"robot",title:"記録02　ポンコの記憶",by:"ポンコ",unlock:r=>!!r.robot,body:"「ボク、昔は見習いだったんだ。難しい修理は先輩に助けてもらってた。……でも、今度はボクが誰かの力になりたいな。」"},
{id:"work",title:"記録03　工房の約束",by:"工房に残されたメモ",unlock:r=>!!r.work,body:"「壊れても、すぐには捨てない。直す方法を探す。ひとりで直せなかったら、仲間に頼る。」これは星の工房に残された約束。"},
{id:"choice",title:"記録04　灯りか、花か",by:"ポンコ",unlock:r=>!!(r.lamp||r.flower),body:"「どちらも大切だよ。道を照らすことも、花を咲かせることも。ボクたちは好きな順番で星を戻していけるんだね。」"},
{id:"beacon",title:"記録05　遠くからの信号",by:"古い通信ログ",unlock:r=>!!r.beacon,body:"星の奥から、小さな信号が届いた。「……記録は、残っている……」ポンコは耳を澄ませた。この星には、まだ知らない物語がある。"},
{id:"natt",title:"記録06　ナットからの通信",by:"ナット",unlock:(r,stage)=>stage>=7,body:"「こちら記録係ナット。ずっと昔の修理依頼が残っている。消えかけた地図を送る。ガラクタの山にも、星の記憶があるんだ。」"},
{id:"bridge",title:"記録07　橋がつないだもの",by:"修理工房の保存図面",unlock:(r,stage)=>stage>=9,body:"橋の設計図の裏には、誰かが小さな字で書き残していた。「遠くの仲間が帰ってこられるように。今日も一本、道をつなぐ。」"},
{id:"moku",title:"記録08　モクの作業台",by:"モク",unlock:(r,stage)=>stage>=11,body:"「急がなくても、直せるものはあるよ。」古い作業台の隅で、木のかけらが温かく光った。ポンコは、見覚えのある道具を見つめた。"},
{id:"coil",title:"記録09　コイルとフロラの芽",by:"コイルとフロラ",unlock:(r,stage)=>stage>=13,body:"「電気が戻ったら、次は小さな芽を育てたいの。」フロラが苗を差し出す。コイルは笑ってスイッチを入れた。修理船の温室に、初めて灯りがともった。"},
{id:"tomorrow",title:"記録10　星のつづき",by:"ポンコと仲間たち",unlock:(r,stage,best)=>best&&Number.isFinite(best['15']),body:"壊れた星に戻ったのは、昔と同じ景色ではなかった。新しい道、新しい灯り、そして新しい仲間。「きっと明日も、直せるものが見つかるよ。」"}
];
window.JunktopiaLore={available(repaired,stage,best){const r=repaired||{},n=Number.isInteger(stage)?stage:1,b=best||{};return entries.map(e=>{const unlocked=!!e.unlock(r,n,b);return {id:e.id,title:e.title,by:e.by,unlocked,body:unlocked?e.body:null};});}};
})();