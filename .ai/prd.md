# Dokument wymagań produktu (PRD) - Aura (MVP)

## 1. Przegląd produktu

Aura (MVP) to responsywna aplikacja webowa (RWD) zaprojektowana, aby pomóc użytkownikom w prostym i efektywnym zarządzaniu budżetem domowym. Aplikacja koncentruje się na manualnym śledzeniu przychodów i wydatków, obsłudze wielu kont finansowych (np. bankowych, gotówkowych), możliwości tworzenia własnych kategorii wydatków oraz podstawowym planowaniu budżetu w ujęciu rocznym/miesięcznym. Użytkownicy mogą analizować swoje finanse za pomocą prostego pulpitu podsumowującego stan budżetu oraz wykresu miesięcznych wydatków. Celem MVP jest dostarczenie podstawowych narzędzi do świadomego zarządzania finansami osobistymi bez konieczności automatycznej integracji z bankami, co upraszcza wdrożenie i pozwala użytkownikom na pełną kontrolę nad wprowadzanymi danymi. Aplikacja będzie używać jednej, domyślnej waluty (PLN).

## 2. Problem użytkownika

Zarządzanie budżetem domowym jest trudne, ponieważ wymaga regularnego śledzenia różnorodnych wydatków i przychodów, a większość istniejących aplikacji nie uwzględnia indywidualnych nawyków finansowych i specyficznych celów każdej rodziny. Użytkownicy potrzebują narzędzia, które upraszcza ten proces, pozwala na elastyczne kategoryzowanie transakcji zgodnie z ich własnymi potrzebami oraz umożliwia podstawowe planowanie i monitorowanie realizacji budżetu. Aura MVP ma na celu rozwiązanie tego problemu poprzez dostarczenie prostego, intuicyjnego interfejsu do manualnego wprowadzania danych finansowych, zarządzania wieloma kontami i tworzenia spersonalizowanego planu budżetowego.

## 3. Wymagania funkcjonalne

### 3.1 Zarządzanie Kontami
*   Użytkownik może dodawać nowe konta, podając ich nazwę i saldo początkowe.
*   System wyświetla listę wszystkich kont użytkownika wraz z ich aktualnymi saldami.
*   Aktualne saldo konta obliczane jest na podstawie salda początkowego oraz wszystkich powiązanych transakcji (w tym tych z przyszłą datą).
*   System wyświetla łączne saldo ze wszystkich kont użytkownika.
*   Użytkownik może usunąć istniejące konto. Usunięcie konta powoduje nieodwracalne usunięcie wszystkich danych powiązanych z tym kontem (transakcji, wpływu na budżet).
*   Nie ma predefiniowanych typów kont.

### 3.2 Zarządzanie Transakcjami
*   Użytkownik może dodawać trzy typy transakcji: Wydatek, Przychód, Transfer.
*   Każda transakcja (Wydatek/Przychód) musi mieć przypisane: Konto, Datę (może być przeszła lub przyszła), Kwotę.
*   Każda transakcja (Wydatek/Przychód) może mieć opcjonalnie: Nazwę (opis) oraz Kategorię. Transakcje bez kategorii nie są wliczane do budżetu ani wykresu wydatków.
*   Użytkownik może edytować istniejące transakcje (Wydatek/Przychód).
*   Użytkownik może usuwać istniejące transakcje (Wydatek/Przychód).
*   Użytkownik może inicjować Transfer między dwoma swoimi kontami jako pojedynczą operację, podając: Konto źródłowe, Konto docelowe, Datę, Kwotę.
*   System automatycznie tworzy dwie powiązane pozycje transakcyjne dla Transferu: jedną obciążającą konto źródłowe, drugą uznającą konto docelowe.
*   Transfery nie mają przypisanej kategorii i nie są wliczane do budżetu ani wykresu wydatków.
*   Na liście transakcji danego konta wyświetlane są wszystkie Wydatki, Przychody oraz Transfery (zarówno wychodzące, jak i przychodzące) powiązane z tym kontem.
*   Lista transakcji dla konta jest sortowana chronologicznie wg daty transakcji (od najnowszej do najstarszej lub odwrotnie - do ustalenia w UI/UX).

### 3.3 Zarządzanie Kategoriami
*   System udostępnia predefiniowane kategorie wydatków: Jedzenie, Mieszkanie, Transport, Rozrywka.
*   Użytkownik może dodawać własne kategorie wydatków bez limitu ich liczby.
*   Użytkownik może edytować nazwy własnych kategorii.
*   Użytkownik może usuwać własne kategorie.
*   System blokuje możliwość usunięcia kategorii (predefiniowanej lub własnej), jeśli istnieją jakiekolwiek transakcje przypisane do tej kategorii.
*   Kategorie służą do grupowania wydatków w widoku budżetu i na wykresie analitycznym.

