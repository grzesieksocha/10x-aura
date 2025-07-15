# Plan Testów - Aura MVP

## 1. Wprowadzenie i cele testowania

### Cel główny
Zapewnienie wysokiej jakości i niezawodności aplikacji Aura MVP - responsywnej aplikacji webowej do zarządzania budżetem domowym, przed jej wdrożeniem do produkcji.

### Cele szczegółowe
- Weryfikacja poprawności wszystkich funkcji opisanych w PRD
- Zapewnienie bezpieczeństwa autentykacji i autoryzacji użytkowników
- Potwierdzenie wydajności aplikacji na różnych urządzeniach i przeglądarkach
- Walidacja integralności danych finansowych i obliczeń sald
- Sprawdzenie zgodności z wymaganiami responsywności (RWD)

## 2. Zakres testów

### W zakresie testów
- **Funkcje kluczowe**: Zarządzanie kontami, transakcjami, kategoriami, budżetem
- **Autentykacja**: Logowanie, rejestracja, zmiana hasła, resetowanie hasła
- **Obliczenia finansowe**: Salda kont, agregacja transakcji, transfery
- **Interfejs użytkownika**: Responsywność, nawigacja, formularze
- **Integracja z Supabase**: API, baza danych, Row Level Security
- **Walidacja danych**: Formaty kwot, dat, unikalność nazw

### Poza zakresem testów
- Funkcje wykraczające poza MVP (import/eksport, powiadomienia)
- Testy obciążeniowe dla dużej liczby użytkowników
- Testowanie automatycznej integracji bankowej (nie ma w MVP)
- Testy penetracyjne zaawansowane (poza podstawową walidacją bezpieczeństwa)

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe
**Zakres**: Serwisy biznesowe, funkcje pomocnicze, walidacja schematów
- `AccountService` - obliczanie sald, operacje CRUD
- `TransactionService` - tworzenie transakcji, transferów
- `CategoryService` - zarządzanie kategoriami
- `BudgetService` - planowanie i porównanie budżetu
- Schematy Zod - walidacja danych wejściowych
- Funkcje pomocnicze w `utils.ts`

### 3.2 Testy integracyjne
**Zakres**: API routes, integracja z Supabase, przepływ danych
- Endpointy API w `/api/accounts/`, `/api/transactions/`, `/api/categories/`
- Integracja z klientem Supabase (SSR)
- Middleware autentykacji
- Przepływ danych między komponentami React

### 3.3 Testy funkcjonalne (E2E)
**Zakres**: Kompletne scenariusze użytkownika
- Pełne przepływy autentykacji
- Zarządzanie kontami i transakcjami
- Planowanie budżetu i analiza wydatków
- Responsywność na różnych urządzeniach

### 3.4 Testy interfejsu użytkownika
**Zakres**: Komponenty React, strony Astro, interakcje
- Komponenty UI (formularze, tabele, wykresy)
- Walidacja kliencka formularzy
- Nawigacja między stronami
- Stan loading i komunikaty błędów

### 3.5 Testy wydajności
**Zakres**: Czas ładowania, responsywność interfejsu
- Czas ładowania stron Astro (SSR)
- Wydajność komponentów React
- Optymalizacja zapytań do bazy danych
- Rozmiar bundli JavaScript

### 3.6 Testy bezpieczeństwa
**Zakres**: Autentykacja, autoryzacja, walidacja danych
- Row Level Security (RLS) w Supabase
- Walidacja danych wejściowych (server-side)
- Ochrona przed XSS i injection
- Bezpieczeństwo sesji użytkowników

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autentykacja (US-001, US-002)
- **TC-001**: Logowanie z poprawnymi danymi
- **TC-002**: Logowanie z błędnymi danymi
- **TC-003**: Rejestracja nowego użytkownika
- **TC-004**: Zmiana hasła z walidacją
- **TC-005**: Resetowanie hasła przez email
- **TC-006**: Automatyczne wylogowanie po wygaśnięciu sesji

