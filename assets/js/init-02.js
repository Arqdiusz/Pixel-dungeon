'use strict';

document.addEventListener('pointerover',e=>{if(!busy&&e.pointerType==='mouse'){let b=helpTarget(e);if(b&&!b.disabled)tooltip(b.dataset.help,e.clientX,e.clientY)}},true);

document.addEventListener('pointerup',()=>{stopHold();if(!hold)return;clearTimeout(hold.timer);if(hold.long){suppress={b:hold.b,until:Date.now()+1000};tipTimer=setTimeout(hideTip,3500)}hold=null},true);

document.addEventListener('pointercancel',()=>{stopHold();clearTimeout(hold?.timer);hold=null;hideTip()},true);

document.addEventListener('click',e=>{if(suppress&&Date.now()<suppress.until&&suppress.b.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();suppress=null}},true);

document.addEventListener('focusout',hideTip);

document.addEventListener('pointerout',e=>{let b=helpTarget(e);if(e.pointerType==='mouse'&&b&&!b.contains(e.relatedTarget))hideTip()});

for(let b of $('pad').querySelectorAll('button')){b.addEventListener('pointerdown',e=>{e.preventDefault();if(!canAct())return;let d=[+b.dataset.dx,+b.dataset.dy];heldDirection=fighting()?null:d;lastStep=performance.now();move(...d);b.setPointerCapture(e.pointerId)});b.addEventListener('pointerup',stopHold);b.addEventListener('pointercancel',stopHold)}

const LANDSCAPES=['Dolina o świcie','Zamek nad rzeką','Jesienny trakt','Strażnica w górach','Brzeziny o zmierzchu'];

for(let i=0;i<5;i++){let b=document.createElement('button');b.dataset.index=i;b.textContent=i+1;b.setAttribute('aria-label',LANDSCAPES[i]);b.onclick=()=>{landscape=i;drawLandscape()};$('landscapeDots').append(b)}

const world=$('world');

world.addEventListener('pointerdown',e=>{if(titleActive||busy||e.button!==0)return;world.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,moved:false};hideTip()});

world.addEventListener('pointermove',e=>{if(titleActive||busy)return;if(drag&&drag.id===e.pointerId){let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>8)drag.moved=true;if(drag.moved){cam.follow=false;cam.x=Math.max(-400,Math.min(1400,drag.cx-dx/cam.scale));cam.y=Math.max(-350,Math.min(1100,drag.cy-dy/cam.scale));draw()}return}if(e.pointerType==='mouse'){let h=hit(e.clientX,e.clientY);if(h)tooltip(h.text,e.clientX,e.clientY);else hideTip()}});

world.addEventListener('pointerup',e=>{if(!drag||busy||drag.id!==e.pointerId)return;let moved=drag.moved;drag=null;if(world.hasPointerCapture(e.pointerId))world.releasePointerCapture(e.pointerId);if(moved)return;let h=hit(e.clientX,e.clientY);if(!h)return;if(h.e){target=h.e.id;render()}else if(h.npc)talk(h.npc);else{let d=open('Na szlaku');para(d,h.text)}});

world.addEventListener('pointercancel',()=>drag=null);

world.addEventListener('pointerleave',hideTip);

const DIRS={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};

document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideTip();stopHold();return}if($('dialog').open){if(e.repeat)return;let n=+e.key;if(n>=1&&n<=9&&choiceHandlers[n-1]&&!choiceHandlers[n-1].disabled){e.preventDefault();choiceHandlers[n-1].click()}else if(e.key==='Enter'&&!$('progressButton').hidden&&document.activeElement?.tagName!=='BUTTON'){e.preventDefault();$('progressButton').click()}return}if(titleActive||busy)return;let k=e.key.toLowerCase();if(DIRS[k]){e.preventDefault();if(!e.repeat){lastStep=performance.now();heldDirection=fighting()?null:DIRS[k];move(...DIRS[k])}return}if(e.repeat)return;if(k==='z')undo();if(k==='e')defend();if(k==='r')toggleMount();if(k==='f')talk();if(k==='m')panel('map');if(k==='?')panel('help');if(['1','2','3'].includes(k))attack(+k-1);if(k==='tab'){e.preventDefault();let es=map().enemies.filter(e=>!fighting()||S.combat.ids.includes(e.id)),i=es.findIndex(e=>e.id===target);target=es[(i+1)%es.length]?.id;render()}});

document.addEventListener('keyup',e=>{if(DIRS[e.key.toLowerCase()])stopHold()});

window.addEventListener('resize',()=>{if(titleActive)drawLandscape();else{positionLog();draw()}scheduleScroll()});

document.addEventListener('fullscreenchange',()=>{updateTitleFullscreen();setTimeout(()=>{if(titleActive)drawLandscape();else{positionLog();draw()}scheduleScroll()},60)});

window.addEventListener('blur',()=>{stopHold();clearTimeout(hold?.timer);hold=null;drag=null;hideTip()});

window.addEventListener('error',e=>$('error').textContent=e.message);