### 3.4 Planowanie Budżetu
*   System udostępnia widok rocznego planowania budżetu w formie tabeli.
*   Tabela prezentuje miesiące (kolumny) i kategorie wydatków (wiersze) dla wybranego roku.
*   Użytkownik może przełączać widok pomiędzy różnymi latami.
*   Użytkownik może manualnie wprowadzić planowaną kwotę wydatków dla każdej kategorii w każdym miesiącu.
*   Tabela zawiera dodatkowy wiersz informacyjny dla przychodów (Planowane / Rzeczywiste / Różnica). Użytkownik może manualnie wprowadzić planowaną kwotę przychodów dla każdego miesiąca.
*   W komórkach tabeli (na przecięciu miesiąca i kategorii) system wyświetla:
    *   Planowaną kwotę wydatków (wprowadzoną przez użytkownika).
    *   Rzeczywistą sumę wydatków (obliczoną na podstawie transakcji z danej kategorii i miesiąca - uwzględniając transakcje z przyszłymi datami w ramach danego miesiąca).
    *   Różnicę między planem a wydatkami rzeczywistymi.
*   System wizualizuje porównanie planu z rzeczywistością za pomocą kolorów (np. zielony - wydatki poniżej planu, czerwony - wydatki powyżej planu).

### 3.5 Analiza i Pulpit
*   System udostępnia prosty pulpit (lub dedykowany widok) z podsumowaniem aktualnego stanu finansów.
*   Pulpit wyświetla co najmniej łączne saldo ze wszystkich kont.
*   System udostępnia widok prezentujący indywidualne salda poszczególnych kont.
*   System generuje prosty wykres kołowy pokazujący procentowy podział wydatków na poszczególne kategorie dla wybranego miesiąca.
*   Użytkownik może wybrać miesiąc, dla którego generowany jest wykres wydatków.
*   Wykres uwzględnia tylko transakcje typu Wydatek, które mają przypisaną kategorię i datę w wybranym miesiącu.

### 3.6 Uwierzytelnianie i Autoryzacja
*   System wymaga od użytkowników rejestracji i logowania.
*   Logowanie odbywa się za pomocą adresu e-mail i hasła.
*   System umożliwia użytkownikowi zmianę hasła.
*   Hasła użytkowników muszą być przechowywane w bezpieczny sposób (np. hashowane z solą).

### 3.7 Wymagania Niefunkcjonalne
*   Aplikacja musi być aplikacją webową, responsywną (RWD), działającą poprawnie na najnowszych wersjach popularnych przeglądarek (np. Chrome, Firefox, Safari, Edge - dokładna lista i wersje do ustalenia).
*   Aplikacja używa jednej, domyślnej waluty (PLN).
*   System musi zapewniać podstawową walidację danych wejściowych (np. format kwoty, poprawność adresu e-mail).

## 4. Granice produktu

Następujące funkcjonalności i cechy są celowo wyłączone z zakresu MVP:

*   Automatyczna synchronizacja z kontami bankowymi i innymi aplikacjami finansowymi.
*   Integracja z programami lojalnościowymi, systemami cashback itp.
*   Zaawansowane prognozy finansowe, modelowanie scenariuszy "co jeśli".
*   Rozbudowane raportowanie podatkowe, eksport danych dla księgowości.
*   Szczegółowa analiza portfela inwestycyjnego, śledzenie zwrotów z inwestycji.
*   Funkcje społecznościowe (dzielenie budżetów, porównywanie się z innymi itp.).
*   Zaawansowany onboarding użytkownika i samouczki.
*   Import i eksport danych (np. z/do CSV).
*   Obsługa wydatków cyklicznych/stałych zleceń.
*   Obsługa wielu walut i przeliczeń kursowych.
*   Zaawansowana walidacja biznesowa (np. blokowanie możliwości wprowadzenia wydatku przekraczającego saldo konta - "debetu").
*   Zaawansowane mechanizmy zapobiegania błędom użytkownika (np. ostrzeżenia o znacznym przekroczeniu budżetu, porównywanie sumy budżetów z planowanymi przychodami).
*   Możliwość edycji lub usuwania predefiniowanych kategorii.
*   Szczegółowe dostosowywanie wyglądu interfejsu przez użytkownika.
*   Powiadomienia (email, push).

## 5. Historyjki użytkowników

### 5.1 Uwierzytelnianie

