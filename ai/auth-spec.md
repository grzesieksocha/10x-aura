# Specyfikacja architektury modułu rejestracji, logowania i odzyskiwania hasła

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Struktura stron i layoutów

- **Nowe strony Astro:**

  - `/login.astro` – strona logowania
  - `/register.astro` – strona rejestracji
  - `/reset-password.astro` – strona inicjowania resetu hasła (podanie e-maila)
  - `/reset-password-confirm.astro` – strona ustawiania nowego hasła po kliknięciu w link z e-maila
  - `/settings.astro` – strona ustawień konta (zmiana hasła, dostępna tylko dla zalogowanych)

- **Layouty:**
  - `src/layouts/Layout.astro` – główny layout aplikacji, rozbudowany o warunkowe renderowanie nawigacji i slotów w zależności od stanu autentykacji (auth/non-auth).
  - Nowy layout `AuthLayout.astro` (opcjonalnie) – minimalistyczny layout dla stron logowania/rejestracji/resetu hasła (bez nawigacji, z logo i prostym tłem).

### 1.2. Komponenty i podział odpowiedzialności

- **Formularze React (client-side):**

  - `LoginForm.tsx` – obsługuje logowanie, walidację, komunikaty błędów, integrację z Supabase Auth.
  - `RegisterForm.tsx` – obsługuje rejestrację, walidację, komunikaty błędów, integrację z Supabase Auth.
  - `ResetPasswordForm.tsx` – obsługuje wysyłkę e-maila resetującego hasło.
  - `SetNewPasswordForm.tsx` – obsługuje ustawienie nowego hasła po kliknięciu w link z e-maila.
  - `ChangePasswordForm.tsx` – obsługuje zmianę hasła w ustawieniach konta (wymaga podania starego i nowego hasła).

- **Wykorzystanie komponentów UI:**

  - Inputy, buttony, labelki, komunikaty błędów – z katalogu `src/components/ui` (np. `input.tsx`, `button.tsx`, `label.tsx`).
  - Komponent `Toaster` do wyświetlania powiadomień o sukcesie/błędach.

- **Integracja z backendem:**
  - Formularze React komunikują się bezpośrednio z Supabase Auth (SDK po stronie klienta).
  - Po sukcesie: przekierowanie do odpowiednich widoków (np. dashboard po logowaniu, login po rejestracji, potwierdzenie po resetowaniu hasła).

### 1.3. Walidacja i komunikaty błędów

- **Walidacja po stronie klienta:**

  - E-mail: poprawny format, wymagane pole.
  - Hasło: wymagane pole, minimalna długość (np. 8 znaków).
  - Potwierdzenie hasła: zgodność z nowym hasłem.
  - Komunikaty błędów wyświetlane inline pod polami oraz jako powiadomienia (Toaster).

- **Walidacja po stronie Supabase:**
  - Błędy rejestracji (np. e-mail już zajęty), logowania (złe dane), resetu hasła (nieistniejący e-mail) – obsługa i tłumaczenie komunikatów na przyjazne dla użytkownika.

### 1.4. Scenariusze użytkownika

- **Logowanie:** użytkownik podaje e-mail i hasło → walidacja → próba logowania przez Supabase → sukces: przekierowanie do dashboardu, błąd: komunikat.
- **Rejestracja:** użytkownik podaje e-mail, hasło, potwierdzenie hasła → walidacja → rejestracja przez Supabase → sukces: przekierowanie do loginu z komunikatem, błąd: komunikat.
- **Reset hasła:** użytkownik podaje e-mail → walidacja → wysyłka linku przez Supabase → sukces: komunikat, błąd: komunikat.
- **Ustawienie nowego hasła:** użytkownik wchodzi z linku z e-maila, podaje nowe hasło → walidacja → ustawienie hasła przez Supabase → sukces: przekierowanie do loginu, błąd: komunikat.
- **Zmiana hasła:** użytkownik w ustawieniach podaje stare i nowe hasło → walidacja → zmiana przez Supabase → sukces: komunikat, błąd: komunikat.

- **Tryb auth/non-auth:**
  - Po zalogowaniu: dostęp do wszystkich funkcji aplikacji, pełna nawigacja.
  - Bez zalogowania: dostęp tylko do stron logowania/rejestracji/resetu hasła, przekierowania z prób wejścia na chronione strony.

---

## 2. LOGIKA BACKENDOWA

### 2.1. Endpointy API

