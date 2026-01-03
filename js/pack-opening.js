/**
 * MTG Pocket - Pack Opening (REFACTORED)
 * 
 * Removed deprecated functions, consolidated pack generation logic.
 */

import { 
  PACK_COST, 
  GODPACK_CHANCE, 
  FULLART_BONUS_CHANCE, 
  MASTERPIECE_CHANCE,
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
  setLastPack,
  save
} from './state.js';
import { rollRarity, getCardImages, randomChance, getRandomElement } from './utils.js';
import { showPackModal } from './card-renderer.js';
import { startRipAnimation } from './pack-carousel.js';

// ===== PACK OPENING CONTROLLER =====

export function canOpenPack(freeMode) {
  return freeMode || getPoints() >= PACK_COST;
}

export async function openPack(freeMode) {
  if (!canOpenPack(freeMode)) return;
  
  await startRipAnimation();
  
  if (!freeMode) subtractPoints(PACK_COST);
  
  const currentSet = getCurrentSet();
  const pack = generatePack(currentSet);
  
  setLastPack(currentSet);
  save();
  
  const isGodPack = pack.some(card => card.isGodPack);
  showPackModal(pack, isGodPack);
  
  return pack;
}

// ===== PACK GENERATION =====

function generatePack(setCode) {
  const cardPools = {
    all: getAllCards(),
    fullArt: getFullArtCards(),
    masterpiece: getMasterpieceCards(),
    spotlight: getStorySpotlightCards()
  };
  
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

function generateGodPack(setCode, pools) {
  const pack = [];
  
  for (let i = 0; i < 5; i++) {
    const card = getRandomElement(pools.fullArt);
    const cardId = card.id + CARD_SUFFIXES.fullart;
    const cardData = createCardData(card, pools, { fullart: true });
    const isNew = !isCardOwned(setCode, cardId);
    
    ensureCardExists(setCode, cardId, cardData);
    pack.push({ ...cardData, isNew, isGodPack: true });
  }
  
  return pack;
}

function generateRegularPack(setCode, pools) {
  const pack = [];
  
  // 5 base cards
  for (let i = 0; i < 5; i++) {
    const card = selectRandomCard(pools.all, rollRarity());
    if (!card) continue;
    
    const cardId = card.id;
    const cardData = createCardData(card, pools, { fullart: false });
    const isNew = !isCardOwned(setCode, cardId);
    
    ensureCardExists(setCode, cardId, cardData);
    pack.push({ ...cardData, isNew });
  }
  
  // Bonus full-art card (10% chance)
  const got6thCard = addBonusCard(pack, setCode, pools.fullArt, pools, 'fullart');
  
  // Masterpiece card (25% chance, only if 6th card exists)
  if (got6thCard) {
    addBonusCard(pack, setCode, pools.masterpiece, pools, 'masterpiece');
  }
  
  return pack;
}

function addBonusCard(pack, setCode, pool, allPools, type) {
  const chances = { fullart: FULLART_BONUS_CHANCE, masterpiece: MASTERPIECE_CHANCE };
  const suffixes = { fullart: CARD_SUFFIXES.fullart, masterpiece: CARD_SUFFIXES.masterpiece };
  const flags = { fullart: 'isBonus', masterpiece: 'isSecret' };
  
  if (!randomChance(chances[type]) || pool.length === 0) return false;
  
  const card = getRandomElement(pool);
  const cardId = card.id + suffixes[type];
  const cardData = createCardData(card, allPools, { [type]: true });
  const isNew = !isCardOwned(setCode, cardId);
  
  ensureCardExists(setCode, cardId, cardData);
  pack.push({ ...cardData, isNew, [flags[type]]: true });
  
  console.log(`${type} card added`);
  return true;
}

function selectRandomCard(allCards, targetRarity) {
  let pool = allCards.filter(c => c.rarity === targetRarity);
  
  if (pool.length === 0) {
    const fallbackRarities = ['common', 'uncommon', 'rare', 'mythic'].filter(r => r !== targetRarity);
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

function createCardData(card, pools, flags) {
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

function isCardOwned(setCode, cardId) {
  return getCard(setCode, cardId) !== null;
}

function ensureCardExists(setCode, cardId, cardData) {
  addCard(setCode, cardId, cardData);
  return getCard(setCode, cardId);
}
