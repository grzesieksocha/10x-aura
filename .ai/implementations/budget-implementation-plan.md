# API Endpoint Implementation Plan: Budget Management Endpoints

## 1. Przegląd punktu końcowego

Zestaw endpointów do zarządzania budżetami miesięcznymi dla kategorii wydatków/przychodów. Umożliwia tworzenie, aktualizację i pobieranie budżetów z podziałem na kategorie i miesiące.

## 2. Szczegóły żądania

### GET /api/budgets

- Metoda HTTP: GET
- Struktura URL: `/api/budgets`
- Parametry Query:
  - Wymagane:
    - `year` (string, format: YYYY)
  - Opcjonalne:
    - `page` (number)
    - `limit` (number)

### POST /api/budgets

- Metoda HTTP: POST
- Struktura URL: `/api/budgets`
- Request Body:
  ```typescript
  {
    category_id: number;
    budget_date: string; // format: YYYY-MM-01
    planned_amount: number;
  }
  ```

### PUT /api/budgets/{budgetId}

- Metoda HTTP: PUT
- Struktura URL: `/api/budgets/{budgetId}`
- Parametry Path:
  - `budgetId` (number)
- Request Body:
  ```typescript
  {
    planned_amount: number;
  }
  ```

## 3. Wykorzystywane typy

### DTOs

```typescript
interface BudgetResponseDto {
  id: number;
  category_id: number;
  budget_date: string;
  planned_amount: number;
  created_at: string;
}

interface CreateBudgetCommand {
  category_id: number;
  budget_date: string;
  planned_amount: number;
}

interface UpdateBudgetCommand {
  planned_amount: number;
}

interface BudgetListParams {
  year: string;
  page?: number;
  limit?: number;
}
```

### Zod Schemas

```typescript
const budgetDateSchema = z.string().regex(/^\d{4}-\d{2}-01$/);
const plannedAmountSchema = z.number().positive();
const yearSchema = z.string().regex(/^\d{4}$/);

const createBudgetSchema = z.object({
  category_id: z.number().positive(),
  budget_date: budgetDateSchema,
  planned_amount: plannedAmountSchema,
});

const updateBudgetSchema = z.object({
  planned_amount: plannedAmountSchema,
});

const budgetListParamsSchema = z.object({
  year: yearSchema,
  page: z.number().optional(),
  limit: z.number().optional(),
});
```

## 4. Przepływ danych

### GET /api/budgets

1. Walidacja parametrów zapytania (year, page, limit)
2. Pobranie ID użytkownika z kontekstu Supabase
3. Wywołanie BudgetService.getBudgets(userId, year, page, limit)
4. Transformacja danych do BudgetResponseDto[]
5. Zwrócenie odpowiedzi z paginacją

### POST /api/budgets

1. Walidacja request body przez createBudgetSchema
2. Pobranie ID użytkownika z kontekstu Supabase
3. Sprawdzenie czy kategoria należy do użytkownika
4. Sprawdzenie duplikatów (user_id, category_id, budget_date)
5. Wywołanie BudgetService.createBudget(userId, command)
6. Zwrócenie utworzonego rekordu

### PUT /api/budgets/{budgetId}

1. Walidacja request body przez updateBudgetSchema
2. Pobranie ID użytkownika z kontekstu Supabase
3. Sprawdzenie czy budżet istnieje i należy do użytkownika
4. Wywołanie BudgetService.updateBudget(budgetId, command)
5. Zwrócenie zaktualizowanego rekordu

## 5. Względy bezpieczeństwa

1. Autentykacja:

   - Wykorzystanie middleware Supabase do weryfikacji JWT
   - Dostęp tylko dla zalogowanych użytkowników

2. Autoryzacja:

   - Implementacja RLS w bazie danych
   - Sprawdzanie właściciela zasobu przed każdą operacją

3. Walidacja danych:
   - Sanityzacja wszystkich danych wejściowych
   - Walidacja typów i formatów przez Zod
   - Sprawdzanie integralności relacji

## 6. Obsługa błędów

### Kody odpowiedzi

- 200: Pomyślne pobranie lub aktualizacja
- 201: Pomyślne utworzenie
- 400: Błędy walidacji
  - Nieprawidłowy format daty
  - Nieprawidłowa wartość planned_amount
  - Duplikat wpisu
- 401: Brak autoryzacji
- 404: Nie znaleziono budżetu
- 500: Błąd serwera

### Struktura błędów

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

## 7. Rozważania dotyczące wydajności

1. Indeksy bazy danych:

   - Composite index na (user_id, category_id, budget_date)
   - Index na budget_date dla filtrowania po roku

2. Paginacja:

   - Limit domyślny: 20 rekordów
   - Maksymalny limit: 100 rekordów

3. Cachowanie:
   - Implementacja cache dla często używanych zapytań
   - Cache invalidation przy modyfikacjach

## 8. Etapy wdrożenia

1. Przygotowanie struktury:

   ```
   src/
     pages/
       api/
         budgets/
           index.ts        # GET, POST handlers
           [budgetId].ts   # PUT handler
     lib/
       services/
         budget.service.ts
       schemas/
         budget.schema.ts
       types/
         budget.types.ts
   ```

2. Implementacja BudgetService:

   - Metody: getBudgets, createBudget, updateBudget
   - Integracja z Supabase Client
   - Implementacja logiki biznesowej

3. Implementacja schematów walidacji:

   - Utworzenie budget.schema.ts
   - Definicja wszystkich schematów Zod

4. Implementacja endpointów:

   - GET /api/budgets
   - POST /api/budgets
   - PUT /api/budgets/{budgetId}

5. Implementacja testów:

   - Testy jednostkowe dla BudgetService
   - Testy integracyjne dla endpointów
   - Testy walidacji

6. Konfiguracja bezpieczeństwa:

   - Implementacja RLS w Supabase
   - Konfiguracja middleware autoryzacji

7. Dokumentacja:

   - Aktualizacja dokumentacji API
   - Przykłady użycia
   - Opis kodów błędów

8. Code review i testy:
   - Przegląd kodu przez zespół
   - Testy wydajnościowe
   - Testy bezpieczeństwa
