# Pack Carousel Feature

## 🎯 Feature Overview

The pack carousel displays your 3 most recently opened packs in a 3D carousel layout:
- **Center**: Most recent pack (selected, ready to open)
- **Left**: Second most recent pack (clickable to select)
- **Right**: Third most recent pack (clickable to select)

## 🎨 Visual Design

```
    [Left]     [CENTER]     [Right]
     85%         100%         85%
  rotated    full size     rotated
  dimmed     bright        dimmed
```

### Positioning
- Center pack is at 100% scale, full brightness
- Side packs are at 85% scale, 70% opacity, rotated 25°
- Side packs slide away horizontally (±120%)
- Smooth transitions between states (0.5s cubic-bezier)

### Hover States
- Center pack: Scales to 105%
- Side packs: Scales to 90%, brightness increases to 85%

## 📁 New Files

### `js/pack-carousel.js`
New module handling carousel logic:
- `renderPackCarousel()` - Renders all 3 packs
- `selectPack(index)` - Selects a pack (brings to center)
- `getSelectedPackSetCode()` - Gets current selected set
- `startRipAnimation()` - Animates pack opening
- `initPackCarousel()` - Initializes carousel

## 🔄 Data Structure Changes

### Added to state.js:
```javascript
data: {
  // ... existing fields ...
  recentPacks: []  // Array of up to 3 set codes
}
```

### New Functions:
- `getRecentPacks()` - Returns array of recent pack codes
- Updated `setLastPack(setCode)` - Now maintains recentPacks array

### Migration:
- Automatically adds `recentPacks: []` if missing
- Initializes with `lastPack` if it exists

## 🎮 User Interaction

### Opening a Pack:
1. Click center pack OR "Open Pack" button
2. Pack rips with animation
3. Pack opens and shows cards
4. Carousel updates with new recent pack

### Selecting a Pack:
1. Click left or right pack
2. That pack slides to center
3. Other packs reposition
4. Current set updates
5. "Open Pack" button now opens selected pack

### Changing Sets (Dropdown):
1. Select set from dropdown
2. Carousel regenerates if needed
3. Selected set becomes center pack

## 🔧 Technical Implementation

### Event System:
Custom events for decoupling:
```javascript
// When pack is clicked to open
document.dispatchEvent(new CustomEvent('openPack', { 
  detail: { setCode } 
}));

// When pack is clicked to select
document.dispatchEvent(new CustomEvent('packSelected', { 
  detail: { setCode } 
}));
```

### CSS Classes:
- `.packImage.center` - Center position
- `.packImage.left` - Left position
- `.packImage.right` - Right position
- `.packImage.hidden` - Hidden (4th+ pack)
- `.packImage.ripping` - Opening animation

### Position Calculation:
```javascript
relativePosition = index - selectedPackIndex

if (relativePosition === 0) → center
if (relativePosition === -1) → left
if (relativePosition === 1) → right
else → hidden
```

## 📱 Responsive Design

### Desktop (> 768px):
- Full 3-pack layout
- Side packs at ±120% translateX
- Side packs at 85% scale

### Tablet (≤ 768px):
- Smaller packs
- Side packs at ±100% translateX
- Side packs at 75% scale

### Mobile (≤ 480px):
- Even smaller packs
- Side packs at ±90% translateX
- Side packs at 70% scale
- Reduced rotation (20° vs 25°)

## 🎯 Use Cases

### Scenario 1: First Time User
1. Opens app
2. Sees one pack (current set from dropdown)
3. Opens pack
4. Now has 1 pack in history
5. Can switch to other sets via dropdown

### Scenario 2: Returning User
1. Opens app
2. Sees last 3 packs opened
3. Can click left/right to switch between them
4. Can open any of them

### Scenario 3: Set Hopper
1. Opens pack from Set A (now center)
2. Selects Set B from dropdown
3. Opens pack from Set B
4. Now has A (left), B (center)
5. Clicks on A (left) to select it
6. A moves to center, B moves to right

## 🔄 Update Flow

### After Opening a Pack:
```javascript
openPack() 
  → setLastPack(setCode)         // Updates recentPacks array
  → save()                        // Persists to localStorage  
  → renderPackCarousel()          // Re-renders with new history
```

### Array Management:
```javascript
// Before opening 4th pack:
recentPacks = ['SET3', 'SET2', 'SET1']

// After opening SET4:
recentPacks = ['SET4', 'SET3', 'SET2']  // SET1 dropped

// Oldest pack is always removed when limit reached
```

## 🐛 Edge Cases Handled

### No Recent Packs:
- Shows current set from dropdown
- Array initializes with first opened pack

### Only 1 Recent Pack:
- Shows only center pack
- Left/right positions empty

### Only 2 Recent Packs:
- Shows center and one side
- Other side empty

### Duplicate Sets:
- Opening same set multiple times
- Removes old entry, adds to front
- No duplicates in carousel

## 🎨 Animation Details

### Pack Rip:
- Uses existing `@keyframes ripOpen`
- Applied to center pack only
- 800ms duration
- Slicing effect + shake

### Position Transitions:
- `transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1)`
- Smooth easing for natural movement
- Applies to: transform, opacity, filter

### Hover Transitions:
- Instant on hover (no transition override needed)
- Returns to default with transition

## 🧪 Testing

### Manual Tests:
1. Open 3 different packs → See all 3 in carousel
2. Click left pack → It moves to center
3. Click right pack → It moves to center
4. Open 4th pack → Oldest pack disappears
5. Select new set from dropdown → Pack appears
6. Open same set twice → No duplicate
7. Refresh page → Carousel persists

### Console Commands:
```javascript
// Check recent packs
import('./js/state.js').then(s => console.log(s.getRecentPacks()));

// Manually set recent packs
localStorage.setItem('mtgPocket', JSON.stringify({
  ...JSON.parse(localStorage.getItem('mtgPocket')),
  recentPacks: ['BLB', 'MH3', 'OTJ']
}));
location.reload();
```

## 📊 Performance

### Rendering:
- Only renders 3 packs max
- Unused packs have `display: none` equivalent (via opacity/pointer-events)
- Images lazy load from CDN

### Memory:
- Minimal state (just 3 set codes)
- No heavy computation
- Transitions handled by CSS GPU acceleration

## 🔮 Future Enhancements

### Possible Additions:
- Swipe gestures on mobile
- Keyboard navigation (arrow keys)
- Pack count badges (e.g., "Opened 5x")
- Animation when new pack added
- "Clear history" option
- More than 3 packs (scrollable carousel)

### Implementation Notes for Future:
- Event system is extensible
- Position classes can handle more positions
- Array can store more than 3 (just update slice)

---

## 📝 Summary

✅ **What Changed:**
- Added `recentPacks` array to state
- Created `pack-carousel.js` module
- Updated HTML to use carousel container
- Added 3D carousel CSS
- Integrated with pack opening flow
- Mobile responsive

✅ **What's Preserved:**
- Existing pack opening logic
- Card collection system
- All animations and effects
- Backward compatibility (migration handles old data)

✅ **User Experience:**
- Visual history of recent packs
- Quick switching between favorites
- Engaging 3D presentation
- Touch/click interactions
- Smooth animations

The feature is ready to use! 🎉