*   ID: US-001
*   Tytuł: Logowanie użytkownika
*   Opis: Jako użytkownik, chcę móc zalogować się do aplikacji za pomocą mojego adresu e-mail i hasła, aby uzyskać dostęp do moich danych finansowych.
*   Kryteria akceptacji:
    *   Given: Jestem na stronie logowania.
    *   When: Wprowadzę poprawny zarejestrowany e-mail i odpowiadające mu hasło i kliknę "Zaloguj".
    *   Then: Zostaję pomyślnie zalogowany i przekierowany do głównego widoku aplikacji (np. pulpitu).
    *   Given: Jestem na stronie logowania.
    *   When: Wprowadzę niepoprawny e-mail lub hasło i kliknę "Zaloguj".
    *   Then: Widzę komunikat błędu informujący o niepoprawnych danych logowania i pozostaję na stronie logowania.
    *   Given: Jestem na stronie logowania.
    *   When: Pozostawię pole e-mail lub hasło puste i kliknę "Zaloguj".
    *   Then: Widzę komunikat błędu wskazujący na wymagane pola i pozostaję na stronie logowania.

*   ID: US-002
*   Tytuł: Zmiana hasła
*   Opis: Jako zalogowany użytkownik, chcę móc zmienić swoje hasło do konta, aby zwiększyć bezpieczeństwo.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany w aplikacji i znajduję się w sekcji ustawień konta.
    *   When: Wprowadzę moje aktualne hasło, nowe hasło, powtórzę nowe hasło zgodnie z wymaganiami (np. minimalna długość) i kliknę "Zmień hasło".
    *   Then: Moje hasło zostaje zmienione w systemie.
    *   And: Widzę komunikat potwierdzający zmianę hasła.
    *   And: Przy następnym logowaniu muszę użyć nowego hasła.
    *   Given: Jestem zalogowany w aplikacji i znajduję się w sekcji ustawień konta.
    *   When: Wprowadzę niepoprawne aktualne hasło.
    *   Then: Widzę komunikat błędu o niepoprawnym aktualnym haśle.
    *   And: Hasło nie zostaje zmienione.
    *   Given: Jestem zalogowany w aplikacji i znajduję się w sekcji ustawień konta.
    *   When: Nowe hasła (w polach "nowe hasło" i "powtórz nowe hasło") nie pasują do siebie.
    *   Then: Widzę komunikat błędu o niezgodności nowych haseł.
    *   And: Hasło nie zostaje zmienione.
    *   Given: Jestem zalogowany w aplikacji i znajduję się w sekcji ustawień konta.
    *   When: Nowe hasło nie spełnia wymagań bezpieczeństwa (np. minimalna długość).
    *   Then: Widzę komunikat błędu o niespełnieniu wymagań przez nowe hasło.
    *   And: Hasło nie zostaje zmienione.

### 5.2 Zarządzanie Kontami

*   ID: US-003
*   Tytuł: Dodawanie nowego konta
*   Opis: Jako użytkownik, chcę móc dodać nowe konto (np. bankowe, portfel gotówkowy), podając jego nazwę i saldo początkowe, aby móc śledzić na nim transakcje.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i znajduję się w sekcji zarządzania kontami.
    *   When: Kliknę opcję dodania nowego konta, wprowadzę unikalną nazwę konta (np. "Portfel") i saldo początkowe (np. 100.00), a następnie potwierdzę.
    *   Then: Nowe konto zostaje dodane do mojej listy kont.
    *   And: Konto pojawia się na liście z podaną nazwą i saldem równym saldu początkowemu.
    *   And: Łączne saldo wszystkich kont zostaje zaktualizowane.
    *   Given: Jestem zalogowany i próbuję dodać nowe konto.
    *   When: Wprowadzę nazwę, która już istnieje dla innego mojego konta.
    *   Then: Widzę komunikat błędu o nieunikalnej nazwie i konto nie zostaje dodane.
    *   Given: Jestem zalogowany i próbuję dodać nowe konto.
    *   When: Wprowadzę niepoprawny format salda początkowego (np. tekst).
    *   Then: Widzę komunikat błędu o niepoprawnym formacie kwoty i konto nie zostaje dodane.
    *   Given: Jestem zalogowany i próbuję dodać nowe konto.
    *   When: Pozostawię pole nazwy lub salda początkowego puste.
    *   Then: Widzę komunikat błędu o wymaganym polu i konto nie zostaje dodane.

*   ID: US-004
*   Tytuł: Przeglądanie listy kont i sald
*   Opis: Jako użytkownik, chcę widzieć listę wszystkich moich kont wraz z ich aktualnymi saldami oraz łączne saldo ze wszystkich kont, aby mieć szybki przegląd mojej sytuacji finansowej.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam dodane co najmniej jedno konto.
    *   When: Przejdę do widoku listy kont lub na pulpit.
    *   Then: Widzę listę wszystkich moich kont, każda pozycja zawiera nazwę konta i jego aktualne saldo.
    *   And: Aktualne saldo każdego konta jest obliczone jako: Saldo Początkowe + Suma Przychodów - Suma Wydatków + Suma Transferów Przychodzących - Suma Transferów Wychodzących (uwzględniając transakcje z przyszłą datą).
    *   And: Widzę również łączne saldo, które jest sumą aktualnych sald wszystkich moich kont.

