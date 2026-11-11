/* Giermek v35 — ruch, dosiadanie, szarża i zasoby podróży. Ładuj po init-03.js. */
(() => {
'use strict';
const cfg={walkSeconds:60,rideSeconds:30,gallopSeconds:15,rideEnergy:.010,gallopEnergy:.05,regenCap:1};
const old={step:originalMove32,mount:toggleMount,start:startCombat,enemyPhase,render,panel,addTime};
let stepClock=null;
function travel(){if(!S)return null;const t=S.travel35??={};t.mode??='walk';t.seconds??=0;t.footSteps??={};t.rideSteps??={};return t;}
function turnBudget(){if(!fighting())return mounted()?2:1;const c=S.combat;if(c.moveAllowance35!==1&&c.moveAllowance35!==2)c.moveAllowance35=mounted()?2:1;return c.moveAllowance35;}
function finishMode(){const t=travel();if(t)t.mode='walk';stopHold();}
function clock(seconds){const t=travel(),sum=t.seconds+seconds;S.minutes+=Math.floor(sum/60);t.seconds=sum%60;}
function regen(riding){const t=travel(),id=asMaster()?'master':'player',a=hero(),counter=riding?t.rideSteps:t.footSteps,every=riding?2:3;counter[id]=(counter[id]||0)+1;if(counter[id]>=every){counter[id]=0;const ceiling=Math.floor(total('sta',a)*cfg.regenCap);if(a.sta<ceiling)a.sta=Math.min(ceiling,a.sta+1);}}
function gallopLimit(){return S.p.horse.gallopTrained35===true?3:2;}
function canGallop(){return active()&&!busy&&!fighting()&&mounted()&&!tutorialLock()&&!S.scene&&!S.outcome;}
function toggleGallop(){if(!canGallop())return;if(travel().mode!=='gallop'&&S.p.horse.power<cfg.gallopEnergy){log('Chaber potrzebuje co najmniej 1 energii na krok galopu.');render();return;}const t=travel();t.mode=t.mode==='gallop'?'walk':'gallop';stopHold();log(t.mode==='gallop'?'Galop: do '+gallopLimit()+' pól na polecenie. G wyłącza galop.':'Spokojna jazda: jedno pole na polecenie.');render();save();}
function exitAt(e,x,y){return typeof exitContains33==='function'?exitContains33(e,x,y):e.x===x&&e.y===y;}
function important(x,y){return map().npcs.some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<=1)||map().drops.some(d=>Math.abs(d.x-x)+Math.abs(d.y-y)<=1)||map().exits.some(e=>exitAt(e,x,y));}
moveBudget=turnBudget;
startCombat=function(...args){finishMode();old.start(...args);S.combat.moveAllowance35=mounted()?2:1;render();save();};
enemyPhase=function(){if(!S)return;S.combat.moveAllowance35=mounted()?2:1;finishMode();return old.enemyPhase();};
addTime=function(minutes){if(stepClock&&minutes===1&&!stepClock.paid){stepClock.paid=true;clock(stepClock.seconds);}else old.addTime(minutes);};
move=function(dx,dy){
 if(tutorialLock()&&!$('dialog').open){tutorialPrompt32();return;}
 if(!canAct()||Math.abs(dx)+Math.abs(dy)!==1)return;
 if(fighting()){
  finishMode();const a=hero(),h=S.p.horse,budget=turnBudget(),x=a.x+dx,y=a.y+dy;
  if(S.combat.movesUsed>=budget||blocked(x,y)||occupied(x,y))return old.step(dx,dy);
  if(a.mounted&&h.power+1e-9<cfg.rideEnergy){log('Chaber nie ma energii na krok. Zsiądź albo użyj obrony.');render();return;}
  const riding=!!a.mounted,beforePower=h.power,point={x:a.x,y:a.y};
  begin();if(riding)h.power=Math.max(0,Math.round((h.power-cfg.rideEnergy)*100)/100);
  old.step(dx,dy);
  if(riding&&a.x===point.x&&a.y===point.y)h.power=beforePower;
  if(riding&&h.power<=0)horseExhaust32();save();return;
 }
 const t=travel(),a=hero(),h=S.p.horse,riding=!!a.mounted,galloping=riding&&t.mode==='gallop',limit=galloping?gallopLimit():1,before=clone(S),origin={x:a.x,y:a.y,map:S.map};let steps=0,stopped=false;
 for(let j=0;j<limit;j++){
  if(!canAct()||fighting()||S.scene||S.outcome||S.map!==origin.map)break;
  const x=a.x+dx,y=a.y+dy;
  if(blocked(x,y)||occupied(x,y)){if(!steps)log('Droga zablokowana.');break;}
  const cost=riding?(galloping?cfg.gallopEnergy:cfg.rideEnergy):0;
  if(riding&&h.power+1e-9<cost){log('Chaber jest zbyt zmęczony. Zsiądź albo odpocznij w obozie.');finishMode();stopped=true;break;}
  const wasDrop=map().drops.some(d=>d.x===x&&d.y===y),prior={x:a.x,y:a.y};
  if(riding)h.power=Math.max(0,Math.round((h.power-cost)*100)/100);
  if(!galloping)regen(riding);
  stepClock={seconds:riding?(galloping?cfg.gallopSeconds:cfg.rideSeconds):cfg.walkSeconds,paid:false};
  try{old.step(dx,dy);}finally{stepClock=null;}
  if(a.x===prior.x&&a.y===prior.y&&S.map===origin.map)break;
  steps++;
  if(S.map!==origin.map||fighting()||busy||$('dialog').open||S.scene||S.outcome){finishMode();stopped=true;break;}
  if(galloping&&(wasDrop||important(a.x,a.y))){finishMode();log('Galop zatrzymany przy ważnym punkcie.');stopped=true;break;}
  if(riding&&h.power<=0){finishMode();log('Chaber wyczerpał energię. Dalsza jazda wymaga odpoczynku.');stopped=true;break;}
 }
 if(!steps){render();save();return;}
 if(fighting()&&a.mounted&&h.power<=0)horseExhaust32();
 if(S.map===origin.map){history.push(before);history=history.slice(-5);if(!fighting()&&!busy)motions.set('actor',{from:{x:origin.x,y:origin.y},to:{x:a.x,y:a.y},start:performance.now(),duration:galloping?220:160});}
 if(galloping&&!stopped&&steps<limit)stopHold();
 render();save();
};
toggleMount=function(){
 if(!canAct()||tutorialLock())return;
 if(!fighting()){finishMode();if(S.p.horse.power>0)S.p.horse.fled=false;return old.mount();}
 const a=hero(),h=S.p.horse,budget=turnBudget();
 if(S.combat.movesUsed>=budget){log('Brak ruchu na zmianę dosiadania. Możesz jeszcze zaatakować lub użyć obrony.');render();return;}
 if(!a.mounted&&(h.power<=0||h.fled)){log('Chaber nie może teraz wrócić do walki.');render();return;}
 if(!a.mounted&&(h.map!==S.map||Math.abs(h.x-a.x)+Math.abs(h.y-a.y)>1)){log('Podejdź do Chabra na sąsiednie pole.');render();return;}
 begin();const before=snapshot(),point={x:a.x,y:a.y};
 if(a.mounted)dismountFree();else{a.mounted=true;syncHorse();}
 S.combat.movesUsed++;a.counter=false;finishMode();
 record({kind:'move',entity:'actor',from:point,to:point,targets:[]},before);
 log((a.mounted?'Dosiadasz Chabra.':'Zsiadasz z Chabra.')+' Pozostało ruchów: '+Math.max(0,budget-S.combat.movesUsed)+'. Akcja nadal dostępna.');
 save();playTimeline(render);
};
charge=function(){
 if(!canAct()||tutorialLock())return;
 const a=hero(),h=S.p.horse,e=map().enemies.find(e=>e.id===target);
 if(!a.mounted){log('Szarża wymaga konia.');render();return;}
 const distance=e?Math.abs(e.x-a.x)+Math.abs(e.y-a.y):0;
 if(!e||(distance!==2&&distance!==3)||!line(a,e,3,e.id)){log('Szarża: wróg musi stać za jednym albo dwoma pustymi polami, po prostej.');render();return;}
 const landing=chargeLanding(e);
 if(!landing){log('Brak bezpiecznego odjazdu o 2 pola. Szarża nie została wykonana.');render();return;}
 if(h.power<15||a.sta<6){log('Szarża kosztuje 15 energii Chabra i 6 STA. Za mało zasobów.');render();return;}
 const surprise=!fighting()&&e.state==='idle'&&(!visible(e,a)||behind(e,a)),instant=surprise&&!e.boss&&!mountedCounter32(e);
 if(!fighting())startCombat([e.id],'Szarża z inicjatywą.',true);
 begin();const before=snapshot(),from={x:a.x,y:a.y},impact={x:e.x,y:e.y};
 a.counter=false;h.power-=15;a.sta-=6;a.dir=direction(e.x-a.x,e.y-a.y);
 const hit=instant?{hit:true}:rollHit(a,e),raw=hit.hit?rng(...chargeRange32(e)):0,d=instant?e.hp:Math.ceil(raw*(1-(e.armor||0))*(e.guard?.5:1));
 e.hp-=d;if(hit.hit)e.stagger=1;a.x=e.x;a.y=e.y;syncHorse();e.state='alert';
 if(!S.combat.ids.includes(e.id))S.combat.ids.push(e.id);
 log('SZARŻA → '+TYPES[e.type].name+': '+(instant?'ZASKOCZENIE — eliminacja':hit.hit?d+' obrażeń':'PUDŁO')+'; 15 energii Chabra i 6 STA.',hit.hit?'hit':'miss');
 if(e.hp<=0)defeat(e);
 if(hit.hit){h.training++;if(h.training>=3){h.training-=3;h.level++;h.maxPower+=5;h.power=Math.min(h.maxPower,h.power+5);log('Chaber: poziom '+h.level+', +5 maks. energii. Dystans galopu bez zmian.','heal');}}
 record({kind:'hit',from,targets:[{x:impact.x,y:impact.y,damage:d,miss:!hit.hit,instant}],charge:true},before);
 const prior=snapshot();a.x=landing.x;a.y=landing.y;syncHorse();S.combat.movesUsed=turnBudget();
 record({kind:'move',entity:'actor',from:impact,to:landing,targets:[]},prior);
 if(!map().enemies.some(x=>x.id===target))target=null;
 horseExhaust32();enemyPhase();
};
// Zwykłe ciosy i obrona zachowują dotychczasową logikę: można ich użyć przy 0, 1 albo 2 wykonanych ruchach.
const gallop=document.createElement('button');gallop.id='gallop35';gallop.className='round';gallop.style.fontSize='8px';gallop.textContent='GALOP';gallop.setAttribute('aria-label','Włącz lub wyłącz galop [G]');gallop.onclick=toggleGallop;$('toolRow').append(gallop);
for(const b of $('toolRow').querySelectorAll('button'))if(b.querySelector('use')?.getAttribute('href')==='#ic-horse'){b.onclick=()=>toggleMount();b.dataset.help='Wsiądź / zsiądź [R]\nW walce: koszt 1 ruchu, bez kończenia tury i bez utraty akcji.';}
const status=document.createElement('div');status.id='travel35Status';status.style.cssText='font:10px/1.4 system-ui;color:#d6d7b6;margin-top:4px';$('top').append(status);
render=function(){
 if(S){travel();if(!mounted())travel().mode='walk';if(fighting()){travel().mode='walk';turnBudget();}}
 old.render();if(!S||titleActive)return;
 const a=hero(),h=S.p.horse,t=travel(),energy=Number(h.power.toFixed(2));
 gallop.disabled=!canGallop()||(t.mode!=='gallop'&&h.power<1);gallop.setAttribute('aria-pressed',String(t.mode==='gallop'));gallop.classList.toggle('selected',t.mode==='gallop');gallop.textContent=t.mode==='gallop'?'GALOP ✓':'GALOP';
 gallop.dataset.help='Galop [G]: do '+gallopLimit()+' pól. Koszt: 1 energii/pole. Czas: 25 sekund/pole. Zatrzymuje się przy zdarzeniach, NPC, łupach i przejściach.';
 status.textContent='Chaber: '+energy+'/'+h.maxPower+' energii · '+(fighting()?'ruchy '+S.combat.movesUsed+'/'+turnBudget()+' · '+(busy?'rozstrzyganie':'akcja dostępna'):a.mounted?t.mode==='gallop'?'galop do '+gallopLimit()+' pól':'jazda 1 pole':'marsz 1 pole');
 $('clock').textContent=$('clock').textContent.replace(/(\d{2}:\d{2})(?!:)/,'$1:'+String(t.seconds).padStart(2,'0'));
 if(a.mounted){$('attack1').dataset.help='Szarża: 1 lub 2 puste pola między Tobą i wrogiem (cel oddalony o 2–3 kratki). Droga po prostej. Wymagany bezpieczny odjazd. Koszt: 15 energii Chabra i 6 STA. Obrażenia: '+chargeRange32(map().enemies.find(e=>e.id===target)).join('–')+'. Kończy turę; dozwolona także po zwykłym ruchu.';}
};
panel=function(type){
 if(type!=='horse')return old.panel(type);
 if(busy||!S)return;const d=open('Chaber — podróż i walka','horse35'),h=S.p.horse;
 para(d,'Energia: '+Number(h.power.toFixed(2))+'/'+h.maxPower+' · poziom '+h.level+' · wprawa w szarży '+h.training+'/3','numeric');
 para(d,'Marsz pieszo: 60 s/pole. Jazda: 45 s/pole, 0,25 energii/pole. Galop: 25 s/pole, 1 energii/pole, maksymalnie '+gallopLimit()+' pola na polecenie.','numeric');
 para(d,'Spokojna jazda odnawia 1 STA co 2 pola; marsz 1 STA co 3 pola. Tylko poza walką, do 70% maksimum. Galop nie regeneruje staminy. Odpoczynek w obozie odnawia energię Chabra.','fine');
 para(d,'Walka: start w siodle daje 2 ruchy, start pieszo 1 ruch. Krok w siodle kosztuje 0,25 energii, ale nie regeneruje staminy. Każdy krok i każda zmiana dosiadania kosztują 1 ruch. Atak albo obrona kończą turę — nie trzeba zużywać wszystkich ruchów. Wsiadanie nie zwiększa budżetu bieżącej tury.','fine');
 para(d,'Szarża wymaga 1 lub 2 pustych pól przed celem i bezpiecznego odjazdu. Ulepszenie galopu do 3 pól będzie osobnym szkoleniem; awanse za szarże go nie odblokowują.','fine');
 btn(d,mounted()?'Zsiądź — w walce koszt 1 ruchu':'Dosiądź — w walce koszt 1 ruchu',()=>{closeDialog();toggleMount();});btn(d,'Wróć',closeDialog);
};
HELP.controls[1]='WASD/strzałki i D-pad: 1 pole. G: włącz/wyłącz galop (poza walką, do 2 pól; 3 dopiero po osobnym szkoleniu). R: wsiądź/zsiądź. 1/2/3: atak. E: obrona/obóz. F: rozmowa. M: mapa. I: sakwa. Z: cofnij akcję.\nW walce galop jest wyłączony. Start konno: 2 ruchy + akcja, pieszo: 1 ruch + akcja. Możesz atakować bez wykorzystywania wszystkich ruchów.';
HELP.mounted[1]='Jazda: jedno pole na polecenie, 45 s i 0,25 energii/pole; +1 STA co 2 pola do 70%. Galop: do 2 pól na polecenie, po 25 s i 1 energii/pole; bez regeneracji. Szkolenie galopu do 3 pól jest osobne od awansów za szarże.\nWalka: dwie akcje ruchu, jeśli zaczynasz turę w siodle, albo jedna, jeśli zaczynasz pieszo. Każdy krok i zsiadanie/wsiadanie kosztują 1 ruch. Budżet nie resetuje się przy zmianie dosiadania. Zsiadasz pierwszym ruchem: zostaje jeden krok i akcja. Atak lub obrona kończą turę.\nPrzewaga konna i kontrujące jednostki pozostają bez zmian. Przy 0 energii w walce Chaber się wycofuje; podczas podróży zatrzymuje się. Regenerację energii daje obóz. Obrona w siodle nadal daje +3 energii.';
HELP.charge[1]='Szarża: wróg stoi w linii prostej, a pomiędzy wami jest 1 lub 2 pustych pól (odległość do celu 2 lub 3 kratki). Koszt 15 energii konia i 6 STA. Wymaga bezpiecznego odjazdu 2 pola od celu, sprawdzanego przed kosztem. Możesz szarżować po zwykłych ruchach; szarża jest akcją kończącą turę. Pozostałe zasady trafień, parowania i kontr pozostają bez zmian.';
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='g'||e.repeat||e.target.closest('input,select,textarea')||$('dialog').open||titleActive)return;e.preventDefault();toggleGallop();});
if(S)render();
})();
