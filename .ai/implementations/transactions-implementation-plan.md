# API Endpoint Implementation Plan: POST /api/transactions/transfer

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia transakcji transferowych między dwoma kontami użytkownika. Automatycznie tworzy dwa powiązane rekordy transakcji - jeden dla konta źródłowego (debet) i jeden dla konta docelowego (kredyt). Zapewnia atomowość operacji i spójność danych.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: `/api/transactions/transfer`
- Headers:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Request Body:
  ```typescript
  {
    source_account_id: number;      // ID konta źródłowego
    destination_account_id: number;  // ID konta docelowego
    amount: number;                 // Kwota w groszach (>0)
    transaction_date: string;       // Data w formacie ISO8601
    description?: string;           // Opcjonalny opis (max 500 znaków)
  }
  ```

## 3. Wykorzystywane typy

### Command Models

```typescript
interface TransferTransactionCommand {
  source_account_id: number;
  destination_account_id: number;
  amount: number;
  transaction_date: string;
  description?: string;
}

interface ValidatedTransfer extends TransferTransactionCommand {
  user_id: string;
}
```

### Response Types

```typescript
interface TransferTransactionResponse {
  source_transaction: TransactionDTO;
  destination_transaction: TransactionDTO;
}

interface TransactionDTO {
  id: number;
  account_id: number;
  amount: number;
  transaction_date: string;
  transaction_type: "transfer";
  description?: string;
  related_transaction_id: number;
  created_at: string;
}
```

### Validation Schema

```typescript
import { z } from "zod";

const transferTransactionSchema = z
  .object({
    source_account_id: z.number().int().positive(),
    destination_account_id: z.number().int().positive(),
    amount: z.number().int().positive(),
    transaction_date: z.string().datetime({ offset: true }),
    description: z.string().max(500).optional(),
  })
  .refine((data) => data.source_account_id !== data.destination_account_id, {
    message: "Source and destination accounts must be different",
  });
```

## 4. Przepływ danych

1. Walidacja wejścia:

   - Parsowanie i walidacja body requestu przez Zod schema
   - Sprawdzenie czy użytkownik jest zalogowany (Supabase auth)

2. Walidacja biznesowa:

   - Sprawdzenie czy oba konta należą do użytkownika
   - Sprawdzenie czy konta istnieją
   - Sprawdzenie czy kwota jest dodatnia

3. Operacje bazodanowe (w transakcji SQL):

   - Utworzenie rekordu transakcji dla konta źródłowego
   - Utworzenie rekordu transakcji dla konta docelowego
   - Powiązanie rekordów przez related_transaction_id
   - Aktualizacja sald kont

4. Przygotowanie odpowiedzi:
   - Mapowanie rekordów na DTO
   - Zwrócenie odpowiedzi z kodem 201

## 5. Względy bezpieczeństwa

1. Uwierzytelnianie:

   - Wymagane uwierzytelnienie przez Supabase
   - Walidacja tokena JWT w middleware

2. Autoryzacja:

   - Sprawdzenie własności obu kont
   - Wykorzystanie Row Level Security (RLS) w Supabase

3. Walidacja danych:

   - Sanityzacja wszystkich danych wejściowych
   - Walidacja typów i formatów
   - Walidacja limitów długości pól

4. Zabezpieczenia bazodanowe:
   - Wykorzystanie prepared statements
   - Transakcje SQL dla atomowości operacji
   - Indeksy na kluczowych polach

## 6. Obsługa błędów

### Kody odpowiedzi

- 201: Sukces - transfer utworzony
- 400: Błędne dane wejściowe
  - Nieprawidłowy format danych
  - Te same konta źródłowe i docelowe
  - Brakujące wymagane pola
- 401: Brak autoryzacji
  - Brak tokena JWT
  - Nieważny token
- 404: Nie znaleziono zasobu
  - Konto źródłowe nie istnieje
  - Konto docelowe nie istnieje
- 500: Błąd serwera
  - Błąd bazy danych
  - Błąd transakcji

### Struktura błędów

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## 7. Rozważania dotyczące wydajności

1. Optymalizacja bazy danych:

   - Indeksy na `user_id`, `account_id`, `transaction_date`
   - Partycjonowanie po `transaction_date`
   - Wykorzystanie transakcji SQL

2. Cachowanie:

   - Cachowanie walidacji kont
   - Cachowanie sum transakcji

3. Monitorowanie:
   - Śledzenie czasu odpowiedzi
   - Monitorowanie wykorzystania zasobów
   - Alerty przy przekroczeniu progów

## 8. Etapy wdrożenia

1. Przygotowanie struktury:

   ```
   src/
     pages/
       api/
         transactions/
           transfer.ts     # Endpoint handler
     lib/
       services/
         transaction.ts   # Business logic
       validators/
         transaction.ts   # Zod schemas
       types/
         transaction.ts   # TypeScript types
   ```

2. Implementacja walidatorów:

   - Utworzenie schematów Zod
   - Implementacja walidacji biznesowej

3. Implementacja serwisu:

   - Metody tworzenia transferu
   - Metody walidacji kont
   - Obsługa transakcji SQL

4. Implementacja endpointu:

   - Handler POST
   - Integracja z serwisem
   - Obsługa błędów

5. Testy:

   - Testy jednostkowe walidatorów
   - Testy integracyjne endpointu
   - Testy wydajnościowe

6. Dokumentacja:

   - Dokumentacja API
   - Przykłady użycia
   - Opis obsługi błędów

7. Wdrożenie:
   - Code review
   - Testy na środowisku staging
   - Deployment na produkcję