*   ID: US-005
*   Tytuł: Usuwanie konta
*   Opis: Jako użytkownik, chcę móc usunąć konto, którego już nie używam, aby utrzymać porządek w moich finansach.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam co najmniej jedno konto.
    *   When: Wybiorę opcję usunięcia dla konkretnego konta i potwierdzę tę operację (np. w oknie dialogowym z ostrzeżeniem).
    *   Then: Wybrane konto zostaje trwale usunięte z systemu.
    *   And: Wszystkie transakcje powiązane z tym kontem zostają trwale usunięte.
    *   And: Konto znika z listy kont.
    *   And: Łączne saldo wszystkich kont zostaje zaktualizowane.
    *   And: Wpływ usuniętych transakcji na budżet zostaje usunięty (budżet jest przeliczany).

### 5.3 Zarządzanie Kategoriami

*   ID: US-006
*   Tytuł: Przeglądanie kategorii
*   Opis: Jako użytkownik, chcę widzieć listę dostępnych kategorii wydatków, w tym predefiniowane i moje własne, abym mógł ich używać podczas dodawania transakcji.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany w aplikacji.
    *   When: Przejdę do sekcji zarządzania kategoriami lub będę dodawał/edytował wydatek.
    *   Then: Widzę listę dostępnych kategorii wydatków.
    *   And: Lista zawiera predefiniowane kategorie: Jedzenie, Mieszkanie, Transport, Rozrywka.
    *   And: Lista zawiera wszystkie kategorie dodane przeze mnie.

*   ID: US-007
*   Tytuł: Dodawanie własnej kategorii wydatków
*   Opis: Jako użytkownik, chcę móc dodać własną kategorię wydatków (np. "Hobby", "Edukacja"), aby lepiej dopasować kategoryzację do moich potrzeb.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i znajduję się w sekcji zarządzania kategoriami.
    *   When: Wybiorę opcję dodania nowej kategorii, wprowadzę jej unikalną nazwę i potwierdzę.
    *   Then: Nowa kategoria zostaje dodana do listy moich kategorii.
    *   And: Kategoria jest dostępna do wyboru podczas dodawania/edycji wydatków.
    *   And: Nowa kategoria pojawia się jako wiersz w tabeli budżetu.
    *   Given: Próbuję dodać nową kategorię.
    *   When: Wprowadzę nazwę, która już istnieje (ignorując wielkość liter).
    *   Then: Widzę komunikat błędu o nieunikalnej nazwie i kategoria nie zostaje dodana.
    *   Given: Próbuję dodać nową kategorię.
    *   When: Pozostawię pole nazwy puste.
    *   Then: Widzę komunikat błędu o wymaganym polu i kategoria nie zostaje dodana.

*   ID: US-008
*   Tytuł: Edycja własnej kategorii wydatków
*   Opis: Jako użytkownik, chcę móc edytować nazwę mojej własnej kategorii wydatków, aby poprawić literówkę lub zmienić jej przeznaczenie.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam dodaną co najmniej jedną własną kategorię.
    *   When: Wybiorę opcję edycji dla własnej kategorii, wprowadzę nową, unikalną nazwę i potwierdzę.
    *   Then: Nazwa kategorii zostaje zaktualizowana na liście kategorii i we wszystkich miejscach, gdzie jest wyświetlana (np. w transakcjach, w budżecie).
    *   Given: Próbuję edytować własną kategorię.
    *   When: Wprowadzę nazwę, która już istnieje dla innej kategorii.
    *   Then: Widzę komunikat błędu o nieunikalnej nazwie i nazwa nie zostaje zmieniona.
    *   Given: Próbuję edytować własną kategorię.
    *   When: Spróbuję zapisać pustą nazwę.
    *   Then: Widzę komunikat błędu o wymaganym polu i nazwa nie zostaje zmieniona.
    *   Given: Próbuję edytować predefiniowaną kategorię.
    *   When: Próbuję wywołać akcję edycji dla predefiniowanej kategorii.
    *   Then: Opcja edycji jest niedostępna lub zablokowana dla predefiniowanych kategorii.

