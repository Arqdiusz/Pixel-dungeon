'use strict';

'use strict';

const ART={"person": "<circle cx=\"12\" cy=\"6\" r=\"3\"/><path d=\"M5 22v-5a7 7 0 0114 0v5z\"/>", "bag": "<path d=\"M8 6V3h8v3M5 7h14v15H5zM5 12h14M10 12v4h4v-4\"/>", "gear": "<path d=\"M8 3l4 3 4-3 6 6-4 4-2-2v11H8V11l-2 2-4-4z\"/>", "camera": "<circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 1v5m0 12v5M1 12h5m12 0h5\"/>", "eye": "<path d=\"M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "full": "<path d=\"M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6\"/>", "menu": "<path d=\"M4 5h16M4 12h16M4 19h16\"/>", "log": "<path d=\"M5 2h14v20H5zM8 6h8M8 10h8M8 14h8\"/>", "weapon": "<path d=\"M14 2h7v7L9 21l-5-5zM2 14l9 9M3 23l3-3\"/>", "strong": "<path d=\"M3 3h5l13 15-4 4L3 8zM21 3h-5L3 18l4 4L21 8z\"/>", "special": "<path d=\"M12 3a9 9 0 119 9M12 3L8 7m4-4l4 4M13 9h6v5l-9 8-4-4z\"/>", "camp": "<path d=\"M4 20l8-16 8 16H4zM12 4v16M2 22h20\"/>", "undo": "<path d=\"M9 4L2 10l7 5M3 10h11a6 6 0 010 12\"/>", "talk": "<path d=\"M3 3h18v13H9l-6 5zM7 7h10M7 11h7\"/>", "shield": "<path d=\"M3 3l9-2 9 2v10l-9 10-9-10zM7 12l3 3 7-7\"/>", "left": "<path d=\"M3 3h18v10c0 5-9 10-9 10S3 18 3 13zM12 5v14M6 10h12\"/>", "helm": "<path d=\"M3 21V11a9 9 0 0118 0v10h-6v-9H9v9zM3 10h18\"/>", "armor": "<path d=\"M8 3l4 3 4-3 6 6-4 4-2-2v11H8V11l-2 2-4-4z\"/>", "pants": "<path d=\"M5 2h14l-1 20h-5l-1-12-1 12H6z\"/>", "ring": "<circle cx=\"12\" cy=\"15\" r=\"7\"/><path d=\"M7 5l5-4 5 4-5 5z\"/>", "backpack": "<path d=\"M8 6V2h8v4M4 7h16v15H4zM4 12h16M9 14h6v5H9z\"/>", "potion": "<path d=\"M9 2h6v7l5 8v5H4v-5l5-8zM8 2h8M5 16h14\"/>", "horse": "<path d=\"M4 13h12V8l-3-4 4-2 4 6-1 8H5L3 9M6 16v6M15 16v6M20 15v7\"/>", "book": "<path d=\"M3 3h8l2 2 2-2h6v18h-7l-2 1-2-1H3zM12 6v15M6 7h3M6 11h3M15 7h3\"/>", "lock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"12\" rx=\"2\"/><path d=\"M8 10V6a4 4 0 018 0v4M12 15v3\"/>", "map": "<path d=\"M2 4l7-2 6 2 7-2v18l-7 2-6-2-7 2zM9 2v18M15 4v18\"/>", "chalice": "<path d=\"M5 3h14v5a7 7 0 01-14 0zM12 15v6M7 22h10\"/>", "help": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9 9a3 3 0 116 1c0 2-3 2-3 4m0 3v1\"/>", "charge": "<path d=\"M2 12h12M9 6l6 6-6 6M17 3h4v18h-4\"/>", "boot": "<path d=\"M7 2h9v13l6 3v4H4v-6h3zM7 7h9\"/>"};

const $=id=>document.getElementById(id),KEY='giermek-brunon-v29',T=32,W=32,H=24,COL=['#b8beac','#82cf87','#8cbce9','#c6a3e6','#eed079'],RAR=['Zwykły','Niezwykły','Rzadki','Epicki','Legendarny'],SLOTS={weapon:'Miecz',left:'Tarcza',helm:'Hełm',armor:'Kaftan',pants:'Spodnie',ring:'Pierścień',backpack:'Torba'},LAB={hp:'Maks. życia',sta:'Maks. staminy',power:'Maks. mocy',str:'Siła',regen:'Regeneracja staminy'};

