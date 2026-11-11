# Giermek v35 — paczka do podmiany na działającej v34

## Wgranie
Rozpakuj ZIP. Wgraj `game.html`, `VERSION.txt` oraz `assets/js/travel-v35.js` do katalogu działającej gry, zachowując ścieżki. To poprawka, NIE pełna kopia gry. Pozostałych plików assets, index.html i zapisów nie usuwaj. Odśwież stronę z pominięciem cache (Ctrl+F5). Nie trzeba dopisywać ręcznie znacznika script: dołączony game.html robi to po init-03.js. GitHub nie został zmieniony przez asystenta.

## Walka
- Początek tury w siodle: 2 ruchy oraz akcja. Początek pieszo: 1 ruch oraz akcja.
- Każdy krok przesuwa o 1 pole; w walce nie działa galop.
- Możesz atakować od razu, po jednym albo po dwóch ruchach.
- Zsiadanie/wsiadanie kosztuje 1 ruch, nie kończy tury ani nie odbiera akcji. Zsiadasz pierwszym ruchem: zostaje krok pieszo i atak.
- Budżet tury nie resetuje się przy zmianie dosiadania. Wsiadanie w turze rozpoczętej pieszo nie tworzy nowych ruchów; następna tura w siodle daje 2.
- Krok konny kosztuje 0,25 energii również w walce. Nie regeneruje staminy.
- Atak/obrona/mikstura zachowują zasady kończenia tury. Szarża też kończy turę, również gdy wykonana po zwykłym ruchu.

## Szarża
Pomiędzy graczem i wrogiem musi być 1 lub 2 pustych pól: odległość do celu 2 lub 3 kratki po prostej. Sprawdzane są przeszkody i zajęte pola. Zachowano bezpieczny odjazd o 2 pola, koszt 15 energii i 6 STA, obrażenia, kontrę włócznika/olbrzyma oraz dotychczasowe awanse Chabra za trafienia. Są to awanse bojowe, nie szkolenie galopu.

## Podróż — umowna skala czasu i startowy balans
| Tryb | Pola/polecenie | Sekundy/pole | Energia/pole | Odnawianie STA |
|---|---:|---:|---:|---|
| Pieszo | 1 | 60 (bez zmiany) | 0 | +1 co 3 pola |
| Spokojnie konno | 1 | 45 | 0,25 | +1 co 2 pola |
| Galop | do 2 | 25 | 1 | brak |
Regeneracja tylko za przebyte pola, poza walką, do 70% maksymalnej staminy. Nie obniża wyższego aktualnego zasobu. Galop dwóch pól trwa 50 sekund, a nie 2 minuty. Spokojny koń przebywa dwa pola w 90 sekund. To parametry gry do dalszego balansowania, nie twierdzenia o historycznej prędkości podróży.

G lub przycisk GALOP włącza/wyłącza tryb. Walka automatycznie przywraca spokojną jazdę, bez zrzucania z konia. Zatrzymanie przy NPC, łupie, przejściu, scenie, przeszkodzie, wykrytym wrogu lub braku energii. Każda kratka jest sprawdzana osobno; płacisz tylko za przejechane.

Galop do 3 pól przygotowano jako osobny przyszły trening (`horse.gallopTrained35`), domyślnie nieaktywny i niepowiązany z poziomem za szarże. W tej aktualizacji nie dodano trenera ani odblokowania trzeciego pola.

Koń nie odzyskuje energii za darmo podczas podróży. Przy zerowej energii zatrzymuje się; możesz zsiąść i iść pieszo. Obóz odnawia energię według istniejących reguł. W walce zachowano wycofanie konia przy wyczerpaniu.

## Zapis i cofanie
Zachowano klucz zapisu v29. Nowe pola są dodawane leniwie: sekundy podróży, liczniki regeneracji, tryb jazdy i stały budżet ruchu na turę. Jeden galop jest jedną akcją cofnięcia. Cofnięcie odtwarza czas, energię i pozycję; przejścia fabularne pozostają punktami kontrolnymi.

## Architektura
Jedyny nowy kod jest w travel-v35.js. Ładuje się po init-03.js i aktualizuje funkcje związane z koniem oraz pomoc i przyciski. Nie przenoś go wcześniej. game.html przed zmianą został odtworzony bajtowo zgodnie z wersją pobraną z GitHuba (blob d27cafae5b26349d88af1330e11ba92d8a422ee4). Nie podmieniono świata, walki pieszej, map, ekwipunku ani plików inicjalizacji.

## Weryfikacja
36 scenariuszy logiki zaliczonych w Chromium na lokalnym silniku bazowym z załącznika v32 (tych samych funkcjach bazowych odczytanych z modułów repozytorium v34). Osobno sprawdzono rzeczywistą klawiaturę, przycisk konia i odtwarzanie animacji: galop, zsiadanie, krok pieszo i atak. Brak błędów JavaScript i poziomego przepełnienia w sprawdzonym widoku 420×840.
Nie przeprowadzono całej kampanii ani testów na żywym GitHub Pages / Safari / Firefox. Parametry są pierwszym balansem.