*   ID: US-009
*   Tytuł: Usuwanie własnej kategorii wydatków
*   Opis: Jako użytkownik, chcę móc usunąć moją własną kategorię wydatków, której już nie potrzebuję.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam dodaną własną kategorię, do której nie są przypisane żadne transakcje.
    *   When: Wybiorę opcję usunięcia dla tej kategorii i potwierdzę.
    *   Then: Kategoria zostaje trwale usunięta z listy kategorii.
    *   And: Kategoria znika z tabeli budżetu (jeśli nie miała zaplanowanych kwot; jeśli miała, może pozostać wyszarzona lub zniknąć - do decyzji UI/UX).
    *   Given: Jestem zalogowany i próbuję usunąć kategorię (własną lub predefiniowaną), do której przypisana jest co najmniej jedna transakcja.
    *   When: Wybiorę opcję usunięcia dla tej kategorii.
    *   Then: Widzę komunikat informujący, że nie można usunąć kategorii, ponieważ jest używana przez transakcje.
    *   And: Kategoria nie zostaje usunięta.

### 5.4 Zarządzanie Transakcjami

*   ID: US-010
*   Tytuł: Dodawanie wydatku
*   Opis: Jako użytkownik, chcę móc szybko dodać nowy wydatek, określając konto, datę, kwotę oraz opcjonalnie kategorię i opis, aby śledzić moje koszty.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam co najmniej jedno konto.
    *   When: Wybiorę opcję dodania nowego wydatku, wybiorę konto, wprowadzę datę (domyślnie dzisiejsza), wprowadzę kwotę, opcjonalnie wybiorę kategorię z listy i opcjonalnie wprowadzę nazwę/opis, a następnie potwierdzę.
    *   Then: Nowa transakcja typu Wydatek zostaje zapisana w systemie i powiązana z wybranym kontem.
    *   And: Saldo wybranego konta zostaje pomniejszone o kwotę wydatku (widoczne natychmiast, nawet jeśli data jest przyszła).
    *   And: Łączne saldo wszystkich kont zostaje zaktualizowane.
    *   And: Jeśli wybrano kategorię i data transakcji mieści się w bieżącym lub przyszłym miesiącu widocznym w budżecie, rzeczywiste wydatki dla tej kategorii i miesiąca w budżecie zostają zaktualizowane.
    *   And: Transakcja pojawia się na liście transakcji dla wybranego konta.
    *   Given: Próbuję dodać wydatek.
    *   When: Nie wybiorę konta, nie wprowadzę daty lub kwoty.
    *   Then: Widzę komunikat błędu o wymaganych polach i transakcja nie zostaje dodana.
    *   Given: Próbuję dodać wydatek.
    *   When: Wprowadzę niepoprawny format kwoty lub daty.
    *   Then: Widzę komunikat błędu o niepoprawnym formacie i transakcja nie zostaje dodana.

*   ID: US-011
*   Tytuł: Dodawanie przychodu
*   Opis: Jako użytkownik, chcę móc dodać nowy przychód, określając konto, datę, kwotę oraz opcjonalnie opis, aby śledzić moje wpływy.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam co najmniej jedno konto.
    *   When: Wybiorę opcję dodania nowego przychodu, wybiorę konto, wprowadzę datę (domyślnie dzisiejsza), wprowadzę kwotę, opcjonalnie wprowadzę nazwę/opis, a następnie potwierdzę. (Kategoria jest niedostępna/nieistotna dla przychodu w MVP).
    *   Then: Nowa transakcja typu Przychód zostaje zapisana w systemie i powiązana z wybranym kontem.
    *   And: Saldo wybranego konta zostaje powiększone o kwotę przychodu (widoczne natychmiast, nawet jeśli data jest przyszła).
    *   And: Łączne saldo wszystkich kont zostaje zaktualizowane.
    *   And: Rzeczywiste przychody w odpowiednim miesiącu w widoku budżetu zostają zaktualizowane.
    *   And: Transakcja pojawia się na liście transakcji dla wybranego konta.
    *   Given: Próbuję dodać przychód.
    *   When: Nie wybiorę konta, nie wprowadzę daty lub kwoty.
    *   Then: Widzę komunikat błędu o wymaganych polach i transakcja nie zostaje dodana.
    *   Given: Próbuję dodać przychód.
    *   When: Wprowadzę niepoprawny format kwoty lub daty.
    *   Then: Widzę komunikat błędu o niepoprawnym formacie i transakcja nie zostaje dodana.