for(let [k,v] of Object.entries(ART))$('icons').innerHTML+='<symbol id="ic-'+k+'" viewBox="0 0 24 24">'+v+'</symbol>';

const icon=k=>'<svg class="icon" aria-hidden="true"><use href="#ic-'+k+'"/></svg>';

const TYPES=[{name:'Leśny napastnik',level:1,hp:16,sta:24,cost:6,d:[2,4],range:1,color:'#b75949',special:'Mocny cios'},{name:'Oskrzydlający',level:2,hp:16,sta:22,cost:6,d:[2,4],range:1,color:'#786b98',special:'Doskok'},{name:'Włócznik',level:3,hp:22,sta:26,cost:8,d:[3,5],range:2,color:'#a08050',special:'Mocne pchnięcie'},{name:'Wygłodniały wilk',level:1,hp:21,sta:18,cost:7,d:[4,7],range:1,color:'#9d9c88',special:'Szarpnięcie'},{name:'Zbójca kościelny',level:1,hp:14,sta:20,cost:6,d:[2,3],range:1,color:'#956846',special:'Ciężkie cięcie'},{name:'Brunon Żelazny',level:2,hp:34,sta:32,cost:8,d:[4,6],range:1,color:'#675f59',special:'Miażdżący cios'}];

const REGIONS={village:{x:1,y:1,name:'Brzeziny',desc:'Kościół na północnym wschodzie. Las na wschodzie, młyn na zachodzie, łąki na południu.'},forest:{x:2,y:1,name:'Las zbójców',desc:'Obóz rabusiów. Na północy strażnica, na zachodzie Brzeziny.'},tower:{x:2,y:0,name:'Strażnica',desc:'Bezpieczny postój. Las na południu.'},mill:{x:0,y:1,name:'Stary młyn',desc:'Spokojna odnoga zachodnia i dom młynarza.'},meadow:{x:1,y:2,name:'Południowe łąki',desc:'Łąki i wędrowcy. Brzeziny na północy.'},capital:{x:1,y:0,name:'Droga do stolicy',locked:true,desc:'Brama zamknięta. Stolica i królewska stajnia będą dalszym etapem.'}};

let S=null,history=[],pending=null,target=null,cam={x:0,y:0,scale:1.5,follow:true},hits=[],drag=null,showVision=false,hold=null,suppress=null,tipTimer=null,locked=false,view=null,titleActive=true,landscape=Math.floor(Math.random()*5),busy=false,timeline=[],replay=null,fx=null,choiceHandlers=[],motions=new Map(),heldDirection=null,lastStep=0,lastWorld=0,helpTab='controls',mapTab='local';

const clone=x=>JSON.parse(JSON.stringify(x)),map=()=>S.maps[S.map],hero=()=>!S.prologue.done&&S.master.alive?S.master:S.p,asMaster=()=>!!S&&!S.prologue.done&&S.master.alive,signed=n=>(n>=0?'+':'')+n;

$('dialogBody').addEventListener('scroll',()=>{hideTip();scrollCue()});

$('dialog').addEventListener('cancel',e=>{if(locked)e.preventDefault();else{hideTip();if(view==='outcome'&&S){S.outcome=null;save()}}});

$('dialog').addEventListener('close',()=>{hideTip();document.body.append($('tip'));view=null;choiceHandlers=[];lastWorld=performance.now()});

