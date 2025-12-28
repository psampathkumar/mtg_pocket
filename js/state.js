/**
 * MTG Pocket - State Management
 * 
 * Handles application state, localStorage persistence, and data migrations.
 */

import { STORAGE_KEY, MTG_CARD_BACK } from './constants.js';

// ===== APPLICATION STATE =====
export const state = {
  // User data (persisted)
  data: {
    points: 0,
    last: Date.now(),
    cards: {},
    lastPack: null,
    recentPacks: []  // Array of recent pack set codes (max 3)
  },
  
  // Current session data (not persisted)
  allCards: [],
  fullArtCards: [],
  masterpieceCards: [],
  storySpotlightCards: [],
  currentSet: null,
  setSize: 0,
  activeRarity: 'all',
  setData: {}
};

// ===== INITIALIZATION =====
/**
 * Load data from localStorage or initialize with defaults
 */
export function initializeState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      state.data = JSON.parse(stored);
      console.log('Loaded saved data:', {
        points: state.data.points,
        lastPack: state.data.lastPack,
        setCount: Object.keys(state.data.cards).length,
        totalCards: Object.values(state.data.cards).reduce((sum, set) => sum + Object.keys(set).length, 0)
      });
      migrateData();
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      state.data = getDefaultData();
    }
  } else {
    console.log('No saved data found, initializing with defaults');
    state.data = getDefaultData();
  }
}

/**
 * Get default data structure
 */
function getDefaultData() {
  return {
    points: 0,
    last: Date.now(),
    cards: {},
    lastPack: null,
    recentPacks: []
  };
}

// ===== PERSISTENCE =====
/**
 * Save current data to localStorage
 */
export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

// ===== DATA MIGRATION =====
/**
 * Migrate old data structures to current version
 * Ensures backward compatibility when data structure changes
 */
export function migrateData() {
  let needsSave = false;
  
  console.log('Running data migration...');
  
  // Ensure cards object exists
  if (!state.data.cards) {
    state.data.cards = {};
    needsSave = true;
    console.log('Added missing cards object');
  }
  
  // Ensure recentPacks array exists
  if (!state.data.recentPacks) {
    state.data.recentPacks = [];
    // Initialize with lastPack if it exists
    if (state.data.lastPack) {
      state.data.recentPacks = [state.data.lastPack];
      console.log('Initialized recentPacks with lastPack:', state.data.lastPack);
    }
    needsSave = true;
    console.log('Added missing recentPacks array');
  }
  
  // Ensure recentPacks is an array (in case of corruption)
  if (!Array.isArray(state.data.recentPacks)) {
    console.warn('recentPacks was not an array, resetting');
    state.data.recentPacks = [];
    if (state.data.lastPack) {
      state.data.recentPacks = [state.data.lastPack];
    }
    needsSave = true;
  }
  
  // Migrate each set's cards
  Object.keys(state.data.cards).forEach(setCode => {
    const setCards = state.data.cards[setCode];
    
    if (!setCards || typeof setCards !== 'object') {
      console.warn(`Invalid cards for set ${setCode}, skipping`);
      return;
    }
    
    Object.keys(setCards).forEach(cardId => {
      const card = setCards[cardId];
      
      if (!card || typeof card !== 'object') {
        console.warn(`Invalid card ${cardId} in set ${setCode}, skipping`);
        return;
      }
      
      // Add fullart flag if missing
      if (card.fullart === undefined) {
        card.fullart = cardId.endsWith('_fullart');
        needsSave = true;
      }
      
      // Add backImg if missing
      if (card.backImg === undefined) {
        card.backImg = MTG_CARD_BACK;
        needsSave = true;
      }
      
      // Ensure count exists and is a number
      if (typeof card.count !== 'number') {
        card.count = 1;
        needsSave = true;
      }
      
      // Ensure name exists
      if (!card.name) {
        console.warn(`Card ${cardId} missing name in set ${setCode}`);
        card.name = 'Unknown Card';
        needsSave = true;
      }
      
      // Ensure img exists
      if (!card.img) {
        console.warn(`Card ${cardId} missing img in set ${setCode}`);
        card.img = MTG_CARD_BACK;
        needsSave = true;
      }
    });
  });
  
  if (needsSave) {
    console.log('Migration complete, saving changes');
    save();
  } else {
    console.log('No migration needed');
  }
}

