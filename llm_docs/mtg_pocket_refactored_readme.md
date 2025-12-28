# MTG Pocket - Refactored File Structure

## 📁 File Organization

The codebase has been refactored from a single HTML file into a modular structure:

```
mtg-pocket/
├── index.html              # Main HTML structure
├── styles.css              # All CSS styles and animations
└── js/
    ├── constants.js        # Configuration constants
    ├── state.js           # State management and persistence
    ├── api.js             # Scryfall API interactions
    ├── utils.js           # Helper functions
    ├── card-renderer.js   # Card display and rendering
    ├── pack-opening.js    # Pack generation and opening logic
    ├── collection.js      # Collection view and statistics
    ├── dev-tools.js       # Developer tools and testing
    └── main.js            # Application entry point
```

## 📄 File Descriptions

### **index.html**
- Clean HTML structure with semantic sections
- Links to external CSS and JS modules
- Minimal inline styles
- Includes hover-tilt library for holographic effects

### **styles.css**
- All CSS organized into logical sections:
  - Base styles
  - Components (buttons, cards, modals)
  - Animations (pack rip, card flip, glows)
  - Responsive media queries

### **js/constants.js**
- Game mechanics configuration (pack cost, probabilities)
- API settings
- Animation timings
- Filter types
- Card suffixes

### **js/state.js**
- Application state management
- localStorage persistence
- Data migration for backward compatibility
- Getters and setters for all state properties
- Separate persistent data (saved) and session data (temporary)

### **js/api.js**
- Scryfall API wrapper functions
- Pagination handling
- Set queries (all sets, filtering, sorting)
- Card queries (main cards, full-art, masterpieces, spotlights)
- Complete set data loading with parallel requests

### **js/utils.js**
- Rarity rolling logic
- Card image extraction (handles single/multi-faced cards)
- Time formatting
- 3D tilt effects
- Array utilities (random, shuffle)
- DOM helpers
- Collection statistics calculations

### **js/card-renderer.js**
- Card DOM element creation
- Card badges (NEW, STORY, count, flip indicator)
- Special effects (god pack glow, bonus glow)
- Placeholder elements
- Card modal (fullscreen view with flip)
- Pack reveal modal (card-by-card animation)

### **js/pack-opening.js**
- Pack opening flow
- Pack generation logic (regular packs, god packs)
- Bonus card mechanics (6th full-art, 7th masterpiece)
- Card ownership tracking
- Pack image updates

### **js/collection.js**
- Collection rendering by filter type
- Statistics calculation and display
- Filter handlers (all, rarity, full-art, spotlight, secrets)
- View management (home screen ↔ collection)

### **js/dev-tools.js**
- Dev panel toggle
- Add card by collector number
- Manual holographic glare test (custom implementation)
- Library holographic glare test (hover-tilt)
- Gyroscope support for mobile testing

### **js/main.js**
- Application initialization
- Set loading and switching
- Event handler setup
- Countdown timer
- UI updates

## 🚀 How to Use

### Local Development

1. **Serve the files** using a local server (required for ES6 modules):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server
   
   # VS Code Live Server extension
   Right-click index.html → "Open with Live Server"
   ```

2. **Open in browser**: `http://localhost:8000`

### Important Notes

- **ES6 Modules**: Uses `type="module"` and `import/export` syntax
- **CORS**: Must be served via HTTP server (not `file://` protocol)
- **No Build Step**: No bundler required - runs directly in browser
- **Browser Compatibility**: Requires modern browser with ES6 module support

## 🔧 Module Dependencies

### Import Graph

```
main.js
├── constants.js
├── state.js
│   └── constants.js
├── api.js
│   └── constants.js
├── utils.js
│   └── constants.js
├── card-renderer.js
│   ├── constants.js
│   └── utils.js
├── pack-opening.js
│   ├── constants.js
│   ├── state.js
│   ├── utils.js
│   └── card-renderer.js
├── collection.js
│   ├── constants.js
│   ├── state.js
│   ├── utils.js
│   └── card-renderer.js
└── dev-tools.js
    ├── constants.js
    ├── state.js
    ├── utils.js
    └── collection.js
```

