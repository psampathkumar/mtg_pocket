/**
 * MTG Pocket - Pack Opening Module
 * 
 * Handles pack generation, opening animations, and card reveals.
 */

import { 
  PACK_COST, 
  GODPACK_CHANCE, 
  FULLART_BONUS_CHANCE, 
  MASTERPIECE_CHANCE,
  PACK_RIP_DURATION,
  CARD_SUFFIXES
} from './constants.js';
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
  getSetMetadata,
  setLastPack,
  save
} from './state.js';
import { rollRarity, getCardImages, randomChance, getRandomElement, wait } from './utils.js';
import { showPackModal } from './card-renderer.js';
import { startRipAnimation } from './pack-carousel.js';

// ===== PACK OPENING =====

/**
 * Check if user can open a pack
 * @param {boolean} freeMode - Whether free mode is enabled
 * @returns {boolean}
 */
export function canOpenPack(freeMode) {
  if (freeMode) return true;
  return getPoints() >= PACK_COST;
}

/**
 * Open a pack and generate cards
 * @param {boolean} freeMode - Whether free mode is enabled
 */
export async function openPack(freeMode) {
  if (!canOpenPack(freeMode)) {
    return;
  }
  
  // Play pack ripping animation
  await startRipAnimation();
  
  // Deduct points
  if (!freeMode) {
    subtractPoints(PACK_COST);
  }
  
  // Generate pack
  const currentSet = getCurrentSet();
  const pack = generatePack(currentSet);
  
  // Save pack opening
  setLastPack(currentSet);
  save();
  
  // Show pack reveal
  const isGodPack = pack.some(card => card.isGodPack);
  showPackModal(pack, isGodPack);
  
  return pack;
}

/**
 * Generate a pack of cards
 * @param {string} setCode - The set code
 * @returns {Array} - Array of card objects
 */
