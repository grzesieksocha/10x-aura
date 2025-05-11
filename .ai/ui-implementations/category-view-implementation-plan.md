# Plan implementacji widoku Kategorii

## 1. Przegląd

Widok Kategorii umożliwia użytkownikom zarządzanie kategoriami finansowymi poprzez wyświetlanie, dodawanie, edytowanie i usuwanie kategorii. Kategorie są kluczowe dla organizacji wydatków i przychodów, pozwalając użytkownikom na grupowanie transakcji według własnych potrzeb. Widok zapewnia czytelny podział na kategorie wydatkowe i przychodowe oraz rozróżnienie między kategoriami predefiniowanymi (systemowymi) a własnymi.

## 2. Routing widoku

Widok dostępny pod ścieżką: `/categories`

Plik `src/pages/categories.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import CategoryPage from "../components/categories/CategoryPage";
---

<Layout>
  <CategoryPage client:load />
</Layout>
```

## 3. Struktura komponentów

```
CategoryPage
├── PageHeader (z AddCategoryButton)
├── CategoryFilters (opcjonalnie)
├── CategoryList
│   ├── CategoryItem (wiele instancji)
└── CategoryFormModal (otwierany na żądanie)
```

## 4. Szczegóły komponentów

### CategoryPage

- Opis komponentu: Główny kontener dla całego widoku kategorii, zarządza stanem i koordynuje interakcje między komponentami.
- Główne elementy: Nagłówek strony, przyciski akcji, lista kategorii, modal formularza.
- Obsługiwane interakcje: Deleguje interakcje do komponentów potomnych, obsługuje usuwanie kategorii poprzez window.confirm().
- Obsługiwana walidacja: Nie wykonuje bezpośredniej walidacji.
- Typy: Korzysta z typów zdefiniowanych dla podkomponentów.
- Propsy: Brak - komponent najwyższego poziomu.

### PageHeader

- Opis komponentu: Nagłówek strony z tytułem i przyciskiem dodawania nowej kategorii.
- Główne elementy: Tytuł strony, AddCategoryButton.
- Obsługiwane interakcje: Deleguje do AddCategoryButton.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onAddClick: () => void`

### CategoryFilters (opcjonalnie)

- Opis komponentu: Umożliwia filtrowanie listy kategorii według typu (wydatki/przychody).
- Główne elementy: Przyciski przełączania typu, pole wyszukiwania (opcjonalnie).
- Obsługiwane interakcje: Zmiana filtru typu, wyszukiwanie tekstu.
- Obsługiwana walidacja: Brak.
- Typy: CategoryFilter.
- Propsy:
  - `filters: CategoryFilter`
  - `onFiltersChange: (filters: CategoryFilter) => void`

### CategoryList

- Opis komponentu: Wyświetla listę kategorii z podziałem na typy (wydatki/przychody).
- Główne elementy: Nagłówki sekcji, lista elementów CategoryItem.
- Obsługiwane interakcje: Deleguje do CategoryItem.
- Obsługiwana walidacja: Brak.
- Typy: CategoryViewModel[].
- Propsy:
  - `categories: CategoryViewModel[]`
  - `isLoading: boolean`
  - `error: Error | null`
  - `onEdit: (category: CategoryViewModel) => void`
  - `onDelete: (category: CategoryViewModel) => void`
  - `onRetry?: () => void`

### CategoryItem

- Opis komponentu: Reprezentuje pojedynczą kategorię w liście.
- Główne elementy: Nazwa kategorii, typ, przyciski akcji (edycja, usunięcie).
- Obsługiwane interakcje: Kliknięcie na przycisk edycji, kliknięcie na przycisk usunięcia.
- Obsługiwana walidacja: Sprawdzanie czy kategoria jest systemowa (ukrywanie przycisków edycji/usunięcia).
- Typy: CategoryViewModel.
- Propsy:
  - `category: CategoryViewModel`
  - `onEdit: (category: CategoryViewModel) => void`
  - `onDelete: (category: CategoryViewModel) => void`

### AddCategoryButton

- Opis komponentu: Przycisk otwierający modal dodawania nowej kategorii.
- Główne elementy: Przycisk z ikoną i tekstem.
- Obsługiwane interakcje: Kliknięcie - otwiera modal formularza.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onClick: () => void`

### CategoryFormModal

- Opis komponentu: Modal z formularzem do dodawania lub edycji kategorii.
- Główne elementy: Pola formularza (nazwa, typ kategori - tylko przy dodawaniu), przyciski akcji.
- Obsługiwane interakcje: Wprowadzanie danych, zatwierdzanie formularza, anulowanie.
- Obsługiwana walidacja:
  - Nazwa kategorii jest wymagana
  - Nazwa musi być unikalna (obsługa błędu z API)
  - Wybór typu jest wymagany przy tworzeniu nowej kategorii
