# API Endpoint Implementation Plan: Accounts

## 1. Przegląd punktu końcowego

Celem endpointu jest zarządzanie kontami użytkowników. Umożliwia on pełen zakres operacji CRUD:

- Pobieranie listy kont (GET /api/accounts)
- Pobieranie szczegółów konkretnego konta (GET /api/accounts/{accountId})
- Tworzenie nowego konta (POST /api/accounts)
- Aktualizację danych konta (PATCH /api/accounts/{accountId})
- Usuwanie konta wraz z powiązanymi operacjami (DELETE /api/accounts/{accountId})

Endpoint korzysta z Supabase do obsługi operacji bazy danych, Zod do walidacji danych wejściowych oraz mechanizmów Astro do obsługi żądań. Implementacja musi być zgodna z regułami backend.mdc, shared.mdc i astro.mdc.

## 2. Szczegóły żądania

- **Metody HTTP**:
  - GET, POST, PATCH, DELETE
- **Struktura URL**:
  - Lista kont: `/api/accounts`
  - Szczegóły konta: `/api/accounts/{accountId}`
- **Parametry**:
  - **GET /api/accounts**:
    - Wymagane: Token uwierzytelniający (JWT w nagłówku `Authorization`)
    - Opcjonalne: Parametry zapytania `page`, `limit` (paginacja) oraz ewentualne opcje sortowania.
  - **GET /api/accounts/{accountId}**:
    - Wymagane: `accountId` jako parametr ścieżki
  - **POST /api/accounts**:
    - Request Body (JSON):
      - `name` (string, wymagany)
      - `initial_balance` (number, wymagany)
  - **PATCH /api/accounts/{accountId}**:
    - Request Body (JSON):
      - `name` (string, wymagany)
  - **DELETE /api/accounts/{accountId}**:
    - Wymagane: `accountId` jako parametr ścieżki

## 3. Wykorzystywane typy

- **DTO dla konta**:
  - `AccountResponseDTO`: { id, user_id, name, initial_balance, current_balance (obliczane dynamicznie), created_at }
- **Command Modele**:
  - `CreateAccountCommand`: { name: string, initial_balance: number }
  - `UpdateAccountCommand`: { name: string }

## 4. Szczegóły odpowiedzi

- **GET /api/accounts (lista)**:
  - Status: 200 OK
  - Response: Tablica obiektów `AccountResponseDTO`
- **GET /api/accounts/{accountId}**:
  - Status: 200 OK, gdy konto zostanie znalezione
  - Response: Pojedynczy obiekt `AccountResponseDTO`
  - Błąd: 404 Not Found, jeżeli konto nie istnieje
- **POST /api/accounts**:
  - Status: 201 Created
  - Response: Utworzony obiekt `AccountResponseDTO`
  - Błędy: 400 Bad Request dla nieprawidłowych danych, 401 Unauthorized, 500 Internal Server Error
- **PATCH /api/accounts/{accountId}**:
  - Status: 200 OK
  - Response: Zaktualizowany obiekt `AccountResponseDTO`
  - Błędy: 400, 401, 404
- **DELETE /api/accounts/{accountId}**:
  - Status: 200 OK
  - Response: Komunikat potwierdzający usunięcie
  - Błędy: 404, 401

## 5. Przepływ danych

1. Klient wysyła żądanie do API z odpowiednim nagłówkiem `Authorization` zawierającym token JWT oraz, jeśli dotyczy, danymi w ciele żądania.
2. Middleware (np. Astro middleware) weryfikuje token i ustawia informacje o użytkowniku w kontekście (context.locals).
3. Handler API waliduje dane wejściowe przy użyciu Zod schema.
4. Po walidacji żądanie jest przekazywane do warstwy serwisowej (np. `AccountService` w `src/lib/services`), która wykonuje logikę biznesową:
   - Dla POST: tworzy nowy rekord w tabeli `accounts`
   - Dla PATCH: aktualizuje dane konta
   - Dla GET: pobiera dane z tabeli `accounts` oraz oblicza `current_balance` (na podstawie `initial_balance` oraz agregacji transakcji)
   - Dla DELETE: usuwa konto wraz z powiązanymi rekordami (transakcjami)
5. Komunikacja z bazą odbywa się za pośrednictwem Supabase (używając `context.locals.supabase`).
6. Wynik operacji jest zwracany do klienta w formacie JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wszystkie żądania muszą zawierać poprawny token JWT w nagłówku `Authorization`.
- **Autoryzacja**: RLS (Row Level Security) w bazie danych zapewnia, że użytkownik widzi tylko swoje dane (polityki RLS na tabeli `Accounts`).
- **Walidacja**: Dane wejściowe są walidowane przy użyciu Zod, co ogranicza ryzyko SQL Injection i innych ataków.
- **Bezpieczne operacje DB**: Używanie klienta Supabase z kontekstem zapewnia, że zapytania są wykonywane w obrębie zabezpieczonych mechanizmów autoryzacji.

## 7. Obsługa błędów

- **400 Bad Request**: Zwracane w przypadku błędów walidacji danych wejściowych.
- **401 Unauthorized**: Zwracane, gdy token JWT nie jest dostarczony lub jest nieprawidłowy.
- **404 Not Found**: Zwracane, jeżeli żądane konto nie istnieje.
- **500 Internal Server Error**: Zwracane w przypadku problemów z serwerem lub bazą danych.
- Dodatkowo: Logowanie błędów do systemu monitoringu w celu analizy i szybkiej reakcji.

## 8. Rozważania dotyczące wydajności

- **Paginacja**: Stosowanie paginacji (parametry `page` i `limit`) w celu ograniczenia ilości zwracanych rekordów.
- **Indeksy**: Wykorzystanie indeksów (np. `idx_accounts_user_id`) w tabeli `Accounts` poprawia czas reakcji zapytań.
- **Optymalizacja zapytań**: Agregacja wartości `current_balance` powinna być wykonywana efektywnie, np. poprzez prekompilowane widoki lub zoptymalizowane zapytania.
- **Cache**: Opcjonalne cache'owanie wyników dla endpointów o wysokim ruchu.

## 9. Etapy wdrożenia

1. **Walidacja danych wejściowych**:
   - Utworzenie Zod schemas dla `CreateAccountCommand` i `UpdateAccountCommand`.
2. **Warstwa serwisowa**:
   - Utworzenie lub aktualizacja serwisu `AccountService` w `src/lib/services` z metodami: `createAccount`, `getAccounts`, `getAccountById`, `updateAccount`, `deleteAccount`.
3. **Implementacja API endpointów**:
   - Implementacja logiki w plikach API w katalogu `src/pages/api/accounts` z obsługą poszczególnych metod HTTP.
4. **Integracja uwierzytelniania**:
   - Weryfikacja tokenu JWT i ustawienie użytkownika w kontekście przy pomocy Astro middleware.
5. **Obsługa błędów i logowanie**:
   - Dodanie mechanizmów obsługi błędów i logowania, aby zwracać właściwe kody statusu oraz komunikaty.
6. **Przegląd kodu i dokumentacja**:
   - Upewnienie się, że kod jest zgodny z zasadami implementacji (backend.mdc, shared.mdc, astro.mdc) i przez code review.
7. **Przygotowanie struktury**:
   ```
   src/
     pages/
       api/
         accounts/
           index.ts        # GET (list), POST handlers
           [id].ts        # GET (single), PATCH, DELETE handlers
     lib/
       services/
         account.service.ts
       validators/
         account.validator.ts
       types/
         account.types.ts
   ```