// ===== POINTS MANAGEMENT =====
/**
 * Add points to the user's balance
 */
export function addPoints(amount) {
  state.data.points += amount;
  save();
}

/**
 * Subtract points from the user's balance
 */
export function subtractPoints(amount) {
  state.data.points -= amount;
  save();
}

/**
 * Set points to a specific value
 */
export function setPoints(amount) {
  state.data.points = amount;
  save();
}

/**
 * Update the last point generation timestamp
 */
export function updateLastTimestamp(timestamp) {
  state.data.last = timestamp;
  save();
}

// ===== CARD MANAGEMENT =====
/**
 * Add a card to the collection
 * @param {string} setCode - The set code
 * @param {string} cardId - The card ID
 * @param {object} cardData - Card data object
 */
export function addCard(setCode, cardId, cardData) {
  if (!state.data.cards[setCode]) {
    state.data.cards[setCode] = {};
  }
  
  if (!state.data.cards[setCode][cardId]) {
    state.data.cards[setCode][cardId] = cardData;
  }
  
  state.data.cards[setCode][cardId].count++;
  save();
}

/**
 * Get a card from the collection
 * @param {string} setCode - The set code
 * @param {string} cardId - The card ID
 */
export function getCard(setCode, cardId) {
  return state.data.cards[setCode]?.[cardId] || null;
}

/**
 * Get all cards for a set
 * @param {string} setCode - The set code
 */
export function getSetCards(setCode) {
  return state.data.cards[setCode] || {};
}

/**
 * Clear all cards (dev tool)
 */
export function clearAllCards() {
  state.data.cards = {};
  save();
}

/**
 * Clear cards for a specific set (dev tool)
 */
export function clearSetCards(setCode) {
  if (state.data.cards[setCode]) {
    delete state.data.cards[setCode];
    save();
  }
}

// ===== LAST PACK TRACKING =====
/**
 * Set the last opened pack's set code and update recent packs
 */
export function setLastPack(setCode) {
  state.data.lastPack = setCode;
  
  // Update recent packs (keep last 3)
  if (!state.data.recentPacks) {
    state.data.recentPacks = [];
  }
  
  // Remove if already exists
  state.data.recentPacks = state.data.recentPacks.filter(code => code !== setCode);
  
  // Add to front
  state.data.recentPacks.unshift(setCode);
  
  // Keep only last 3
  if (state.data.recentPacks.length > 3) {
    state.data.recentPacks = state.data.recentPacks.slice(0, 3);
  }
  
  save();
}

/**
 * Get recent packs array
 */
export function getRecentPacks() {
  if (!state.data.recentPacks || !Array.isArray(state.data.recentPacks)) {
    console.warn('recentPacks invalid, returning empty array');
    return [];
  }
  return state.data.recentPacks;
}

/**
 * Get the last opened pack's set code
 */
export function getLastPack() {
  return state.data.lastPack;
}

// ===== SESSION STATE (NOT PERSISTED) =====
/**
 * Set the current set being viewed
 */
export function setCurrentSet(setCode) {
  state.currentSet = setCode;
}

/**
 * Set the active rarity filter
 */
export function setActiveRarity(rarity) {
  state.activeRarity = rarity;
}

/**
 * Update loaded cards data
 */
export function updateCardsData(cards, fullArt, masterpieces, spotlights) {
  state.allCards = cards;
  state.fullArtCards = fullArt;
  state.masterpieceCards = masterpieces;
  state.storySpotlightCards = spotlights;
  state.setSize = cards.length;
}

/**
 * Add set metadata
 */
export function addSetMetadata(setCode, metadata) {
  state.setData[setCode] = metadata;
}

/**
 * Get set metadata
 */
export function getSetMetadata(setCode) {
  return state.setData[setCode];
}

// ===== GETTERS =====
export function getState() {
  return state;
}

export function getData() {
  return state.data;
}

export function getAllCards() {
  return state.allCards;
}

export function getFullArtCards() {
  return state.fullArtCards;
}

export function getMasterpieceCards() {
  return state.masterpieceCards;
}

export function getStorySpotlightCards() {
  return state.storySpotlightCards;
}

export function getCurrentSet() {
  return state.currentSet;
}

export function getSetSize() {
  return state.setSize;
}

export function getActiveRarity() {
  return state.activeRarity;
}

export function getPoints() {
  return state.data.points;
}

export function getLastTimestamp() {
  return state.data.last;
}