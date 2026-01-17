/**
 * MTG Pocket - Pack Generator Module
 * 
 * Handles pack generation logic (god packs, regular packs, bonus cards).
 * Single responsibility: Pack content generation only.
 * 
 * TESTABLE: All functions are pure or have predictable outputs.
 */

import { 
  GODPACK_CHANCE, 
  FULLART_BONUS_CHANCE, 
  MASTERPIECE_CHANCE,
  CARD_SUFFIXES
} from '../constants.js';
import { rollRarity, randomChance, getRandomElement } from './rarity.js';
import { getCardImages } from '../ui/image-loader.js';

/**
 * Generate a complete pack of cards
 * @param {string} setCode - Set code
 * @param {Object} cardPools - { all, fullArt, masterpiece, spotlight }
 * @returns {Array} - Array of card data objects
 * 
 * TESTABLE: Can pass custom pools and verify output
 */
export function generatePack(setCode, cardPools) {
  const isGodPack = randomChance(GODPACK_CHANCE) && cardPools.fullArt.length > 0;
  
  console.log('=== GENERATING PACK ===');
  console.log('Is God Pack:', isGodPack);
  
  const pack = isGodPack 
    ? generateGodPack(setCode, cardPools)
    : generateRegularPack(setCode, cardPools);
  
  console.log('Pack generated with', pack.length, 'cards');
  console.log('=== END GENERATING PACK ===');
  
  return pack;
}

/**
 * Generate a god pack (all full-art cards)
 * @param {string} setCode - Set code
 * @param {Object} cardPools - Card pools
 * @returns {Array} - Array of 5 full-art cards with metadata
 * 
 * TESTABLE: Verify all cards are full-art
 */
export function generateGodPack(setCode, cardPools) {
  const pack = [];
  
  for (let i = 0; i < 5; i++) {
    const card = getRandomElement(cardPools.fullArt);
    const cardId = card.id + CARD_SUFFIXES.fullart;
    const cardData = createCardData(card, cardPools, { fullart: true });
    
    pack.push({
      setCode,
      cardId,
      cardData,
      isGodPack: true
    });
  }
  
  return pack;
}

/**
 * Generate a regular pack with base cards and possible bonuses
 * @param {string} setCode - Set code
 * @param {Object} cardPools - Card pools
 * @returns {Array} - Array of 5-7 cards with metadata
 * 
 * TESTABLE: Verify 5 base cards + optional bonuses
 */
export function generateRegularPack(setCode, cardPools) {
  const pack = [];
  
  // 5 base cards
  for (let i = 0; i < 5; i++) {
    const card = selectRandomCard(cardPools.all, rollRarity());
    if (!card) continue;
    
    const cardId = card.id;
    const cardData = createCardData(card, cardPools, { fullart: false });
    
    pack.push({
      setCode,
      cardId,
      cardData,
      isBonus: false,
      isSecret: false
    });
  }
  
  // Bonus full-art card (10% chance)
  const got6thCard = tryAddBonusCard(pack, setCode, cardPools.fullArt, cardPools, 'fullart');
  
  // Masterpiece card (25% chance, only if 6th card exists)
  if (got6thCard) {
    tryAddBonusCard(pack, setCode, cardPools.masterpiece, cardPools, 'masterpiece');
  }
  
  return pack;
}

/**
 * Try to add a bonus card to the pack
 * @param {Array} pack - Pack array to add to
 * @param {string} setCode - Set code
 * @param {Array} pool - Card pool to draw from
 * @param {Object} allPools - All card pools
 * @param {string} type - 'fullart' or 'masterpiece'
 * @returns {boolean} - True if card was added
 * 
 * TESTABLE: Mock randomChance to control outcome
 */
export function tryAddBonusCard(pack, setCode, pool, allPools, type) {
  const chances = { 
    fullart: FULLART_BONUS_CHANCE, 
    masterpiece: MASTERPIECE_CHANCE 
  };
  const suffixes = { 
    fullart: CARD_SUFFIXES.fullart, 
    masterpiece: CARD_SUFFIXES.masterpiece 
  };
  
  if (!randomChance(chances[type]) || pool.length === 0) {
    return false;
  }
  
  const card = getRandomElement(pool);
  const cardId = card.id + suffixes[type];
  const cardData = createCardData(card, allPools, { [type]: true });
  
  pack.push({
    setCode,
    cardId,
    cardData,
    isBonus: type === 'fullart',
    isSecret: type === 'masterpiece'
  });
  
  console.log(`${type} card added`);
  return true;
}

/**
 * Select a random card from pool with target rarity
 * @param {Array} allCards - All available cards
 * @param {string} targetRarity - Desired rarity
 * @returns {Object|null} - Selected card or null
 * 
 * TESTABLE: Verify fallback logic works
 */
export function selectRandomCard(allCards, targetRarity) {
  let pool = allCards.filter(c => c.rarity === targetRarity);
  
  // Fallback to other rarities if target pool is empty
  if (pool.length === 0) {
    const fallbackRarities = ['common', 'uncommon', 'rare', 'mythic']
      .filter(r => r !== targetRarity);
    
    for (const rarity of fallbackRarities) {
      pool = allCards.filter(c => c.rarity === rarity);
      if (pool.length > 0) {
        console.warn(`Fallback to ${rarity} from ${targetRarity}`);
        break;
      }
    }
  }
  
  if (pool.length === 0) {
    console.warn('No cards available');
    return null;
  }
  
  return getRandomElement(pool);
}

/**
 * Create card data object with images and metadata
 * @param {Object} card - Scryfall card object
 * @param {Object} pools - All card pools
 * @param {Object} flags - { fullart, masterpiece }
 * @returns {Object} - Card data for storage
 * 
 * TESTABLE: Verify data structure
 */
export function createCardData(card, pools, flags) {
  const imgs = getCardImages(card);
  const isSpotlight = pools.spotlight.some(sc => sc.id === card.id);
  
  return {
    name: card.name,
    rarity: card.rarity,
    img: imgs.front,
    backImg: imgs.back,
    count: 0,
    fullart: flags.fullart || false,
    masterpiece: flags.masterpiece || false,
    spotlight: isSpotlight,
    collectorNum: card.collector_number
  };
}

/**
 * Validate card pools have required data
 * @param {Object} cardPools - Card pools to validate
 * @returns {boolean} - True if valid
 * 
 * TESTABLE: Simple validation logic
 */
export function validateCardPools(cardPools) {
  if (!cardPools || typeof cardPools !== 'object') return false;
  if (!Array.isArray(cardPools.all) || cardPools.all.length === 0) return false;
  if (!Array.isArray(cardPools.fullArt)) return false;
  if (!Array.isArray(cardPools.masterpiece)) return false;
  if (!Array.isArray(cardPools.spotlight)) return false;
  return true;
}

/**
 * Calculate pack statistics
 * @param {Array} pack - Generated pack
 * @returns {Object} - Pack statistics
 * 
 * TESTABLE: Pure calculation
 */
export function calculatePackStats(pack) {
  return {
    totalCards: pack.length,
    regularCards: pack.filter(c => !c.isBonus && !c.isSecret).length,
    bonusCards: pack.filter(c => c.isBonus).length,
    secretCards: pack.filter(c => c.isSecret).length,
    isGodPack: pack.some(c => c.isGodPack),
    rarities: pack.reduce((acc, c) => {
      acc[c.cardData.rarity] = (acc[c.cardData.rarity] || 0) + 1;
      return acc;
    }, {})
  };
}