*   ID: US-012
*   Tytuł: Wykonywanie transferu między kontami
*   Opis: Jako użytkownik, chcę móc zarejestrować transfer środków między dwoma moimi kontami (np. z konta bankowego do portfela), aby salda obu kont były poprawne i aby uniknąć podwójnego liczenia środków jako wydatek/przychód.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam co najmniej dwa konta.
    *   When: Wybiorę opcję wykonania transferu, wybiorę konto źródłowe, wybiorę inne konto docelowe, wprowadzę datę (domyślnie dzisiejsza), wprowadzę kwotę transferu i potwierdzę.
    *   Then: System tworzy dwie powiązane operacje: jedną (typu 'transfer wychodzący') obciążającą konto źródłowe i drugą (typu 'transfer przychodzący') uznającą konto docelowe.
    *   And: Saldo konta źródłowego zostaje pomniejszone o kwotę transferu (widoczne natychmiast, nawet jeśli data jest przyszła).
    *   And: Saldo konta docelowego zostaje powiększone o kwotę transferu (widoczne natychmiast, nawet jeśli data jest przyszła).
    *   And: Łączne saldo wszystkich kont pozostaje niezmienione.
    *   And: Obie operacje transferu pojawiają się na listach transakcji odpowiednich kont, wyraźnie oznaczone jako transfer (np. "Transfer do [Nazwa konta docelowego]", "Transfer z [Nazwa konta źródłowego]").
    *   And: Transfery nie mają przypisanej kategorii i nie wpływają na obliczenia w budżecie (ani na wykres wydatków).
    *   Given: Próbuję wykonać transfer.
    *   When: Wybiorę to samo konto jako źródłowe i docelowe.
    *   Then: Widzę komunikat błędu informujący, że konta muszą być różne i transfer nie zostaje wykonany.
    *   Given: Próbuję wykonać transfer.
    *   When: Nie wybiorę konta źródłowego, docelowego, nie wprowadzę daty lub kwoty.
    *   Then: Widzę komunikat błędu o wymaganych polach i transfer nie zostaje wykonany.
    *   Given: Próbuję wykonać transfer.
    *   When: Wprowadzę niepoprawny format kwoty lub daty.
    *   Then: Widzę komunikat błędu o niepoprawnym formacie i transfer nie zostaje wykonany.

*   ID: US-013
*   Tytuł: Przeglądanie listy transakcji dla konta
*   Opis: Jako użytkownik, chcę móc zobaczyć listę wszystkich transakcji (wydatków, przychodów, transferów) powiązanych z wybranym kontem, posortowaną chronologicznie, aby móc prześledzić historię operacji.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam konto z co najmniej jedną transakcją.
    *   When: Wybiorę konto z listy kont lub przejdę do dedykowanego widoku historii konta.
    *   Then: Widzę listę transakcji dla tego konta.
    *   And: Lista zawiera: Datę, Nazwę/Opis (jeśli podano), Kategorię (dla wydatków), Kwotę (z odpowiednim znakiem lub oznaczeniem typu transakcji).
    *   And: Transfery są wyraźnie oznaczone, wskazując drugie konto biorące udział w operacji.
    *   And: Lista jest posortowana wg daty transakcji (np. od najnowszej do najstarszej).

*   ID: US-014
*   Tytuł: Edycja transakcji
*   Opis: Jako użytkownik, chcę móc edytować istniejącą transakcję (wydatek lub przychód), aby poprawić błąd we wprowadzonych danych (np. kwotę, datę, kategorię).
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam zapisaną transakcję (wydatek lub przychód).
    *   When: Wybiorę opcję edycji dla tej transakcji, zmienię jedno lub więcej pól (np. kwotę, datę, kategorię, nazwę, konto) i zapiszę zmiany.
    *   Then: Dane transakcji zostają zaktualizowane w systemie.
    *   And: Salda kont (starego i/lub nowego, jeśli konto zostało zmienione) zostają przeliczone.
    *   And: Łączne saldo kont zostaje przeliczone.
    *   And: Dane w budżecie (rzeczywiste wydatki/przychody) zostają przeliczone, jeśli zmiana dotyczyła kwoty, daty, kategorii lub typu transakcji.
    *   And: Dane na wykresie wydatków zostają przeliczone, jeśli zmiana dotyczyła kwoty, daty lub kategorii wydatku.
    *   And: Nie można edytować transakcji typu Transfer (transfery należy usunąć i dodać ponownie).

*   ID: US-015
*   Tytuł: Usuwanie transakcji
*   Opis: Jako użytkownik, chcę móc usunąć błędnie wprowadzoną lub nieaktualną transakcję (wydatek, przychód lub transfer).
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam zapisaną transakcję.
    *   When: Wybiorę opcję usunięcia dla tej transakcji i potwierdzę.
    *   Then: Transakcja zostaje trwale usunięta z systemu.
    *   And: Jeśli usuwany jest wydatek lub przychód, saldo powiązanego konta zostaje przeliczone.
    *   And: Jeśli usuwany jest transfer, salda obu powiązanych kont zostają przeliczone (usuwane są obie składowe operacje transferu).
    *   And: Łączne saldo kont zostaje przeliczone (chyba że usuwany jest transfer).
    *   And: Dane w budżecie (rzeczywiste wydatki/przychody) zostają przeliczone, jeśli usunięta transakcja na nie wpływała.
    *   And: Dane na wykresie wydatków zostają przeliczone, jeśli usunięty wydatek na nie wpływał.

