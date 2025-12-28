# Pack Carousel V2 - Corrected Implementation

## 🎯 Carousel Behavior (Final)

### Center Pack:
✅ **Always** shows the set selected in dropdown  
✅ **Only** the center pack can be opened  
✅ Clicking center pack or "Open Pack" button opens it  
✅ Opening a pack adds it to recent history (max 3 unique)

### Left & Right Packs:
✅ Show the **2 most recent** opened packs (from history)  
✅ **Not openable** - they're visual history  
✅ **Clickable to select** - brings them to center AND syncs dropdown  
✅ If history < 3, duplicates packs to fill sides

### Dropdown:
✅ Changing dropdown → changes center pack immediately  
✅ Center pack always syncs with dropdown  
✅ Opening a pack → adds to history but doesn't change dropdown

---

## 🔄 Example Flows

### Flow 1: Clicking Side Packs (Rotation)

**Starting:**
```
History: [BLB, MH3, OTJ]
Dropdown: BLB ←

Left: MH3    Center: BLB    Right: OTJ
```

**Click RIGHT pack (OTJ):**
```
History: [BLB, MH3, OTJ] (unchanged)
Dropdown: OTJ ← (synced)

Left: BLB    Center: OTJ    Right: MH3
         (rotated clockwise)
```

**Click LEFT pack (BLB):**
```
History: [BLB, MH3, OTJ] (unchanged)
Dropdown: BLB ← (synced)

Left: MH3    Center: BLB    Right: OTJ
         (rotated counter-clockwise)
```

### Flow 2: Opening Packs

**Starting:**
```
History: [BLB, MH3]
Dropdown: OTJ ←

Left: BLB    Center: OTJ    Right: MH3
```

**Open center pack (OTJ):**
```
History: [OTJ, BLB, MH3] ← (OTJ added to front)
Dropdown: OTJ (unchanged)

Left: BLB    Center: OTJ    Right: MH3
```

**Change dropdown to SET4:**
```
History: [OTJ, BLB, MH3] (unchanged)
Dropdown: SET4 ←

Left: OTJ    Center: SET4   Right: BLB
         (center changed to SET4)
```

**Open center (SET4):**
```
History: [SET4, OTJ, BLB] ← (SET4 added, MH3 dropped)
Dropdown: SET4 (unchanged)

Left: OTJ    Center: SET4   Right: BLB
```

### Flow 3: Duplicating When History < 3

**Fresh user, no history:**
```
History: []
Dropdown: BLB ←

Left: BLB    Center: BLB    Right: BLB
         (duplicated to fill)
```

**Open first pack (BLB):**
```
History: [BLB]
Dropdown: BLB

Left: BLB    Center: BLB    Right: BLB
         (still duplicated)
```

**Change to MH3 and open:**
```
History: [MH3, BLB]
Dropdown: MH3

Left: BLB    Center: MH3    Right: BLB
         (BLB duplicated on sides)
```

**Change to OTJ and open:**
```
History: [OTJ, MH3, BLB]
Dropdown: OTJ

Left: MH3    Center: OTJ    Right: BLB
         (all unique now!)
```

---

## 🔧 Technical Changes

### Removed Functions:
- ❌ `selectedPackIndex` (no longer needed)
- ❌ `updatePackPositions()` (simplified)
- ❌ `selectPack(index)` (replaced with `rotateTo()`)
- ❌ `getSelectedPackSetCode()` (use `getCurrentSet()`)

### New/Updated Functions:

#### `buildDisplayArray(currentSet, recentPacks)`
- Returns `[left, center, right]` array
- Center is always `currentSet`
- Sides are from history, excluding center
- Duplicates if history has < 2 unique packs

#### `rotateTo(setCode, fromPosition)`
- Updates `currentSet` to the clicked pack
- Syncs dropdown value
- Re-renders carousel
- Dispatches `packSelected` event

#### `renderPackCarousel()`
- Builds display array from current set + history
- Creates 3 pack elements with positions
- Center gets "open" click handler
- Sides get "rotate" click handler

