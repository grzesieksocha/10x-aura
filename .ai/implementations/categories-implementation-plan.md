# API Endpoint Implementation Plan: Categories

## 1. Przegląd punktu końcowego

Celem endpointu jest zarządzanie kategoriami transakcji finansowych. Umożliwia on pełen zakres operacji CRUD:

- Pobieranie listy kategorii (GET /api/categories)
- Tworzenie nowej kategorii (POST /api/categories)
- Aktualizację nazwy kategorii (PATCH /api/categories/{categoryId})
- Usuwanie kategorii (DELETE /api/categories/{categoryId})

Endpoint korzysta z Supabase do obsługi operacji bazy danych, Zod do walidacji danych wejściowych oraz mechanizmów Astro do obsługi żądań. Implementacja musi być zgodna z regułami backend.mdc, shared.mdc i astro.mdc.

## 2. Szczegóły żądania

- **Metody HTTP**:
  - GET, POST, PATCH, DELETE
- **Struktura URL**:
  - Lista kategorii: `/api/categories`
  - Operacje na pojedynczej kategorii: `/api/categories/{categoryId}`
- **Parametry**:
  - **GET /api/categories**:
    - Wymagane: Token uwierzytelniający (JWT w nagłówku `Authorization`)
  - **POST /api/categories**:
    - Request Body (JSON):
      ```typescript
      {
        name: string; // Nazwa kategorii
        is_revenue: boolean; // Czy kategoria dotyczy przychodów
      }
      ```
  - **PATCH /api/categories/{categoryId}**:
    - Parametr ścieżki: `categoryId` (number)
    - Request Body (JSON):
      ```typescript
      {
        name: string; // Nowa nazwa kategorii
      }
      ```
  - **DELETE /api/categories/{categoryId}**:
    - Parametr ścieżki: `categoryId` (number)

## 3. Wykorzystywane typy

### DTO

```typescript
interface CategoryResponseDTO {
  id: number;
  name: string;
  is_revenue: boolean;
  created_at: string;
}
```

### Command Models

```typescript
interface CreateCategoryCommand {
  name: string;
  is_revenue: boolean;
}

interface UpdateCategoryCommand {
  name: string;
}
```

### Zod Schemas

```typescript
const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  is_revenue: z.boolean(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255),
});
```

## 4. Przepływ danych

1. Klient wysyła żądanie do API z odpowiednim nagłówkiem `Authorization` zawierającym token JWT.
2. Middleware (Astro) weryfikuje token i ustawia informacje o użytkowniku w kontekście (context.locals).
3. Handler API waliduje dane wejściowe przy użyciu odpowiedniego Zod schema.
4. Po walidacji żądanie jest przekazywane do `CategoryService`, który wykonuje logikę biznesową:
   - Dla GET: pobiera wszystkie kategorie użytkownika
   - Dla POST: tworzy nową kategorię po sprawdzeniu unikalności nazwy
   - Dla PATCH: aktualizuje nazwę kategorii po sprawdzeniu unikalności
   - Dla DELETE: usuwa kategorię po sprawdzeniu czy nie jest używana
5. Komunikacja z bazą odbywa się za pośrednictwem Supabase (używając `context.locals.supabase`).
6. Wynik operacji jest zwracany do klienta w formacie JSON.

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie**:
  - Wszystkie żądania muszą zawierać poprawny token JWT w nagłówku `Authorization`
  - Weryfikacja tokenu przez Astro middleware
- **Autoryzacja**:

  - RLS (Row Level Security) w Supabase zapewnia, że użytkownik widzi tylko swoje kategorie
  - Polityki RLS na tabeli `Categories`:

    ```sql
    CREATE POLICY "Users can view their own categories"
      ON categories FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own categories"
      ON categories FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own categories"
      ON categories FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own categories"
      ON categories FOR DELETE
      USING (auth.uid() = user_id);
    ```

- **Walidacja**:
  - Sanityzacja danych wejściowych przez Zod
  - Sprawdzanie unikalności nazw kategorii
  - Walidacja typów i długości pól

## 6. Obsługa błędów

- **400 Bad Request**:
  - Nieprawidłowa struktura danych wejściowych
  - Nazwa kategorii już istnieje
  - Próba usunięcia kategorii, która jest używana
  - Nieprawidłowy format categoryId
- **401 Unauthorized**:
  - Brak tokenu JWT
  - Nieprawidłowy token JWT
- **404 Not Found**:
  - Kategoria o podanym ID nie istnieje
- **500 Internal Server Error**:
  - Błędy bazy danych
  - Nieoczekiwane błędy serwera

Każdy błąd powinien zwracać odpowiedź w formacie:

```typescript
{
  error: {
    message: string;
    code: string;
    details?: any;
  }
}
```

## 7. Rozważania dotyczące wydajności

- **Indeksy**:
  - Indeks na kolumnie `user_id` dla szybszego filtrowania
  - Unikalny indeks na parze `(user_id, name)` dla szybkiego sprawdzania duplikatów
- **Zapytania**:
  - Używanie odpowiednich klauzul WHERE w zapytaniach
  - Unikanie niepotrzebnych JOINów
- **Walidacja**:
  - Cache'owanie wyników walidacji unikalności nazwy
  - Optymalizacja sprawdzania czy kategoria jest używana

## 8. Etapy wdrożenia

1. **Przygotowanie typów i schematów**:

   - Utworzenie pliku `src/types/category.types.ts` z definicjami DTO i Command Models
   - Utworzenie pliku `src/schemas/category.schemas.ts` z schematami Zod

2. **Implementacja CategoryService**:

   ```typescript
   // src/lib/services/category.service.ts
   export class CategoryService {
     constructor(private supabase: SupabaseClient) {}

     async getCategories(): Promise<CategoryResponseDTO[]>;
     async createCategory(command: CreateCategoryCommand): Promise<CategoryResponseDTO>;
     async updateCategory(id: number, command: UpdateCategoryCommand): Promise<CategoryResponseDTO>;
     async deleteCategory(id: number): Promise<void>;
     private async checkNameUniqueness(name: string, userId: string, excludeId?: number): Promise<boolean>;
     private async isCategoryInUse(id: number): Promise<boolean>;
   }
   ```

3. **Implementacja endpointów**:

   - Utworzenie plików w `src/pages/api/categories/`:
     - `index.ts` (GET, POST)
     - `[categoryId].ts` (PATCH, DELETE)
   - Implementacja obsługi żądań z wykorzystaniem CategoryService
   - Dodanie walidacji danych wejściowych
   - Implementacja obsługi błędów

4. **Testy**:

   - Testy jednostkowe dla CategoryService
   - Testy integracyjne dla endpointów API
   - Testy wydajnościowe dla operacji na dużej liczbie kategorii

5. **Dokumentacja**:

   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia w Postman/Swagger
   - Dokumentacja wewnętrzna (JSDoc)

6. **Wdrożenie**:
   - Code review
   - Testy na środowisku staging
   - Wdrożenie na produkcję
   - Monitoring działania endpointu
