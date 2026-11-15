# CHANGELOG — Giermek / Ostatnia droga

Format: `## vXX — opis (data lub status)`
Oznaczenia: ✅ = wgrane do repo / GitHub Pages; 📦 = przygotowana paczka, nie wgrane; 🔧 = w toku

---

## v38 — pixel-art HUD, pasek akcji zależny od trybu, dedupe kroniki 🔧

**Data:** 2026-11-15 (w toku)

### Dodane
- **Płaski pixel-art styl przycisków HUD** (`game.css`): zero okręgów, zero gradientów —
  wszystkie `.round` (d-pad, toolRow, attackRow, menuStack) dostały ostre narożniki
  (`border-radius: 0`), jednolite ciemnozielone tło i dwupikselowy bevel (jasna linia
  góra/lewo, ciemna dół/prawo) zamiast `radial-gradient`
- **Pasek akcji zależny od trybu** (`ui-v38.js`): zamiast pokazywać wszystkie przyciski
  naraz i tylko je wyłączać, moduł chowa (`hidden`) te nierelewantne w danym kontekście:
  - `#attackRow` (atak/zamach/specjalny) — widoczny wyłącznie w walce
  - narzędzia eksploracyjne (pola widzenia, wycentruj, rozmowa) — chowane w walce
  - GALOP — tylko w siodle i poza walką
  - GWIZD — tylko pieszo i poza walką
  - przyciski uniwersalne (koń, obrona/obóz, cofnij, sakwa) zostają zawsze widoczne
- **Deduplikacja kroniki**: identyczne, kolejne wpisy w logu (ten sam tekst, rodzaj
  i miejsce) nie tworzą nowej linii — zamiast tego rośnie licznik na istniejącym wpisie,
  wyświetlany jako „ xN" (np. „Marsz: −1 STA (zmęczenie podróżą). x4"). Działa zarówno
  w panelu Kroniki, jak i w pasku „Ostatnie zdarzenia” na ekranie gry

### Zmiany istniejących mechanik
- `log()`: patchowany, by scalać identyczne kolejne wpisy zamiast je duplikować
- `richLog()`: patchowany, by dopisywać licznik powtórzeń
- `render()`: patchowany, by chować/pokazywać przyciski toolRow i attackRow wg trybu

### Bez zmian
- Format zapisu v29 (nowe pole `count` na wpisach `S.messages` jest opcjonalne
  i w pełni kompatybilne wstecz)
- Logika walki, podróży i survivalu z v36/v37 — moduł v38 tylko nadpisuje `render`,
  `log` i `richLog`, niczego nie usuwa

### Ograniczenia / znane braki
- Ikony wciąż wektorowe (SVG z `path`/`circle`) — prawdziwy pixel-art (rect po rect,
  siatka 32×32) przetestowany w osobnym artefakcie UI, czeka na wdrożenie
- Sakwa jako pojedynczy przycisk zamiast osobnych mikstur w toolbelcie — do zrobienia
- Joystick analogowy jako opcja sterowania — do zrobienia
- Czcionki Redaction / Redaction 50 — ustalone w teście UI, nie wdrożone do gry

---

## v37 — regeneracja staminy, zmęczenie, głód i prowiant 🔧

**Data:** 2026-11-12 (w toku)

### Dodane
- **Regeneracja staminy w walce** (`survival-v37.js`):
  - 100% statystyki `regen` po zwykłej turze
  - 150% po wybranej obronie
  - 200% po obronie z udanym parowaniem
  - Premia za parowanie najwyżej raz na turę; wynik zaokrąglony po obliczeniu całości
  - Zastępuje poprzedni stały zysk +6 STA z `defend()` — nie sumuje się z nim
- **Zmęczenie marszem**: −1 STA co 20 przebytych pól pieszo (≈ −3 STA/h), min. 1 STA
- **Głód**: rozliczany przy każdej zmianie pory dnia (Poranek → Dzień → Wieczór → Noc)
  - Stan: `full` lub `hungry` (widoczny w HUD i karcie postaci)
  - Bez jedzenia: −1 HP, HP nie spada poniżej 25% maksimum; gracz nie ginie z głodu
- **Prowiant** — surowce i gotowe porcje:
  - Surowce: `fruit` (owoce), `veggie` (warzywa), `meat` (mięso)
  - Przetworzone porcje: `food` — jednostka do jedzenia przy obozie
