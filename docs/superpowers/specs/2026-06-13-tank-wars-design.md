# Tank Wars - Specyfikacja gry

## Przegląd

Gra turowa typu Tank Wars (DOS lat 80.) z mechaniką deformacji terenu inspirowaną Worms. Dwóch przeciwników (człowiek vs AI) walczy czołgami na pagórkowatym terenie. Celem jest zniszczenie czołgu przeciwnika za pomocą pocisków wystrzeliwanych pod różnym kątem i siłą, z uwzględnieniem wiatru i grawitacji.

**Stack**: Vanilla HTML + JavaScript + CSS (PWA)
**Docelowa platforma**: iOS (PWA), kompatybilne z desktopem

---

## 1. Podstawowa mechanika gry

### Typ gry
- Turowa, 2 graczy (człowiek vs AI)
- Jeden strzał na turę
- Gra kończy się gdy HP jednego z czołgów spadnie do 0

### Rozgrywka
1. Losowanie pozycji startowych czołgów na pagórkowatym terenie
2. Gracze wykonują ruchy naprzemiennie
3. Każdy ruch: ustawienie kąta lufy → ustawienie siły strzału → strzał
4. Po strzale pocisk leci torem parabolicznym (z uwzględnieniem wiatru)
5. Eksplozja deformuje teren w promieniu X pikseli
6. Jeśli grunt pod czołgiem zniknie → czołg spada → obrażenia za upadek

### Parametry czołgu
- **HP**: 100
- **Rozmiar**: ~20×10 pikseli
- Czołg "siedzi" na powierzchni terenu

### Pocisk
- Leci torem parabolicznym (prędkość x, prędkość y + grawitacja)
- Wiatr zmienia prędkość x pocisku w każdą klatkę
- Eksplozja: promień 15–25 pikseli (zależny od siły strzału)
- Obrażenia: maleją z odległością od epicentrum

### Teren
- Generowany proceduralnie (Perlin/Simplex noise)
- Rozmiar: canvas dostosowany do szerokości ekranu, wysokość ~400px
- Pagórkowaty krajobraz z różnymi wysokościami
- Kolory: zieleń (trawa) na górze, brąz (ziemia) w środku, szary (skała) na dole

---

## 2. Sterowanie i interfejs

### Układ ekranu (pionowy, mobile-first)
- **Górna sekcja (20%)**: Logo gry, HP obu czołgów, wskaźnik wiatru (strzałka + siła)
- **Środek (50%)**: Canvas z terenem i czołgami
- **Dolna sekcja (30%)**: Panel sterowania

### Panel sterowania (mobile)
- Suwak kąta lufy (0°–180°, lewo/prawo)
- Suwak siły strzału (0–100%)
- Duży przycisk "STRZAŁ" (zielony)
- Wyświetlanie aktualnych wartości kąta i siły

### Sterowanie na desktopie
- Strzałki klawiatury ←→ zmieniają kąt
- Strzałki ↑↓ zmieniają siłę
- Spacja = strzał
- Suwaki również klikalne

### HUD w grze
- Pasek HP nad każdym czołgiem
- Strzałka wiatru w prawym górnym rogu canvasa
- Numer tury
- Komunikaty tekstowe ("Twoja tura!", "Tura AI...", "Eksplozja!", "Czołg spada!")

---

## 3. Fizyka i balistyka

### Równania ruchu pocisku
```
vx = siła × cos(kąt) + wiatr
vy = siła × sin(kąt)
x += vx × dt
y += vy × dt
vy += grawitacja × dt  (grawitacja ≈ 0.1–0.2 px/frame²)
```

### Kolizje
- **Pocisk vs teren**: sprawdzanie pikseli wzdłuż trajektorii
- **Pocisk vs czołg**: sprawdzenie overlapu z bounding box czołgu
- **Krawędzie ekranu**: pocisk znika (chyba że uderzy w czołg)

### Eksplozja
- Promień: 15–25 pikseli (zależny od siły strzału, im większa siła tym większy promień)
- Obrażenia: `40 × (1 - odległość/promień)` w epicentrum (max 40 HP za bezpośredni trafienie)
- Deformacja: zerowanie pikseli w okręgu

### Wiatr
- Zmienia się co turę (losowo, ±0.05–0.15 px/frame²)
- Wskazuje kierunek i siłę (strzałka + tekst)
- Wpływa na vx pocisku w każdą klatkę lotu

---

## 4. Spadanie czołgów i obrażenia

### Mechanika spadania
1. Po eksplozji sprawdzamy: czy pod czołgiem jest grunt?
2. Jeśli NIE: czołg zaczyna spadać (grawitacja)
3. Czołg spada aż uderzy w grunt niżej
4. Obrażenia za upadek: `obrażenia = fallDistance × 0.5` (max 30 HP)

