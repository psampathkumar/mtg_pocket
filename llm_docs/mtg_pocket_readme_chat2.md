# MTG Pocket - Development Summary

## Overview
This is a Magic: The Gathering pack opening simulator built as a single-page HTML application. Users can open booster packs, collect cards, and manage their collection with various features like full-art cards, masterpieces, and story spotlight cards.

---

## Key Features Implemented in This Session

### 1. **Card Back System with Flipping**
- **Single-faced cards**: Show standard MTG card back
- **Double-faced cards**: Show the alternate face as the back (extracted from Scryfall API `card_faces[1]`)
- **Flip indicator**: 🔄 icon appears in bottom-left corner for double-faced cards
- **Flip functionality**: Click card or flip button to rotate and see the back

### 2. **Pack Reveal Animation with Card Flipping**
- Cards flip while sliding off screen during pack reveal
- Shows card back as they exit (270° rotation over 0.8s)
- Border removed during exit for cleaner animation
- Simultaneous translation and rotation

### 3. **API Pagination Support**
- Scryfall API returns paginated results (175 cards per page)
- Implemented `fetchAllPages()` helper that follows `next_page` links
- Applied to all API calls: sets, cards, full-art, masterpieces, spotlights
- Fixed missing cards issue (now loads all 250-300+ cards per set)

### 4. **Multi-faced Card Support**
- API returns cards with `card_faces` array instead of top-level `image_uris`
- Updated filtering to check both `c.image_uris` AND `c.card_faces[0].image_uris`
- Created `getCardImages()` helper to extract front/back from either structure
- All card types (regular, full-art, masterpieces) now support multi-faced cards

### 5. **Collection View Improvements**
- "All Cards" filter shows: main set + full-art + spotlights + secrets (in that order)
- "All Cards" stat box shows total collected count (no progress bar)
- "Secrets" stat box has no progress bar (open-ended collection)
- Multi-faced cards now appear in collection with proper ordering

### 6. **Dev Tools Panel**
- Collapsible dev panel (🛠️ Dev button)
- **Free Packs**: Toggle unlimited packs
- **Add Card by Collector #**: Instantly add specific cards to collection
- Panel appears above button (bottom-anchored UI)

### 7. **UI/UX Enhancements**
- Points counter moved to pack button: `Open Pack (6/15)` or `Open Pack (0/∞)` in free mode
- Free mode changes button to red gradient
- Dev panel positioned at absolute bottom
- Pack opening slice animation improved (sword streak)

---

## Technical Architecture

### Data Structure
```javascript
data = {
  points: Number,
  last: Timestamp,
  cards: {
    [setCode]: {
      [cardId]: {
        name: String,
        rarity: String,
        img: String,          // Front image URL
        backImg: String,      // Back image URL or MTG_CARD_BACK
        count: Number,
        fullart: Boolean,
        spotlight: Boolean,
        masterpiece: Boolean,
        collectorNum: String
      }
    }
  },
  lastPack: String
}
```

### Card Rendering Structure
```html
<div class="card rarity-{rarity}">
  <div class="card-inner">           <!-- Flippable container -->
    <div class="card-front">         <!-- Front face (rotateY(0deg)) -->
      <img src="{front}">
    </div>
    <div class="card-back">          <!-- Back face (rotateY(180deg)) -->
      <img src="{back}">
    </div>
    <div class="count">x{count}</div>
    <div class="flip-indicator">🔄</div>  <!-- Only for double-faced -->
  </div>
</div>
```

### Key CSS Classes
- `.card`: Outer container with rarity border
- `.card-inner`: Inner flippable element with `transform-style: preserve-3d`
- `.card-front`: Front face with `backface-visibility: hidden`
- `.card-back`: Back face with `transform: rotateY(180deg)` and `backface-visibility: hidden`
- `.no-transition`: Disables CSS transition during animations
- `.exiting`: Removes border during exit animation

---

## Critical Lessons Learned

### 1. **CSS Transforms and Animations Don't Mix on Same Element**
**Problem**: Applying both `transform` transition and `animation` to `.card-inner` caused conflicts.

**Solution**: 
- Keep `transition: transform 0.6s` on `.card-inner` for manual flips
- Add `.no-transition` class during exit animations to disable it
- Apply exit animations separately: `cardExit` on parent, `cardFlipExit` on child

### 2. **Pagination is Essential for Scryfall API**
**Problem**: Only seeing 175 cards when sets have 250+.

**Solution**: Always check for `json.next_page` and fetch all pages:
```javascript
async function fetchAllPages(url){
  let allData=[];
  let nextUrl=url;
  while(nextUrl){
    const res=await fetch(nextUrl);
    const json=await res.json();
    allData.push(...json.data);
    nextUrl=json.next_page||null;
  }
  return allData;
}
```

### 3. **Multi-faced Cards Have Different API Structure**
**Problem**: Cards with `card_faces` array don't have top-level `image_uris`.

**Solution**: Check both structures:
```javascript
const hasTopLevelImage = c.image_uris;
const hasCardFaceImage = c.card_faces?.[0]?.image_uris;
return hasTopLevelImage || hasCardFaceImage;
```