function generatePack(setCode) {
  const allCards = getAllCards();
  const fullArtCards = getFullArtCards();
  const masterpieceCards = getMasterpieceCards();
  const storySpotlightCards = getStorySpotlightCards();
  
  const isGodPack = randomChance(GODPACK_CHANCE) && fullArtCards.length > 0;
  let pack = [];
  
  console.log('=== GENERATING PACK ===');
  console.log('Is God Pack:', isGodPack);
  
  if (isGodPack) {
    // God pack: 5 full-art cards
    for (let i = 0; i < 5; i++) {
      const card = getRandomElement(fullArtCards);
      const cardId = card.id + CARD_SUFFIXES.fullart;
      const isNew = !isCardOwned(setCode, cardId);
      const imgs = getCardImages(card);
      
      const cardData = ensureCardExists(setCode, cardId, {
        name: card.name,
        rarity: card.rarity,
        img: imgs.front,
        backImg: imgs.back,
        count: 0,
        fullart: true,
        collectorNum: card.collector_number
      });
      
      pack.push({ ...cardData, isNew, isGodPack: true });
    }
  } else {
    // Regular pack: 5 cards based on rarity
    for (let i = 0; i < 5; i++) {
      let rarity = rollRarity();
      let pool = allCards.filter(c => c.rarity === rarity);
      
      // Fallback: if no cards of rolled rarity, try other rarities in order
      const fallbackRarities = ['common', 'uncommon', 'rare', 'mythic'].filter(r => r !== rarity);
      let attempts = 0;
      
      while (pool.length === 0 && attempts < fallbackRarities.length) {
        console.warn(`No cards found for rarity: ${rarity}, trying fallback: ${fallbackRarities[attempts]}`);
        rarity = fallbackRarities[attempts];
        pool = allCards.filter(c => c.rarity === rarity);
        attempts++;
      }
      
      if (pool.length === 0) {
        console.warn(`No cards available for any rarity in pack slot ${i + 1}, skipping`);
        continue;
      }
      
      const card = getRandomElement(pool);
      const cardId = card.id;
      const isNew = !isCardOwned(setCode, cardId);
      const isSpotlight = storySpotlightCards.some(sc => sc.id === card.id);
      const imgs = getCardImages(card);
      
      const cardData = ensureCardExists(setCode, cardId, {
        name: card.name,
        rarity: card.rarity,
        img: imgs.front,
        backImg: imgs.back,
        count: 0,
        fullart: false,
        spotlight: isSpotlight,
        collectorNum: card.collector_number
      });
      
      pack.push({ ...cardData, isNew });
    }
    
    // Chance for 6th card (full-art bonus)
    let got6thCard = false;
    if (randomChance(FULLART_BONUS_CHANCE) && fullArtCards.length > 0) {
      const card = getRandomElement(fullArtCards);
      const cardId = card.id + CARD_SUFFIXES.fullart;
      const isNew = !isCardOwned(setCode, cardId);
      const imgs = getCardImages(card);
      
      const cardData = ensureCardExists(setCode, cardId, {
        name: card.name,
        rarity: card.rarity,
        img: imgs.front,
        backImg: imgs.back,
        count: 0,
        fullart: true,
        collectorNum: card.collector_number
      });
      
      pack.push({ ...cardData, isNew, isBonus: true });
      got6thCard = true;
      console.log('Bonus full-art card added');
    }
    
    // Chance for 7th card (masterpiece) only if 6th card exists
    if (got6thCard && randomChance(MASTERPIECE_CHANCE) && masterpieceCards.length > 0) {
      const card = getRandomElement(masterpieceCards);
      const cardId = card.id + CARD_SUFFIXES.masterpiece;
      const isNew = !isCardOwned(setCode, cardId);
      const imgs = getCardImages(card);
      
      const cardData = ensureCardExists(setCode, cardId, {
        name: card.name,
        rarity: card.rarity,
        img: imgs.front,
        backImg: imgs.back,
        count: 0,
        masterpiece: true,
        collectorNum: card.collector_number
      });
      
      pack.push({ ...cardData, isNew, isSecret: true });
      console.log('Secret masterpiece card added');
    }
  }
  
  console.log('Pack generated with', pack.length, 'cards');
  console.log('=== END GENERATING PACK ===');
  
  return pack;
}

/**
 * Check if a card is already owned
 * @param {string} setCode - The set code
 * @param {string} cardId - The card ID
 * @returns {boolean}
 */
function isCardOwned(setCode, cardId) {
  const card = getCard(setCode, cardId);
  return card !== null;
}

/**
 * Ensure a card exists in the collection and increment its count
 * @param {string} setCode - The set code
 * @param {string} cardId - The card ID
 * @param {Object} cardData - Card data object
 * @returns {Object} - The card data with updated count
 */
function ensureCardExists(setCode, cardId, cardData) {
  addCard(setCode, cardId, cardData);
  
  // Get the updated card (with incremented count)
  return getCard(setCode, cardId);
}

/**
 * Update the pack image based on current set
 * NOTE: This function is deprecated with the new carousel system
 * but kept for backward compatibility
 */
export function updatePackImage() {
  const currentSet = getCurrentSet();
  
  // Check if old single pack elements exist (backward compatibility)
  const logo = document.getElementById('packLogo');
  const icon = document.getElementById('packIcon');
  
  if (!logo || !icon) {
    // Using new carousel system, no need to update
    console.log('Using carousel system, skipping legacy updatePackImage');
    return;
  }
  
  // Legacy single-pack system
  logo.src = `https://www.mtgpics.com/graph/sets/logos_big/${currentSet}.png`;
  logo.onerror = () => { logo.style.display = 'none'; };
  logo.onload = () => { logo.style.display = 'block'; };
  
  const setMetadata = getSetMetadata(currentSet);
  
  if (setMetadata && setMetadata.icon) {
    icon.src = setMetadata.icon;
    icon.style.display = 'block';
  } else {
    icon.style.display = 'none';
  }
}
