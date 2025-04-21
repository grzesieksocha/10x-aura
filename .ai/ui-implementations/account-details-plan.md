# Plan implementacji widoku szczegółów konta

## 1. Przegląd

Widok szczegółów konta prezentuje operacje finansowe na danym koncie, umożliwiając przeglądanie, dodawanie, edycję i usuwanie transakcji. Widok zawiera saldo konta, filtry transakcji oraz chronologiczną listę operacji z możliwością szybkiej edycji.

## 2. Routing widoku

- Ścieżka: `/account/[id]`
- Parametry URL: `id` - identyfikator konta

## 3. Struktura komponentów

```
AccountDetailsView
├── AccountHeader
├── TransactionFilters
├── TransactionList
│   ├── TransactionItem
│   └── TransactionEditForm
└── TransactionForm
```

## 4. Szczegóły komponentów

### AccountDetailsView

- Opis: Główny kontener widoku, zarządza stanem i integracją z API
- Główne elementy: Layout z nagłówkiem, filtrami i listą transakcji
- Obsługiwane interakcje: Routing, zarządzanie stanem globalnym widoku
- Typy: `AccountViewModel`, `TransactionViewModel`
- Propsy: `accountId: number`

### AccountHeader

- Opis: Wyświetla nazwę konta, saldo oraz przyciski akcji
- Główne elementy: Nazwa konta, saldo, przyciski dodawania transakcji
- Obsługiwane interakcje: Otwieranie formularzy nowych transakcji
- Typy: `AccountViewModel`
- Propsy: `account: AccountViewModel, onAddTransaction: (type: TransactionType) => void`

### TransactionFilters

- Opis: Panel filtrów transakcji
- Główne elementy: Date picker, wybór kategorii, wybór typu transakcji
- Obsługiwane interakcje: Zmiana filtrów
- Typy: `TransactionFilters`
- Propsy: `filters: TransactionFilters, onFilterChange: (filters: TransactionFilters) => void`

### TransactionList

- Opis: Lista transakcji z możliwością edycji inline
- Główne elementy: Lista transakcji, komponenty edycji
- Obsługiwane interakcje: Edycja, usuwanie, sortowanie
- Obsługiwana walidacja: Format kwoty, daty, wymagane pola
- Typy: `TransactionViewModel[]`
- Propsy: `transactions: TransactionViewModel[], onEdit: (id: number, data: TransactionViewModel) => void, onDelete: (id: number) => void`

### TransactionForm

- Opis: Formularz dodawania/edycji transakcji
- Główne elementy: Pola formularza, przyciski akcji
- Obsługiwane interakcje: Zapisywanie, anulowanie
- Obsługiwana walidacja: Wszystkie reguły walidacji API
- Typy: `TransactionFormData`
- Propsy: `type: TransactionType, initialData?: TransactionViewModel, onSubmit: (data: TransactionFormData) => void, onCancel: () => void`

## 5. Typy

```typescript
interface AccountViewModel {
  id: number;
  name: string;
  balance: number;
  initialBalance: number;
}

interface TransactionViewModel {
  id: number;
  type: "expense" | "revenue" | "transfer";
  amount: number;
  date: string;
  description?: string;
  categoryId?: number;
  category?: CategoryViewModel;
  relatedAccountId?: number;
  relatedAccountName?: string;
}

interface TransactionFormData {
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  categoryId?: number;
  destinationAccountId?: number; // dla transferów
}

interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: number;
  type?: TransactionType[];
}

interface CategoryViewModel {
  id: number;
  name: string;
  isRevenue: boolean;
}
```

## 6. Zarządzanie stanem

### Custom Hooks

#### useAccountDetails

- Pobieranie i cachowanie danych konta
- Obsługa błędów API
- Automatyczne odświeżanie salda

#### useTransactions

- Zarządzanie listą transakcji
- Filtrowanie i sortowanie
- Optymistyczne aktualizacje
- Paginacja (jeśli potrzebna)

#### useTransactionForm

- Walidacja formularza
- Zarządzanie stanem formularza
- Obsługa submitowania

## 7. Integracja API

### Endpointy

- GET /api/accounts/{id} - pobieranie szczegółów konta
- GET /api/accounts/{id}/transactions - pobieranie transakcji
- POST /api/transactions - dodawanie transakcji
- PUT /api/transactions/{id} - aktualizacja transakcji
- DELETE /api/transactions/{id} - usuwanie transakcji
- POST /api/transactions/transfer - tworzenie transferu

### Typy żądań i odpowiedzi

[Szczegółowe typy z database.types.ts]

## 8. Interakcje użytkownika

1. Filtrowanie transakcji
   - Wybór zakresu dat
   - Wybór kategorii
   - Wybór typu transakcji
2. Dodawanie transakcji
   - Wybór typu transakcji
   - Wypełnienie formularza
   - Walidacja w locie
   - Zapisanie/Anulowanie
3. Edycja transakcji
   - Kliknięcie w transakcję
   - Edycja inline
   - Zapisanie/Anulowanie (Enter/Escape)
4. Usuwanie transakcji
   - Potwierdzenie usunięcia
   - Optymistyczna aktualizacja UI

## 9. Warunki i walidacja

### Walidacja formularza

- Kwota: liczba dodatnia, max 2 miejsca po przecinku
- Data: format ISO8601, nie może być pusta
- Kategoria: wymagana dla wydatków
- Konta przy transferze: muszą być różne

### Walidacja stanu

- Blokada edycji podczas zapisywania
- Blokada usuwania podczas zapisywania
- Walidacja pól w locie

## 10. Obsługa błędów

### Rodzaje błędów

- Błędy API
- Błędy walidacji
- Błędy sieci
- Błędy optymistycznych aktualizacji

### Strategia obsługi

- Wyświetlanie komunikatów użytkownikowi
- Wycofywanie optymistycznych zmian
- Retry dla błędów sieci
- Logowanie błędów

## 11. Kroki implementacji

1. Konfiguracja routingu

   - Dodanie strony w Astro
   - Konfiguracja parametrów

2. Implementacja komponentów

   - AccountDetailsView
   - AccountHeader
   - TransactionFilters
   - TransactionList
   - TransactionForm

3. Implementacja hooks

   - useAccountDetails
   - useTransactions
   - useTransactionForm

4. Integracja z API

   - Implementacja klientów API
   - Obsługa błędów
   - Cachowanie

5. Implementacja UI

   - Stylowanie komponentów
   - Responsywność
   - Dostępność