- **Brak własnych endpointów do autentykacji** – całość obsługiwana przez Supabase Auth (SDK po stronie klienta).
- **Dodatkowe endpointy Astro (opcjonalnie):**
  - `/api/user` – zwraca dane zalogowanego użytkownika (do SSR i ochrony stron).
  - Middleware Astro (`src/middleware/index.ts`) – ochrona tras wymagających autentykacji (przekierowanie na login, jeśli brak sesji).

### 2.2. Modele danych

- **Użytkownik:** zarządzany przez Supabase (tabela `auth.users`), brak własnych modeli poza referencją `user_id` w innych tabelach.
- **Zmiana hasła:** obsługiwana przez Supabase (SDK/metody REST).

### 2.3. Walidacja i obsługa wyjątków

- **Walidacja wejściowa:** po stronie klienta (formularze React) oraz przez Supabase (np. unikalność e-maila, siła hasła).
- **Obsługa wyjątków:** przechwytywanie błędów z Supabase, tłumaczenie na komunikaty dla użytkownika, logowanie błędów po stronie klienta (opcjonalnie do Sentry).

### 2.4. Renderowanie server-side

- **Astro SSR:** renderowanie stron z uwzględnieniem stanu sesji użytkownika (np. przekierowanie na login, jeśli nie zalogowany).
- **Middleware:** sprawdzanie obecności sesji Supabase w `Astro.locals` (zgodnie z typami w `src/types.ts`).

---

## 3. SYSTEM AUTENTYKACJI

### 3.1. Supabase Auth

- **Rejestracja:** `supabase.auth.signUp({ email, password })`
- **Logowanie:** `supabase.auth.signInWithPassword({ email, password })`
- **Wylogowanie:** `supabase.auth.signOut()`
- **Reset hasła:** `supabase.auth.resetPasswordForEmail(email)`
- **Ustawienie nowego hasła:** obsługa przez link z e-maila i dedykowany formularz
- **Zmiana hasła:** `supabase.auth.updateUser({ password: newPassword })` (wymaga zalogowania)

### 3.2. Integracja z Astro

- **SSR:** sesja użytkownika dostępna w `Astro.locals.user` (typy już zadeklarowane w `src/types.ts`).
- **Ochrona tras:** middleware sprawdzający obecność `user` w `Astro.locals`, przekierowujący na `/login` w przypadku braku autentykacji.
- **Przekazywanie sesji do komponentów React:** przez propsy lub context (np. React Context z informacją o zalogowanym użytkowniku).

### 3.3. Bezpieczeństwo

- **Hasła:** przechowywane i obsługiwane wyłącznie przez Supabase (hashowanie, reset, zmiana).
- **Dane użytkownika:** identyfikacja po `user.id` z Supabase, referencje w tabelach aplikacji.
- **Brak przechowywania haseł po stronie aplikacji.**

---

## 4. KLUCZOWE KOMPONENTY I MODUŁY

- **Strony Astro:** `/login.astro`, `/register.astro`, `/reset-password.astro`, `/reset-password-confirm.astro`, `/settings.astro`
- **Layouty:** `Layout.astro` (rozbudowany o tryb auth/non-auth), opcjonalnie `AuthLayout.astro`
- **Komponenty React:** `LoginForm.tsx`, `RegisterForm.tsx`, `ResetPasswordForm.tsx`, `SetNewPasswordForm.tsx`, `ChangePasswordForm.tsx`
- **Hooki React:** `useAuth` (do pobierania stanu użytkownika, logowania, rejestracji, wylogowania, zmiany hasła)
- **Middleware Astro:** ochrona tras wymagających autentykacji
- **Konfiguracja Supabase:** `src/db/supabase.client.ts` (już istnieje)
- **Obsługa sesji:** przez `Astro.locals.user` i React Context

---

## 5. UWAGI WDROŻENIOWE

- **Nie naruszać istniejącej logiki biznesowej** – wszystkie operacje na danych (konta, transakcje, kategorie, budżety) muszą być powiązane z `user_id` z Supabase.
- \*\*Zastąpić wszędzie użycie `DEFAULT_USER_ID` realnym `user.id` po wdrożeniu autentykacji.
- \*\*Dostosować nawigację i layout do trybu auth/non-auth (np. ukryć linki do dashboardu/kont/kategorii dla niezalogowanych).
- \*\*Zaimplementować przekierowania po zalogowaniu/wylogowaniu/rejestracji/resetowaniu hasła zgodnie z dobrymi praktykami UX.
