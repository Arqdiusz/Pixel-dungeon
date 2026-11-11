'use strict';

function enemy(id,type,x,y,alert=false,weak=false){let t=TYPES[type],s=weak?.7:1;return{id,type,name:t.name,boss:type===5,level:t.level,x,y,dir:'down',home:{x,y},hp:Math.max(1,Math.floor(t.hp*s)),max:Math.max(1,Math.floor(t.hp*s)),sta:Math.max(1,Math.floor(t.sta*s)),maxSta:Math.max(1,Math.floor(t.sta*s)),damageScale:weak?.6:1,weak,armor:0,state:alert?'alert':'idle',search:0,patrol:[],patrolIndex:0,guard:false}}

function emptyMap(name,w=W,h=H){return{name,w,h,obstacles:[],enemies:[],drops:[],npcs:[],exits:[]}}

function civilian(id,name,x,y,text){return{id,name,x,y,type:9,dir:'down',wander:true,home:{x,y},text}}

function makeMaps(){let ms={};for(let [id,name] of [['road1','Prolog — Leśne podejście'],['road2','Prolog — Wilcza polana'],['road3','Prolog — Napad Brunona']]){ms[id]=emptyMap(name);ms[id].obstacles=[{x:6,y:4,type:'tree'},{x:11,y:17,type:'tree'},{x:21,y:7,type:'rock'}]}ms.road1.exits=[{x:30,y:12,to:'road2',tx:2,ty:12,label:'Wilcza polana'}];ms.road2.exits=[{x:1,y:12,to:'road1',tx:29,ty:12,label:'Leśne podejście'},{x:30,y:12,to:'road3',tx:2,ty:12,label:'Kamienny zakręt'}];ms.road3.exits=[{x:1,y:12,to:'road2',tx:29,ty:12,label:'Polana'},{x:30,y:12,to:'village',tx:2,ty:12,label:'Brzeziny'}];for(let id of ['road1','road2','road3'])for(let y=2;y<22;y+=3)for(let x=4;x<29;x+=4)if((y<10||y>14)&&hash(x,y,id.length)%3===0)ms[id].obstacles.push({x,y,type:'tree'});
let f=emptyMap('Las — obóz Brunona');f.enemies=[enemy('church1',4,11,11),enemy('church2',4,18,13),enemy('brunonCamp',5,25,11)];f.enemies[2].dir='left';for(let y=2;y<22;y++)for(let x=4;x<29;x++){if(y>=9&&y<=15||x>=14&&x<=18)continue;if(hash(x,y)%10===0)f.obstacles.push({x,y,type:hash(x,y)%3===0?'rock':'tree'})}f.exits=[{x:1,y:12,to:'village',tx:29,ty:12,label:'Brzeziny'},{x:16,y:1,to:'tower',tx:16,ty:22,label:'Strażnica'}];ms.forest=f;
let v=emptyMap('Wioska Brzeziny');v.obstacles=[{x:5,y:5,w:4,h:3,type:'house'},{x:13,y:4,w:4,h:3,type:'house'},{x:6,y:17,w:4,h:3,type:'house'},{x:22,y:4,w:6,h:5,type:'church'}];v.npcs=[{id:'priest',name:'Ksiądz Mateusz',x:24,y:10,type:8,dir:'down',wander:false},{id:'merchant',name:'Kupiec Wojciech',x:12,y:11,type:9,dir:'left',wander:false},civilian('c0','Marta, zielarka',8,14,'Ksiądz mieszka przy kościele na północnym wschodzie.'),civilian('c1','Janek, wędrowiec',17,14,'Brunon Żelazny wrócił do obozu w lesie. Podobno okradł kościół.'),civilian('c2','Wojtek, stajenny',20,17,'Chaber ma siłę na dwie szarże. Oszczędzaj go i broń się między atakami.'),civilian('c3','Anna, tkaczka',11,9,'Wioska jest bezpieczna na obóz.')];v.exits=[{x:30,y:12,to:'forest',tx:2,ty:12,label:'Las'},{x:1,y:12,to:'mill',tx:29,ty:12,label:'Młyn'},{x:16,y:22,to:'meadow',tx:16,ty:2,label:'Łąki'},{x:16,y:1,to:'capital',tx:16,ty:22,label:'Stolica — zamknięte',locked:true}];ms.village=v;
let t=emptyMap('Leśna strażnica');t.obstacles=[{x:17,y:5,w:5,h:4,type:'tower'}];t.npcs=[{id:'guard',name:'Strażnik traktu',x:17,y:11,type:6,dir:'down',wander:false}];t.exits=[{x:16,y:22,to:'forest',tx:16,ty:2,label:'Las'}];ms.tower=t;let mill=emptyMap('Stary młyn');mill.obstacles=[{x:8,y:6,w:5,h:5,type:'mill'}];mill.npcs=[civilian('miller','Młynarz Roch',14,12,'Na wschód wrócisz do Brzezin.')];mill.exits=[{x:30,y:12,to:'village',tx:2,ty:12,label:'Brzeziny'}];ms.mill=mill;let meadow=emptyMap('Południowe łąki');meadow.obstacles=[{x:5,y:7,type:'tree'},{x:23,y:17,type:'tree'}];meadow.npcs=[civilian('shepherd','Pasterz',12,13,'Na północ jest wioska.')];meadow.exits=[{x:16,y:1,to:'village',tx:16,ty:21,label:'Brzeziny'}];ms.meadow=meadow;ms.capital=emptyMap('Droga do stolicy');for(const m of Object.values(ms))expandRegion33(m);return ms}