### Data Flow:

```
User Action           → State Change         → UI Update
─────────────────────────────────────────────────────────
Click dropdown        → setCurrentSet()      → renderPackCarousel()
Click side pack       → setCurrentSet()      → renderPackCarousel()
                        + update dropdown

Click center/button   → setLastPack()        → renderPackCarousel()
(open pack)             + add to history       (history updated)
```

---

## 🎨 Visual States

### Position Classes:
- `.packImage.left` - Left position (recent #1)
- `.packImage.center` - Center position (current set)
- `.packImage.right` - Right position (recent #2)
- `.packImage.ripping` - Opening animation

### CSS Effects:
```css
.center {
  transform: translateX(0) scale(1);
  opacity: 1;
  z-index: 3;
}

.left {
  transform: translateX(-120%) scale(0.85) rotateY(25deg);
  opacity: 0.7;
  z-index: 2;
}

.right {
  transform: translateX(120%) scale(0.85) rotateY(-25deg);
  opacity: 0.7;
  z-index: 2;
}
```

---

## 🧪 Testing Scenarios

### Test 1: Fresh User
1. Start app (no history)
2. Check: All 3 packs show same set (duplicated)
3. Open pack
4. Check: History has 1 entry, sides still duplicated

### Test 2: Dropdown Changes
1. Select "Set A" from dropdown
2. Check: Center shows Set A
3. Select "Set B" from dropdown
4. Check: Center shows Set B, sides unchanged

### Test 3: Side Pack Selection
1. Have history: [A, B, C], Dropdown: A
2. Click right pack (B)
3. Check: Center now B, dropdown updated to B
4. Check: Carousel rotated clockwise

### Test 4: Opening Packs
1. Select Set A (not in history)
2. Open pack
3. Check: A added to front of history
4. Open same set again
5. Check: A stays at front (no duplicate)

### Test 5: History Limit
1. Open 4 different packs: A, B, C, D
2. Check: History only has [D, C, B]
3. A was dropped (oldest removed)

---

## 🔄 Carousel Rotation Logic

The carousel doesn't "rotate" in the traditional sense. Instead:

**When you click a side pack:**
1. That pack's `setCode` becomes the new center
2. History is used to populate left/right
3. Everything re-renders with new positions

**This creates the illusion of rotation:**
- Click right → right pack moves to center, others shift left
- Click left → left pack moves to center, others shift right

**Implementation:**
```javascript
// Not: rotate array [L, C, R] → [C, R, L]
// Instead: rebuild array with new center
[left, center, right] = buildDisplayArray(newCenter, history)
```

This is simpler and always keeps center synced with dropdown!

---

## 📝 Code Cleanup

### Removed:
- `updatePackImage()` call from `main.js` (deprecated)
- Import of `updatePackImage` (no longer needed)
- Export of `updatePackImage` (kept for backward compat, just returns early)
- `selectedPackIndex` variable (not needed)
- Complex position calculation logic

### Kept:
- `updatePackImage()` function body (for backward compatibility)
  - Now just checks if elements exist and returns early
  - Logs message about using carousel system

---

## 🚀 User Experience

### Intuitive Interaction:
- Center pack is always "active" (matches dropdown)
- Side packs show "where you've been"
- Click sides to revisit recent sets
- Visual feedback (hover, animations)

### Clear Visual Hierarchy:
- Center: Full size, bright, obviously interactive
- Sides: Smaller, dimmed, rotated (clearly secondary)
- Smooth transitions when changing

### No Surprises:
- Dropdown always shows what's in center
- Opening adds to history but doesn't change selection
- History is visual reference, not navigation state

---

## 🎯 Summary

✅ **Center = Dropdown** (always synced)  
✅ **Sides = History** (visual only)  
✅ **Click sides → Rotate to center**  
✅ **Click center → Open pack**  
✅ **Opening → Adds to history**  
✅ **History duplicates if < 3 unique**  
✅ **Max 3 unique in history**

**Simple, intuitive, and works exactly as described!** 🎉