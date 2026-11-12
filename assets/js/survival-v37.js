/* survival-v37.js — regeneracja staminy, zmęczenie marszem, głód, prowiant, obóz
 * Ładowany po combat.js i travel-v36.js w game.html.
 * Nie modyfikuje travel-v36.js ani combat.js bezpośrednio — nadpisuje wybrane funkcje
 * przez przechowanie oryginałów w obiekcie _sv37 i zastąpienie globalnych referencji.
 *
 * Zmiany v37:
 *   – regeneracja staminy w walce: 100/150/200% statystyki regen zależnie od obrony/parowania
 *   – stałe +6 STA z obrony zastąpione tym systemem
 *   – marsz pieszo: −1 STA co 20 pól (gracza), spokojna jazda nadal +1 STA co 2 pola
 *   – głód przy zmianie pory dnia: −1 HP jeśli bez prowiantu, min. 25% maxHP
 *   – prowiant: owoce, warzywa, mięso, przetworzone porcje; przetwarzanie w obozie
 *   – zbieranie z punktów na mapie (odnawialne raz dziennie)
 *   – koszt odpoczynku w obozie: 1 porcja/6h, awaryjny obóz bez prowiantu
 */

(function(){
  'use strict';

  /* ── 1. Ochrona przed podwójnym ładowaniem ──────────────────────────────── */
  if(window._sv37){ return; }
  window._sv37 = true;

  /* ── 2. Referencje do oryginałów (nadpisywane poniżej) ─────────────────── */
  const orig = {
    defend,
    enemyPhase,
    addTime,
    recoverHours,
  };

  /* ── 3. Inicjalizacja stanu przeżycia w zapisie ─────────────────────────── */
  function initSurvival(){
    const st = S;
    if(!st.survival){
      st.survival = {
        // głód
        hunger:       'full',   // 'full' | 'hungry'
        lastFedPhase: timePhase(), // faza pory dnia przy ostatnim posiłku/inicjalizacji
        lastFedDay:   Math.floor(st.minutes / 1440),
        // porcje jedzenia (przetworzone, gotowe do jedzenia)
        food: 0,
        // surowce do przetworzenia
        raw: { fruit: 0, veggie: 0, meat: 0 },
        // zmęczenie marszem — licznik pól
        walkSteps: 0,
        // ograniczenie regeneracji bojowej konia między odpoczynkami (v36 też używa)
        // — tutaj śledzimy flagi tury walki dla premii regen staminy
        combatRound: { defended: false, parried: false },
        // punkty zbierania: { 'map:x:y': dayLastPicked }
        gatherNodes: {},
      };
    }
    // migracja starszych zapisów bez surowców
    if(!st.survival.raw){ st.survival.raw = { fruit:0, veggie:0, meat:0 }; }
    if(st.survival.food === undefined){ st.survival.food = 0; }
  }

  /* ── 4. Pomocnicze ──────────────────────────────────────────────────────── */
  function sv(){ initSurvival(); return S.survival; }
  function currentDay(){ return Math.floor(S.minutes / 1440); }

  // Zwraca numer kolejnej pory dnia (0-Noc, 1-Poranek, 2-Dzień, 3-Wieczór)
  function phaseIndex(){ const h=Math.floor(S.minutes/60)%24; return h>=6&&h<12?1:h>=12&&h<18?2:h>=18&&h<22?3:0; }

  function regenValue(){ return total('regen'); }

  /* ── 5. Walka — regeneracja staminy i śledzenie obrony/parowania ────────── */

  // Nadpisujemy defend() — usuwamy stały +6 STA, podpinamy flagę 'defended'
  defend = function(){
    if(!canAct() || tutorialLock()) return;
    if(!fighting()){ panel('camp'); return; }
    begin();
    const a = hero(), before = snapshot(), old = a.sta;
    a.counter = false;
    // NIE dodajemy już stałego +6 STA tutaj — regeneracja rozliczana po turze
    a.guard = true;
    sv().combatRound.defended = true;
    // Koń: zachowujemy ograniczoną regenerację energii z v36
    let gain = 0;
    if(a.mounted){
      const h = S.p.horse, p = h.power;
      h.power = Math.min(h.maxPower, h.power + Math.min(3, 3 - (sv().horseRegenUsed || 0)));
      gain = h.power - p;
      sv().horseRegenUsed = (sv().horseRegenUsed || 0) + gain;
    }
    log('Obrona: redukcja 50%, parowanie ' + parryChance(a) + '%'
      + (a.mounted ? ', Chaber +' + gain + ' energii' : '')
      + '. Regeneracja staminy — po turze.', 'heal');
    record({ kind: 'rest', from: { x: a.x, y: a.y }, targets: [{ x: a.x, y: a.y }], value: 0 }, before);
    orig.enemyPhase();
  };

  // Nadpisujemy enemyPhase() — po fazie wrogów naliczamy regenerację gracza
  enemyPhase = function(){
    orig.enemyPhase();
    // Sprawdzamy czy walka nadal trwa; po jej zakończeniu też rozliczamy regenerację
    _applyTurnRegen();
    // Resetujemy flagi tury
    sv().combatRound.defended = false;
    sv().combatRound.parried  = false;
    sv().horseRegenUsed = sv().horseRegenUsed || 0; // nie resetujemy między odpoczynkami
  };

  function _applyTurnRegen(){
    if(!S || !S.p) return;
    const a = hero();
    if(a.hp <= 0) return; // gracz poległ
    const r   = sv().combatRound;
    const reg = regenValue();
    let mult;
    if(r.defended && r.parried) mult = 2.0;
    else if(r.defended)         mult = 1.5;
    else                        mult = 1.0;
    const gain = Math.min(total('sta') - a.sta, Math.round(reg * mult));
    if(gain > 0){
      a.sta = Math.min(total('sta'), a.sta + gain);
      log('Regeneracja staminy: +' + gain + ' STA (' + (mult===2?'parowanie':'') + (mult===1.5?'obrona':'') + (mult===1?'zwykła tura':'') + ').', 'heal');
    }
  }

  // Podpinamy parowanie: gdy gracz sparuje, ustawiamy flagę
  // applyEnemyStrike ustawia a.counter=true przy parowaniu — obserwujemy to przez patch
  const _origStrike = applyEnemyStrike;
  applyEnemyStrike = function(e, reaction=false){
    const a = hero(), counterBefore = a.counter;
    _origStrike(e, reaction);
    // Jeśli counter wzrósł — parowanie nastąpiło
    if(!counterBefore && a.counter) sv().combatRound.parried = true;
  };

  /* ── 6. Marsz pieszo — zmęczenie ────────────────────────────────────────── */
  // Travel-v36 nadpisuje addTime i liczy kroki konia.
  // My podpinamy się pod RUCH PIESZEJ POSTACI.
  // travel-v36 wywołuje orig.step (oryginalny ruch) — wewnątrz niego zmienia S.p.{x,y}.
  // Obserwujemy to przez patch step-funkcji z v36 (która sama jest już patchem).

  const _origAddTime37 = addTime; // aktualny addTime (może być już patched przez v36)
  addTime = function(n){
    _origAddTime37(n);
    // Po każdej minucie sprawdź zmianę pory dnia
    _checkDayPhase();
  };

  // Rejestracja kroku pieszego — wywoływana przez travel-v36 po ruchu
  // Travel-v36 używa orig.step do faktycznego ruchu; my podpinamy się przez zdarzenie po ruchu.
  // Bezpieczna metoda: obserwujemy zmianę S.p.x/S.p.y po każdym ruchu pieszo.
  let _lastPos = null;
  const _origStep36 = originalMove32; // oryginalny krok (przed patchem v36)

  // Monkey-patch originalMove32 — travel-v36 go zachował jako orig.step
  // Ale nie mamy bezpośredniego dostępu do wewnętrznych zamknięć v36.
  // Zamiast tego podpinamy się przez addTime — każde 1 min to 1 krok (pieszo lub konno).
  // Rozróżniamy: jeśli hero().mounted === false → krok pieszego.
  // Zliczamy kroki na podstawie addTime(1) + brak konia.

  let _pendingWalkStep = false;
  const _sv37AddTimeInner = addTime;
  addTime = function(n){
    // addTime(1) po ruchu pieszym lub konnym
    if(n === 1 && S && !hero().mounted && fighting && !fighting()){
      _pendingWalkStep = true;
    }
    _sv37AddTimeInner(n);
    if(_pendingWalkStep){
      _pendingWalkStep = false;
      _applyWalkFatigue();
    }
  };

  function _applyWalkFatigue(){
    const a = hero();
    if(a.hp <= 0) return;
    const s = sv();
    s.walkSteps = (s.walkSteps || 0) + 1;
    if(s.walkSteps >= 20){
      s.walkSteps -= 20;
      if(a.sta > 1){
        a.sta = Math.max(1, a.sta - 1);
        log('Marsz: −1 STA (zmęczenie podróżą).', 'enemy');
      }
    }
  }

  /* ── 7. Głód — zmiana pory dnia ─────────────────────────────────────────── */
  let _lastPhaseIndex = -1;

  function _checkDayPhase(){
    const idx = phaseIndex();
    if(idx === _lastPhaseIndex) return;
    if(_lastPhaseIndex === -1){ _lastPhaseIndex = idx; return; } // init
    _lastPhaseIndex = idx;
    _applyHunger();
  }

  function _applyHunger(){
    const s = sv(), a = hero();
    if(s.hunger === 'hungry'){
      // bez jedzenia: −1 HP, min 25% maxHP
      const minHp = Math.max(1, Math.ceil(total('hp') * 0.25));
      if(a.hp > minHp){
        a.hp = Math.max(minHp, a.hp - 1);
        log('Głód: −1 HP. Zjedz coś przy obozie.', 'enemy');
      } else {
        log('Głód: jesteś wyczerpany, ale nie padniesz z głodu samego. Zjedz coś!', 'enemy');
      }
    } else {
      // 'full' → staje się głodny przy kolejnej zmianie (jeśli nie je)
      s.hunger = 'hungry';
      log('Zrobiło się późno — kiszki marsza grają. Zjedz przy obozie.', 'miss');
    }
    save();
  }

  /* ── 8. Prowiant — API ───────────────────────────────────────────────────── */

  // Przetworzone porcje jedzenia
  window.survivalAddFood = function(n, msg){
    sv().food = (sv().food || 0) + n;
    if(msg) log(msg, 'heal');
    save();
  };

  window.survivalAddRaw = function(kind, n, msg){
    // kind: 'fruit' | 'veggie' | 'meat'
    sv().raw[kind] = (sv().raw[kind] || 0) + n;
    if(msg) log(msg + ' (' + n + ' szt.)', 'heal');
    save();
  };

  // Zaspokojenie głodu (1 porcja)
  window.survivalEat = function(){
    const s = sv();
    if(s.food < 1){
      log('Nie masz prowiantu. Zbierz owoce, upoluj zwierzynę lub kup u farmera.', 'miss');
      return false;
    }
    s.food--;
    s.hunger = 'full';
    log('Zjadłeś porcję prowiantu. Siły wracają.', 'heal');
    save();
    return true;
  };

  // Przetwarzanie surowców w obozie (darmowe, zużywa składniki)
  // Receptury: owoce→suszone, warzywa→gotowane, mięso→pieczone, mix→mieszane
  window.survivalCraft = function(recipe){
    const s = sv(), r = s.raw;
    const recipes = {
      dried_fruit:  { needs: { fruit: 2 },          gives: 1, name: 'Suszone owoce' },
      cooked_veg:   { needs: { veggie: 2 },          gives: 1, name: 'Gotowane warzywa' },
      roast_meat:   { needs: { meat: 1 },             gives: 2, name: 'Pieczone mięso' },
      mixed_stew:   { needs: { fruit: 1, veggie: 1 }, gives: 2, name: 'Mieszana zupa' },
      hearty_meal:  { needs: { meat: 1, veggie: 1 },  gives: 3, name: 'Sycący posiłek' },
    };
    const rec = recipes[recipe];
    if(!rec){ log('Nieznany przepis.', 'miss'); return false; }
    for(const [k, need] of Object.entries(rec.needs)){
      if((r[k] || 0) < need){
        log('Brakuje składników: ' + k + ' (masz ' + (r[k]||0) + ', potrzeba ' + need + ').', 'miss');
        return false;
      }
    }
    for(const [k, need] of Object.entries(rec.needs)) r[k] -= need;
    s.food = (s.food || 0) + rec.gives;
    log(rec.name + ': przygotowano ' + rec.gives + ' porcj' + (rec.gives===1?'ę':'e') + ' prowiantu.', 'heal');
    save();
    return true;
  };

  /* ── 9. Zbieranie z punktów na mapie ────────────────────────────────────── */
  // Węzły zbierania definiowane w danych mapy jako { gather: 'fruit'|'veggie' }
  // Wywoływane przez ui/world gdy gracz wchodzi na pole z węzłem.

  window.survivalGather = function(mapId, x, y, kind){
    const s = sv(), key = mapId + ':' + x + ':' + y;
    const today = currentDay();
    if((s.gatherNodes[key] || -1) >= today){
      log('Tu już dziś zbierałeś. Wróć jutro.', 'miss');
      return false;
    }
    s.gatherNodes[key] = today;
    const amount = kind === 'meat' ? 1 : 2;
    s.raw[kind] = (s.raw[kind] || 0) + amount;
    const names = { fruit:'Owoce', veggie:'Warzywa', meat:'Mięso' };
    log('Zebrałeś ' + amount + ' × ' + names[kind] + '.', 'heal');
    save();
    return true;
  };

  /* ── 10. Obóz — koszt prowiantu ─────────────────────────────────────────── */
  // recoverHours(h) — standardowa regeneracja przez h godzin
  // Podpinamy się: 1 porcja na każde rozpoczęte 6h

  recoverHours = function(hours){
    if(hours <= 0) return orig.recoverHours(hours);
    const s = sv();
    const portions = Math.ceil(hours / 6);
    if(s.food >= portions){
      s.food -= portions;
      s.hunger = 'full';
      log('Obóz (' + hours + 'h): zużyto ' + portions + ' porcj' + (portions===1?'ę':'e') + ' prowiantu. Pełny odpoczynek.', 'heal');
    } else if(s.food > 0){
      const used = s.food;
      s.food = 0;
      s.hunger = 'hungry';
      log('Obóz: masz tylko ' + used + ' porcj' + (used===1?'ę':'e')
        + ' prowiantu na ' + hours + 'h odpoczynku. Awaryjny odpoczynek — niepełne leczenie.', 'miss');
      return _emergencyRest(hours);
    } else {
      s.hunger = 'hungry';
      log('Obóz bez prowiantu: awaryjny odpoczynek — odzyskujesz staminę i część energii konia, bez pełnego leczenia HP.', 'miss');
      return _emergencyRest(hours);
    }
    save();
    return orig.recoverHours(hours);
  };

  function _emergencyRest(hours){
    // Awaryjny odpoczynek: stamina do max, energia konia do 50%, HP bez zmian
    const a = hero(), h = S.p.horse;
    a.sta = total('sta');
    h.power = Math.min(h.maxPower, Math.ceil(h.maxPower * 0.5));
    orig.addTime(hours * 60);
    save();
    return { emergency: true };
  }

  /* ── 11. Karta postaci — info o głodzie i prowiancie ────────────────────── */
  // Dorzucamy do panelu statystyk jeśli panel('stats') istnieje
  // Robimy to przez zdarzenie render — bezpieczne rozszerzenie UI

  const _sv37origRender = render;
  render = function(){
    _sv37origRender();
    _updateSurvivalHUD();
  };

  function _updateSurvivalHUD(){
    // Szukamy elementu z ID survivalStatus; jeśli nie ma — tworzymy w #bars
    let el = document.getElementById('survivalStatus');
    if(!S || !active()) return;
    const s = sv();
    const info = (s.hunger === 'hungry' ? '🍖 GŁODNY' : '🍖 Najedzony')
      + ' · Prowiant: ' + (s.food || 0)
      + ' · Owoce: ' + (s.raw?.fruit || 0)
      + ' · Warzywa: ' + (s.raw?.veggie || 0)
      + ' · Mięso: ' + (s.raw?.meat || 0);
    if(!el){
      el = document.createElement('div');
      el.id = 'survivalStatus';
      el.style.cssText = 'font-size:0.7em;opacity:0.7;padding:1px 4px;';
      const bars = document.getElementById('bars');
      if(bars) bars.appendChild(el);
    }
    el.textContent = info;
  }

  /* ── 12. Inicjalizacja po załadowaniu stanu ─────────────────────────────── */
  // Uruchamiamy po tym, jak gra wczyta zapis (save/load), oraz przy nowej grze.
  // travel-v36 patchuje save i recoverHours — my robimy to samo.

  const _sv37origSave = save;
  save = function(){
    if(S) initSurvival(); // zawsze upewniamy się, że S.survival istnieje przed zapisem
    return _sv37origSave();
  };

  // Inicjalizacja przy starcie
  if(typeof S !== 'undefined' && S){ initSurvival(); }

  /* ── 13. Eksport testowy (używany przez TESTY) ───────────────────────────── */
  window._sv37api = {
    sv,
    initSurvival,
    applyWalkFatigue: _applyWalkFatigue,
    applyHunger: _applyHunger,
    applyTurnRegen: _applyTurnRegen,
    phaseIndex,
    currentDay,
  };

  console.log('[survival-v37] załadowany — regeneracja, zmęczenie, głód, prowiant, obóz.');

})();
