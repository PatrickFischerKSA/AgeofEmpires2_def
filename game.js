// Einfachere, ausgelagerte Version des Spielcodes mit sichtbarer Minimap.

// ---------- Logging ----------
const logEl = document.getElementById("log");
function log(msg,type="system"){
  const div=document.createElement("div");
  div.textContent=msg;
  div.className= type==="good" ? "log-good" :
                 type==="bad" ? "log-bad" :
                 type==="danger" ? "log-danger" : "log-system";
  logEl.appendChild(div);
  logEl.scrollTop=logEl.scrollHeight;
}

// ---------- Makrospiel ----------
const macro={
  t:0,
  speed:1,
  res:{food:200,wood:200,gold:100,stone:0},
  villagers:["food","food","food"],
  ecoUp:{wood:false,food:false,wheel:false},
  buildings:{houses:0,barracks:0,range:0,stable:0},
  army:{inf:0,spear:0,archer:0,cav:0},
  baseHP:100,baseHPMax:100,
  enemyHP:200,enemyHPMax:200,
  enemyStr:10,
  enemyTimer:40,
  enemyTimerBase:40
};
const ages=["","Dunkles Zeitalter","Feudalzeit","Ritterzeit","Imperium"];

function popCap(){return 5+macro.buildings.houses*5;}
function totalPop(){return macro.villagers.length+macro.army.inf+macro.army.spear+macro.army.archer+macro.army.cav;}

function tinyRate(task){
  const base= task==="food"?4:task==="wood"?4:task==="gold"?3:task==="stone"?2:0;
  let m=1;
  if(macro.ecoUp.wood && task==="wood")m*=1.2;
  if(macro.ecoUp.food && task==="food")m*=1.2;
  if(macro.ecoUp.wheel)m*=1.15;
  return base*m;
}

function canPay(c){
  return macro.res.food>=(c.food||0)&&macro.res.wood>=(c.wood||0)&&
         macro.res.gold>=(c.gold||0)&&macro.res.stone>=(c.stone||0);
}
function pay(c){
  macro.res.food-=c.food||0;
  macro.res.wood-=c.wood||0;
  macro.res.gold-=c.gold||0;
  macro.res.stone-=c.stone||0;
}

function updateEcoUI(){
  document.getElementById("ui-time").textContent=macro.t;
  document.getElementById("ui-age").textContent=ages[1];
  document.getElementById("ui-food").textContent=Math.floor(macro.res.food);
  document.getElementById("ui-wood").textContent=Math.floor(macro.res.wood);
  document.getElementById("ui-gold").textContent=Math.floor(macro.res.gold);
  document.getElementById("ui-stone").textContent=Math.floor(macro.res.stone);
  document.getElementById("ui-pop").textContent=totalPop()+" / "+popCap();

  const counts={food:0,wood:0,gold:0,stone:0,idle:0};
  macro.villagers.forEach(t=>{counts[t]=(counts[t]||0)+1;});
  document.getElementById("vils-count").textContent=macro.villagers.length;
  document.getElementById("vils-food").textContent=counts.food||0;
  document.getElementById("vils-wood").textContent=counts.wood||0;
  document.getElementById("vils-gold").textContent=counts.gold||0;
  document.getElementById("vils-stone").textContent=counts.stone||0;
  document.getElementById("vils-idle").textContent=counts.idle||0;

  const rFood=(counts.food||0)*tinyRate("food");
  const rWood=(counts.wood||0)*tinyRate("wood");
  const rGold=(counts.gold||0)*tinyRate("gold");
  const rStone=(counts.stone||0)*tinyRate("stone");
  document.getElementById("rate-food").textContent=rFood.toFixed(1);
  document.getElementById("rate-wood").textContent=rWood.toFixed(1);
  document.getElementById("rate-gold").textContent=rGold.toFixed(1);
  document.getElementById("rate-stone").textContent=rStone.toFixed(1);

  document.getElementById("ui-houses").textContent=macro.buildings.houses;
  document.getElementById("ui-barracks").textContent=macro.buildings.barracks;
  document.getElementById("ui-range").textContent=macro.buildings.range;
  document.getElementById("ui-stable").textContent=macro.buildings.stable;

  document.getElementById("mil-inf").textContent=macro.army.inf;
  document.getElementById("mil-spear").textContent=macro.army.spear;
  document.getElementById("mil-archer").textContent=macro.army.archer;
  document.getElementById("mil-cav").textContent=macro.army.cav;

  const baseR=Math.max(0,macro.baseHP)/macro.baseHPMax;
  const enemyR=Math.max(0,macro.enemyHP)/macro.enemyHPMax;
  document.getElementById("hp-base").style.width=(baseR*100)+"%";
  document.getElementById("hp-enemy").style.width=(enemyR*100)+"%";
  document.getElementById("hp-base-label").textContent=Math.floor(Math.max(0,macro.baseHP))+" / "+macro.baseHPMax;
  document.getElementById("hp-enemy-label").textContent=Math.floor(Math.max(0,macro.enemyHP))+" / "+macro.enemyHPMax;
}