### 5.5 Planowanie Budżetu

*   ID: US-016
*   Tytuł: Przeglądanie tabeli budżetu
*   Opis: Jako użytkownik, chcę widzieć tabelę budżetu pokazującą moje kategorie wydatków w wierszach i miesiące w kolumnach dla wybranego roku, abym mógł planować i monitorować finanse.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany.
    *   When: Przejdę do widoku budżetu.
    *   Then: Widzę tabelę budżetową.
    *   And: Domyślnie wyświetlany jest bieżący rok.
    *   And: Mogę wybrać inny rok (np. za pomocą przełącznika/listy rozwijanej).
    *   And: Wiersze tabeli reprezentują wszystkie moje kategorie wydatków (predefiniowane i własne) oraz dodatkowy wiersz dla przychodów.
    *   And: Kolumny tabeli reprezentują miesiące wybranego roku.
    *   And: Komórki na przecięciu kategorii i miesiąca są gotowe do wpisania planowanych kwot.

*   ID: US-017
*   Tytuł: Planowanie wydatków w budżecie
*   Opis: Jako użytkownik, chcę móc ręcznie wprowadzić planowane kwoty wydatków dla każdej kategorii w poszczególnych miesiącach w tabeli budżetu, aby stworzyć mój plan finansowy.
*   Kryteria akceptacji:
    *   Given: Jestem w widoku tabeli budżetu dla wybranego roku.
    *   When: Kliknę w komórkę na przecięciu kategorii wydatku i miesiąca i wprowadzę liczbową wartość planowanego wydatku.
    *   Then: Wprowadzona kwota zostaje zapisana jako plan dla tej kategorii i miesiąca.
    *   And: W komórce widzę wprowadzoną planowaną kwotę.
    *   And: Mogę edytować tę kwotę w dowolnym momencie.
    *   Given: Próbuję wprowadzić planowany wydatek.
    *   When: Wprowadzę niepoprawny format kwoty (np. tekst).
    *   Then: Widzę komunikat błędu lub wartość nie zostaje zapisana/wyświetlona jako poprawna.

*   ID: US-018
*   Tytuł: Planowanie przychodów w budżecie
*   Opis: Jako użytkownik, chcę móc ręcznie wprowadzić planowane kwoty przychodów dla poszczególnych miesięcy w dedykowanym wierszu tabeli budżetu.
*   Kryteria akceptacji:
    *   Given: Jestem w widoku tabeli budżetu dla wybranego roku.
    *   When: Kliknę w komórkę w wierszu przychodów dla danego miesiąca i wprowadzę liczbową wartość planowanego przychodu.
    *   Then: Wprowadzona kwota zostaje zapisana jako planowany przychód dla tego miesiąca.
    *   And: W komórce widzę wprowadzoną planowaną kwotę.

*   ID: US-019
*   Tytuł: Monitorowanie realizacji budżetu
*   Opis: Jako użytkownik, chcę widzieć w tabeli budżetu, obok planowanych kwot, rzeczywiste sumy wydatków/przychodów dla każdej kategorii/miesiąca oraz różnicę, z wizualnym wskaźnikiem (kolor), abym mógł łatwo ocenić realizację planu.
*   Kryteria akceptacji:
    *   Given: Jestem w widoku tabeli budżetu i mam wprowadzone transakcje oraz opcjonalnie planowane kwoty.
    *   When: Patrzę na komórkę na przecięciu kategorii wydatku i miesiąca.
    *   Then: Widzę w tej komórce (lub w jej sąsiedztwie):
        *   Planowaną kwotę wydatków (jeśli wprowadzono).
        *   Rzeczywistą sumę wydatków z danej kategorii w danym miesiącu (obliczoną na podstawie transakcji, w tym przyszłych w ramach miesiąca).
        *   Różnicę między planem a rzeczywistością.
    *   And: Komórka (lub jej element) jest pokolorowana, np.:
        *   Zielony: Rzeczywiste wydatki <= Planowane wydatki.
        *   Czerwony: Rzeczywiste wydatki > Planowane wydatki.
    *   When: Patrzę na komórkę w wierszu przychodów dla danego miesiąca.
    *   Then: Widzę w tej komórce (lub w jej sąsiedztwie):
        *   Planowaną kwotę przychodów (jeśli wprowadzono).
        *   Rzeczywistą sumę przychodów w danym miesiącu (obliczoną na podstawie transakcji, w tym przyszłych w ramach miesiąca).
        *   Różnicę między planem a rzeczywistością.

### 5.6 Analiza i Pulpit

