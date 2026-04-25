# MTG Pocket — Agent Notes

## What this is
Browser-based Magic: The Gathering pack-opening simulator. Vanilla JS (ES modules), no build tools, no package manager.

## Entry point & runtime
- `index.html` → `<script type="module" src="./js/main.js">`
- **Must be served over HTTP(S)** because of ES modules. Open `index.html` directly from disk and modules will fail.
- Quick dev server: `python3 -m http.server 8000` then open `http://localhost:8000`

## Architecture
- Modular ES6 under `js/`. All files use `import`/`export` with `.js` extensions.
- Event-driven communication between modules via custom events on `document`:
  - `carouselSetChange` — carousel rotated, main.js loads new set data
  - `openPack` — trigger pack opening flow
- State lives in `js/state.js` and persists to `localStorage` under key `mtgPocket`.

### Key directories
- `js/main.js` — app init, event wiring, countdown timer
- `js/state.js` — localStorage-backed state + data migration logic
- `js/api.js` — Scryfall API wrapper with pagination; rate-limit delay between pages
- `js/constants.js` — game config (pack cost, rarity weights, API base, set filters, glare config)
- `js/game-logic/` — pack generation (`pack-generator.js`), rarity rolls (`rarity.js`), pack opener (`pack-opener.js`)
- `js/rendering/` — card DOM factory, modal UIs, pack reveal animation
- `js/effects/` — holographic tilt/glare effects
- `styles/` — modular CSS (imported by `styles.css` root)
- `llm_docs/` — design docs and deployment guides (non-executable reference)

## Data & persistence
- All user data (points, collection, last pack) is in `localStorage` key `mtgPocket`.
- State includes migration logic that adds missing fields on load (e.g., `fullart`, `backImg`).
- `backup.html` is a standalone tool to download/verify/restore user data JSON.
- **Never delete `backup.html` unexpectedly** — it’s the user’s data safety net.

## Testing
- No test runner (Jest/Vitest/etc.). Tests are static HTML pages run in browser:
  - `test.html` — combined test suite
  - `test-phase1.html`, `test-phase2.html`, `test-phase3.html` — phased regression tests
- Open each in a browser after starting the dev server; results are rendered in-page.

## API behavior
- Uses Scryfall API (`https://api.scryfall.com`).
- `fetchAllPages` follows paginated responses with `SCRYFALL_RATE_LIMIT_DELAY` ms delay.
- `loadCompleteSetData` fetches 4 card categories in parallel: main, full-art, masterpieces, story spotlights.

## Dev tools in UI
A hidden dev panel is toggled via the 🛠️ Dev button on the home screen. It exposes:
- Free mode toggle (zero-cost packs)
- Add card by collector number
- Test holographic glare across rarities
- Refresh current set data from API

## Common gotchas
- **Changing the set dropdown or rotating the carousel triggers async `loadSet()`**; UI events wait for this to complete via `carouselSetChange`.
- `WHITELISTED_SETS` in `constants.js` can force-include sets that would otherwise be filtered out.
- God packs, full-art bonus cards, and masterpiece bonuses are all probability-driven from `constants.js`.
- The holographic effect intensity is rarity-specific and configured in `GLARE_CONFIG`.