const HELP={controls:['Sterowanie','Przytrzymaj D-pad albo WASD/strzałki, aby podróżować. Przeciągnij planszę, aby się rozejrzeć.\n1 — zwykły atak. 2 — ciężki pieszo lub szarża w siodle. 3 — piesza umiejętność specjalna. E — obrona/obóz. R — wsiądź/zsiądź. F — rozmowa. M — mapa. Z — cofanie w walce. Tab — wybór celu.\nPrzytrzymanie ikony pokazuje opis. Dialogi: 1/2/3 wybierają odpowiedź, Enter przechodzi dalej.'],mounted:['Walka konna','Eksplorację zaczynasz w siodle. Po wykryciu gra automatycznie zsiada do walki pieszej. Możesz ponownie dosiąść Chabra, jeśli stoi na tym samym lub sąsiednim polu; w walce to pełna akcja i odpowiedź przeciwników.\nW siodle masz 2 kroki na turę, zwykły atak, obronę i szarżę. Ciężki i specjalny atak wymagają zsiadania. Zsiadanie jest pełną akcją. Chaber zostaje na polu — nie blokuje przejścia. W walce pieszej nie teleportuje się za Tobą. Przy zmianie lokacji podróżuje razem z Tobą.\nObrona w siodle: +6 Twojej staminy i +3 energii konia, redukcja obrażeń 50% i szansa parowania. Nie ma samoczynnej regeneracji energii konia w walce.'],charge:['Szarża','Cel musi być dokładnie 2 pola od Ciebie po prostej. Droga do niego musi być wolna. W walce nie możesz wcześniej zużyć ruchu. Koszt: 15 energii Chabra i 6 Twojej staminy.\nNa poziomie konia 1 obrażenia wynoszą 24–32. Po trafieniu lub pudle odjeżdżasz na bezpieczne pole oddalone od celu o 2 kroki. Gra sprawdza przeszkody i zasięgi ataku wrogów przed pobraniem kosztu. Gdy brak bezpiecznego odjazdu, szarża jest niedostępna.\nOdjazd zużywa cały ruch i szarża kończy turę. Trafiony cel traci jedną odpowiedź, odzyskując równowagę; inni wrogowie mogą odpowiedzieć. W następnej turze wybierasz kolejną szarżę, obronę albo zsiadanie.\nZaskoczenie działa tylko przed walką na niezaalarmowanego wroga, który Cię nie widzi lub stoi tyłem. Zwykły wróg zostaje wyeliminowany. Bossowie, w tym Brunon, są odporni na tę natychmiastową eliminację.\nZa 3 trafione szarże Chaber awansuje: +5 maks. energii i +2 do obu końców obrażeń szarży. Dystans ruchu pozostaje 2 pola.'],combat:['Walka piesza','Pieszo masz 1 krok i 1 akcję. Atak, mikstura lub obrona kończą turę. Ruch w zasięgu wroga wywołuje słabszą reakcję, raz na wroga na turę.\nTrafienie: 90% przy równych poziomach, ±4 pp za poziom różnicy, minimum 65%, maksimum 98%. Pudło zużywa koszt i turę.\nCzerwony pasek HP wroga jest widoczny także w eksploracji. Reszta pasków pojawia się w walce. Nie ma popupów opisujących zwykłe akcje: efekty są na polach i w kronice.\nPrzeciwnicy mają przedni półokrąg widzenia; tył jest ślepą strefą. Drzewa i budynki zasłaniają.'],parry:['Obrona i parowanie','Obrona daje +6 staminy i 50% redukcji podczas odpowiedzi. Giermek ma bazowo 15% parowania. Sukces zeruje cios i daje następny zwykły atak +20%. Premia nie kumuluje się, wygasa po innej akcji i zużywa także przy pudle. Ruch jej nie zabiera. Reakcji nie parujemy.\nPrzedmioty i rozwój zwiększają szansę do 50%. Punkt rozwoju za misję z kielichem: +4 HP / +1 siły / +4 pp parowania.'],camp:['Obóz','Stały element EQ bez slotu. Sen odnawia również energię konia. Wioska, młyn i strażnica są bezpieczne. Na trakcie ryzyko 2%, w lesie 3%, wieczorem i nocą +2 pp; jakość obozu obniża je o 0,5 pp na poziom.\nPo pierwszej obronie: bezpieczne 2 godziny dają +50% maks. HP/mocy i pełną staminę oraz energię konia. Albo pełny sen z ryzykiem jednego słabszego napadu. Druga fala ma 70% HP/STA i 60% obrażeń. Po niej pełny odpoczynek jest gwarantowany.\nZasadzki obozowe rozgrywasz pieszo na mapie 11×9; koń pozostaje poza miniareną.'],time:['Dzień i noc','60 kroków eksploracji to godzina. Patrole poruszają się niezależnie, ale samo stanie i czytanie okien nie przesuwa czasu.\nPoranek 06–12, dzień 12–18, wieczór 18–22, noc 22–06. Noc przyciemnia mapę i zmniejsza wykrywanie z 4 do 3 pól.'],story:['Brunon i kielich','Napad na trzeciej mapie prologu jest grywalny. Dobromir został wcześniej ranny bełtem. Możesz pokonać pomocników i zranić Brunona. To scena o ustalonym finale: po 3 odpowiedziach przeciwników lub wcześniejszym upadku mistrza następuje jego śmierć i przekazanie sterowania.\nBrunon w prologu ma ciężki napierśnik. Później w lesie jest ranny i bez niego. Obrażenia zadane mu w prologu obniżają jego późniejsze maksymalne HP o maksymalnie 12, do minimum 22.\nTo ten sam człowiek, który okradł kościół. Kielich wypada bezpośrednio z Brunona, nie z przypadkowego pomocnika. Nagroda księdza: słabszy dwupolowy atak pieszy, moc i punkt rozwoju.'],world:['Mapy i odkrycia','Mapa lokalna ma opisy punktów. Osobna zakładka świata pokazuje nieliniową siatkę. Nie teleportuje.\n? oznacza nieodkrytą możliwość, ! cel znanego zadania. Obok mapy są tylko zadania odkryte w rozmowach. Stolica i królewska stajnia pozostają zamknięte.\nTa wersja ma nowy zapis v29, ponieważ zmienił się prolog i model postaci/konie. Poprzednie zapisy pozostają nietknięte.']};