function blocked(x,y,m=map()){return x<1||x>m.w-2||y<1||y>m.h-2||m.obstacles.some(o=>x>=o.x&&x<o.x+(o.w||1)&&y>=o.y&&y<o.y+(o.h||1))}

function occupied(x,y,id=null){return map().enemies.some(e=>e.id!==id&&e.x===x&&e.y===y)||map().npcs.some(n=>n.id!==id&&n.x===x&&n.y===y)}

function direction(dx,dy){return Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up'}

function vector(a){return{right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]}[a.dir||'down']}

function stepEntity(e,p,combat=false){let old={x:e.x,y:e.y},before=combat?snapshot():null;e.dir=direction(p.x-e.x,p.y-e.y);e.x=p.x;e.y=p.y;if(combat)record({kind:'move',entity:e.id||'actor',from:old,to:{x:e.x,y:e.y},targets:[]},before);else motions.set(e.id||'actor',{from:old,to:{x:e.x,y:e.y},start:performance.now(),duration:135})}

function syncHorse(){let a=hero(),h=S.p.horse;if(a.mounted){h.map=S.map;h.x=a.x;h.y=a.y;h.rider=asMaster()?'master':'player'}}

function patrolRoute(e,m){let r=[{...e.home}];for(let [dx,dy] of [[2,0],[2,2],[0,2],[-2,0],[-2,-2],[0,-2]]){let p={x:e.home.x+dx,y:e.home.y+dy};if(!blocked(p.x,p.y,m))r.push(p);if(r.length===4)break}return r}

function initPatrols(){for(let m of Object.values(S.maps))for(let e of m.enemies){e.patrol=patrolRoute(e,m);e.patrolIndex=0}}

function discoverRegion(id){if(REGIONS[id]){S.world.visited[id]=true;S.world.known[id]=true}}

function line(a,b,r,id=null){let dx=b.x-a.x,dy=b.y-a.y,n=Math.abs(dx)+Math.abs(dy);if(dx&&dy||n<1||n>r)return false;for(let i=1;i<n;i++){let x=a.x+Math.sign(dx)*i,y=a.y+Math.sign(dy)*i;if(blocked(x,y)||occupied(x,y,id))return false}return true}

function terrainSight(a,b){let x=a.x,y=a.y,dx=Math.abs(b.x-x),dy=-Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,err=dx+dy;while(x!==b.x||y!==b.y){let e=2*err;if(e>=dy){err+=dy;x+=sx}if(e<=dx){err+=dx;y+=sy}if(blocked(x,y))return false}return true}

function behind(e,a){let [dx,dy]=vector(e);return(a.x-e.x)*dx+(a.y-e.y)*dy<0}

function visible(a,b){if(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)>viewRange())return false;if(behind(a,b))return false;return terrainSight(a,b)}

