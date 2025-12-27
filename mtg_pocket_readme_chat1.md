# MTG Pocket

A Pokemon Pocket-style card collection app for Magic: The Gathering, built with vanilla HTML/CSS/JavaScript.

## Features

### Core Mechanics
- **Pack Opening System**
  - Costs 6 points per pack
  - 5 regular cards per pack with rarity-based distribution:
    - Common: 60% chance
    - Uncommon: 30% chance  
    - Rare: 9% chance
    - Mythic: 1% chance
  - Points regenerate at 1 point per hour
  - Free pack mode for testing

### Special Card Types

#### Full Art Cards (6th Card Bonus)
- 10% chance to get a 6th full art card
- Tracked separately from regular versions
- Red glow effect during reveal
- Separate "FULL ART" filter in collection

#### Masterpiece Cards (7th Card Secret)
- 25% chance for a 7th masterpiece card (only if 6th card appeared)
- Loads from child sets with `set_type: "masterpiece"`
- Purple glow effect during reveal
- "SECRETS" filter shows count only (no total)

#### Story Spotlight Cards
- Automatically detected from cards with `is:spotlight` flag
- Blue "STORY" tag during reveal
- "STORY SPOTLIGHT" filter with progress tracking

#### God Packs
- 1.5% chance to get all 5 cards as full art
- Golden glow and "GOD PACK!" announcement

### Pack Opening Animations
- **Pack rip animation** - Slicing effect when opening
- **Card-by-card reveal** - Click/tap to reveal next card
- **Exit animation** - Cards flip and slide right (270° rotation)
- **Final view** - All cards displayed together at the end

### Collection Features

#### Filters
- All Cards
- Common, Uncommon, Rare, Mythic (shows owned + placeholders)
- Full Art (owned fullart cards only)
- Story Spotlight (owned + placeholders)
- Secrets (owned masterpieces only, no count)

#### Display
- Cards sorted by collector number
- Placeholders show actual collector numbers (e.g., "#42")
- Progress bars for each rarity
- Tilt effect on hover/touch for owned cards
- "NEW" tag for first-time acquisitions
- "STORY" tag for spotlight cards

### Visual Design
- **Home screen** with set logo and icon
- **Responsive layout** for mobile and desktop
- **Dark theme** with gradient backgrounds
- **Color-coded rarities**:
  - Common: Gray border
  - Uncommon: Green border
  - Rare: Blue border
  - Mythic: Orange border
- **Special effects**:
  - Golden glow for god pack/new cards
  - Red glow for full art bonus cards
  - Purple glow for masterpiece cards

### Data Management
- **LocalStorage persistence** - All progress saved locally
- **Data migration** - Automatically fixes old card data on load
- **Set selection** - Dropdown with all major MTG sets (excluding Jumpstart, Promos, Commander-only)
- **Parent set filtering** - Only shows top-level sets in dropdown

## Technical Details

### APIs Used
- **Scryfall API** for all card data:
  - `/sets` - Set information
  - `/cards/search` - Card queries with filters
  - Queries: `set:CODE`, `is:fullart`, `is:extended`, `is:spotlight`

### Data Structure
```javascript
{
  points: Number,
  last: Timestamp,
  lastPack: String (set code),
  cards: {
    [setCode]: {
      [cardId]: {
        name: String,
        rarity: String,
        img: String (image URL),
        count: Number,
        fullart: Boolean,
        masterpiece: Boolean,
        spotlight: Boolean,
        collectorNum: String
      }
    }
  }
}
```

### Key Implementation Notes
- Card variants (regular/fullart/masterpiece) stored separately with suffixes: `_fullart`, `_masterpiece`
- Collection view shows only `fullart: false` cards to avoid duplicates
- Collector numbers used for sorting and placeholder display
- All cards pre-sorted by collector number on load
- Stats updated only when opening collection view (not every tick)

## File Structure
- Single HTML file with embedded CSS and JavaScript
- No external dependencies except Scryfall API
- All state managed in localStorage

## Browser Compatibility
- Modern browsers with ES6+ support
- localStorage required
- Fetch API for network requests

## Debug Features
- Console logging for render operations
- Shows card names, collector numbers, owned/placeholder status
- Logs filter operations and card counts
- Can be disabled by removing `console.log` statements

## Future Enhancement Ideas
- Sound effects for pack opening
- Deck building feature
- Trade/crafting system
- Daily login bonuses
- Achievement system
- Export/import collection data
- Multiple user profiles

---

Built with ❤️ for MTG collectors