### Efekt wizualny
- Czołg "wpada" w dziurę po eksplozji
- Po wylądowaniu: efekt "pyłu" (kilka pikseli w górę)
- Ekran lekko "drży" przy większych upadkach

---

## 5. AI i poziomy trudności

### Poziomy trudności

| Poziom | Celność (tolerancja kąta) | Siła (zakres) | Opis |
|--------|---------------------------|---------------|------|
| Łatwy | ±15° | 40–80% | Celnie losowo, nie optymalizuje |
| Średni | ±8° | 50–90% | Celniej, czasem trafia |
| Trudny | ±3° | 70–95% | Prawie zawsze trafia w okolicę |

### Algorytm AI
1. Znajdź pozycję czołgu gracza (x, y)
2. Oblicz dystans i różnicę wysokości
3. Wybierz kąt i siłę które mogłyby trafić (z tolerancją losową)
4. Dodaj losowość zależną od poziomu trudności
5. AI zna pozycję gracza (jak w oryginalnym Tank Wars)

### Czas reakcji AI
- 1–2 sekundy po zakończeniu tury gracza (symulacja "myślenia")

---

## 6. Generowanie terenu

### Algorytm
1. Użyj Simplex/Perlin noise do wygenerowania wysokości (0–1)
2. Dodaj kilka oktaw (octaves) dla naturalnego wyglądu
3. Mapuj na piksele canvasa (wysokość terenu = f(x))
4. Kolory: gradient od góry do dołu

### Kolory terenu (gradient od powierzchni w dół)
- Pierwsze 10px pod powierzchnią: zieleń (#4a7c3f)
- Kolejne 30px: brąz (#8b5a2b)
- Reszta (dół): szary (#6b6b6b) - skała, nie do zniszczenia

### Parametry generowania
- Seed: losowy lub ustalony
- Skala: 0.01–0.03 (kontroluje "gładkość" pagórków)
- Amplituda: 50–100 pikseli (wysokość wzgórz)

### Warunki brzegowe
- Lewa i prawa krawędź: teren stabilny (nie spada poniżej minimalnej wysokości)
- Dno: stała warstwa skały (nie do zniszczenia)

---

## 7. Efekty wizualne

### Eksplozja
- Rozszerzający się okrąg (żółty → czerwony → czarny)
- Dym po eksplozji: kilka pikseli w górę

### Trajektoria
- Ślad pocisku (kilka ostatnich pozycji)

### Wiatr
- Animowana strzałka

### Spadanie
- Lekkie obroty czołgu podczas spadania

### Styl wizualny
- Retro/pixel art (nawiązanie do oryginalnej gry z DOS)
- Proste kształty, pikselowa grafika

---

## 8. Audio

### Dźwięki (generowane przez Web Audio API)
- **Strzał**: krótki "bum" (oscillator, ~0.2s)
- **Eksplozja**: dłuższy "bum" z decay (~0.5s)
- **Spadanie**: efekt "whoosh" (sweep frequency)
- **Tura**: dźwięk przejścia (krótki ping)

### Domyślna głośność
- Dźwięki domyślnie wyciszone na mobilne
- Przycisk wyciszania/włączania w interfejsie

---

## 9. Architektura techniczna

### Struktura plików
```
tank_wars/
├── index.html
├── script.js
├── styles.css
├── manifest.json
├── icon-192.png
└── icon-512.png
```

### Silnik gry (script.js)
- **GameEngine**: główny loop, stan gry, logika tur
- **Terrain**: generowanie i deformacja terenu (2D tablica pikseli)
- **Tank**: pozycja, HP, renderowanie czołgu
- **Projectile**: fizyka lotu pocisku
- **AI**: logika komputera
- **Renderer**: rysowanie na canvasie
- **Audio**: Web Audio API dla dźwięków
- **Input**: obsługa suwaków, klawiatury, touch

### Canvas
- Rozmiar: szerokość ekranu (max 800px), wysokość 400px
- Pikselowy teren: tablica o rozmiarze canvas.width × canvas.height
- Rendering: 60fps (requestAnimationFrame)

### PWA
- manifest.json z ikonami
- Service worker opcjonalny (cache'owanie)
- Display: standalone
- Orientation: any (ale gra zoptymalizowana pod portrait)

---

## 10. Kolejność implementacji

1. **Podstawy**: HTML + CSS + Canvas + generowanie terenu
2. **Czołgi**: renderowanie, pozycjonowanie na terenie
3. **Sterowanie**: suwaki kąta i siły, przycisk strzału
4. **Fizyka pocisku**: balistyka, kolizje z terenem
5. **Eksplozja**: deformacja terenu, obliczanie obrażeń
6. **Spadanie**: mechanika spadania czołgów
7. **AI**: logika komputera, 3 poziomy trudności
8. **Efekty wizualne**: eksplozja, dym, trajektoria
9. **Audio**: Web Audio API
10. **PWA**: manifest, ikony, responsywność
11. **Optymalizacja**: wydajność, testowanie na iOS
