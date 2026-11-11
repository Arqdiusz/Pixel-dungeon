# Giermek v36 — nowy model konia

## Instalacja na obecnej v35
Wgraj z paczki game.html, VERSION.txt oraz assets/js/travel-v36.js, zachowując ścieżki. Pozostałych plików nie usuwaj. game.html ładuje teraz v36 ZAMIAST travel-v35.js; nie dopisuj obu skryptów. Stary plik może pozostać, ale nie jest wykonywany. index.html nie zmienia się. Po wgraniu odśwież z pominięciem cache. Paczka jest poprawką, nie pełną kopią gry. Asystent nie wykonał commita ani aktualizacji GitHub Pages.

## Podróż
- Pieszo: 1 kratka za 1 minutę.
- Spokojna jazda: 1 kratka za 1 minutę. +1 STA co 2 przejechane pola, do maksimum; brak regeneracji za stanie, ścianę i w walce.
- Galop: do 2 kratek za 1 minutę, bez regeneracji STA. G i przycisk GALOP włączają tryb. Przerwania i przeszkody są sprawdzane po każdym polu. Przerwany po jednym polu galop też kosztuje pełną minutę, ale wysiłek tylko za przejechane pole.
- Energia wyłącznie całkowita. Każde przejechane pole dodaje 1 do całkowitego licznika wysiłku; co 20 pól koń traci 1 energii. Galop zbiera 2 wysiłku w minutę zamiast 1: męczy dwukrotnie szybciej W CZASIE, nie dwukrotnie za kratkę.
- Początkowe 30 energii to 600 minut (10 godzin) spokojnej jazdy albo 300 minut (5 godzin) ciągłego galopu. Są to parametry gry, nie twierdzenia o rzeczywistych możliwościach konia. Walka skraca tę rezerwę.
- Przy zerowej energii koń nie jedzie dalej. Można zsiąść i iść pieszo. Obóz odnawia energię według istniejących reguł (35% maksimum/h; 2 godziny dają 70%).
- Galop na trzy pola i poziomy rozwoju NIE zostały jeszcze odblokowane; nawet stare flagi szkolenia z v35 nie dają teraz trzeciej kratki.

## Walka
- Start tury w siodle: dwa ruchy i akcja. Pieszo: jeden ruch i akcja. Atak/obrona nadal kończą turę, nie dodano ruchu po zakończeniu akcji. Możesz atakować przed ruchami, po jednym lub po dwóch.
- Zmiana dosiadania kosztuje jeden ruch. Zsiadasz pierwszym: zostaje krok i akcja. Wsiadanie nie resetuje budżetu tury.
- Zwykły cios z konia ma +100% obrażeń, także przeciw włócznikom. Kosztuje dotychczasowe 4 energii oraz normalny koszt staminy (giermek 5 STA). Premia zastępuje poprzednie +25%. Dotychczasowa 20% redukcja obrażeń przeciw zwykłym wrogom zostaje; włócznicy/olbrzymi ją ignorują.
- Każda zakończona tura w siodle kosztuje dodatkowo 1 energii. Także tura obrony, nie tylko ataku. Sam krok w walce nie odejmuje dodatkowej ułamkowej energii.
- Obrona konna: +4 STA, do +1 energii konia, normalna obrona 50% i szansa parowania.
- Udane parowanie konne: +1 STA i do +1 energii konia.
- Obrona i parowanie korzystają ze wspólnego zapasu maksymalnie 3 energii DO KOLEJNEGO ODPOCZYNKU. Nie jest to nowy pasek HUD. Zapas nie odnawia się po ponownym wejściu do walki ani po gwizdaniu. Przy pełnej energii nie wydaje się zapasu. Obóz go odnawia.
- Przy 0 energii Chaber wycofuje się. Nie można dosiąść go ponownie w tej walce.

## Strącenie — wartości początkowego balansu
Losowanie dopiero po trafieniu, które zadało obrażenia, nie po pudle ani udanym parowaniu:
- zwykły przeciwnik 8%;
- włócznik 30%;
- olbrzym 20%;
- wilk 5%.
Dla słabszych reakcji: odpowiednio 4%, 15%, 10%, 2%. Po strąceniu koń się wycofuje i jest niedostępny do końca walki. W scenariuszowym prologu strącenia są wyłączone, aby nie naruszyć lekcji i ustalonego finału Dobromira.

## Szarża
Zablokowana zarówno przyciskiem, jak i przez klawisz/funkcję, bez pobierania kosztu. Ciężki atak pieszo pozostaje. Quest i nauka u stajennego w zamku są dopiero przyszłym etapem; nie zostały dodane.

## Koniec podążania za graczem
Po zsiadaniu Chaber stoi w miejscu. Piesza zmiana mapy również go nie przenosi. Poza walką H/przycisk GWIZD przywołują go z dowolnej lokacji i od razu dosiadasz. Kosztuje 1 minutę, nie odnawia energii ani zapasu regeneracji. R poza walką też przywołuje konia, jeśli jesteś pieszo. W walce gwizd jest zablokowany; możesz normalnie dosiąść tylko dostępnego konia na sąsiednim polu, za jeden ruch.

## Zapisy i cofanie
Pozostaje klucz/format v29. Sekundowa reszta starego zegara zaokrąglana jednorazowo do następnej pełnej minuty; energia w dół do całkowitego punktu. Wartości historyczne też są migrowane. Galop i przywołanie są pojedynczymi akcjami cofnięcia. Przejścia fabularne pozostają punktami kontrolnymi.

## Parametry
Na początku assets/js/travel-v36.js w cfg: travelStepsPerEnergy=20, rideRegenEvery=2, combatUpkeep=1, defendSta=4, defendHorse=1, recoveryPool=3 i szanse strącenia. Koszt 4 energii ciosu pozostaje w bazowym combat.js.

## Weryfikacja i ograniczenia
43 scenariusze logiki w Chromium, w tym pełne 600 minut jazdy/300 galopu, brak nieskończonej regeneracji, strącenie, parowanie, odnowienie limitów po obronie obozu, przejście pieszo bez przenoszenia konia, migrowanie zapisu i cofanie. Osobno prawdziwe klawisze G/R/H, ruch i sekwencja zsiadanie–krok–atak z pełnymi animacjami. Brak błędów JS i przepełnienia poziomego w sprawdzonym widoku 420x840.
Testy uruchomiono na lokalnym silniku bazowym z załącznika v32. Bazowe funkcje i obecny moduł v35 odczytano w repozytorium; game.html przed zmianą odtworzono bajtowo zgodnie z pobranym plikiem (Git blob 96409b6b16ee4be44d2ac982697cea427849cd97). Nie przeprowadzono pełnej kampanii, testu żywego GitHub Pages ani Safari/Firefox.

Zmiana zajmuje v36; poprzednio planowane jedzenie zostaje przesunięte, nie zostało zaimplementowane.