function path(e,g){let a=hero(),q=[{x:e.x,y:e.y,n:0}],seen=new Set([e.x+','+e.y]);for(let j=0;j<q.length;j++){let p=q[j];if(p.x===g.x&&p.y===g.y)return p;for(let [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){let x=p.x+dx,y=p.y+dy,k=x+','+y;if(seen.has(k)||blocked(x,y)||occupied(x,y,e.id)||x===a.x&&y===a.y)continue;seen.add(k);q.push({x,y,n:p.n+1,first:p.first||{x,y}})}}return null}

function patrol(e){if(!e.patrol.length)e.patrol=patrolRoute(e,map());let g=e.patrol[e.patrolIndex||0];if(e.x===g.x&&e.y===g.y){e.patrolIndex=((e.patrolIndex||0)+1)%e.patrol.length;g=e.patrol[e.patrolIndex]}let p=path(e,g);if(p?.first)stepEntity(e,p.first);else e.patrolIndex=((e.patrolIndex||0)+1)%e.patrol.length}

function wanderNPCs(){let a=hero();for(let n of map().npcs){if(!n.wander)continue;let d=[[1,0],[-1,0],[0,1],[0,-1]][hash(S.worldTick||0,n.id.length,n.x+n.y)%4],p={x:n.x+d[0],y:n.y+d[1]};if(Math.abs(p.x-n.home.x)+Math.abs(p.y-n.home.y)>3||blocked(p.x,p.y)||occupied(p.x,p.y,n.id)||p.x===a.x&&p.y===a.y)continue;stepEntity(n,p)}}

function detectEnemies(){if(!active()||busy||$('dialog').open||S.scene||S.outcome||fighting())return;let es=map().enemies.filter(e=>visible(e,hero()));if(es.length)startCombat(es.map(e=>e.id))}

function worldTick(){if(!active()||busy||fighting()||$('dialog').open||S.scene||S.outcome)return;S.worldTick=(S.worldTick||0)+1;for(let e of map().enemies)patrol(e);wanderNPCs();detectEnemies();render()}

function pickup(){for(let j=map().drops.length-1;j>=0;j--){let d=map().drops[j],i=d.item,a=hero();if(d.x!==a.x||d.y!==a.y)continue;if(i.kind==='gold')S.p.gold+=i.qty;else{let st=i.kind==='potion'?S.p.bag.find(b=>b.potion===i.potion):null;if(st)st.qty+=i.qty;else if(i.kind==='quest'||S.p.bag.filter(i=>i.kind!=='quest').length<cap())S.p.bag.push(i);else{log('Sakwa pełna.');continue}}log('Zebrano '+i.name+(i.qty?' ×'+i.qty:''));if(i.questId==='chalice')S.quest.stage=S.quest.discovered?'return':'foundBeforeQuest';map().drops.splice(j,1)}}

function spawnWolves(){let a=hero();for(let [j,p] of [{x:a.x+1,y:a.y},{x:a.x,y:a.y+1},{x:a.x-1,y:a.y+1}].entries())map().enemies.push(enemy('wolf'+j,3,p.x,p.y,true));S.prologue.wolves=true;S.tutorial.forceSpecial=true;S.master.sta=Math.max(22,S.master.sta);startCombat(map().enemies.map(e=>e.id),'Tutorial wilków.');S.tutorial.forceSpecial=false;S.scene={kind:'wolfAmbush',step:0}}

function spawnBandits(){let a=hero();S.story.banditsStarted=true;S.story.bossSeen=true;S.story.bossRound=0;map().enemies=[enemy('escortA',4,a.x+1,a.y,true),enemy('escortB',4,a.x,a.y+1,true),enemy('brunonPrologue',5,a.x+3,a.y,true)];let b=map().enemies[2];b.hp=b.max=80;b.level=4;b.armor=.45;b.prologueBoss=true;b.dir='left';a.hp=Math.min(a.hp,35);startCombat(map().enemies.map(e=>e.id),'Napad Brunona. Dobromir jest ranny.');S.scene={kind:'banditIntro',step:0};log('Bełt z zasadzki rani Dobromira. Brunon Żelazny odcina trakt.','enemy')}

function move(dx,dy){if(!canAct()||tutorialLock())return;let a=hero(),x=a.x+dx,y=a.y+dy;if(blocked(x,y)||occupied(x,y)){if(fighting()){log('Droga zablokowana.');render()}return}cam.follow=true;if(fighting()){stopHold();if(S.combat.movesUsed>=moveBudget()){log('Ruch wykorzystany. Zaatakuj albo użyj obrony.');render();return}begin();for(let e of map().enemies){if(!S.combat.ids.includes(e.id)||S.combat.reactions[e.id]||!line(e,a,TYPES[e.type].range,e.id))continue;S.combat.reactions[e.id]=true;applyEnemyStrike(e,true);if(a.hp<=0)break}if(a.hp<=0){if(S.map==='road3'&&!S.prologue.done)prologueFatal();save();playTimeline(()=>{render();resumeScene()});return}let before=snapshot(),old={x:a.x,y:a.y};a.dir=direction(dx,dy);a.x=x;a.y=y;syncHorse();if(asMaster()){S.p.x=old.x;S.p.y=old.y;S.p.dir=a.dir}record({kind:'move',entity:'actor',from:old,to:{x,y},targets:[]},before);S.combat.movesUsed++;pickup();let ex=map().exits.find(e=>exitContains33(e,x,y));save();playTimeline(()=>{render();if(ex)useExit(ex)});return}let old={x:a.x,y:a.y};a.dir=direction(dx,dy);stepEntity(a,{x,y});syncHorse();if(asMaster()){S.p.dir=direction(old.x-S.p.x,old.y-S.p.y);motions.set('squire',{from:{x:S.p.x,y:S.p.y},to:old,start:performance.now(),duration:135});S.p.x=old.x;S.p.y=old.y}S.steps++;addTime(1);pickup();if(!S.prologue.done){if(!S.prologue.intro&&S.steps>=S.prologue.introAt){S.prologue.intro=true;S.scene={kind:'intro',step:0}}else if(S.map==='road1'&&x>=13&&!S.prologue.traveller){S.prologue.traveller=true;S.scene={kind:'traveller',step:0}}else if(S.map==='road2'&&x>=8&&!S.prologue.wolves)spawnWolves();else if(S.map==='road3'&&x>=7&&!S.story.banditsStarted)spawnBandits();if(S.scene){stopHold();render();save();resumeScene();return}}let ex=map().exits.find(e=>exitContains33(e,x,y));if(ex){useExit(ex);return}if(S.map==='village'&&!S.flags.thief&&rng(1,100)<=8){S.flags.thief=true;S.scene={kind:'thief',step:0};stopHold();render();save();resumeScene();return}detectEnemies();render();save()}

function useExit(e){if(S.map==='_camp'){campEscape();return}if(S.map==='road3'&&!S.prologue.done){log('Brunon odcina drogę. Osłaniaj ucznia.');render();return}if(e.locked){S.world.known[e.to]=true;hero().y=Math.max(2,hero().y);log('Brama do stolicy zamknięta.');stopHold();render();save();return}if(S.map==='road2'&&e.to==='road3'&&!S.prologue.wolvesWon){log('Ukończ lekcję wilków.');render();return}let fight=fighting();hero().counter=false;S.combat.active=false;S.combat.ids=[];history=[];pending=null;let a=hero(),h=S.p.horse;S.map=e.to;a.x=e.tx;a.y=e.ty;a.dir=e.ty<=2?'down':e.ty>=22?'up':e.tx<=2?'right':'left';if(a.mounted)syncHorse();else{h.map=S.map;h.x=a.x;h.y=a.y;h.rider=null}if(asMaster()){S.p.x=e.tx<=2?1:e.tx+1;S.p.y=e.ty;S.p.dir=a.dir}discoverRegion(S.map);target=null;motions.clear();stopHold();log((fight?'Wycofanie: ':'Przejście: ')+map().name);render();save();detectEnemies()}

function campRiskAt(id=S.map){if(['village','tower','mill'].includes(id))return 0;return Math.max(0,(id==='forest'?3:2)+(['Wieczór','Noc'].includes(timePhase())?2:0)-(S.p.camp.level-1)*.5)}

function hourlyRates(){let l=S.p.camp.level;return{hp:(10+5*l)/100,sta:(25+10*l)/100,power:(10+5*l)/100}}

function fullRestHours(){let r=hourlyRates(),h=S.p.horse;return Math.max(0,...['hp','sta','power'].map(k=>{let m=total(k,S.p);return m>0?Math.ceil(Math.max(0,m-S.p[k])/(m*r[k])-1e-10):0}),Math.ceil((h.maxPower-h.power)/(h.maxPower*.35)-1e-10))}

function recoverHours(hours){let g={},r=hourlyRates();for(let k of ['hp','sta','power']){let old=S.p[k];S.p[k]=Math.min(total(k,S.p),S.p[k]+Math.ceil(total(k,S.p)*r[k]*hours));g[k]=S.p[k]-old}let h=S.p.horse,old=h.power;h.power=Math.min(h.maxPower,h.power+Math.ceil(h.maxPower*.35*hours));g.horse=h.power-old;return g}

function forceFullRecovery(){let g={};for(let k of ['hp','sta','power']){let old=S.p[k];S.p[k]=total(k,S.p);g[k]=S.p[k]-old}g.horse=S.p.horse.maxPower-S.p.horse.power;S.p.horse.power=S.p.horse.maxPower;return g}

function resourceText(g){return'Życie +'+g.hp+' · STA +'+g.sta+' · Moc +'+g.power+' · Chaber +'+(g.horse||0)}

function makeCampMap(weak=false){let m=emptyMap(weak?'Druga, słabsza zasadzka':'Zasadzka w obozie',11,9);m.obstacles=[{x:5,y:4,type:'fire'},{x:8,y:1,type:'tree'},{x:9,y:7,type:'rock'}];m.enemies=[enemy('camp1',3,7,3,true,weak),enemy('camp2',0,8,5,true,weak)];m.exits=[{x:1,y:4,to:'return',label:'Ucieczka'}];return m}

function enterCampBattle(weak){S.maps._camp=makeCampMap(weak);S.map='_camp';S.p.x=3;S.p.y=4;S.p.dir='right';S.p.mounted=false;S.p.counter=false;S.combat={active:true,ids:map().enemies.map(e=>e.id),movesUsed:0,reactions:{},lost:0,round:1};target='camp1';motions.clear();render()}

function restAtCamp(mode='short'){if(!canAct()||fighting()||!S.prologue.done||S.campSession)return;let hours=mode==='full'?fullRestHours():2;if(!hours){log('Zasoby pełne.');render();return}let point={map:S.map,x:hero().x,y:hero().y,dir:hero().dir,mounted:hero().mounted,horse:clone(S.p.horse)};history=[];pending=null;if(rng(1,10000)/100<=campRiskAt()){addTime(60);S.campSession={...point,stage:'firstFight',secondaryUsed:false};enterCampBattle(false);log('NAPAD NA OBÓZ. Sen przerwany po 1 godzinie. Walczysz pieszo.','enemy');save();return}addTime(hours*60);let g=mode==='full'?forceFullRecovery():recoverHours(hours);log('Obóz '+hours+' godz. '+resourceText(g),'heal');save();render()}

function safeRecoveryAfterDefense(){if(S.campSession?.stage!=='afterDefense')return;let g={};for(let k of ['hp','sta','power']){let old=S.p[k],max=total(k,S.p);S.p[k]=k==='sta'?max:Math.min(max,S.p[k]+Math.ceil(max*.5));g[k]=S.p[k]-old}g.horse=S.p.horse.maxPower-S.p.horse.power;S.p.horse.power=S.p.horse.maxPower;addTime(120);finishCamp('Bezpieczne 2 godziny. '+resourceText(g)+'. STA i energia konia pełne.')}

function fullRecoveryAfterDefense(){let cs=S.campSession;if(!cs||cs.stage!=='afterDefense')return;let hours=fullRestHours();if(!hours){finishCamp('Pełnia sił.');return}if(!cs.secondaryUsed&&rng(1,10000)/100<=campRiskAt(cs.map)/2){cs.secondaryUsed=true;cs.stage='secondFight';let elapsed=Math.max(0,Math.min(hours-1,Math.floor(hours/2)));addTime(elapsed*60);let g=recoverHours(elapsed);S.scene=null;locked=false;closeDialog();enterCampBattle(true);log('DRUGI NAPAD — słabsza grupa. Zachowano '+resourceText(g)+'. Trzeciego nie będzie.','enemy');save();return}addTime(hours*60);forceFullRecovery();finishCamp('Pełny sen po obronie: '+hours+' godz. Zasoby pełne.')}

function finishSecondRecovery(){if(S.campSession?.stage!=='secondVictory')return;let h=fullRestHours();addTime(h*60);forceFullRecovery();finishCamp('Po drugim zwycięstwie: '+h+' godz. i pełne zasoby bez trzeciego napadu.')}

function finishCamp(text){returnFromCamp(text);let d=open('Koniec obozowania');para(d,text);progress('Wracam na szlak',closeDialog)}

function returnFromCamp(text){let cs=S.campSession;if(!cs)return;S.map=cs.map;S.p.x=cs.x;S.p.y=cs.y;S.p.dir=cs.dir;S.p.mounted=cs.mounted;let power=S.p.horse.power,level=S.p.horse.level,training=S.p.horse.training,maxPower=S.p.horse.maxPower;S.p.horse={...cs.horse,power,level,training,maxPower};if(S.p.mounted)syncHorse();delete S.maps._camp;S.campSession=null;S.combat={active:false,ids:[],movesUsed:0,reactions:{},lost:0,round:1};S.scene=null;S.p.counter=false;target=null;history=[];pending=null;motions.clear();log(text);locked=false;closeDialog();render();save()}