Extract images correctly:
```javascript
if(card.image_uris){
  front = card.image_uris.normal;
  back = card.card_faces?.[1]?.image_uris?.normal || MTG_CARD_BACK;
} else if(card.card_faces){
  front = card.card_faces[0].image_uris.normal;
  back = card.card_faces[1]?.image_uris?.normal || MTG_CARD_BACK;
}
```

### 4. **3D Card Flip Requires Proper Structure**
**Must-haves for working flip:**
- Parent has `perspective: 1000px`
- Flipping element has `transform-style: preserve-3d`
- Front/back both have `backface-visibility: hidden`
- Front at `rotateY(0deg)`, back at `rotateY(180deg)`
- Both absolutely positioned with full width/height

### 5. **Animation Timing for Simultaneous Effects**
**For card reveal exit:**
- Both animations run for same duration (0.8s)
- Translation uses `ease-out` (natural deceleration)
- Rotation uses `linear` (constant speed)
- Flip to 270° ensures back is visible throughout journey
- Remove border with `.exiting` class for clean animation

### 6. **Debugging Flip Issues Systematically**
**Best approach:**
- Create test card with solid colors (RED front, BLUE back)
- Verify flip works in isolation
- Add inline styles to override any CSS conflicts
- Use `transform` directly via JS for manual flips
- Use CSS `animation` for automated sequences

---

## Common Pitfalls to Avoid

### ❌ Don't Do This:
1. **Don't use `localStorage` or `sessionStorage`** - Not supported in Claude artifacts
2. **Don't apply transform transition and animation to same element** - They conflict
3. **Don't assume API returns all results in one call** - Always paginate
4. **Don't check only `image_uris`** - Multi-faced cards use `card_faces`
5. **Don't use `overflow: hidden` on flip containers** - Prevents back from showing
6. **Don't forget `backface-visibility: hidden`** - You'll see both faces at once
7. **Don't use class-based flip toggle with animations** - Use inline `style.transform`

### ✅ Do This:
1. **Use in-memory storage** - React state, JS variables, or object storage
2. **Separate animations across parent/child elements** - Translation on parent, rotation on child
3. **Implement `fetchAllPages()` for all Scryfall queries**
4. **Check both `image_uris` and `card_faces[0].image_uris`**
5. **Use `overflow: visible` on `.card` and `.card-inner`**
6. **Always set `backface-visibility: hidden` on front/back faces**
7. **Manual flips**: Use `style.transform = 'rotateY(180deg)'`
8. **Animated flips**: Use CSS `@keyframes` with `animation` property

---

## File Structure

### Single HTML File Contains:
- **CSS**: All styles including animations, card layouts, responsive design
- **HTML**: Minimal structure (header, home screen, collection view, modals)
- **JavaScript**: 
  - Data management (localStorage)
  - API calls (Scryfall with pagination)
  - Card rendering functions
  - Pack opening logic
  - Collection management
  - Animation handlers

### Key Functions:
- `fetchAllPages(url)`: Handles API pagination
- `loadSet()`: Loads all cards for current set
- `openPack()`: Generates random pack with proper rarity distribution
- `getCardImages(card)`: Extracts front/back from API response
- `cardEl(card, isRevealing)`: Creates card DOM element
- `showCard(card)`: Opens fullscreen card view with flip
- `showCardInternal(card, isBonus, isSecret)`: Pack reveal card display
- `render()`: Renders collection view with filters

---

## Testing Checklist

When modifying this codebase, verify:
- [ ] Cards load completely (check console for "Total cards from API (all pages)")
- [ ] Multi-faced cards appear in collection
- [ ] Flip indicator shows on double-faced cards
- [ ] Clicking card opens modal with flip button
- [ ] Flip button/card click rotates smoothly
- [ ] Pack reveal shows card backs during exit
- [ ] Border disappears during exit animation
- [ ] Free mode shows (0/∞) with red button
- [ ] Normal mode shows (6/points) with blue button
- [ ] Dev panel opens upward from bottom
- [ ] Add card by collector # works
- [ ] All card filters work (all, common, rare, fullart, spotlight, secrets)

---

## Future Considerations

### Potential Improvements:
1. **Performance**: Virtual scrolling for large collections
2. **Search/Filter**: Card name search, advanced filters
3. **Statistics**: Pack history, pull rates, completion percentage
4. **Trading**: Card trading/gifting between users (requires backend)
5. **Animations**: More elaborate pack opening sequences
6. **Sound Effects**: Audio feedback for pack opening
7. **Set Rotation**: Special events, limited-time sets

### Known Limitations:
- No backend (all data in localStorage)
- No user accounts/authentication
- No real-time sync across devices
- Limited to Scryfall API rate limits
- No offline support

---

## Debug Commands

```javascript
// Check total cards loaded
console.log('Total cards:', allCards.length);

// Check multi-faced cards
console.log('Multi-faced:', allCards.filter(c => c.card_faces).length);

// View card structure
console.log('Sample card:', allCards[0]);

// Check collection
console.log('Collection:', data.cards[currentSet]);

// Force add points
data.points = 100; save(); update();

// Clear collection
data.cards = {}; save(); render();
```

---

## Version Info
- **Last Updated**: December 2024
- **API**: Scryfall API v1
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Dependencies**: None (vanilla JavaScript)
