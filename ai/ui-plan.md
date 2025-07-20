# Architektura UI dla Aura MVP

## 1. Przegląd struktury UI

Całościowa struktura interfejsu użytkownika opiera się na podzieleniu aplikacji na główne widoki odpowiadające kluczowym funkcjonalnościom produktu: autentykacja, pulpitu, zarządzania kontami, transakcjami, kategoriami, budżetem oraz ustawieniami. Projekt został zaplanowany z myślą o intuicyjnej nawigacji, szybkim dostępie do najważniejszych informacji oraz możliwości interakcji, takich jak edycja inline w tabelach. Interfejs komunikuje się z backendem poprzez dedykowane końcówki API, co umożliwia operacje CRUD w obrębie kont, transakcji, kategorii i budżetu.

## 2. Lista widoków

- **Widok logowania (Login)**

  - Ścieżka: `/login`
  - Główny cel: Umożliwić użytkownikowi autoryzację poprzez wprowadzenie danych logowania.
  - Kluczowe informacje: Formularz logowania (e-mail, hasło), komunikaty o błędach autentykacji.
  - Kluczowe komponenty: Formularz, pola wejściowe z walidacją, przycisk logowania.
  - UX, dostępność i bezpieczeństwo: Dostępność klawiaturą, odpowiednie etykietowanie, czytelne komunikaty błędów.

- **Widok pulpitu (Dashboard)**

  - Ścieżka: `/dashboard`
  - Główny cel: Prezentacja ogólnego stanu finansów, w tym łącznego salda, przeglądu kont oraz podsumowania budżetu.
  - Kluczowe informacje: Łączne saldo wszystkich kont, skrótowa lista kont z aktualnymi saldami, szybki podgląd budżetu (miesięczny).
  - Kluczowe komponenty: Karty informacyjne, lista kont, ewentualnie wykres do wizualizacji danych.
  - UX, dostępność i bezpieczeństwo: Intuicyjne rozmieszczenie, odpowiednio sformatowane kwoty (PLN), wysoki kontrast dla kluczowych informacji.

- **Widok kont (Accounts)**

  - Ścieżka: `/accounts`
  - Główny cel: Umożliwić zarządzanie listą kont przy użyciu operacji dodawania, edycji i usuwania.
  - Kluczowe informacje: Lista kont z nazwą, saldem początkowym i aktualnym saldo, przyciski akcji (dodaj, edytuj, usuń).
  - Kluczowe komponenty: Tabela lub lista, formularz dodawania/edycji, modal potwierdzający usunięcie.
  - UX, dostępność i bezpieczeństwo: Czytelny interfejs, potwierdzenia operacji, walidacja unikalności nazw, jasne komunikaty błędów.

- **Widok konta (Account Details)**

  - Ścieżka: `/accounts/{id}`
  - Główny cel: Prezentacja operacji finansowych na danym koncie (wydatki, przychody, transfery) oraz możliwość dodawania i edytowania transakcji.
  - Kluczowe informacje: Stan konta, lista transakcji sortowana chronologicznie, filtry (miesiąc, kategoria), oznaczenia typów transakcji (np. +/-, kolorowe etykiety).
  - Kluczowe komponenty: Stan konta, lista transakcji, filtry (dropdown, date picker), formularz dodawania transakcji, mechanizm edycji inline.
  - UX, dostępność i bezpieczeństwo: Łatwe filtrowanie, wyraźne oznaczenia rodzajów transakcji, wsparcie dla szybkiej edycji (Enter/Escape), czytelne etykiety.

- **Widok kategorii (Categories)**

  - Ścieżka: `/categories`
  - Główny cel: Umożliwić zarządzanie kategoriami przy użyciu operacji dodawania, edycji i usuwania.
  - Kluczowe informacje: Lista kategorii z podziałem na wydatkowe i przychodowe, przyciski akcji (dodaj, edytuj, usuń).
  - Kluczowe komponenty: Tabela lub lista kategorii, formularz dodawania/edycji z wyborem typu kategorii (przychód/wydatek), modal potwierdzający usunięcie.
  - UX, dostępność i bezpieczeństwo: Wyraźne rozróżnienie między kategoriami predefiniowanymi a własnymi, blokada usuwania kategorii przypisanych do transakcji, walidacja unikalności nazw.

