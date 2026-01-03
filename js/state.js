/**
 * MTG Pocket - State Management (REFACTORED)
 * 
 * Consolidated validation, cleaner migration logic.
 */

import { STORAGE_KEY, MTG_CARD_BACK } from './constants.js';

// ===== APPLICATION STATE =====
export const state = {
  data: {
    points: 0,
    last: Date.now(),
    cards: {},
    lastPack: null,
    recentPacks: []
  },
  
  // Session-only (not persisted)
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

export function initializeState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      state.data = JSON.parse(stored);
      console.log('Loaded saved data:', getSummary());
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

function getDefaultData() {
  return {
    points: 0,
    last: Date.now(),
    cards: {},
    lastPack: null,
    recentPacks: []
  };
}

function getSummary() {
  return {
    points: state.data.points,
    lastPack: state.data.lastPack,
    setCount: Object.keys(state.data.cards).length,
    totalCards: Object.values(state.data.cards).reduce((sum, set) => sum + Object.keys(set).length, 0)
  };
}

// ===== PERSISTENCE =====

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

// ===== DATA MIGRATION =====

export function migrateData() {
  let needsSave = false;
  console.log('Running data migration...');
  
  // Ensure required fields exist
  needsSave = ensureRequiredFields() || needsSave;
  
  // Migrate cards
  needsSave = migrateCards() || needsSave;
  
  if (needsSave) {
    console.log('Migration complete, saving changes');
    save();
  } else {
    console.log('No migration needed');
  }
}

function ensureRequiredFields() {
  let changed = false;
  
  if (!state.data.cards) {
    state.data.cards = {};
    changed = true;
    console.log('Added missing cards object');
  }
  
  if (!Array.isArray(state.data.recentPacks)) {
    state.data.recentPacks = state.data.lastPack ? [state.data.lastPack] : [];
    changed = true;
    console.log('Initialized recentPacks array');
  }
  
  return changed;
}

function migrateCards() {
  let changed = false;
  
  Object.keys(state.data.cards).forEach(setCode => {
    const setCards = state.data.cards[setCode];
    if (!isValidObject(setCards)) return;
    
    Object.keys(setCards).forEach(cardId => {
      const card = setCards[cardId];
      if (!isValidObject(card)) return;
      
      if (migrateCard(card, cardId)) {
        changed = true;
      }
    });
  });
  
  return changed;
}

function migrateCard(card, cardId) {
  let changed = false;
  
  // Add fullart flag if missing
  if (card.fullart === undefined) {
    card.fullart = cardId.endsWith('_fullart');
    changed = true;
  }
  
  // Add backImg if missing
  if (card.backImg === undefined) {
    card.backImg = MTG_CARD_BACK;
    changed = true;
  }
  
  // Ensure count is a number
  if (typeof card.count !== 'number') {
    card.count = 1;
    changed = true;
  }
  
  // Ensure name exists
  if (!card.name) {
    card.name = 'Unknown Card';
    changed = true;
  }
  
  // Ensure img exists
  if (!card.img) {
    card.img = MTG_CARD_BACK;
    changed = true;
  }
  
  return changed;
}

function isValidObject(obj) {
  return obj && typeof obj === 'object';
}

// ===== POINTS MANAGEMENT =====

export function addPoints(amount) {
  state.data.points += amount;
  save();
}

export function subtractPoints(amount) {
  state.data.points -= amount;
  save();
}

export function setPoints(amount) {
  state.data.points = amount;
  save();
}

export function updateLastTimestamp(timestamp) {
  state.data.last = timestamp;
  save();
}

// ===== CARD MANAGEMENT =====

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

export function getCard(setCode, cardId) {
  return state.data.cards[setCode]?.[cardId] || null;
}

export function getSetCards(setCode) {
  return state.data.cards[setCode] || {};
}

export function clearAllCards() {
  state.data.cards = {};
  save();
}

export function clearSetCards(setCode) {
  if (state.data.cards[setCode]) {
    delete state.data.cards[setCode];
    save();
  }
}

// ===== PACK HISTORY =====

export function setLastPack(setCode) {
  state.data.lastPack = setCode;
  updateRecentPacks(setCode);
  save();
}

function updateRecentPacks(setCode) {
  if (!Array.isArray(state.data.recentPacks)) {
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
}

export function getRecentPacks() {
  if (!Array.isArray(state.data.recentPacks)) {
    console.warn('recentPacks invalid, returning empty array');
    return [];
  }
  return state.data.recentPacks;
}

export function getLastPack() {
  return state.data.lastPack;
}

// ===== SESSION STATE =====

export function setCurrentSet(setCode) {
  state.currentSet = setCode;
}

export function setActiveRarity(rarity) {
  state.activeRarity = rarity;
}

export function updateCardsData(cards, fullArt, masterpieces, spotlights) {
  state.allCards = cards;
  state.fullArtCards = fullArt;
  state.masterpieceCards = masterpieces;
  state.storySpotlightCards = spotlights;
  state.setSize = cards.length;
}

export function addSetMetadata(setCode, metadata) {
  state.setData[setCode] = metadata;
}

export function getSetMetadata(setCode) {
  return state.setData[setCode];
}

// ===== GETTERS =====

export const getState = () => state;
export const getData = () => state.data;
export const getAllCards = () => state.allCards;
export const getFullArtCards = () => state.fullArtCards;
export const getMasterpieceCards = () => state.masterpieceCards;
export const getStorySpotlightCards = () => state.storySpotlightCards;
export const getCurrentSet = () => state.currentSet;
export const getSetSize = () => state.setSize;
export const getActiveRarity = () => state.activeRarity;
export const getPoints = () => state.data.points;
export const getLastTimestamp = () => state.data.last;