const originalSync32=syncHorse;

syncHorse=function(){if(hero().mounted)originalSync32();else followHorse32()};

const originalDamage32=damage;

damage=function(i){let r=originalDamage32(i);if(i===0&&mounted()&&!mountedCounter32(map().enemies.find(e=>e.id===target)))r=r.map(n=>Math.round(n*1.25));return r};

const originalMove32=move;

move=function(dx,dy){if(tutorialLock()&&!$('dialog').open){tutorialPrompt32();return;}if(!canAct())return;let a=hero(),start={x:a.x,y:a.y,map:S.map},riding=mounted(),steps=riding?2:1;if(!fighting()){let before=clone(S);for(let j=0;j<steps;j++){let x=a.x,y=a.y;originalMove32(dx,dy);if(a.x===x&&a.y===y||S.map!==start.map||S.scene||S.outcome||$('dialog').open||fighting()||busy)break;}if(a.x!==start.x||a.y!==start.y||S.map!==start.map){history.push(before);history=history.slice(-5);if(S.map===start.map&&!fighting())motions.set('actor',{from:{x:start.x,y:start.y},to:{x:a.x,y:a.y},start:performance.now(),duration:riding?270:160});reveal32();render();save();}return;}
stopHold();if(S.combat.movesUsed>=moveBudget()){log('Ruch wykorzystany. Zaatakuj albo użyj obrony.');render();return;}let moved=0;for(let j=0;j<steps&&S.combat.movesUsed<moveBudget();j++){let x=a.x+dx,y=a.y+dy;if(blocked(x,y)||occupied(x,y))break;begin();for(let e of map().enemies){if(!S.combat.ids.includes(e.id)||S.combat.reactions[e.id]||!line(e,a,TYPES[e.type].range,e.id))continue;S.combat.reactions[e.id]=true;applyEnemyStrike(e,true);if(a.hp<=0)break;}if(a.hp<=0)break;let before=snapshot(),old={x:a.x,y:a.y};a.dir=direction(dx,dy);a.x=x;a.y=y;syncHorse();if(asMaster()){S.p.x=old.x;S.p.y=old.y;S.p.dir=a.dir;}record({kind:'move',entity:'actor',from:old,to:{x,y},targets:[]},before);S.combat.movesUsed++;moved++;pickup();reveal32();if(map().exits.some(e=>exitContains33(e,x,y)))break;}
if(!moved&&a.hp>0){log('Droga zablokowana.');render();return;}if(a.hp<=0&&S.map==='road3'&&!S.prologue.done)prologueFatal();save();playTimeline(()=>{render();let e=map().exits.find(e=>exitContains33(e,a.x,a.y));if(e&&a.hp>0)useExit(e);resumeScene();});};

document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea'))return;if(tutorialLock()&&!$('dialog').open&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','1','2','e','r','f','z','m'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();tutorialPrompt32();}},true);

document.addEventListener('click',e=>{if(tutorialLock()&&!$('dialog').open&&e.target.closest('#hud button')&&!e.target.closest('#attack2')){e.preventDefault();e.stopImmediatePropagation();tutorialPrompt32();}},true);

$('world').addEventListener('pointermove',e=>{if(drag){drag.moved=false;drag.x=e.clientX;drag.y=e.clientY;}e.stopImmediatePropagation();},true);

const originalRender32=render;

render=function(){originalRender32();if(!S||titleActive)return;for(let i=0;i<3;i++){let b=$('a'+i),range=i===1&&mounted()?chargeRange32(map().enemies.find(e=>e.id===target)):damage(i);if(i===2&&(mounted()||!asMaster()&&!S.p.specialUnlocked))continue;b.textContent=range.join('–')+' DMG\n'+(i===1&&mounted()?'15 KOŃ ·6 STA':attackCost(i)+' STA'+(i===0&&mounted()?' ·4 KOŃ':''));}if(tutorialLock()&&!busy)for(let b of document.querySelectorAll('#hud button'))b.disabled=false;if(mounted()){$('attack0').dataset.help+='\nCios konny: +25% obrażeń (bez premii na włóczników/olbrzymów). Koszt: 4 energii Chabra.';$('attack1').dataset.help+='\nObrażenia: '+chargeRange32(map().enemies.find(e=>e.id===target)).join('–')+'. Przeciw włócznikom/olbrzymom szarża ma połowę obrażeń.';} }

