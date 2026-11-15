/* turnbased-v38.js — prawdziwie turowy ruch w eksploracji
 * Ładowany jako ostatni moduł w game.html.
 *
 * Problem: `loop()` w render-2.js wywoływał `worldTick()` co 850ms na żywym
 * zegarze (requestAnimationFrame), niezależnie od tego czy gracz się ruszył.
 * Efekt: gdy gracz stał w miejscu, patrolujący wrogowie i wędrujący NPC-e
 * i tak się poruszali — łamało to turowy "vibe" gry (czas/HUD stały,
 * ale świat obok żył swoim tempem).
 *
 * Naprawa:
 *  1) `loop()` już NIE wywołuje `worldTick()` na zegarze — zostaje tylko
 *     obsługa przytrzymanego kierunku (auto-powtarzanie kroku) i rysowanie
 *     animacji w toku (`motions`).
 *  2) `move()` wywołuje `worldTick()` dokładnie raz, zaraz po tym jak krok
 *     gracza faktycznie się powiódł (pozycja bohatera lub licznik `S.steps`
 *     się zmienił — a nie np. odbił się od ściany). Dzięki temu NPC-e,
 *     patrole i wrogowie wykonują dokładnie jeden "swój" ruch na każdy
 *     ruch gracza, łącznie z krokami z przytrzymanego kierunku (te też
 *     wywołują move() co 155ms, więc nadal liczą się jako ruch gracza).
 *
 * `worldTick()` ma już własne zabezpieczenia (nic nie robi w walce, w czasie
 * dialogu/sceny/wyniku) — wywołanie jej "o jeden za dużo" po wejściu
 * na nową mapę przez przejście jest nieszkodliwe (po prostu pierwszy krok
 * na nowej mapie liczy się jako normalny ruch gracza).
 *
 * Nie zmienia zapisu gry ani logiki walki/podróży — patchuje wyłącznie
 * `move` i `loop`.
 */
(() => {
  'use strict';

  const old = { move, loop };

  move = function (dx, dy) {
    if (!S) { old.move(dx, dy); return; }
    const a = hero();
    const beforeX = a.x, beforeY = a.y, beforeSteps = S.steps;

    old.move(dx, dy);

    const b = hero();
    const moved = b.x !== beforeX || b.y !== beforeY || S.steps !== beforeSteps;
    if (moved) worldTick();
  };

  loop = function (now) {
    if (active() && !busy && !$('dialog').open) {
      if (!fighting() && heldDirection && now - lastStep >= 155) {
        lastStep = now;
        move(...heldDirection);
      }
      if (motions.size) draw();
    }
    requestAnimationFrame(loop);
  };

  console.log('[turnbased-v38] załadowany — świat rusza się tylko wraz z graczem.');
})();