function ecoTick(){
  macro.t++;
  macro.villagers.forEach(task=>{
    const g=tinyRate(task);
    if(task==="food")macro.res.food+=g;
    if(task==="wood")macro.res.wood+=g;
    if(task==="gold")macro.res.gold+=g;
    if(task==="stone")macro.res.stone+=g;
  });
}

function doAction(a){
  switch(a){
    case "task-food": macro.villagers[0]="food"; break;
    case "task-wood": macro.villagers[0]="wood"; break;
    case "task-gold": macro.villagers[0]="gold"; break;
    case "task-stone": macro.villagers[0]="stone"; break;
    case "task-idle": macro.villagers[0]="idle"; break;
    case "make-vil":
      if(!canPay({food:50})||totalPop()>=popCap())return;
      pay({food:50}); macro.villagers.push("food"); break;
    case "build-house":
      if(!canPay({wood:25}))return;
      pay({wood:25}); macro.buildings.houses++; break;
    case "eco-wood":
      if(macro.ecoUp.wood||!canPay({food:100,gold:50}))return;
      pay({food:100,gold:50}); macro.ecoUp.wood=true; break;
    case "eco-food":
      if(macro.ecoUp.food||!canPay({food:125,gold:75}))return;
      pay({food:125,gold:75}); macro.ecoUp.food=true; break;
    case "eco-wheel":
      if(macro.ecoUp.wheel||!canPay({food:175,gold:75}))return;
      pay({food:175,gold:75}); macro.ecoUp.wheel=true; break;
  }
  updateEcoUI();
}

// Buttons
document.querySelectorAll("button[data-action]").forEach(btn=>{
  btn.addEventListener("click",()=>doAction(btn.getAttribute("data-action")));
});
setInterval(()=>{ecoTick();updateEcoUI();},1000);

// ---------- Minimap ----------
const W=128,H=128;
const minimap=document.getElementById("minimap");
const tiles=new Array(W*H);
const tileEls=new Array(W*H);
const unitHere=new Array(W*H).fill(false);
const visible=new Array(W*H).fill(false);
let playerBase={x:20,y:90};
let enemyBase={x:105,y:25};
const units=[
  {id:1,x:24,y:86,vision:10,tx:null,ty:null},
  {id:2,x:18,y:96,vision:8,tx:null,ty:null},
  {id:3,x:30,y:92,vision:12,tx:null,ty:null}
];
let selectedUnitId=1;

function idx(x,y){return y*W+x;}
function clamp(v,min,max){return v<min?min:v>max?max:v;}

for(let y=0;y<H;y++){
  for(let x=0;x<W;x++){
    tiles[idx(x,y)]="g";
    const d=document.createElement("div");
    d.className="tile g fog-d";
    d.addEventListener("click",e=>{e.stopPropagation();handleTileClick(x,y);});
    minimap.appendChild(d);
    tileEls[idx(x,y)]=d;
  }
}

function setAll(type){
  for(let i=0;i<W*H;i++)tiles[i]=type;
}
function circle(cx,cy,r,type){
  const r2=r*r;
  for(let y=-r;y<=r;y++){
    for(let x=-r;x<=r;x++){
      const nx=cx+x,ny=cy+y;
      if(nx<0||ny<0||nx>=W||ny>=H)continue;
      if(x*x+y*y<=r2)tiles[idx(nx,ny)]=type;
    }
  }
}
function scatter(cx,cy,r,type,count){
  let placed=0,tries=0;
  while(placed<count && tries<count*20){
    tries++;
    const a=Math.random()*Math.PI*2;
    const rr=Math.random()*r;
    const nx=Math.round(cx+Math.cos(a)*rr);
    const ny=Math.round(cy+Math.sin(a)*rr);
    if(nx<0||ny<0||nx>=W||ny>=H)continue;
    const i=idx(nx,ny);
    if(tiles[i]==="g"){tiles[i]=type;placed++;}
  }
}

function genArabia(){
  setAll("g");
  for(let i=0;i<10;i++)circle(
    Math.floor(W*(0.1+0.8*Math.random())),
    Math.floor(H*(0.1+0.8*Math.random())),8,"f");
  for(let i=0;i<3;i++)circle(
    Math.floor(W*(0.2+0.6*Math.random())),
    Math.floor(H*(0.2+0.6*Math.random())),6,"w");
  playerBase={x:Math.floor(W*0.25),y:Math.floor(H*0.7)};
  enemyBase={x:Math.floor(W*0.75),y:Math.floor(H*0.3)};
  scatter(playerBase.x,playerBase.y,14,"o",6);
  scatter(enemyBase.x,enemyBase.y,14,"o",6);
}

