'use strict';

function rng(a,b){S.seed=(Math.imul(S.seed,1664525)+1013904223)>>>0;return a+Math.floor(S.seed/4294967296*(b-a+1))}

function hash(x,y,n=0){let v=Math.imul(x+57,374761393)^Math.imul(y+71,668265263)^Math.imul(n+1,1274126177);v=Math.imul(v^(v>>>13),1274126177);return(v^(v>>>16))>>>0}

function equipment(k,a=hero()){return Object.values(a.eq||{}).filter(i=>i.stats[k]).map(i=>({name:i.name,value:i.stats[k]}))}

function effects(k,a=hero()){return(a.effects||[]).filter(e=>e.turns>0&&e.stats[k]).map(e=>({name:e.name,value:e.stats[k]}))}

function sum(a){return a.reduce((n,i)=>n+i.value,0)}

function total(k,a=hero()){let base=k==='power'&&a===S.p?(a.specialUnlocked?20+a.level-1:0):a.base[k];return Math.max(k==='regen'||k==='power'?0:1,base+sum(equipment(k,a))+sum(effects(k,a)))}

function cap(){return 10+(S.p.eq.backpack?.capacity||0)}

function active(){return !titleActive&&S&&hero().hp>0}

function canAct(){return active()&&!busy&&!$('dialog').open}

function fighting(){return !!S?.combat.active}

function tutorialLock(){return !!S?.tutorial.forceSpecial}

function mounted(){return !!hero().mounted}

function moveBudget(){return mounted()?2:1}

function begin(){if(!pending){pending=clone(S);history=history.slice(-4)}}

function commit(){if(pending){history.push(pending);history=history.slice(-5);pending=null}}

function clamp(a=hero()){for(let k of ['hp','sta','power'])a[k]=Math.min(a[k],total(k,a))}

function log(text,kind='info'){S.messages.push({turn:S.turn,place:map()?.name||'Podróż',text,kind});S.messages=S.messages.slice(-300)}

function save(){if(!S)return false;try{localStorage.setItem(KEY,JSON.stringify({S,history,pending}));return true}catch(e){$('error').textContent='Zapis zablokowany.';return false}}

function undo(){if(titleActive||busy||$('dialog').open||!S||tutorialLock())return;if(pending){S=pending;pending=null}else if(history.length)S=history.pop();else return;timeline=[];replay=null;fx=null;motions.clear();target=null;stopHold();render();save();resumeScene()}

function timePhase(){let h=Math.floor(S.minutes/60)%24;return h>=6&&h<12?'Poranek':h>=12&&h<18?'Dzień':h>=18&&h<22?'Wieczór':'Noc'}

function timeText(){let m=S.minutes;return'Dzień '+(1+Math.floor(m/1440))+' · '+String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+' · '+timePhase()}

function addTime(m){S.minutes+=m}

function viewRange(){return timePhase()==='Noc'?3:4}

function snapshot(){return{combat:S.combat.active,actor:{...clone(hero()),maxHp:total('hp'),maxSta:total('sta'),maxPower:total('power')},enemies:clone(map().enemies),npcs:clone(map().npcs),p:clone(S.p),horse:clone(S.p.horse),master:asMaster()}}

function record(f,before){timeline.push({...f,before,after:snapshot()})}

function readSave(){try{let d=JSON.parse(localStorage.getItem(KEY));return d?.S?.version===29&&d.S.maps?.[d.S.map]&&d.S.combat&&d.S.p?.horse?d:null}catch(e){return null}}

function refreshSaveSummary(){let d=readSave();$('continueButton').disabled=!d;$('saveSummary').textContent=d?'Zapis: '+d.S.maps[d.S.map].name+' · '+(d.S.combat.active?'walka':'eksploracja'):'Brak zapisu v29. Wybierz tutorial albo wioskę.';updateTitleFullscreen()}

function enterWorld(){titleActive=false;$('titleScreen').hidden=true;$('hud').hidden=false;$('world').hidden=false;hideTip()}

function showTitle(randomize=true){if(busy)return;stopHold();locked=false;drag=null;hideTip();if($('dialog').open)$('dialog').close();titleActive=true;$('titleScreen').hidden=false;$('hud').hidden=true;$('world').hidden=true;if(randomize)landscape=Math.floor(Math.random()*5);refreshSaveSummary();drawLandscape();$('continueButton').disabled?$('newGameButton').focus():$('continueButton').focus()}

function loadSave(fromTitle=true){if(busy)return;let d=readSave();if(!d){if(fromTitle)refreshSaveSummary();else para($('dialogBody'),'Brak zapisu v29.');return}locked=false;if($('dialog').open)$('dialog').close();S=d.S;history=d.history||[];pending=d.pending||null;upgradeState33(S);for(const st of history)upgradeState33(st);if(pending)upgradeState33(pending);target=null;timeline=[];replay=null;fx=null;motions.clear();stopHold();cam.follow=true;enterWorld();render();resumeScene()}

function continueGame(){loadSave(true)}

function requestNewGame(){if(busy)return;let d=open('Nowa podróż');para(d,readSave()?'Nowa gra zastąpi zapis v29. Poprzednie wersje pozostają osobno.':'Wybierz początek podróży.');choices(d,[{text:'Prolog z Dobromirem.',meta:'Koszt: brak. Grywalna zasadzka wilków, napad Brunona i ostatnia przysięga.',fn:()=>{locked=false;closeDialog();start(false)}},{text:'Pomiń tutorial — start w Brzezinach.',meta:'Koszt: brak. Wybierzesz dwie lekcje. Mistrz zginął z ręki Brunona; misję odkryjesz w rozmowie.',fn:()=>{locked=false;closeDialog();start(true)}},{text:'Anuluj.',meta:'Koszt: brak.',fn:closeDialog}])}