for(let [k,label,type] of [['person','Karta postaci','character'],['bag','Sakwa','bag'],['gear','Strój i oręż','gear'],['horse','Chaber i jazda','horse'],['map','Mapy','map'],['camp','Obóz','camp']])action($('quick'),k,label,()=>panel(type),'square');

action($('menuStack'),'menu','Menu gry',()=>panel('menu'),'square');

action($('menuStack'),'log','Kronika',()=>panel('logs'),'square');

action($('menuStack'),'full','Pełny ekran',toggleFullscreen,'square');

action($('menuStack'),'help','Pomoc — mechaniki',()=>panel('help'),'square');

for(let i=0;i<3;i++){let b=action($('attackRow'),['weapon','strong','special'][i],'Atak',()=>attack(i),'round','<small id="a'+i+'"></small>');b.id='attack'+i}

action($('toolRow'),'horse','Wsiądź / zsiądź [R]\nW walce kończy turę.',toggleMount);

let eye=action($('toolRow'),'eye','Pola widzenia',()=>{if(busy)return;showVision=!showVision;eye.setAttribute('aria-pressed',String(showVision));draw()});

action($('toolRow'),'camera','Wycentruj',()=>{if(busy)return;cam.follow=true;draw()});

action($('toolRow'),'shield','Obrona [E]\n+6 STA, redukcja 50%, parowanie. W siodle dodatkowo +3 energii konia.',defend);

let ub=action($('toolRow'),'undo','Cofnij [Z]',undo,'round','<small id="undoCount"></small>');

ub.id='undo';

action($('toolRow'),'talk','Rozmowa [F]',()=>talk());

$('continueButton').innerHTML=icon('log')+'Kontynuuj';

$('newGameButton').innerHTML=icon('person')+'Nowa gra';

updateTitleFullscreen();

document.addEventListener('pointerdown',e=>{let b=helpTarget(e);if(!b||b.disabled||busy){hideTip();return}hideTip();clearTimeout(hold?.timer);hold={b,id:e.pointerId,x:e.clientX,y:e.clientY,long:false};hold.timer=setTimeout(()=>{if(hold){hold.long=true;tooltip(b.dataset.help,hold.x,hold.y)}},550)},true);

document.addEventListener('pointermove',e=>{if(hold&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>10){clearTimeout(hold.timer);if(!hold.long)hold=null}if(!hold&&!busy&&e.pointerType==='mouse'){let b=helpTarget(e);if(b&&!b.disabled)tooltip(b.dataset.help,e.clientX,e.clientY)}},true);
