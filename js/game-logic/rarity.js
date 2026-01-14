/**
 * MTG Pocket - Rarity Logic Module
 * 
 * Handles rarity rolling and random card selection.
 * Single responsibility: Game mechanics for card rarity only.
 * 
 * TESTABLE: All functions are pure (no side effects).
 */

import { RARITY_THRESHOLDS } from '../constants.js';

/**
 * Roll for a random card rarity based on probability thresholds
 * @returns {string} - 'common', 'uncommon', 'rare', or 'mythic'
 * 
 * TESTABLE: Pass random value as second param for deterministic tests
 */
export function rollRarity(randomValue = Math.random() * 100) {
  if (randomValue < RARITY_THRESHOLDS.mythic) return 'mythic';
  if (randomValue < RARITY_THRESHOLDS.rare) return 'rare';
  if (randomValue < RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

/**
 * Get a random element from an array
 * @param {Array} array - Array to select from
 * @param {number} randomValue - Optional random value for testing (0-1)
 * @returns {*} - Random element from array
 * 
 * TESTABLE: Pass randomValue for deterministic selection
 */
export function getRandomElement(array, randomValue = Math.random()) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(randomValue * array.length)];
}

/**
 * Shuffle an array in place (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} - The same array, shuffled
 * 
 * TESTABLE: Returns predictable results with seeded random
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Check if a random event should occur based on probability
 * @param {number} probability - Probability from 0 to 1 (e.g., 0.1 = 10%)
 * @param {number} randomValue - Optional random value for testing (0-1)
 * @returns {boolean}
 * 
 * TESTABLE: Pass randomValue for deterministic tests
 */
export function randomChance(probability, randomValue = Math.random()) {
  return randomValue < probability;
}

/**
 * Select a random card from a pool of cards with a specific rarity
 * @param {Array} allCards - All available cards
 * @param {string} targetRarity - Desired rarity
 * @returns {Object|null} - Selected card or null if none available
 * 
 * TESTABLE: Deterministic with fixed card pool
 */
export function selectCardByRarity(allCards, targetRarity) {
  if (!allCards || allCards.length === 0) {
    console.warn('No cards available for selection');
    return null;
  }
  
  // Filter by target rarity
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
    console.warn('No cards available in any rarity');
    return null;
  }
  
  return getRandomElement(pool);
}

/**
 * Calculate rarity distribution for a card pool
 * @param {Array} cards - Array of card objects
 * @returns {Object} - Count by rarity
 * 
 * TESTABLE: Pure function, deterministic output
 */
export function calculateRarityDistribution(cards) {
  const distribution = {
    common: 0,
    uncommon: 0,
    rare: 0,
    mythic: 0
  };
  
  cards.forEach(card => {
    if (distribution[card.rarity] !== undefined) {
      distribution[card.rarity]++;
    }
  });
  
  return distribution;
}

/**
 * Validate that a rarity string is valid
 * @param {string} rarity - Rarity to check
 * @returns {boolean}
 * 
 * TESTABLE: Simple validation logic
 */
export function isValidRarity(rarity) {
  return ['common', 'uncommon', 'rare', 'mythic'].includes(rarity);
}
