/* ui-v38.js — czytelność interfejsu
 * Ładowany jako ostatni moduł (po survival-v37.js) w game.html.
 *
 * Zawiera dwie niezależne poprawki:
 *
 * 1) Deduplikacja kroniki: identyczne, kolejne wpisy w S.messages (ten sam
 *    tekst, rodzaj i miejsce) nie są dodawane jako nowe linie — zamiast tego
 *    zwiększany jest licznik `count` na ostatnim wpisie, a jego `turn` jest
 *    uaktualniany do bieżącej tury. richLog() dopisuje " xN" gdy count > 1.
 *    Rozwiązuje spam typu "Marsz: −1 STA (zmęczenie podróżą)" powtarzany
 *    po każdym 20. polu marszu.
 *
 * 2) Pasek akcji zależny od trybu: chowa (hidden, nie disabled) przyciski
 *    nieistotne w danym kontekście, żeby nie zaśmiecać ekranu:
 *      - #attackRow (atak/zamach/specjalny) — widoczny tylko w walce
 *      - narzędzia eksploracyjne (pola widzenia, wycentruj, rozmowa) —
 *        chowane w walce
 *      - GALOP — widoczny tylko gdy jesteśmy w siodle i nie walczymy
 *      - GWIZD — widoczny tylko gdy jesteśmy pieszo i nie walczymy
 *    Przyciski uniwersalne (koń/zsiądź, obrona/obóz, cofnij) zostają zawsze
 *    widoczne, bo mają sens w kilku trybach naraz.
 *
 * Nie modyfikuje danych zapisu — jedyne nowe pole to opcjonalny
 * `count` na wpisach S.messages, w pełni kompatybilne ze starszymi zapisami
 * (brak pola = zachowanie takie jak dawniej).
 */
(() => {
  'use strict';

  const old = { log, richLog, render };

  /* ── 1) Deduplikacja kroniki ─────────────────────────────────────────── */
  log = function (text, kind = 'info') {
    const msgs = S.messages;
    const last = msgs[msgs.length - 1];
    const place = map()?.name || 'Podróż';
    if (last && last.text === text && last.kind === kind && last.place === place) {
      last.count = (last.count || 1) + 1;
      last.turn = S.turn;
      return;
    }
    old.log(text, kind);
  };

  richLog = function (d, e) {
    old.richLog(d, e);
    if (e.count && e.count > 1) {
      const s = document.createElement('span');
      s.className = 'num info repeatCount';
      s.textContent = ' x' + e.count;
      d.append(s);
    }
  };

  /* ── 2) Pasek akcji zależny od trybu ─────────────────────────────────── */
  function toolBtn(iconKey) {
    for (const b of $('toolRow').querySelectorAll('button')) {
      if (b.querySelector('use')?.getAttribute('href') === '#ic-' + iconKey) return b;
    }
    return null;
  }

  render = function () {
    old.render();
    if (!S || titleActive) return;

    const combat = fighting();
    const horse = mounted();

    const attackRow = $('attackRow');
    if (attackRow) attackRow.hidden = !combat;

    for (const key of ['eye', 'camera', 'talk']) {
      const b = toolBtn(key);
      if (b) b.hidden = combat;
    }

    const gallop = $('gallop36');
    if (gallop) gallop.hidden = combat || !horse;

    const whistle = $('whistle36');
    if (whistle) whistle.hidden = combat || horse;
  };

  console.log('[ui-v38] załadowany — dedupe kroniki, pasek akcji zależny od trybu.');
})();