function applyTerrain(){
  for(let i=0;i<W*H;i++)tileEls[i].className="tile "+tiles[i]+" fog-d";
}

function markUnits(){
  unitHere.fill(false);
  units.forEach(u=>{
    if(u.x>=0&&u.x<W&&u.y>=0&&u.y<H)unitHere[idx(u.x,u.y)]=true;
  });
}

function recomputeFog(){
  visible.fill(false);
  units.forEach(u=>{
    const r=u.vision;
    for(let dy=-r;dy<=r;dy++){
      for(let dx=-r;dx<=r;dx++){
        const nx=u.x+dx,ny=u.y+dy;
        if(nx<0||ny<0||nx>=W||ny>=H)continue;
        if(dx*dx+dy*dy>r*r)continue;
        visible[idx(nx,ny)]=true;
      }
    }
  });
  updateMinimapClasses();
}

function updateMinimapClasses(){
  for(let i=0;i<W*H;i++){
    const base="tile "+tiles[i];
    const fogClass=visible[i]?"fog-v":"fog-d";
    const u=unitHere[i]?" u-tile":"";
    tileEls[i].className=base+" "+fogClass+u;
  }
  const pb=idx(playerBase.x,playerBase.y);
  const eb=idx(enemyBase.x,enemyBase.y);
  tileEls[pb].className="tile pb fog-v";
  tileEls[eb].className="tile eb fog-v";
  units.forEach(u=>{
    if(u.x<0||u.x>=W||u.y<0||u.y>=H)return;
    const i=idx(u.x,u.y);
    if(u.id===selectedUnitId)tileEls[i].classList.add("u-sel");
  });
}

function placeUnits(){
  const offs=[{dx:-4,dy:-4},{dx:4,dy:-4},{dx:0,dy:4}];
  units.forEach((u,i)=>{
    const o=offs[i]||{dx:0,dy:0};
    u.x=clamp(playerBase.x+o.dx,1,W-2);
    u.y=clamp(playerBase.y+o.dy,1,H-2);
    u.tx=null;u.ty=null;
  });
  markUnits();
  recomputeFog();
}

function selectUnitAt(x,y){
  const u=units.find(u=>u.x===x&&u.y===y);
  if(u){
    selectedUnitId=u.id;
    recomputeFog();
    return true;
  }
  return false;
}
function nearestUnit(x,y){
  let best=null,bestD=Infinity;
  units.forEach(u=>{
    const dx=u.x-x,dy=u.y-y;
    const d=dx*dx+dy*dy;
    if(d<bestD){bestD=d;best=u;}
  });
  return best;
}
function handleTileClick(x,y){
  if(selectUnitAt(x,y))return;
  const u=units.find(u=>u.id===selectedUnitId)||nearestUnit(x,y);
  if(!u)return;
  u.tx=x;u.ty=y;
}

function stepUnits(){
  let moved=false;
  units.forEach(u=>{
    if(u.tx==null||u.ty==null)return;
    if(u.x===u.tx&&u.y===u.ty){u.tx=null;u.ty=null;return;}
    let dx=0,dy=0;
    if(u.x<u.tx)dx=1;else if(u.x>u.tx)dx=-1;
    if(u.y<u.ty)dy=1;else if(u.y>u.ty)dy=-1;
    const nx=u.x+dx,ny=u.y+dy;
    if(nx<0||ny<0||nx>=W||ny>=H){u.tx=null;u.ty=null;return;}
    u.x=nx;u.y=ny;moved=true;
  });
  if(moved){
    markUnits();
    recomputeFog();
  }
}
setInterval(stepUnits,140);

// Pan
const wrapper=document.getElementById("minimap-wrapper");
let dragging=false,startX=0,startY=0,offX=0,offY=0;
function applyTransform(){minimap.style.transform="translate("+offX+"px,"+offY+"px)";}
applyTransform();
wrapper.addEventListener("mousedown",e=>{dragging=true;startX=e.clientX;startY=e.clientY;});
wrapper.addEventListener("mouseup",()=>dragging=false);
wrapper.addEventListener("mouseleave",()=>dragging=false);
wrapper.addEventListener("mousemove",e=>{
  if(!dragging)return;
  const dx=e.clientX-startX,dy=e.clientY-startY;
  startX=e.clientX;startY=e.clientY;
  offX+=dx;offY+=dy;
  applyTransform();
});

// Kartenwechsel (nur Arabia in dieser JS-Version, damit es stabil bleibt)
function genAndApply(){
  genArabia();
  tiles[idx(playerBase.x,playerBase.y)]="pb";
  tiles[idx(enemyBase.x,enemyBase.y)]="eb";
  applyTerrain();
  placeUnits();
}
document.getElementById("btn-new-map").addEventListener("click",genAndApply);

// Start
genAndApply();
updateEcoUI();
log("Mini-AOE geladen – Minimap sollte sichtbar sein.","system");
