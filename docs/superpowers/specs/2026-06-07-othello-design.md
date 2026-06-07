# Othello - Design Document

## Overview

Single-player Othello (Reversi) game with adjustable AI difficulty, built with vanilla HTML/CSS/JS. Features Zen/Japanese aesthetic with full offline support and iPad optimization.

## Requirements

### Functional
- 8×8 Othello board with standard rules
- Single player (black) vs computer (white)
- Three AI difficulty levels: Easy, Medium, Hard
- Score tracking for both players
- New game button
- Status display showing whose turn it is

### Technical
- Vanilla HTML/CSS/JS (no frameworks)
- PWA with service worker for offline play
- Responsive design optimized for iPad
- Touch-friendly interactions
- No server-side dependencies

## Architecture

### File Structure
```
othello/
├── index.html          # Main HTML structure
├── styles.css          # Zen-themed CSS
├── script.js           # Game logic + AI
├── sw.js               # Service worker for offline
├── manifest.json       # PWA manifest
├── icon-192.png        # App icon
└── icon-512.png        # App icon large
```

### Game Engine (script.js)

#### Board Representation
- 8×8 2D array: `0` = empty, `1` = black (player), `2` = white (computer)
- Initial state: center 4 squares with alternating colors

#### Core Functions
- `initBoard()` - Initialize board with starting position
- `getValidMoves(board, player)` - Return array of valid moves
- `makeMove(board, row, col, player)` - Place disc and flip captured
- `checkWin(board)` - Check if game is over
- `flipDiscs(board, row, col, player)` - Flip captured discs in all directions

### AI System

#### Easy Mode
- Random selection from valid moves
- No strategic evaluation
- Fast response time

#### Medium Mode
- Minimax algorithm, depth 2
- Position evaluation weights:
  - Corners: +100
  - Edges adjacent to corners: -20 (risky)
  - Other edges: +10
  - Center: +1
- Alpha-beta pruning for optimization

#### Hard Mode
- Minimax algorithm, depth 4
- Advanced evaluation:
  - Position weights (same as medium)
  - Mobility: number of available moves
  - Stability: discs that cannot be flipped
  - Frontier: discs adjacent to empty squares
- Alpha-beta pruning

### Performance Considerations
- Depth 4 minimax with alpha-beta typically evaluates <5000 nodes
- Response time <500ms on modern devices
- Worker-based evaluation possible if needed (future enhancement)

## Design

### Aesthetic: Zen/Japanese

#### Color Palette
```css
--bg-primary: #1a1410;        /* Deep wood */
--bg-secondary: #2a1810;      /* Darker wood */
--board-color: #3d2817;       /* Board wood */
--board-line: #5a3d2a;        /* Grid lines */
--accent-green: #4a7c59;      /* Garden green */
--accent-gold: #c9a96e;       /* Zen gold */
--text-primary: #f5f0e8;      /* Cream white */
--text-secondary: #a89888;    /* Warm gray */
```

#### Typography
- Titles: "Noto Serif" - elegant, Japanese-inspired
- Body: "Noto Sans" - clean, readable

#### Board Design
- Wood texture background (CSS gradients)
- Subtle grid lines
- Disc shadows for 3D effect
- Black discs: matte finish
- White discs: pearl-like sheen

#### Animations
- Disc placement: scale up with fade in
- Disc flipping: 3D rotation animation (0.3s)
- Valid move hints: subtle pulsing glow
- Score change: smooth counter animation

### Layout

#### Desktop (iPad landscape)
```
┌──────────────────────────────────────────────────────┐
│                    🏯 OTHELLO 🏯                    │
│                  Gra Mistrzów                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│    ┌──────────────┐      ┌──────────────────┐       │
│    │  ⚫ Czarny    │      │  ○ Biały         │       │
│    │     2        │      │     2            │       │
│    └──────────────┘      └──────────────────┘       │
│                                                      │
│         ┌──────────────────────────┐                 │
│         │                          │                 │
│         │      8×8 BOARD           │                 │
│         │                          │                 │
│         │                          │                 │
│         └──────────────────────────┘                 │
│                                                      │
│    Poziom: [Łatwy] [●Średni○] [Trudny]             │
│                                                      │
│              [ Nowa Gra 🔄 ]                         │
│                                                      │
│         Status: Twoja kolej (czarne)                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Mobile (iPad portrait / phone)
- Vertical layout
- Score bars at top
- Board fills width
- Controls at bottom

### Responsive Breakpoints
- `>1024px`: Desktop layout with side scores
- `768px-1024px`: iPad optimized (touch targets 44px+)
- `<768px`: Mobile vertical layout

## Integration with Hub

Add card to `index.html`:
```html
<a href="othello/index.html" class="game-card card-othello">
    <div class="icon-circle">🏯</div>
    <div class="game-title">Othello</div>
    <div class="game-desc">Japońska gra strategiczna z regulowanym AI.</div>
    <div class="play-btn">Graj Teraz</div>
</a>
```

Add CSS:
```css
.card-othello .icon-circle { color: #4a7c59; }
```

## Testing

### Functional Tests
- Board initializes correctly with 4 center discs
- Valid moves calculated correctly for both players
- Disc flipping works in all 8 directions
- Game ends when no valid moves remain
- Score counts are accurate
- AI makes valid moves at all difficulty levels

### UI Tests
- Responsive layout works on iPad (portrait/landscape)
- Touch interactions feel natural
- Animations are smooth
- Dark theme is consistent

### Offline Tests
- Game loads without internet connection
- Service worker caches all assets
- PWA install prompt works