localMapPanel=function(d){reveal32();const m=map(),cv=document.createElement('canvas');cv.id='localMap';cv.width=m.w*12;cv.height=m.h*12;cv.style.width='100%';cv.style.maxWidth='650px';cv.style.height='auto';cv.style.imageRendering='pixelated';const c=cv.getContext('2d'),known=S.world.explored[S.map],pct=Math.round(100*known.filter(Boolean).length/(m.w*m.h));para(d,map().name+' · odkryto '+pct+'% · odkrywanie: 12 pól w eksploracji, 6 w walce.','fine');for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){let road=(y>=10&&y<=14||REGIONS[S.map]&&x>=14&&x<=18);rect(c,x*12,y*12,12,12,known32(x,y)?road?'#a79564':'#52753e':'#102119');if(known32(x,y)){c.strokeStyle='#223d2122';c.strokeRect(x*12,y*12,12,12);}}
for(const o of m.obstacles){if(o.type==='tree'||o.type==='rock'){if(known32(o.x,o.y))rect(c,o.x*12+2,o.y*12+2,8,8,o.type==='tree'?'#24472b':'#929b83');}else for(let dy=0;dy<(o.h||1);dy++)for(let dx=0;dx<(o.w||1);dx++)if(known32(o.x+dx,o.y+dy))rect(c,(o.x+dx)*12,(o.y+dy)*12,12,12,o.type==='church'?'#e3dcbb':o.type==='fire'?'#df9451':'#9b8c72');}
let pois=localPOIs().filter(p=>{for(let yy=p.y;yy<p.y+p.h;yy++)for(let xx=p.x;xx<p.x+p.w;xx++)if(known32(xx,yy))return true;return false;});for(let e of m.exits)for(const p of exitCells33(e,m))if(known32(p.x,p.y))rect(c,p.x*12+1,p.y*12+1,10,10,e.locked?'#a0a088':'#e8c875');for(let n of m.npcs)if(known32(n.x,n.y))rect(c,n.x*12+3,n.y*12+3,6,6,'#7dd2d7');for(let e of m.enemies)if(seenNow32(e))rect(c,e.x*12+3,e.y*12+3,6,6,'#ef8d77');rect(c,hero().x*12,hero().y*12,12,12,'#fff4a2');d.append(cv);para(d,'Żółty: Ty / wyjścia · niebieski: rozmówcy · jasne bryły: budynki · czerwony: widoczni teraz wrogowie. Ciemne części odkryjesz podczas podróży.','fine');let detail=document.createElement('div');d.append(detail);for(let p of pois)btn(detail,p.name,()=>{let dd=open(p.name,'mapDetail32');para(dd,p.text);btn(dd,'Wróć do mapy',()=>panel('map'));});cv.onclick=e=>{let r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*m.w,y=(e.clientY-r.top)/r.height*m.h,p=[...pois].reverse().find(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h);if(p){let dd=open(p.name,'mapDetail32');para(dd,p.text);btn(dd,'Wróć do mapy',()=>panel('map'));}};};

HELP.controls[1]='WASD/strzałki lub D-pad: pieszo 1 pole, konno do 2 pól. Przeszkody i wyjścia sprawdzane po każdym kroku. Kamera jest przy bohaterze, bez rozglądania przez przeciąganie.\n1 — zwykły atak. 2 — ciężki lub szarża. 3 — specjalny pieszo. E — obrona/obóz. R — koń. F — rozmowa. M — mapa. Z — cofnij jedną z 5 tur, także w eksploracji. I — sakwa.';

HELP.mounted[1]='Wykrycie przeciwnika nie powoduje zsiadania. Pierwsza tura pozwala na szarżę, jeśli cel jest 2 pola po prostej i istnieje bezpieczny odjazd.\nZwykły cios: +25% obrażeń, koszt 4 energii Chabra oraz normalnej staminy. Z siodła przyjmujesz o 20% mniej obrażeń od zwykłych wrogów. Włócznicy i olbrzymi ignorują te premie; szarża na nich zadaje połowę obrażeń i nie eliminuje automatycznie z zaskoczenia.\nObrona odnawia +3 energii Chabra. Przy 0 energii koń wycofuje się, a Ty walczysz pieszo. Nie dosiądziesz go ponownie w tej walce. Po walce odpocznij. Zsiadanie i wsiadanie w walce kończy turę. Chaber podąża za pieszym bohaterem po dostępnej drodze; wycofany koń nie wraca pod ostrza w trakcie walki.';

HELP.world[1]='Gra ma stały pionowy obszar 420×840. Zmiana okna skaluje całość, ale nie odsłania większego fragmentu świata. Nie można przesuwać kamery.\nMapa lokalna odkrywa teren w promieniu 6 pól i zapamiętuje go w zapisie. Pokazuje drogi, budynki, przeszkody, rozmówców i wyjścia z odkrytej części lokacji. Wrogowie są pokazywani tylko w bieżącym zasięgu widzenia.\nMasz 5 cofnięć ruchów/tur. Zatwierdzone sceny fabularne nadal są punktami kontrolnymi.';

HELP.charge[1]+='\nWersja v32: wejście do walki nie zrzuca z siodła. Włócznicy i olbrzymi otrzymują połowę normalnego przedziału obrażeń szarży. Przy zerowej energii po akcji Chaber wycofuje się.';

const fullscreen32=()=>parent.postMessage({type:'giermek-fullscreen'},'*');

toggleFullscreen=fullscreen32;

for(let b of document.querySelectorAll('[data-help]'))if(b.dataset.help==='Pełny ekran')b.onclick=fullscreen32;
