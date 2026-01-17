/**
 * MTG Pocket - Pack Opener Module
 * 
 * High-level pack opening flow orchestration.
 * Single responsibility: Coordinating pack opening process only.
 * 
 * TESTABLE: Orchestration logic can be tested with mocked dependencies.
 */

import { PACK_COST } from '../constants.js';
import { 
  getPoints, 
  subtractPoints, 
  addCard, 
  getCard,
  getCurrentSet,
  getAllCards,
  getFullArtCards,
  getMasterpieceCards,
  getStorySpotlightCards,
  setLastPack,
  save
} from '../state.js';
import { generatePack, validateCardPools } from './pack-generator.js';
import { showPackModal } from '../rendering/pack-modal.js';
import { startRipAnimation } from '../pack-carousel.js';

/**
 * Check if pack can be opened
 * @param {boolean} freeMode - Is free mode enabled?
 * @returns {boolean}
 * 
 * TESTABLE: Simple boolean logic
 */
export function canOpenPack(freeMode) {
  return freeMode || getPoints() >= PACK_COST;
}

/**
 * Open a pack (main entry point)
 * @param {boolean} freeMode - Is free mode enabled?
 * @returns {Promise<Array>} - Generated pack
 * 
 * TESTABLE: Can mock all dependencies
 */
export async function openPack(freeMode) {
  if (!canOpenPack(freeMode)) {
    console.warn('Cannot open pack - insufficient points');
    return null;
  }
  
  // Play rip animation
  await startRipAnimation();
  
  // Deduct points
  if (!freeMode) {
    subtractPoints(PACK_COST);
  }
  
  // Get current set
  const currentSet = getCurrentSet();
  
  // Get card pools
  const cardPools = {
    all: getAllCards(),
    fullArt: getFullArtCards(),
    masterpiece: getMasterpieceCards(),
    spotlight: getStorySpotlightCards()
  };
  
  // Validate pools
  if (!validateCardPools(cardPools)) {
    console.error('Invalid card pools');
    return null;
  }
  
  // Generate pack
  const pack = generatePack(currentSet, cardPools);
  
  // Add cards to collection
  const finalPack = processPackCards(pack);
  
  // Update last pack
  setLastPack(currentSet);
  save();
  
  // Show modal
  const isGodPack = finalPack.some(card => card.isGodPack);
  showPackModal(finalPack, isGodPack);
  
  return finalPack;
}

/**
 * Process pack cards (add to collection and get updated data)
 * @param {Array} pack - Generated pack with metadata
 * @returns {Array} - Processed pack with updated card data
 * 
 * TESTABLE: Can verify cards are added correctly
 */
export function processPackCards(pack) {
  const finalPack = [];
  
  for (const packCard of pack) {
    const { setCode, cardId, cardData } = packCard;
    
    // Check if card is new
    const isNew = !isCardOwned(setCode, cardId);
    
    // Add card to collection (increments count)
    ensureCardExists(setCode, cardId, cardData);
    
    // Get updated card data with correct count
    const updatedCard = getCard(setCode, cardId);
    
    // Build final card object
    finalPack.push({
      ...updatedCard,
      isNew,
      isGodPack: packCard.isGodPack || false,
      isBonus: packCard.isBonus || false,
      isSecret: packCard.isSecret || false
    });
  }
  
  return finalPack;
}

/**
 * Check if card is owned
 * @param {string} setCode - Set code
 * @param {string} cardId - Card ID
 * @returns {boolean}
 * 
 * TESTABLE: Simple state check
 */
export function isCardOwned(setCode, cardId) {
  return getCard(setCode, cardId) !== null;
}

/**
 * Ensure card exists in collection
 * @param {string} setCode - Set code
 * @param {string} cardId - Card ID
 * @param {Object} cardData - Card data
 * @returns {Object} - Card from state
 * 
 * TESTABLE: State mutation can be verified
 */
export function ensureCardExists(setCode, cardId, cardData) {
  addCard(setCode, cardId, cardData);
  return getCard(setCode, cardId);
}

/**
 * Get pack opening statistics
 * @param {boolean} freeMode - Is free mode enabled?
 * @returns {Object} - Statistics object
 * 
 * TESTABLE: Simple data gathering
 */
export function getPackOpeningStats(freeMode) {
  return {
    canOpen: canOpenPack(freeMode),
    currentPoints: getPoints(),
    pointsNeeded: PACK_COST,
    currentSet: getCurrentSet(),
    freeMode
  };
}