### 4.2 Zarządzanie kontami (US-003, US-004, US-005)
- **TC-007**: Dodawanie nowego konta z saldem początkowym
- **TC-008**: Walidacja unikalności nazwy konta
- **TC-009**: Wyświetlanie listy kont z aktualnymi saldami
- **TC-010**: Usuwanie konta z transakcjami
- **TC-011**: Przeliczanie łącznego salda

### 4.3 Zarządzanie kategoriami (US-006, US-007, US-008, US-009)
- **TC-012**: Wyświetlanie predefiniowanych kategorii
- **TC-013**: Dodawanie własnej kategorii wydatkowej/przychodowej
- **TC-014**: Edycja nazwy własnej kategorii
- **TC-015**: Próba usunięcia kategorii z przypisanymi transakcjami
- **TC-016**: Usuwanie niewykorzystanej kategorii

### 4.4 Zarządzanie transakcjami (US-010, US-011, US-012, US-013, US-014, US-015)
- **TC-017**: Dodawanie wydatku z kategorią
- **TC-018**: Dodawanie przychodu bez kategorii
- **TC-019**: Wykonywanie transferu między kontami
- **TC-020**: Walidacja dat przyszłych w transakcjach
- **TC-021**: Edycja transakcji z przeliczeniem salda
- **TC-022**: Usuwanie transferu (dwóch powiązanych operacji)
- **TC-023**: Sortowanie transakcji chronologicznie

### 4.5 Planowanie budżetu (US-016, US-017, US-018, US-019)
- **TC-024**: Wyświetlanie tabeli budżetu dla wybranego roku
- **TC-025**: Wprowadzanie planowanych wydatków/przychodów
- **TC-026**: Porównanie planu z rzeczywistością
- **TC-027**: Kolorowe wskaźniki przekroczenia budżetu
- **TC-028**: Przeliczanie budżetu po zmianach w transakcjach

### 4.6 Analiza i pulpit (US-020, US-021)
- **TC-029**: Wyświetlanie łącznego salda na pulpicie
- **TC-030**: Generowanie wykresu kołowego wydatków
- **TC-031**: Filtrowanie wykresu według miesiąca
- **TC-032**: Aktualizacja danych w czasie rzeczywistym

### 4.7 Responsywność (US-022)
- **TC-033**: Działanie na urządzeniach mobilnych (360px+)
- **TC-034**: Działanie na tabletach (768px+)
- **TC-035**: Działanie na desktopach (1024px+)
- **TC-036**: Kompatybilność z przeglądarkami (Chrome, Firefox, Safari, Edge)

## 5. Środowisko testowe

### 5.1 Środowiska
- **Development**: Lokalne środowisko z `npm run dev`
- **Staging**: Środowisko pre-produkcyjne z build produkcyjnym
- **Production**: Środowisko produkcyjne (testy akceptacyjne)

### 5.2 Konfiguracja testowa
- **Baza danych**: Izolowane instancje Supabase dla każdego środowiska
- **Dane testowe**: Zestaw kont, kategorii i transakcji do testów
- **Użytkownicy testowi**: Różne poziomy dostępu i scenariusze

### 5.3 Urządzenia testowe
- **Desktop**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **Mobile**: iOS 15+, Android 10+
- **Przeglądarki**: Chrome 120+, Firefox 120+, Safari 16+, Edge 120+

## 6. Narzędzia do testowania

### 6.1 Framework testowy
- **Vitest**: Testy jednostkowe i integracyjne (szybki, kompatybilny z Vite)
- **React Testing Library**: Testowanie komponentów React
- **Playwright**: Testy E2E wieloprzeglądarkowe

### 6.2 Narzędzia pomocnicze
- **MSW (Mock Service Worker)**: Mockowanie API w testach
- **Supabase Local Development**: Lokalna instancja do testów
- **Accessibility**: axe-core dla testów dostępności
- **Performance**: Lighthouse CI dla testów wydajności

### 6.3 CI/CD integracja
- **GitHub Actions**: Automatyczne uruchamianie testów
- **Pre-commit hooks**: Testy przed commitami (Husky + lint-staged)
- **Coverage reports**: Raportowanie pokrycia kodu

## 7. Harmonogram testów

### Faza 1: Przygotowanie (1 tydzień)
- Konfiguracja narzędzi testowych
- Przygotowanie środowisk testowych
- Utworzenie danych testowych

