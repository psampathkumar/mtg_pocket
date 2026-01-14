/**
 * MTG Pocket - Core Helper Functions
 * 
 * Generic utility functions used throughout the app.
 * Single responsibility: Pure helper functions only.
 * 
 * TESTABLE: All functions are pure with no side effects.
 */

/**
 * Format milliseconds as MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time
 * 
 * TESTABLE: Pure function
 */
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Create an HTML element with classes and text
 * @param {string} tag - HTML tag name
 * @param {string|Array<string>} classes - Class name(s)
 * @param {string} textContent - Text content
 * @returns {HTMLElement}
 * 
 * TESTABLE: Returns predictable DOM element
 */
export function createElement(tag, classes = [], textContent = '') {
  const element = document.createElement(tag);
  
  if (typeof classes === 'string') {
    classes = [classes];
  }
  
  classes.forEach(c => element.classList.add(c));
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Wait for a specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 * 
 * TESTABLE: Can use fake timers
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Group cards by name
 * @param {Object} cardsObject - Cards object (id → card data)
 * @returns {Object} - Grouped by name (name → array of cards)
 * 
 * TESTABLE: Pure function
 */
export function groupCardsByName(cardsObject) {
  const grouped = {};
  
  Object.values(cardsObject).forEach(card => {
    if (!grouped[card.name]) {
      grouped[card.name] = [];
    }
    grouped[card.name].push(card);
  });
  
  return grouped;
}

/**
 * Calculate collection statistics by rarity
 * @param {Object} ownedCards - Cards owned (id → card data)
 * @param {Array} allCards - All available cards
 * @returns {Object} - Stats by rarity
 * 
 * TESTABLE: Pure calculation
 */
export function calculateCollectionStats(ownedCards, allCards) {
  const stats = {
    common: { owned: 0, total: 0 },
    uncommon: { owned: 0, total: 0 },
    rare: { owned: 0, total: 0 },
    mythic: { owned: 0, total: 0 }
  };
  
  // Count totals
  allCards.forEach(card => {
    if (stats[card.rarity]) {
      stats[card.rarity].total++;
    }
  });
  
  // Count owned (unique names only, no full-art variants)
  const ownedNames = new Set();
  Object.values(ownedCards).forEach(card => {
    if (card.fullart === false && !ownedNames.has(card.name)) {
      if (stats[card.rarity]) {
        stats[card.rarity].owned++;
      }
      ownedNames.add(card.name);
    }
  });
  
  return stats;
}

/**
 * Calculate percentage
 * @param {number} owned - Number owned
 * @param {number} total - Total number
 * @returns {number} - Percentage (0-100)
 * 
 * TESTABLE: Pure calculation
 */
export function calculatePercentage(owned, total) {
  if (total === 0) return 0;
  return Math.round((owned / total) * 100);
}

/**
 * Deep clone an object (simple implementation)
 * @param {*} obj - Object to clone
 * @returns {*} - Cloned object
 * 
 * TESTABLE: Pure function
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 * 
 * TESTABLE: Pure function
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 * 
 * TESTABLE: Pure function
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Check if value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean}
 * 
 * TESTABLE: Simple validation
 */
export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} - Debounced function
 * 
 * TESTABLE: Can use fake timers
 */
export function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
