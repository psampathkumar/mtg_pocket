/**
 * MTG Pocket - Utility Functions
 * 
 * Helper functions used throughout the application.
 */

import { RARITY_THRESHOLDS, MTG_CARD_BACK } from './constants.js';

// ===== RARITY ROLLING =====

/**
 * Roll for a random card rarity based on configured probabilities
 * @returns {string} - 'common', 'uncommon', 'rare', or 'mythic'
 */
export function rollRarity() {
  const roll = Math.random() * 100;
  
  if (roll < RARITY_THRESHOLDS.mythic) return 'mythic';
  if (roll < RARITY_THRESHOLDS.rare) return 'rare';
  if (roll < RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

// ===== CARD IMAGE EXTRACTION =====

/**
 * Extract front and back images from a Scryfall card object
 * Handles both single-faced and multi-faced cards
 * @param {Object} card - Scryfall card object
 * @returns {Object} - { front: string, back: string }
 */
export function getCardImages(card) {
  console.log('Getting images for:', card.name);
  console.log('Has image_uris:', !!card.image_uris);
  console.log('Has card_faces:', !!card.card_faces);
  
  // Single-faced card with top-level image_uris
  if (card.image_uris) {
    const front = card.image_uris.normal;
    const back = card.card_faces && 
                 card.card_faces.length > 1 && 
                 card.card_faces[1].image_uris
      ? card.card_faces[1].image_uris.normal
      : MTG_CARD_BACK;
    
    console.log('Single-face - Front:', front, 'Back:', back);
    return { front, back };
  }
  
  // Multi-faced card with images in card_faces
  if (card.card_faces && card.card_faces.length > 0) {
    const front = card.card_faces[0].image_uris
      ? card.card_faces[0].image_uris.normal
      : MTG_CARD_BACK;
    
    const back = card.card_faces.length > 1 && card.card_faces[1].image_uris
      ? card.card_faces[1].image_uris.normal
      : MTG_CARD_BACK;
    
    console.log('Multi-face - Front:', front, 'Back:', back);
    return { front, back };
  }
  
  // Fallback if no images found
  console.log('ERROR: No images found!');
  return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
}

/**
 * Check if a card has a non-standard back (i.e., is double-faced)
 * @param {string} backImg - The back image URL
 * @returns {boolean}
 */
export function isDoubleFaced(backImg) {
  return backImg && backImg !== MTG_CARD_BACK;
}

// ===== TIME FORMATTING =====

/**
 * Format milliseconds into MM:SS format
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time string (e.g., "05:30")
 */
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== CARD INTERACTIONS =====

/**
 * Enable 3D tilt effect on mouse/touch movement
 * @param {HTMLElement} element - The element to add tilt to
 */
export function enableTilt(element) {
  // Mouse movement handler
  element.onmousemove = (e) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    element.style.transform = 
      `perspective(800px) rotateX(${-y * 15}deg) rotateY(${x * 15}deg) scale(1.05)`;
  };
  
  // Mouse leave handler
  element.onmouseleave = () => {
    element.style.transform = '';
  };
  
  // Touch movement handler
  element.ontouchmove = (e) => {
    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    
    element.style.transform = 
      `perspective(800px) rotateX(${-y * 15}deg) rotateY(${x * 15}deg) scale(1.05)`;
  };
  
  // Touch end handler
  element.ontouchend = () => {
    element.style.transform = '';
  };
}

// ===== ARRAY UTILITIES =====

/**
 * Get a random element from an array
 * @param {Array} array - The array to pick from
 * @returns {*} - Random element from the array
 */
export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array (modifies in place)
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ===== RANDOM CHANCE =====

/**
 * Check if a random chance succeeds
 * @param {number} probability - Probability as decimal (0.0 to 1.0)
 * @returns {boolean}
 */
export function randomChance(probability) {
  return Math.random() < probability;
}

// ===== DOM UTILITIES =====

/**
 * Create an element with classes and optional text content
 * @param {string} tag - HTML tag name
 * @param {string|Array} classes - Class name(s) to add
 * @param {string} textContent - Optional text content
 * @returns {HTMLElement}
 */
export function createElement(tag, classes = [], textContent = '') {
  const element = document.createElement(tag);
  
  if (typeof classes === 'string') {
    classes = [classes];
  }
  
  classes.forEach(className => element.classList.add(className));
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== CARD COLLECTION UTILITIES =====

/**
 * Group cards by name (to handle variants)
 * @param {Object} cardsObject - Object of cards from state
 * @returns {Object} - Object with card names as keys, arrays of variants as values
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
 * Calculate collection statistics
 * @param {Object} ownedCards - Object of owned cards
 * @param {Array} allCards - Array of all cards in set
 * @returns {Object} - Statistics object
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
  
  // Count owned (only non-fullart variants)
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
 * Calculate completion percentage
 * @param {number} owned - Number of owned items
 * @param {number} total - Total number of items
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(owned, total) {
  if (total === 0) return 0;
  return Math.round((owned / total) * 100);
}