- **Przetwarzanie** (darmowe, zużywa tylko składniki):
  | Przepis | Składniki | Porcje |
  |---|---|---|
  | Suszone owoce | 2 × owoce | 1 |
  | Gotowane warzywa | 2 × warzywa | 1 |
  | Pieczone mięso | 1 × mięso | 2 |
  | Mieszana zupa | 1 owoc + 1 warzywo | 2 |
  | Sycący posiłek | 1 mięso + 1 warzywo | 3 |
- **Zbieranie z punktów na mapie**: funkcja `survivalGather()` — odnawia się raz dziennie
- **Koszt obozu**: 1 porcja prowiantu na każde 6h odpoczynku
  - Posiłek obozowy zaspokaja głód (nie nalicza osobnej kary)
  - Bez prowiantu: awaryjny odpoczynek — stamina do max, koń do 50% energii, HP bez zmian

### Zmiany istniejących mechanik
- `defend()`: usuwa stały +6 STA; regeneracja rozliczana po turze w `enemyPhase()`
- Regeneracja energii konia z obrony/parowania (v36) zachowana bez zmian

### Bez zmian
- Format zapisu v29
- Galop: 2 pola / 1 minuta; 3. kratka i kolejne poziomy szkolenia — przyszłe
- Szarża zablokowana
- Koń zostaje w miejscu po zsiadaniu; H przywołuje go poza walką
- Walka konna: 2 ruchy + akcja, +100% cios, 4 energii, strącenie
- Prolog i misja z kielichem bez zmian strukturalnych

### Ograniczenia / znane braki
- UI obozu (menu receptur, przycisk „Zjedz") — do dodania w kolejnym kroku
- Punkty zbierania na mapach — do wstawienia w danych map
- Handlarze jedzenia (farmer, wędrowiec) — v38

---

## v36 — nowy model podróży i walki konnej 📦

**Status:** Przygotowana paczka; nie wgrane samodzielnie do repo.

### Dodane
- Pełne minuty i całkowite punkty energii (bez sekund i wartości dziesiętnych)
- Galop: 2 pola za 1 minutę, podwójne zużycie energii konia
- Przywoływanie konia gwizdaniem (klawisz H / przycisk GWIZD), koszt 1 minuta
- Koń zostaje w miejscu po zsiadaniu; nie chodzi za graczem
- Strącenie z siodła: zwykły 8%, włócznik 30%, olbrzym 20%, wilk 5%
- Ograniczenie regeneracji bojowej konia: max 3 energii między odpoczynkami z obrony/parowania
- Zakończenie tury w siodle: −1 energia konia

### Zmiany istniejących mechanik
- Poprzedni model sekund i ułamkowych kosztów zastąpiony całkowitym
- 30 pkt energii startowej = 10h spokojnej jazdy lub 5h ciągłego galopu

### Wyłączone / usunięte
- Szarża: przycisk i skrót nieaktywne; nie pobiera zasobów
- Chaber nie chodzi za graczem

---

## v35 — krok konny i galop (wersja przejściowa) 📦

**Uwaga:** Wprowadzono sekundowy przelicznik podróży, zastąpiony całkowicie w v36.

### Dodane
- Jeden krok konny zamiast dwóch z v32
- Wstępny galop z sekundowym kosztem (wycofany w v36)

---

## v34 — podział CSS/JS 📦

### Dodane
- Wydzielenie kodu na osobne pliki: `combat.js`, `world-1.js`, `world-2.js`, `story.js`, `equipment.js`, `ui.js`, `render-1.js`, `render-2.js`, itd.
- `init-01.js`, `init-02.js`, `init-03.js` — uporządkowana kolejność inicjalizacji
- `CODE-MAP.md` — mapa plików i mechanik

---

## v33 — mapy 64×48 i przejścia 📦

### Dodane
- Mapy rozszerzone do 64×48
- Eksploracja 0,725; walka 1,45
- Przejścia trzy pola
- Migracja odkryć

---

## v32 — podstawa / baza projektu ✅

**Status:** Oryginalny plik załączony do sesji; wgrana wersja bazowa.

### Zawartość
- Piesza walka z systemem staminy
- Ruch konny (dwa kroki), bez galopu
- Prolog z Dobromiirem
- Misja z kielichem (etap 2)
- Format zapisu v29
- Ekwipunek, miksturki, mapy wczesnogry

---

*Plik prowadzony od v37. Historia v30–v33 odtworzona z ustaleń projektowych — daty przybliżone.*
