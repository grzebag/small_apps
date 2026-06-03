# Memory Game – Scoring System Improvements

## 1. Cel

- Punkty zdobyte podczas jednej rozgrywki (poziomy 1-4) mają się sumować
- Rekordy (czas, punkty, combo) zapisywane lokalnie w `localStorage`
- Pełna kompatybilność z PC, Android i iOS
- Zachowanie wstecznej kompatybilności z istniejącymi danymi (`natureMemoryBestTimes`)

## 2. Kumulacja punktów w sesji

### Zmienne stanu

```javascript
this.levelScore = 0;  // punkty zdobyte w bieżącym poziomie (dawniej this.score)
this.sessionScore = 0; // punkty skumulowane ze wszystkich poziomów rozgrywki
```

### Przepływ

1. `startGame(theme)` – resetuje `sessionScore = 0`, potem `initLevel()`
2. `initLevel()` – resetuje `levelScore = 0` (już nie `score`)
3. `checkMatch()` – przy dopasowaniu dodaje punkty do `levelScore`
4. `handleWin()` – przed pokazaniem overlayu: `sessionScore += levelScore`
5. Overlay wygranej pokazuje zarówno `levelScore` jak i `sessionScore`
6. `initLevel()` przy przejściu na kolejny poziom NIE resetuje `sessionScore`

### Zmiany w HTML

Header zyskuje dodatkowy element: `Łączny wynik: <span id="session-score">0</span>`.

Overlay wygranej zyskuje drugą linię w `.stats-summary`:
```
Wynik poziomu:      X
Łączny wynik:       Y   (podświetlony, pokazany dopiero od poziomu 2+)
```

## 3. Rekordy – storage

### Nowa struktura (`localStorage`)

Klucz: `natureMemoryRecords`

```javascript
{
  "1": { time: 15, score: 120, combo: 5 },
  "2": { time: 32, score: 208, combo: 4 },
  "3": { time: 45, score: 315, combo: 6 },
  "4": { time: 60, score: 420, combo: 7 },
  "session": { score: 1200 }
}
```

### Migracja starych danych

Przy starcie gry, jeśli istnieje `natureMemoryBestTimes` a nie istnieje `natureMemoryRecords`:
- Odczytaj zapisane czasy z `natureMemoryBestTimes`
- Zapisz jako `natureMemoryRecords[level] = { time, score: 0, combo: 0 }`
- Usuń stary klucz

### Zapis rekordu w handleWin()

Po zakończeniu poziomu sprawdź i zapisz dla każdej kategorii:

```javascript
const rec = this.records[this.level] || { time: Infinity, score: 0, combo: 0 };
let isNewRecord = false;

if (!this.records[this.level] || this.seconds < rec.time) {
    rec.time = this.seconds;
    isNewRecord = true;
}
if (this.levelScore > rec.score) {
    rec.score = this.levelScore;
    isNewRecord = true;
}
if (this.maxCombo > rec.combo) {
    rec.combo = this.maxCombo;
    isNewRecord = true;
}

// Sprawdź rekord sesji (dopiero gdy poziom ukończony)
if (this.sessionScore > (this.records.session?.score || 0)) {
    this.records.session = { score: this.sessionScore };
    isNewRecord = true;
}

this.records[this.level] = rec;
localStorage.setItem('natureMemoryRecords', JSON.stringify(this.records));
```

### Wyświetlanie rekordu w headerze

Obecnie: `Najlepszy: <span id="best-time">--:--</span>`

Nowy układ (dla obecnego poziomu):

```
Rekord: ☆☆☆ | 00:32 | 120pkt | x5 combo
```

Jeśli brak rekordu: `Rekord: -- | --- | --- `

Wersja mobilna: skrócone do `Rekord: 120pkt | x5 combo` (bez czasu).

## 4. Oznaczenie "NOWY REKORD!"

W overlayu wygranej, jeśli któryś z rekordów (czas/score/combo) został pobity, wyświetlamy animowany znacznik `🏆 NOWY REKORD!` pod gwiazdkami, nad statystykami. Znika po 3 sekundach lub przy kliknięciu "Następny Poziom".

## 5. iOS / Poprawki mobilne

- `min-height: 100vh` → `100dvh` w `body` i `#game-container`
- `env(safe-area-inset-*)` paddingi w `#game-container`
- `overscroll-behavior: none` na `body` podczas gry
- Dodanie medii `@media (hover: none)` – wyłączenie `.card:not(.flipped):hover` na dotykowych urządzeniach (eliminacja "sticky hover" na iOS)

## 6. Brak zmian

- Mechanika matchowania, combo, speed bonus – bez zmian
- System kart, animacji, motywów – bez zmian
- CSS poza wymienionymi poprawkami – bez zmian
- Emoji pool – bez zmian
- Timer – bez zmian

## 7. Pliki do zmiany

| Plik | Zakres zmian |
|------|-------------|
| `memory_nature/script.js` | +sessionScore, +records (localStorage), zmiana logiki handleWin/initLevel/startGame |
| `memory_nature/index.html` | +session-score w headerze, +nowy-rekord w overlayu, +drugi wiersz w stats-summary |
| `memory_nature/styles.css` | +dvh, +safe-area, +hover:none, +styling nowego rekordu |
