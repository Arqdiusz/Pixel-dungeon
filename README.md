# Giermek v34 — źródła do GitHuba

## Uruchomienie
Otwórz index.html po rozpakowaniu całego katalogu. Alternatywnie uruchom `python -m http.server 8000` w katalogu gry i wejdź na http://localhost:8000. Nie potrzeba npm ani procesu budowania.

## Publikacja
Wgraj cały katalog (index.html, game.html, assets), nie sam index.html. Najpierw najlepiej do podkatalogu `v34/`, aby nie nadpisać aktywnej gry. GitHub Pages musi wskazywać odpowiednią gałąź/katalog. Nie zmieniaj nazw ani względnych ścieżek pojedynczo.

## Struktura
- index.html i viewport.css/viewport.js: zewnętrzny pionowy ekran 420×840.
- game.html: właściwy interfejs, odwołania do CSS/JS.
- game.css: wygląd gry.
- core*.js: stan, zapis i czas.
- world*.js: świat, ruch, odkrywanie, obóz.
- combat*.js: walka i szarża.
- story*.js: fabuła i zadania.
- equipment*.js: przedmioty, ekwipunek i porównania.
- ui*.js: dialogi i panele.
- render*.js: rysowanie i kamera.
- v33-world.js: rozszerzenie map i przejść.
- init-*.js: uporządkowane wykonanie inicjalizacji i zachowanych nadpisań v32. Patrz CODE-MAP.md.

Wszystkie skrypty są klasyczne, defer, bez import/export. Definicje funkcji ładowane są przed inicjalizacją; nie zmieniaj kolejności script w game.html bez testu. Globalne zależności nadal istnieją — to bezpieczny pierwszy podział, nie pełne przepisanie silnika na niezależne moduły.

## Baza
W sesji dostępny był załączony v32, a nie binarny artefakt poprzedniej v33. Z niego odtworzono jawne zmiany v33: mapy 64×48, eksploracja 0,725 / walka 1,45, przejścia trzy pola, migracja odkryć. Następnie kod podzielono. Oryginalny plik v32 pozostaje nietknięty. Nie dodano galopu, głodu ani ekonomii. Ruch konny zachowuje dwa kroki z faktycznej v32 — zmiana na jeden jest na v35.

Zachowano dotychczasowy klucz zapisu. Dostęp do starego zapisu zależy od adresu i polityki pamięci przeglądarki; plik lokalny i GitHub Pages nie muszą widzieć tego samego zapisu.
