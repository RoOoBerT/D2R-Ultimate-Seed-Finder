// debug-countess.mjs — usage : node debug-countess.mjs [seed]
import { init, open } from "libd2";

const seed = Number(process.argv[2] || 586870917); // graine de référence (WP Black Marsh connu)

// ---- helpers copiés à l'identique depuis engine.mjs ----
function xy(p){ if(!p)return null; const x=Number(p.x),y=Number(p.y);
  return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null; }
function iso(p){ const q=xy(p); return q?{sx:q.x-q.y,sy:(q.x+q.y)/2}:null; }
function isoDist(a,b){ const A=iso(a),B=iso(b); if(!A||!B)return null;
  return Math.hypot(A.sx-B.sx,A.sy-B.sy); }
function exitTo(area,targetId){ return area.exits.find(e=>e.to?.id===targetId)??null; }
function exitPoint(ex,reference=null){
  if(!ex)return null;
  if(reference){ try{ const p=ex.nearestTo(reference); if(p)return p; }catch{} }
  try{ if(ex.points?.length)return ex.points[0]; }catch{}
  return null;
}
function entryFrom(area,previousId){ return exitPoint(exitTo(area,previousId),area.middle)??null; }
function geometryChain(game,startAreaId,startPos,nextAreas){
  let areaId=startAreaId,pos=startPos,total=0;
  for(const nextId of nextAreas){
    const area=game.area(areaId);
    const out=exitPoint(exitTo(area,nextId),pos);
    if(!out)return null;
    const d=isoDist(pos,out); if(d==null)return null;
    total+=d;
    const entry=entryFrom(game.area(nextId),areaId);
    if(!entry)return null;
    pos=entry; areaId=nextId;
  }
  return {total,pos,areaId};
}

await init();
const game=open({seed,difficulty:"hell"});
console.log(`=== Diagnostic countessFull — seed ${seed} ===`);

const bm=game.area(6), ft=game.area(20), c1=game.area(21);

console.log("0) middle zone 20:",JSON.stringify(ft?.middle),"| middle zone 21:",JSON.stringify(c1?.middle));

// Jambe WP→tour (référence DANS Black Marsh — doit marcher)
const exBm=exitTo(bm,20);
const tower=exitPoint(exBm,bm.middle);
console.log("1) tour:",JSON.stringify(tower),"| exit BM→20 points =",exBm?.points?.length??0);

// ANCIENNE VERSION : exit 20→21 avec référence `tower` (∉ zone 20)
const exFt=exitTo(ft,21);
console.log("2) exit 20→21 : points =",exFt?.points?.length??0,"| nearestTo =",typeof exFt?.nearestTo);
try{ console.log("   nearestTo(tour) →",JSON.stringify(exFt?.nearestTo(tower))); }
catch(e){ console.log("   nearestTo(tour) LÈVE :",e.message); }
console.log("   exitPoint(exit 20→21, tour) →",JSON.stringify(exitPoint(exFt,tower)));

// NOUVELLE VERSION : entrée en zone 21, puis chaîne 21→25
const entryC1=entryFrom(c1,20);
console.log("3) entryFrom(zone21, 20) →",JSON.stringify(entryC1));
const chainNew=entryC1?geometryChain(game,21,entryC1,[22,23,24,25]):null;
console.log("4) chaîne NOUVELLE (21→25) →",JSON.stringify(chainNew));

// ANCIENNE VERSION : chaîne complète via zone 20
const chainOld=tower?geometryChain(game,20,tower,[21,22,23,24,25]):null;
console.log("5) chaîne ANCIENNE (20→25) →",JSON.stringify(chainOld));

game.close();