- Typy: CategoryFormData.
- Propsy:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSubmit: (data: CategoryFormData) => Promise<void>`
  - `initialValues?: Partial<CategoryFormData>`
  - `isEditing: boolean`

## 5. Typy

```typescript
// Typy z API
interface CategoryResponseDTO {
  id: number;
  user_id: string;
  name: string;
  is_revenue: boolean;
  created_at: string;
}

// Typy dla komponentów
interface CategoryViewModel {
  id: number;
  name: string;
  is_revenue: boolean;
  is_system: boolean; // Określa czy kategoria jest predefiniowana
  created_at: string;
}

interface CategoryFormData {
  name: string;
  is_revenue: boolean; // tylko przy tworzeniu
}

interface CategoryFilter {
  type: "all" | "expense" | "revenue";
  search?: string; // opcjonalnie
}
```

## 6. Zarządzanie stanem

### Custom hook: useCategories

```typescript
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export interface CategoryFilters {
  type?: "all" | "expense" | "revenue";
  search?: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>({ type: "all" });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data: CategoryResponseDTO[] = await response.json();
      // Przetwarzanie danych, oznaczanie kategorii systemowych
      setCategories(data.map(mapToCategoryViewModel));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać kategorii",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function createCategory(data: CategoryFormData) {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      const newCategory: CategoryResponseDTO = await response.json();
      await fetchCategories(); // Odświeżenie listy kategorii

      toast({
        title: "Sukces",
        description: "Kategoria została dodana",
        variant: "success",
      });

      return newCategory;
    } catch (err) {
      toast({
        title: "Błąd",
        description: err instanceof Error ? err.message : "Nie udało się utworzyć kategorii",
        variant: "destructive",
      });
      throw err;
    }
  }

  async function updateCategory(id: number, data: { name: string }) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }

      const updatedCategory: CategoryResponseDTO = await response.json();
      await fetchCategories(); // Odświeżenie listy kategorii

      toast({
        title: "Sukces",
        description: "Kategoria została zaktualizowana",
        variant: "success",
      });

      return updatedCategory;
    } catch (err) {
      toast({
        title: "Błąd",
        description: err instanceof Error ? err.message : "Nie udało się zaktualizować kategorii",
        variant: "destructive",
      });
      throw err;
    }
  }

  async function deleteCategory(id: number) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }

      await fetchCategories(); // Odświeżenie listy kategorii

      toast({
        title: "Sukces",
        description: "Kategoria została usunięta",
        variant: "success",
      });

      return true;
    } catch (err) {
      toast({
        title: "Błąd",
        description: err instanceof Error ? err.message : "Nie udało się usunąć kategorii",
        variant: "destructive",
      });
      throw err;
    }
  }

  return {
    categories,
    isLoading,
    error,
    filters,
    setFilters,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
```

### Stany w komponencie głównym (CategoryPage)

```typescript
// Stan dla modala formularza
const [formModalOpen, setFormModalOpen] = useState(false);

// Stan dla kategorii w edycji
const [editingCategory, setEditingCategory] = useState<CategoryViewModel | null>(null);

// Używanie hooka do zarządzania kategoriami
const {
  categories,
  isLoading,
  error,
  filters,
  setFilters,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = useCategories();

// Filtrowanie kategorii na froncie (dla wydajności)
const filteredCategories = useMemo(() => {
  return categories
    .filter((cat) => {
      if (filters.type === "all") return true;
      if (filters.type === "expense") return !cat.is_revenue;
      if (filters.type === "revenue") return cat.is_revenue;
      return true;
    })
    .filter((cat) => {
      if (!filters.search) return true;
      return cat.name.toLowerCase().includes(filters.search.toLowerCase());
    });
}, [categories, filters]);
```

## 7. Integracja API

### Endpointy i typy żądań/odpowiedzi

#### Pobieranie kategorii

- **URL**: GET `/api/categories`
- **Odpowiedź**: CategoryResponseDTO[]

#### Tworzenie kategorii

- **URL**: POST `/api/categories`
- **Dane żądania**: `{ name: string, is_revenue: boolean }`
- **Odpowiedź**: CategoryResponseDTO

#### Aktualizacja kategorii

- **URL**: PUT `/api/categories/{categoryId}`
- **Dane żądania**: `{ name: string }`
- **Odpowiedź**: CategoryResponseDTO

#### Usuwanie kategorii

- **URL**: DELETE `/api/categories/{categoryId}`
- **Odpowiedź**: `{ message: string }`

## 8. Interakcje użytkownika

### Dodawanie kategorii

1. Użytkownik klika przycisk "Dodaj kategorię"
2. Otwiera się modal z formularzem
3. Użytkownik wprowadza nazwę i wybiera typ kategorii (wydatek/przychód)
4. Po zatwierdzeniu formularza:
   - Wysyłane jest żądanie POST do API
   - W przypadku sukcesu lista kategorii jest odświeżana, modal zamykany i wyświetlane jest powiadomienie o sukcesie
   - W przypadku błędu wyświetlane jest powiadomienie o błędzie

### Edycja kategorii

1. Użytkownik klika przycisk "Edytuj" przy wybranej kategorii
2. Otwiera się modal z formularzem wypełnionym danymi kategorii
   - Typ kategorii jest wyświetlany, ale bez możliwości edycji
3. Użytkownik modyfikuje nazwę
4. Po zatwierdzeniu formularza:
   - Wysyłane jest żądanie PUT do API
   - W przypadku sukcesu lista kategorii jest odświeżana, modal zamykany i wyświetlane jest powiadomienie o sukcesie
   - W przypadku błędu wyświetlane jest powiadomienie o błędzie

### Usuwanie kategorii

1. Użytkownik klika przycisk "Usuń" przy wybranej kategorii
2. Wyświetlane jest systemowe okno potwierdzenia (window.confirm)
3. Po potwierdzeniu:
   - Wysyłane jest żądanie DELETE do API
   - W przypadku sukcesu lista kategorii jest odświeżana i wyświetlane jest powiadomienie o sukcesie
   - W przypadku błędu (np. kategoria ma przypisane transakcje) wyświetlane jest powiadomienie o błędzie

## 9. Warunki i walidacja

### Walidacja formularza

- **Pole nazwy kategorii**:

  - Musi być wypełnione (sprawdzane na froncie przed wysłaniem)
  - Musi być unikalne (sprawdzane przez API, obsługa błędu na froncie)
  - Maksymalnie 255 znaków (zgodnie z schematem z API)

- **Pole typu kategorii** (tylko przy dodawaniu):
  - Musi być wybrane (wydatek lub przychód)

### Warunki dotyczące edycji/usuwania

- **Kategorie systemowe**:

  - Frontend ukrywa przyciski edycji i usuwania
  - Typ kategorii przy edycji jest zablokowany (nie można go zmienić)

- **Kategorie używane przez transakcje**:
  - API blokuje usunięcie (zwraca błąd)
  - Frontend wyświetla odpowiednie powiadomienie o błędzie (przez Toaster)

## 10. Obsługa błędów

### Wykorzystanie istniejącego systemu powiadomień

- Wszystkie błędy i komunikaty o sukcesie są wyświetlane przez komponent Toaster
- Hook useCategories zawiera wbudowaną integrację z systemem powiadomień

### Rodzaje obsługiwanych błędów

- **Błąd pobierania kategorii**:

  - Wyświetlenie powiadomienia o błędzie
  - Możliwość ponowienia próby przez przycisk odświeżenia

- **Błąd podczas tworzenia/edycji kategorii**:

  - Wyświetlenie powiadomienia o błędzie z wiadomością z API
  - Formularz pozostaje otwarty z wprowadzonymi danymi

- **Błąd podczas usuwania kategorii**:
  - Wyświetlenie powiadomienia o błędzie z wiadomością z API

## 11. Kroki implementacji

1. **Utworzenie pliku strony Astro**

   - Utworzenie pliku src/pages/categories.astro zgodnie z istniejącym wzorcem
   - Integracja z istniejącym layoutem

2. **Przygotowanie typów**

   - Zdefiniowanie interfejsów dla danych z API i widoku
   - Utworzenie modeli ViewModel do obsługi danych w UI

3. **Implementacja custom hooka `useCategories`**

   - Funkcje komunikacji z API z obsługą błędów
   - Integracja z systemem powiadomień Toaster
   - Zarządzanie stanem danych, ładowania i filtrowania

4. **Implementacja głównego komponentu `CategoryPage`**

   - Inicjalizacja stanu i hooków
   - Obsługa interakcji użytkownika
   - Implementacja usuwania kategorii z window.confirm()

5. **Implementacja komponentów potomnych**

   - Nagłówek z przyciskiem dodawania
   - Filtry kategorii
   - Lista kategorii i elementy listy

6. **Implementacja formularza kategorii**

   - Walidacja pól
   - Obsługa stanu formularza
   - Integracja z hookiem useCategories