- **Widok budżetu (Budget)**

  - Ścieżka: `/budget`
  - Główny cel: Umożliwić zarządzanie planowanymi wydatkami i przychodami w formie tabeli, z możliwością edycji inline.
  - Kluczowe informacje: Tabela z miesiącami jako kolumnami i kategoriami jako wierszami, zaplanowane kwoty, rzeczywiste wydatki/przychody, różnice pomiędzy planem a wykonaniem.
  - Kluczowe komponenty: Tabela budżetowa z edycją inline, mechanizm kolorowania komórek (zielony gdy bilans jest zgodny lub korzystny, czerwony gdy przekroczony).
  - UX, dostępność i bezpieczeństwo: Szybka edycja inline, wizualne wyróżnienie stanów budżetu, walidacja danych wejściowych oraz komunikaty o błędach.

- **Widok ustawień (Settings)**
  - Ścieżka: `/settings`
  - Główny cel: Umożliwić użytkownikowi zarządzanie danymi konta i zmianę hasła.
  - Kluczowe informacje: Formularze zmiany hasła i edycji profilu.
  - Kluczowe komponenty: Formularze, modale potwierdzające operacje.
  - UX, dostępność i bezpieczeństwo: Przejrzystość informacji, wsparcie walidacji danych, ochrona przed przypadkowym usunięciem krytycznych informacji.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na stronę logowania (`/login`) i wprowadza swoje dane uwierzytelniające.
2. Po poprawnej autentykacji zostaje przekierowany na stronę pulpitu (`/dashboard`), gdzie widzi podsumowanie stanu finansów.
3. Na pasku nawigacyjnym użytkownik wybiera sekcję „Konta" (`/accounts`), aby zarządzać swoimi kontami – dodaje nowe, edytuje istniejące lub usuwa niepotrzebne.
4. Następnie użytkownik przechodzi do widoku wybranego konta (`/accounts/{id}`), gdzie przegląda historię operacji, stosuje filtry (miesiąc, kategoria) oraz dodaje nowe transakcje (wydatki, przychody, transfery).
5. W przypadku transferu formularz transakcji dynamicznie dopasowuje pola, ukrywając wybór kategorii i wyświetlając dodatkowe pole dla konta docelowego.
6. Użytkownik może odwiedzić widok „Kategorie" (`/categories`), aby zarządzać kategoriami wydatków i przychodów - przeglądać listę, dodawać nowe, edytować nazwy istniejących lub usuwać nieużywane.
7. Użytkownik może odwiedzić widok „Budżet" (`/budget`), aby wprowadzić lub edytować planowane wydatki i przychody w interaktywnej tabeli.
8. W widoku „Ustawienia" (`/settings`) użytkownik może dokonać zmian w danych konta i zmienić hasło, korzystając z formularzy oraz modalnych potwierdzeń.
9. W przypadku błędów (np. problemy z walidacją, błędy sieciowe) użytkownik otrzymuje czytelne komunikaty i wskazówki naprawcze.

## 4. Układ i struktura nawigacji

- Główna nawigacja jest dostępna na stałe, w postaci paska u góry i zawiera sekcje: Pulpit, Konta, Kategorie, Budżet oraz Ustawienia.
- Nawigacja umożliwia szybki dostęp do poszczególnych widoków bez konieczności przeładowania strony (SPA).
- Dla operacji szczegółowych (np. edycja konta, dodawanie transakcji) wykorzystywane są modalne okna dialogowe lub edycja inline, aby zachować kontekst bieżącego widoku.

## 5. Kluczowe komponenty

- **Formularze autentykacyjne:** Służą do logowania użytkowników; zawierają walidację pól oraz czytelne komunikaty o błędach.
- **Karty podsumowania:** Wyświetlają łączne saldo, kluczowe dane kont oraz szybki przegląd budżetu.
- **Tabele:** Stosowane do prezentacji listy kont, kategorii, transakcji oraz tabeli budżetowej; wspierają funkcję edycji inline.
- **Komponenty filtracji:** Dropdowny, date pickery oraz checkboxy umożliwiające sortowanie i filtrowanie danych, np. transakcji.
- **Modalne okna dialogowe:** Używane do potwierdzania operacji, takich jak usuwanie elementów lub wyświetlanie szczegółowych komunikatów.
- **Komponenty statusu:** Spinnery ładowania, panele informujące o błędach oraz puste stany, które poprawiają doświadczenie użytkownika w przypadku problemów z danymi.
- **System notyfikacji:** Informuje użytkownika o sukcesach lub błędach operacyjnych, wzmacniając transparentność działań.