## 🎯 Benefits of Refactoring

### Code Organization
- **Separation of Concerns**: Each module has a single responsibility
- **Maintainability**: Easier to find and fix bugs
- **Readability**: Logical grouping of related functions

### Development Experience
- **Modularity**: Can work on one feature without affecting others
- **Testability**: Individual modules can be tested in isolation
- **Reusability**: Functions can be easily reused across modules

### Performance
- **Lazy Loading**: Modules loaded only when needed
- **Caching**: Browser caches individual files
- **Parallel Loading**: Browser can load modules in parallel

### Scalability
- **Easy to Extend**: Add new features as new modules
- **Team Collaboration**: Multiple developers can work simultaneously
- **Version Control**: Better Git diffs with separate files

## 🔄 Migration from Single File

If you have existing saved data in localStorage from the single-file version:
- **No migration needed!** The refactored version uses the same storage key
- Data structure is identical
- All existing progress is preserved

## 📝 Development Guidelines

### Adding New Features

1. **Determine the module** where the feature belongs
2. **Add constants** to `constants.js` if needed
3. **Create functions** in the appropriate module
4. **Export functions** that other modules need
5. **Import and use** in other modules as needed

### Example: Adding a New Card Type

```javascript
// 1. Add to constants.js
export const SPECIAL_CARD_CHANCE = 0.05;

// 2. Add to pack-opening.js
import { SPECIAL_CARD_CHANCE } from './constants.js';

function generatePack(setCode) {
  // ... existing code ...
  
  if (randomChance(SPECIAL_CARD_CHANCE)) {
    // Add special card logic
  }
}

// 3. Add rendering to card-renderer.js
export function addSpecialCardEffect(cardElement) {
  cardElement.classList.add('special-card');
  // Add visual effects
}
```

## 🐛 Debugging

### Common Issues

**"Failed to resolve module specifier"**
- Ensure you're serving files via HTTP server
- Check file paths are correct (case-sensitive)
- Verify `.js` extension is included in imports

**"Unexpected token 'export'"**
- Make sure script tag has `type="module"`
- Check browser supports ES6 modules

**"CORS policy error"**
- Must use HTTP server, not `file://` protocol
- Check server is running and accessible

### Debug Tips

```javascript
// Add to any module for debugging
console.log('Module loaded:', import.meta.url);

// Check state
import { getState } from './state.js';
console.log('Current state:', getState());

// Test functions individually
import { rollRarity } from './utils.js';
console.log('Random rarity:', rollRarity());
```

## 📊 File Size Comparison

| File | Lines | Size |
|------|-------|------|
| Original (index.html) | ~1100 | ~45KB |
| **New Total** | ~1100 | ~45KB |
| index.html | ~120 | ~5KB |
| styles.css | ~400 | ~15KB |
| constants.js | ~100 | ~4KB |
| state.js | ~180 | ~7KB |
| api.js | ~200 | ~8KB |
| utils.js | ~150 | ~6KB |
| card-renderer.js | ~250 | ~10KB |
| pack-opening.js | ~150 | ~6KB |
| collection.js | ~200 | ~8KB |
| dev-tools.js | ~250 | ~10KB |
| main.js | ~150 | ~6KB |

**Total size unchanged** - just better organized!

## 🎓 Learning Resources

- [ES6 Modules (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [JavaScript Module Pattern](https://www.patterns.dev/posts/module-pattern/)
- [Code Organization Best Practices](https://github.com/ryanmcdermott/clean-code-javascript)

## 🤝 Contributing

When making changes:
1. Keep functions small and focused
2. Add JSDoc comments for exported functions
3. Update this README if adding new modules
4. Test in multiple browsers
5. Ensure localStorage compatibility

---

**Built with ❤️ for MTG collectors**