*   ID: US-020
*   Tytuł: Przeglądanie pulpitu podsumowującego
*   Opis: Jako użytkownik, chcę widzieć na pulpicie główne podsumowanie mojej sytuacji finansowej, w tym co najmniej łączne saldo wszystkich kont, abym miał szybki wgląd w finanse po zalogowaniu.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany w aplikacji.
    *   When: Przejdę do widoku pulpitu (lub głównego widoku aplikacji).
    *   Then: Widzę wyraźnie wyświetlone aktualne łączne saldo ze wszystkich moich kont (uwzględniające przyszłe transakcje).
    *   (Opcjonalnie, w zależności od projektu UI): Widzę inne kluczowe informacje, np. podsumowanie budżetu na bieżący miesiąc (ile zostało).

*   ID: US-021
*   Tytuł: Analiza wydatków miesięcznych na wykresie kołowym
*   Opis: Jako użytkownik, chcę zobaczyć wykres kołowy pokazujący procentowy podział moich wydatków na poszczególne kategorie w wybranym miesiącu, aby zrozumieć, na co wydaję najwięcej pieniędzy.
*   Kryteria akceptacji:
    *   Given: Jestem zalogowany i mam zapisane wydatki z przypisanymi kategoriami w co najmniej jednym miesiącu.
    *   When: Przejdę do widoku analizy lub pulpitu, gdzie znajduje się wykres wydatków.
    *   Then: Widzę wykres kołowy.
    *   And: Domyślnie wykres pokazuje dane dla bieżącego miesiąca.
    *   And: Mogę wybrać inny miesiąc (np. za pomocą listy rozwijanej).
    *   And: Wykres pokazuje podział sumy wydatków z wybranego miesiąca na poszczególne kategorie (które miały wydatki w tym miesiącu).
    *   And: Każdy wycinek koła reprezentuje jedną kategorię, a jego rozmiar odpowiada procentowemu udziałowi wydatków z tej kategorii w sumie wydatków miesiąca.
    *   And: Widzę legendę wyjaśniającą, który kolor/wycinek odpowiada której kategorii i jaka jest suma wydatków lub procent dla każdej z nich.
    *   And: Wykres uwzględnia tylko transakcje typu Wydatek z przypisaną kategorią i datą w wybranym miesiącu.

### 5.7 Wymagania Ogólne

*   ID: US-022
*   Tytuł: Responsywność interfejsu
*   Opis: Jako użytkownik, chcę móc korzystać z aplikacji na różnych urządzeniach (komputer stacjonarny, tablet, smartfon) z zachowaniem czytelności i funkcjonalności interfejsu.
*   Kryteria akceptacji:
    *   Given: Otwieram aplikację w przeglądarce internetowej.
    *   When: Zmieniam rozmiar okna przeglądarki lub otwieram aplikację na urządzeniu o innej rozdzielczości ekranu.
    *   Then: Układ strony dostosowuje się do dostępnej przestrzeni.
    *   And: Wszystkie elementy interfejsu (przyciski, pola tekstowe, tabele, wykresy) są widoczne i użyteczne.
    *   And: Teksty są czytelne, nie nachodzą na siebie ani nie wychodzą poza swoje kontenery.
    *   And: Aplikacja działa poprawnie na najnowszych wersjach przeglądarek: Chrome, Firefox, Safari, Edge.

## 6. Metryki sukcesu

Sukces wdrożenia wersji MVP aplikacji Aura będzie mierzony za pomocą następujących kryteriów:

*   Kryterium 1: Utrzymanie zaangażowania użytkowników - Co najmniej 80% użytkowników, którzy rozpoczęli korzystanie z aplikacji (np. dodali pierwsze konto lub transakcję), aktywnie dodaje transakcje (wydatki lub przychody) przez okres co najmniej jednego pełnego miesiąca od pierwszego użycia.
*   Kryterium 2: Wykorzystanie funkcji budżetowania - Co najmniej 60% aktywnych użytkowników (zdefiniowanych np. jako ci, którzy dodali co najmniej N transakcji w ostatnim miesiącu) zdefiniowało swój planowany budżet (wprowadziło co najmniej jedną planowaną kwotę wydatku lub przychodu) na okres co najmniej 6 nadchodzących miesięcy (licząc od bieżącego miesiąca).

Sposób mierzenia:
Oba kryteria będą mierzone poprzez wykonywanie bezpośrednich zapytań SQL do bazy danych produkcyjnej aplikacji w regularnych odstępach czasu (np. miesięcznie) po osiągnięciu odpowiedniej bazy użytkowników. Zapytania będą weryfikować daty aktywności użytkowników (np. data ostatnio dodanej transakcji) oraz stan danych w tabelach budżetowych (np. sprawdzenie, czy istnieją wpisy planowanych kwot dla wymaganej liczby miesięcy w przyszłości).