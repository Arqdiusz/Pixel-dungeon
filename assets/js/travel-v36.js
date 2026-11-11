/* v36: całkowite minuty i energia; zastępuje travel-v35.js. */
(()=>{'use strict';
const cfg={travelStepsPerEnergy:20,rideRegenEvery:2,rideRegen:1,combatUpkeep:1,defendSta:4,defendHorse:1,recoveryPool:3,parrySta:1,knockNormal:8,knockSpear:30,knockGiant:20,knockWolf:5};
const old={step:originalMove32,start:startCombat,phase:enemyPhase,render,save,exit:useExit,time:addTime,strike:applyEnemyStrike,defend,recover:recoverHours,full:forceFullRecovery,returnCamp:returnFromCamp,safeCamp:safeRecoveryAfterDefense};
let journey=null;
function state(st=S){if(!st)return;const h=st.p.horse;
 if(!st.travel36){if(st.travel35?.seconds>0)st.minutes++;st.minutes=Math.ceil(st.minutes);h.power=Math.floor(h.power);st.travel36={mode:'walk',rideSteps:{}};delete st.travel35;}
 h.travelWork36??=0;h.recoveryLeft36??=cfg.recoveryPool;st.travel36.rideSteps??={};
}
function budget(){if(!fighting())return mounted()?2:1;const c=S.combat;if(c.allowanceRound36!==c.round){c.allowanceRound36=c.round;c.moveAllowance36=mounted()?2:1;}return c.moveAllowance36;}
function calm(){state();if(S)S.travel36.mode='walk';stopHold();}
function regainHorse(){const h=S.p.horse;if(h.recoveryLeft36<=0||h.power>=h.maxPower)return 0;const n=Math.min(cfg.defendHorse,h.maxPower-h.power,h.recoveryLeft36);h.power+=n;h.recoveryLeft36-=n;return n;}
function flee(reason){const a=hero(),h=S.p.horse;if(!a.mounted)return;dismountFree();h.fled=true;h.blockFight36=true;
 const q=[{x:a.x,y:a.y,n:0}],seen=new Set([a.x+','+a.y]);let best=null;
 for(let i=0;i<q.length;i++){const p=q[i];if(p.n>0){const danger=map().enemies.filter(e=>line(e,p,TYPES[e.type].range,e.id)).length,score=danger*100-p.n;if(!best||score<best.score)best={...p,score};}if(p.n===4)continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(seen.has(k)||blocked(x,y)||occupied(x,y))continue;seen.add(k);q.push({x,y,n:p.n+1});}}
 if(best){h.x=best.x;h.y=best.y;}log(reason+' Chaber wycofuje się do końca walki.','enemy');
}
function resetRest(){state();S.p.horse.travelWork36=0;S.p.horse.recoveryLeft36=cfg.recoveryPool;if(!fighting()){S.p.horse.fled=false;S.p.horse.blockFight36=false;}}
moveBudget=budget;
save=function(){if(S){state();if(fighting())budget();for(const s of history)state(s);if(pending)state(pending);}return old.save();};
// Koń stojący bez jeźdźca nie zmienia położenia.
syncHorse=function(){if(mounted())originalSync32();};
if(typeof followHorse32==='function')followHorse32=function(){};
useExit=function(e){const keep=!mounted()&&S.map!=='_camp',h=keep?clone(S.p.horse):null,origin=S.map;old.exit(e);if(keep&&S.map!==origin){const now=S.p.horse;now.map=h.map;now.x=h.x;now.y=h.y;now.rider=null;render();save();}};
addTime=function(n){if(journey&&n===1){if(!journey.paid){old.time(1);journey.paid=true;}}else old.time(n);};
startCombat=function(...args){calm();old.start(...args);S.combat.allowanceRound36=null;budget();render();save();};
enemyPhase=function(){state();calm();if(mounted()){S.p.horse.power=Math.max(0,S.p.horse.power-cfg.combatUpkeep);if(S.p.horse.power===0)flee('Chaber wyczerpał energię.');}old.phase();if(!fighting()){S.p.horse.blockFight36=false;S.p.horse.fled=false;}save();};
horseExhaust32=function(){if(mounted()&&S.p.horse.power<=0)flee('Chaber wyczerpał energię.');};
damage=function(i){let r=originalDamage32(i);if(i===0&&mounted())r=r.map(n=>n*2);return r;};
charge=function(){if(!canAct()||tutorialLock())return;log('Szarża jest zablokowana. W przyszłości nauczysz się jej u stajennego w zamku.');render();};
applyEnemyStrike=function(e,reaction=false){state();const a=hero(),riding=a.mounted,first=timeline.length;old.strike(e,reaction);const frame=timeline.slice(first).find(f=>f.kind==='hit'),hit=frame?.targets?.[0];if(!riding||!hit||a.hp<=0)return;
 if(hit.parry){const oldSta=a.sta;a.sta=Math.min(total('sta',a),a.sta+cfg.parrySta);const gain=regainHorse();log('Parowanie: +'+(a.sta-oldSta)+' STA, +'+gain+' energii Chabra.','heal');}
 else if(!hit.miss&&hit.damage>0&&a.mounted&&S.prologue.done){let chance=e.type===2?cfg.knockSpear:mountedCounter32(e)?cfg.knockGiant:e.type===3?cfg.knockWolf:cfg.knockNormal;if(reaction)chance=Math.floor(chance/2);if(rng(1,100)<=chance)flee(TYPES[e.type].name+' strąca Cię z siodła!');}
 frame.after=snapshot();
};
defend=function(){if(!canAct()||tutorialLock())return;if(!fighting()||!mounted())return old.defend();state();begin();const a=hero(),before=snapshot(),sta=a.sta;a.counter=false;a.sta=Math.min(total('sta',a),a.sta+cfg.defendSta);a.guard=true;const gain=regainHorse();log('Obrona konna: +'+(a.sta-sta)+' STA, +'+gain+' energii Chabra. Pozostały zapas regeneracji w walce: '+S.p.horse.recoveryLeft36+'.','heal');record({kind:'rest',from:{x:a.x,y:a.y},targets:[{x:a.x,y:a.y}],value:a.sta-sta},before);enemyPhase();};
recoverHours=function(hours){const g=old.recover(hours);if(hours>0)resetRest();return g;};
forceFullRecovery=function(){const g=old.full();resetRest();return g;};
returnFromCamp=function(...args){state();const h=S.p.horse,work=h.travelWork36,pool=h.recoveryLeft36,fled=h.fled,blocked=h.blockFight36;old.returnCamp(...args);S.p.horse.travelWork36=work;S.p.horse.recoveryLeft36=pool;S.p.horse.fled=fled;S.p.horse.blockFight36=blocked;save();};
safeRecoveryAfterDefense=function(){if(S.campSession?.stage==='afterDefense')resetRest();return old.safeCamp();};
function exitAt(e,x,y){return typeof exitContains33==='function'?exitContains33(e,x,y):e.x===x&&e.y===y;}
function important(){const a=hero();return map().npcs.some(n=>Math.abs(n.x-a.x)+Math.abs(n.y-a.y)<=1)||map().drops.some(d=>Math.abs(d.x-a.x)+Math.abs(d.y-a.y)<=1)||map().exits.some(e=>exitAt(e,a.x,a.y));}
function ridingStep(){const h=S.p.horse;h.travelWork36++;if(h.travelWork36>=cfg.travelStepsPerEnergy){h.travelWork36-=cfg.travelStepsPerEnergy;h.power=Math.max(0,h.power-1);}}
function regen(){const t=S.travel36,id=asMaster()?'master':'player';t.rideSteps[id]=(t.rideSteps[id]||0)+1;if(t.rideSteps[id]>=cfg.rideRegenEvery){t.rideSteps[id]=0;hero().sta=Math.min(total('sta'),hero().sta+cfg.rideRegen);}}
move=function(dx,dy){if(tutorialLock()&&!$('dialog').open){tutorialPrompt32();return;}if(!canAct()||Math.abs(dx)+Math.abs(dy)!==1)return;state();
 if(fighting()){calm();budget();return old.step(dx,dy);}
 const a=hero(),h=S.p.horse,riding=a.mounted,gal=riding&&S.travel36.mode==='gallop',origin=S.map,before=clone(S);let moved=0;journey={paid:false};
 try{for(let i=0;i<(gal?2:1);i++){if(!canAct()||fighting()||S.scene||S.outcome||S.map!==origin)break;const x=a.x+dx,y=a.y+dy;if(blocked(x,y)||occupied(x,y))break;if(riding&&h.power<=0){log('Chaber jest wyczerpany. Zsiądź i odpocznij w obozie.');calm();break;}
 const drop=map().drops.some(d=>d.x===x&&d.y===y);if(riding){ridingStep();if(!gal)regen();}old.step(dx,dy);moved++;
 if(S.map!==origin||fighting()||busy||$('dialog').open||S.scene||S.outcome){calm();break;}if(gal&&(drop||important())){calm();break;}if(riding&&h.power===0){calm();log('Chaber jest zmęczony — potrzebuje obozu.');break;}
 }}finally{journey=null;}
 if(!moved){render();return;}if(fighting())horseExhaust32();if(S.map===origin){history.push(before);history=history.slice(-5);}render();save();
};
function whistle(){if(!canAct()||tutorialLock())return;state();if(fighting()){log('W walce nie możesz przywołać konia gwizdaniem.');render();return;}if(S.scene||S.outcome||mounted())return;const h=S.p.horse;if(h.power<=0){log('Chaber jest wyczerpany. Najpierw odpocznij w obozie.');render();return;}const before=clone(S);h.fled=false;h.blockFight36=false;hero().mounted=true;syncHorse();calm();addTime(1);history.push(before);history=history.slice(-5);log('Gwiżdżesz. Chaber przybywa i od razu wsiadasz.');render();save();}
toggleMount=function(){if(!canAct()||tutorialLock())return;state();if(!fighting()&&!mounted()){whistle();return;}const a=hero(),h=S.p.horse,c=S.combat;if(fighting()){budget();if(c.movesUsed>=budget()){log('Brak ruchu na zmianę dosiadania. Akcja jest nadal dostępna.');render();return;}if(!mounted()&&(h.fled||h.blockFight36||h.power<=0||h.map!==S.map||Math.abs(h.x-a.x)+Math.abs(h.y-a.y)>1)){log('Chaber nie jest dostępny do dosiadania w tej walce.');render();return;}begin();const before=snapshot(),p={x:a.x,y:a.y};if(mounted())dismountFree();else{a.mounted=true;syncHorse();}c.movesUsed++;a.counter=false;calm();record({kind:'move',entity:'actor',from:p,to:p,targets:[]},before);save();playTimeline(render);return;}
 const before=clone(S);dismountFree();calm();addTime(1);history.push(before);history=history.slice(-5);log('Zsiadasz. Chaber zostaje na miejscu. Przywołaj go gwizdaniem [H].');render();save();};
function toggleGallop(){if(!canAct()||!mounted()||fighting()||tutorialLock()||S.scene||S.outcome)return;state();S.travel36.mode=S.travel36.mode==='gallop'?'walk':'gallop';stopHold();render();save();}
const g=document.createElement('button');g.id='gallop36';g.className='round';g.style.fontSize='8px';g.onclick=toggleGallop;g.setAttribute('aria-label','Galop [G]');$('toolRow').append(g);
const wh=document.createElement('button');wh.id='whistle36';wh.className='round';wh.style.fontSize='8px';wh.textContent='GWIZD';wh.onclick=whistle;wh.dataset.help='Przywołaj Chabra i wsiądź [H]\nPoza walką. Koszt 1 minuty. Koń nie odnawia w ten sposób energii.';wh.setAttribute('aria-label','Gwizdnij po konia [H]');$('toolRow').append(wh);
for(const b of $('toolRow').querySelectorAll('button')){const href=b.querySelector('use')?.getAttribute('href');if(href==='#ic-horse'){b.onclick=()=>toggleMount();b.dataset.help='Koń [R]: zsiądź / przywołaj. W walce zmiana dosiadania kosztuje 1 ruch.';}if(href==='#ic-shield'){b.onclick=()=>defend();b.dataset.help='Obrona [E]\nKonno +4 STA, maks. +1 energii konia z ograniczonego zapasu. Pieszo +6 STA. Redukcja 50% i parowanie.';}}
const info=document.createElement('div');info.id='horse36Status';info.style.cssText='font:10px/1.4 system-ui;color:#d6d7b6';$('top').append(info);
render=function(){if(S){state();if(fighting()||!mounted())S.travel36.mode='walk';if(fighting())budget();}old.render();if(!S||titleActive)return;const h=S.p.horse;g.disabled=!mounted()||fighting()||busy||h.power<=0||tutorialLock();g.textContent=S.travel36.mode==='gallop'?'GALOP ON':'GALOP';g.setAttribute('aria-pressed',String(S.travel36.mode==='gallop'));g.dataset.help='Galop [G]: do 2 pól za 1 minutę. Dwa razy więcej wysiłku na minutę niż spokojna jazda. Bez odnawiania STA.';wh.disabled=mounted()||fighting()||busy||h.power<=0||tutorialLock();info.textContent='Chaber: '+h.power+'/'+h.maxPower+' energii'+(fighting()?' · ruch '+S.combat.movesUsed+'/'+budget():'');if(mounted()){$('attack1').disabled=true;$('a1').textContent='NAUKA';$('attack1').dataset.help='Szarża — przyszła nauka u stajennego w zamku.';$('attack0').dataset.help='Cios z siodła: +100% obrażeń. Koszt '+attackCost(0)+' STA i 4 energii Chabra. Koniec tury w siodle zużywa dodatkowo 1 energii.';}};
const oldPanel=panel;
panel=function(type){if(type!=='horse')return oldPanel(type);if(busy||!S)return;state();const d=open('Chaber — v36','horse36'),h=S.p.horse;para(d,'Energia '+h.power+'/'+h.maxPower+'. Spokojna jazda: 1 pole = 1 minuta; galop: do 2 pól = 1 minuta.','numeric');para(d,'1 energii co '+cfg.travelStepsPerEnergy+' przejechanych pól. Spokojna jazda odnawia 1 STA co 2 pola do maksimum. Galop nie odnawia STA. Na pełnym początkowym pasku: 10 godzin spokojnej jazdy albo 5 godzin ciągłego galopu.','fine');para(d,'W siodle: 2 ruchy + akcja, obrażenia +100%. Cios: 4 energii i normalny koszt STA. Każda zakończona tura w siodle: 1 energii. Obrona: +4 STA, do +1 energii konia. Łączny pozostały zapas regeneracji bojowej do obozu: '+h.recoveryLeft36+'.','fine');para(d,'Ryzyko strącenia po nieodpartym trafieniu: zwykły wróg 8%, włócznik 30%, olbrzym 20%, wilk 5%. Reakcje: połowa tych szans. Koń po strąceniu lub wyczerpaniu nie wraca do tej walki. Szarża na razie zablokowana.','fine');para(d,'Po zsiadaniu koń zostaje na miejscu. Poza walką: H przywołuje go i od razu dosiadasz. Koszt 1 minuty, bez odnawiania zasobów.','fine');btn(d,mounted()?'Zsiądź':'Przywołaj i dosiądź',()=>{closeDialog();toggleMount();});};
HELP.controls[1]='WASD/strzałki: 1 pole. G: galop do 2 pól za minutę. H: przywołaj konia i wsiądź poza walką. R: zsiądź / dosiądź. 1: atak, 2: ciężki pieszo (szarża zablokowana), 3: specjalny pieszo. E: obrona/obóz. Z: cofnij. Konno: 2 ruchy + akcja, pieszo: 1 ruch + akcja. Nie musisz zużywać wszystkich ruchów.';
HELP.mounted[1]='Spokojna jazda: 1 pole/1 minuta, +1 STA co 2 pola. Galop: 2 pola/1 minuta, bez STA. Chaber traci 1 energii co 20 przejechanych pól: 10 godzin jazdy lub 5 godzin galopu przy 30 energii. Obóz odnawia energię. Koń po zsiadaniu stoi; H przywołuje go poza walką.\nWalka: 2 ruchy + akcja. Atak +100% obrażeń, koszt 4 energii + STA. Koniec tury w siodle kosztuje 1 energii. Obrona +4 STA i do +1 energii konia; łącznie z parowaniem tylko 3 energii do następnego obozu. Włócznicy najłatwiej strącają. Przy strąceniu albo zerze energii koń ucieka do końca tej walki. Wsiadanie nie resetuje budżetu ruchu.';
HELP.charge[1]='Szarża wyłączona. Nauka u stajennego w zamku i quest zostaną dodane w przyszłości. Galop ma na razie 2 pola; kolejne poziomy szkolenia dopiero później.';
HELP.time[1]='Pieszo: 1 pole = 1 minuta. Spokojnie konno: 1 pole = 1 minuta. Galop: do 2 pól = 1 minuta. Bez sekund i dziesiętnych części energii. Stanie i czytanie dialogów nie przesuwają zegara.';
HELP.parry[1]='Obrona pieszo: +6 STA. Konno: +4 STA oraz do +1 energii Chabra. Udane parowanie konno: +1 STA oraz do +1 energii Chabra. Regeneracja konia z obrony i parowania wspólnie ograniczona do 3 energii między odpoczynkami. Redukcja przy obronie 50%, bazowe szanse parowania bez zmian. Każda zakończona tura w siodle zużywa 1 energii, więc nie można odnawiać konia bez końca.';
document.addEventListener('keydown',e=>{if(e.repeat||titleActive||busy||$('dialog').open||e.target.closest('input,select,textarea'))return;const k=e.key.toLowerCase();if(k==='g'){e.preventDefault();toggleGallop();}if(k==='h'){e.preventDefault();whistle();}});
if(S)render();
})();
