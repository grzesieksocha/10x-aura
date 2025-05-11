# Plan implementacji widoku Dashboard

## 1. Przegląd

Dashboard to główny widok pulpitu użytkownika dostępny pod ścieżką `/dashboard`. Jego celem jest szybkie przedstawienie najważniejszych informacji finansowych:

- Łączne saldo ze wszystkich kont.
- Lista kont z aktualnymi saldami.
- Szybki podgląd wydatków w formie wykresu kołowego (podział wydatków według kategorii dla wybranego miesiąca).

## 2. Routing widoku

W pliku routingu Astro należy dodać stronę:

```bash
src/pages/dashboard.astro
```

Ścieżka HTTP: `/dashboard`

## 3. Struktura komponentów

```text
DashboardPage (React)
├── DashboardHeader
│    └─ TotalBalanceCard
├── AccountsSection
│    ├─ AccountsHeader
│    └─ AccountsList
│         └─ AccountItem
├── CategoryBreakdownSection
│    └─ ExpensePieChart
└── ErrorBoundary
```

## 4. Szczegóły komponentów

### DashboardHeader

- Opis: Nagłówek sekcji z wielką kartą prezentującą łączne saldo.
- Główne elementy:
  - `TotalBalanceCard` – karta z dużym numerem salda.
- Obsługiwane zdarzenia: brak (tylko wyświetlanie).
- Walidacja: saldo musi być liczbą >= 0.
- Typy:
  - `TotalBalanceDTO { totalBalance: number }`
- Propsy:
  - `data: TotalBalanceDTO`

### AccountsSection

- Opis: Sekcja listy kont.
- Główne elementy:
  - `AccountsHeader` – tytuł sekcji.
  - `AccountsList` – kontener listy elementów.
  - `AccountItem` – pojedyncze konto (nazwa + saldo).
- Obsługiwane zdarzenia:
  - kliknięcie w `AccountItem` → nawigacja do `/accounts/{id}` (podgląd konta).
- Walidacja: brak, to wyłącznie podgląd.
- Typy:
  - `AccountResponseDTO` (z `src/lib/schemas/account.schema.ts`).
- Propsy:
  - `accounts: AccountResponseDTO[]`

### CategoryBreakdownSection

- Opis: Sekcja wizualizacji wydatków dla bieżącego miesiąca.
- Główne elementy:
  - `ExpensePieChart` – wykres kołowy wydatków.
- Obsługiwane zdarzenia: brak (tylko wyświetlanie).
- Walidacja: brak.
- Typy:
  - `CategoryBreakdownDTO[]`
- Propsy:
  - `data: CategoryBreakdownDTO[]`

### ErrorBoundary

- Opis: Otacza całą stronę i wyłapuje błędy renderowania.
- Propsy:
  - `children`
  - `fallback?`

## 5. Typy

```ts
// src/types.ts

import type { AccountResponseDTO } from "src/lib/schemas/account.schema.ts";

/** Konto z API */
export type DashboardAccount = AccountResponseDTO;

/** Sumaryczne saldo obliczane w hooku */
export type TotalBalance = number;

/** Podział wydatków wg kategorii */
export interface CategoryBreakdownDTO {
  category: string;
  total: number;
}
```

## 6. Zarządzanie stanem

- Custom hook `useDashboardData()` w `src/lib/hooks/useDashboardData.ts`:
  - **state:**
    - `accounts: DashboardAccount[]`
    - `totalBalance: TotalBalance`
    - `breakdown: CategoryBreakdownDTO[]`
    - `loading: boolean`
    - `error: Error | null`
  - **akcje:**
    - fetch `/api/accounts`
    - oblicz `totalBalance = sum(accounts.current_balance)`
    - fetch `/api/reports/category-breakdown?month=${new Date().toISOString().slice(0,7)}`

## 7. Integracja API

- GET `/api/accounts` → `AccountDTO[]`
- GET `/api/reports/category-breakdown?month=YYYY-MM` → `CategoryBreakdownDTO[]`
- Użycie fetch wrappera z nagłówkiem JWT

## 8. Interakcje użytkownika

- Załadowanie strony → fetch kont → wyświetlenie listy i salda.
- Zmiana miesiąca w dropdown → aktualizacja wykresu.
- Błąd fetch → pokazanie fallbacku lub komunikatu w `ErrorBoundary`.

## 9. Warunki i walidacja

- Saldo: jeśli `NaN` → wyświetl `0 PLN`.
- Lista kont pusta → `Brak kont do wyświetlenia`.
- MonthSelector: waliduj format `/^\d{4}-\d{2}$/`.

## 10. Obsługa błędów

- Sieć/API:
  - 401 → przekierowanie do logowania.
  - Inne błędy → komunikat "Błąd serwera, spróbuj ponownie później".

## 11. Kroki implementacji

1. Utworzyć stronę `src/pages/dashboard.astro`.
2. Dodać typy do `src/types.ts`.
3. Napisać hook `useDashboardData`.
4. Stworzyć komponenty:
   - `DashboardHeader`
   - `AccountsSection`
   - `BudgetPreviewSection`
   - `ErrorBoundary`
   - `MonthSelector`
   - `ExpensePieChart`
5. Zaimplementować integrację z API w hooku.
6. Dodać stylowanie Tailwind.
7. Przetestować scenariusze brzegowe.
8. Code review i linting.