### Faza 2: Testy jednostkowe (2 tygodnie)
- Testy serwisów biznesowych
- Testy walidacji danych
- Testy funkcji pomocniczych

### Faza 3: Testy integracyjne (1.5 tygodnia)
- Testy API endpoints
- Testy integracji z Supabase
- Testy middleware

### Faza 4: Testy funkcjonalne (2 tygodnie)
- Testy E2E scenariuszy użytkownika
- Testy responsywności
- Testy kompatybilności przeglądarek

### Faza 5: Testy wydajności i bezpieczeństwa (1 tydzień)
- Testy wydajności aplikacji
- Audyt bezpieczeństwa
- Testy dostępności

### Faza 6: Testy akceptacyjne (1 tydzień)
- Weryfikacja wszystkich wymagań PRD
- Testy użyteczności
- Przygotowanie do wdrożenia

## 8. Kryteria akceptacji testów

### 8.1 Pokrycie kodu
- **Minimum 85%** pokrycia dla serwisów biznesowych
- **Minimum 80%** pokrycia dla komponentów React
- **Minimum 75%** pokrycia ogólnego

### 8.2 Kryteria jakości
- **0 błędów krytycznych** (crash aplikacji, utrata danych)
- **Maksymalnie 5 błędów średnich** na moduł
- **100% scenariuszy PRD** przechodzi testy

### 8.3 Wydajność
- **Czas ładowania strony < 3 sekundy** (3G connection)
- **First Contentful Paint < 1.5 sekundy**
- **Lighthouse Score > 90** dla Performance i Accessibility

### 8.4 Kompatybilność
- **100% funkcjonalności** działa we wszystkich obsługiwanych przeglądarkach
- **Responsive design** prawidłowy na wszystkich rozmiarach ekranów
- **Dostępność WCAG 2.1 AA** poziom

## 9. Role i odpowiedzialności w procesie testowania

### 9.1 Lead Developer/QA Engineer
- Koordynacja procesu testowego
- Konfiguracja narzędzi i środowisk
- Review testów i wyników
- Komunikacja z stakeholderami

### 9.2 Frontend Developer
- Testy komponentów React
- Testy responsywności
- Testy dostępności interfejsu

### 9.3 Backend Developer
- Testy serwisów biznesowych
- Testy API endpoints
- Testy integracji z bazą danych

### 9.4 Product Owner
- Definiowanie kryteriów akceptacji
- Weryfikacja zgodności z PRD
- Akceptacja finalnych wyników

## 10. Procedury raportowania błędów

### 10.1 Klasyfikacja błędów
- **Krytyczne**: Crash aplikacji, utrata danych, bezpieczeństwo
- **Wysokie**: Brak kluczowej funkcjonalności, błędy obliczeniowe
- **Średnie**: Błędy UI/UX, problemy wydajności
- **Niskie**: Kosmetyczne, sugestie ulepszeń

### 10.2 Proces raportowania
1. **Dokumentacja błędu**: GitHub Issues z templatem
2. **Reprodukcja**: Kroki do odtworzenia błędu
3. **Priorytetyzacja**: Według wpływu na użytkownika
4. **Przypisanie**: Do odpowiedniego developera
5. **Weryfikacja**: Testy po naprawie

### 10.3 Tracking i metryki
- **Dashboard**: Przegląd statusu testów w czasie rzeczywistym
- **Metryki**: Liczba błędów, pokrycie kodu, czas wykonania
- **Raporty**: Tygodniowe podsumowania dla zespołu

---

## Podsumowanie

Plan testów uwzględnia specyfikę aplikacji Aura MVP jako kompleksowego systemu zarządzania budżetem domowym. Kluczowym priorytetem jest zapewnienie integralności danych finansowych i poprawności obliczeń sald. Framework testowy oparty na Vitest, React Testing Library i Playwright zapewni kompleksowe pokrycie testowe przy zachowaniu wydajności wykonania.

Szczególną uwagę należy zwrócić na testy bezpieczeństwa (RLS w Supabase), poprawność transferów między kontami oraz responsywność interfejsu zgodnie z wymaganiami PRD.