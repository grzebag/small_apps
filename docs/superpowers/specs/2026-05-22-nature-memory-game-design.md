# Design Spec: Nature Memory Game (Progresywna Odkrywanka)

**Data:** 2026-05-22
**Autor:** Gemini CLI
**Status:** Draft (Do Przeglądu)

## 1. Cel Projektu
Stworzenie przeglądarkowej gry typu Memory z motywem przyrody (fauna i flora), która oferuje wysokiej jakości doznania wizualne (UX/UI) oraz system progresji zachęcający do bicia rekordów czasowych.

## 2. Architektura i Wygląd

### 2.1. System Motywów (Themes)
Gra będzie wspierać trzy style wizualne wybierane w menu głównym. Zmiana stylu odbywa się poprzez nałożenie klasy na kontener główny (`<body>`) i zmianę zmiennych CSS.

| Motyw | Stylistyka | Kluczowe cechy |
| :--- | :--- | :--- |
| **Nature Zen** | Minimalizm, pastele | Spokojne animacje, dużo wolnej przestrzeni, miękkie cienie. |
| **Forest Quest** | Imersja, głębia | Glassmorphism, ciemna zieleń, efekty paralaksy, cząsteczki. |
| **Vibrant Eco** | Energia, dynamika | Nasycone kolory, sprężyste animacje (bounce), system combo. |

### 2.2. Zmienne CSS (Przykłady)
- `--bg-gradient`: Tło strony.
- `--card-bg`: Kolor tyłu karty.
- `--card-radius`: Zaokrąglenie rogów kart.
- `--accent-color`: Kolor interaktywnych elementów.
- `--font-main`: Dobrana czcionka (np. 'Inter' dla Zen, 'Poppins' dla Eco).

## 3. Mechanika Rozgrywki

### 3.1. Pętla Gry (Game Loop)
1. **Menu:** Wybór motywu.
2. **Start Poziomu:** Animacja pojawienia się siatki kart.
3. **Rozgrywka:**
   - Gracz odkrywa 2 karty.
   - Jeśli pasują: karty zostają odkryte, efekt wizualny sukcesu, doliczenie punktów.
   - Jeśli nie pasują: karty zakrywają się po krótkiej przerwie.
4. **Koniec Poziomu:** Podsumowanie czasu/wyniku, przejście do następnego poziomu.
5. **Game Over / Victory:** Finalny wynik i możliwość zapisu w High Score.

### 3.2. Progresja (Poziomy)
- **Level 1:** 4x3 (12 kart, 6 par).
- **Level 2:** 4x4 (16 kart, 8 par).
- **Level 3:** 5x4 (20 kart, 10 par).
- **Level 4:** 6x4 (24 karty, 12 par).
- **Level 5+:** Powrót do 6x4, ale z malejącym limitem czasu.

### 3.3. Punktacja
- **Base Score:** Punkty za każdą parę.
- **Time Bonus:** Im szybciej, tym więcej punktów na koniec poziomu.
- **Combo Multiplier:** Mnożnik za szybkie znajdowanie kolejnych par (okno czasowe 3s).

## 4. Technologie
- **HTML5:** Semantyczna struktura.
- **CSS3:** Flexbox/Grid, CSS Variables, Animacje 3D (flip effect), Glassmorphism.
- **JavaScript (Vanilla):** Klasa `MemoryGame` zarządzająca stanem (state machine), timerem i poziomami.
- **Local Storage:** Przechowywanie najlepszych wyników.

## 5. Assety
- **Grafiki:** Wysokiej jakości Emoji (pula ~30 symboli fauny i flory).
- **Dźwięki (opcjonalnie):** Subtelne "klik", "success", "level-up".

## 6. Wymagania UX
- Responsywność (siatka kart dopasowuje się do ekranu).
- Dostępność (możliwość gry klawiaturą - opcjonalnie, ale zalecane).
- Przejrzyste menu i dashboard z wynikiem.
