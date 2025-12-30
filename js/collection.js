/**
 * MTG Pocket - Collection Module
 * 
 * Handles collection view rendering, filtering, and statistics.
 */

import { FILTER_TYPES } from './constants.js';
import {
  getCurrentSet,
  getSetCards,
  getAllCards,
  getFullArtCards,
  getMasterpieceCards,
  getStorySpotlightCards,
  getActiveRarity,
  setActiveRarity
} from './state.js';
import { 
  groupCardsByName, 
  calculateCollectionStats, 
  calculatePercentage 
} from './utils.js';
import { createCardElement, createPlaceholderElement } from './card-renderer.js';

// ===== COLLECTION RENDERING =====

/**
 * Render the collection view based on active filter
 */
export function renderCollection() {
  const collectionContainer = document.getElementById('collection');
  collectionContainer.innerHTML = '';
  
  const currentSet = getCurrentSet();
  if (!currentSet) {
    console.warn('No current set selected');
    return;
  }
  
  const allCards = getAllCards();
  if (allCards.length === 0) {
    console.warn('No cards loaded for current set');
    return;
  }
  
  const ownedCards = getSetCards(currentSet);
  const ownedByName = groupCardsByName(ownedCards);
  const activeRarity = getActiveRarity();
  
  console.log('Rendering collection for filter:', activeRarity);
  
  if (activeRarity === FILTER_TYPES.SECRETS) {
    renderSecretsCollection(collectionContainer, ownedCards);
  } else if (activeRarity === FILTER_TYPES.SPOTLIGHT) {
    renderSpotlightCollection(collectionContainer, ownedByName);
  } else if (activeRarity === FILTER_TYPES.FULLART) {
    renderFullArtCollection(collectionContainer, ownedCards);
  } else if (activeRarity === FILTER_TYPES.ALL) {
    renderAllCollection(collectionContainer, ownedByName, ownedCards);
  } else {
    renderRarityCollection(collectionContainer, ownedByName, activeRarity);
  }
}

/**
 * Render secrets (masterpiece) collection
 */
function renderSecretsCollection(container, ownedCards) {
  const masterpieceList = Object.values(ownedCards)
    .filter(c => c.masterpiece === true)
    .sort((a, b) => {
      const numA = parseInt(a.collectorNum) || 0;
      const numB = parseInt(b.collectorNum) || 0;
      return numA - numB;
    });
  
  masterpieceList.forEach(card => {
    container.appendChild(createCardElement(card));
  });
}

/**
 * Render story spotlight collection
 */
function renderSpotlightCollection(container, ownedByName) {
  const storySpotlightCards = getStorySpotlightCards();
  
  storySpotlightCards.forEach(card => {
    const variants = ownedByName[card.name] || [];
    const ownedSpotlight = variants.find(v => v.spotlight === true);
    
    if (ownedSpotlight) {
      container.appendChild(createCardElement(ownedSpotlight));
    } else {
      container.appendChild(createPlaceholderElement(card.collector_number));
    }
  });
}

/**
 * Render full-art collection
 */
function renderFullArtCollection(container, ownedCards) {
  const fullArtList = Object.values(ownedCards)
    .filter(c => c.fullart === true)
    .sort((a, b) => {
      const numA = parseInt(a.collectorNum) || 0;
      const numB = parseInt(b.collectorNum) || 0;
      return numA - numB;
    });
  
  fullArtList.forEach(card => {
    container.appendChild(createCardElement(card));
  });
}

/**
 * Render all cards (main set + variants)
 */
function renderAllCollection(container, ownedByName, ownedCards) {
  const allCards = getAllCards();
  
  // Regular cards with placeholders
  allCards.forEach(card => {
    const variants = ownedByName[card.name] || [];
    const regularCard = variants.find(v => v.fullart === false);
    
    if (regularCard) {
      container.appendChild(createCardElement(regularCard));
    } else {
      container.appendChild(createPlaceholderElement(card.collector_number));
    }
  });
  
  // Full-art cards
  const fullArtList = Object.values(ownedCards)
    .filter(c => c.fullart === true)
    .sort((a, b) => {
      const numA = parseInt(a.collectorNum) || 0;
      const numB = parseInt(b.collectorNum) || 0;
      return numA - numB;
    });
  fullArtList.forEach(card => {
    container.appendChild(createCardElement(card));
  });
  
  // Story spotlight cards
  const spotlightList = Object.values(ownedCards)
    .filter(c => c.spotlight === true)
    .sort((a, b) => {
      const numA = parseInt(a.collectorNum) || 0;
      const numB = parseInt(b.collectorNum) || 0;
      return numA - numB;
    });
  spotlightList.forEach(card => {
    container.appendChild(createCardElement(card));
  });
  
  // Masterpiece cards
  const masterpieceList = Object.values(ownedCards)
    .filter(c => c.masterpiece === true)
    .sort((a, b) => {
      const numA = parseInt(a.collectorNum) || 0;
      const numB = parseInt(b.collectorNum) || 0;
      return numA - numB;
    });
  masterpieceList.forEach(card => {
    container.appendChild(createCardElement(card));
  });
}

/**
 * Render specific rarity collection
 */
function renderRarityCollection(container, ownedByName, rarity) {
  const allCards = getAllCards();
  
  allCards.forEach(card => {
    if (card.rarity !== rarity) return;
    
    const variants = ownedByName[card.name] || [];
    const regularCard = variants.find(v => v.fullart === false);
    
    if (regularCard) {
      container.appendChild(createCardElement(regularCard));
    } else {
      container.appendChild(createPlaceholderElement(card.collector_number));
    }
  });
}

// ===== STATISTICS =====

/**
 * Update and render collection statistics
 */
export function updateStats() {
  const statsContainer = document.getElementById('stats');
  const currentSet = getCurrentSet();
  
  if (!currentSet) {
    statsContainer.innerHTML = '';
    return;
  }
  
  const ownedCards = getSetCards(currentSet);
  const allCards = getAllCards();
  const fullArtCards = getFullArtCards();
  const masterpieceCards = getMasterpieceCards();
  const storySpotlightCards = getStorySpotlightCards();
  
  // Calculate stats for each rarity
  const rarityStats = calculateCollectionStats(ownedCards, allCards);
  
  // Calculate full-art stats
  const fullArtOwned = Object.values(ownedCards).filter(c => c.fullart === true).length;
  const fullArtTotal = fullArtCards.length;
  
  // Calculate masterpiece stats
  const masterpieceOwned = Object.values(ownedCards).filter(c => c.masterpiece === true).length;
  
  // Calculate story spotlight stats
  const storySpotlightOwned = Object.values(ownedCards).filter(c => c.spotlight === true).length;
  const storySpotlightTotal = storySpotlightCards.length;
  
  // Calculate total collected (sum of all card counts including duplicates)
  const totalCollected = Object.values(ownedCards).reduce((sum, card) => {
    return sum + (card.count || 0);
  }, 0);
  
  // Calculate unique cards count for "All Cards" stat box
  const uniqueOwnedNames = new Set();
  Object.values(ownedCards).forEach(c => {
    if (c.fullart === false) {
      uniqueOwnedNames.add(c.name);
    }
  });
  const uniqueCardsCount = uniqueOwnedNames.size + fullArtOwned + storySpotlightOwned + masterpieceOwned;
  
  // Update total cards counter
  document.getElementById('totalCards').textContent = totalCollected;
  
  // Build stats HTML
  let statsHTML = `
    <div class='statBox' data-rarity='${FILTER_TYPES.ALL}'>
      <b>All Cards</b> ${uniqueCardsCount}
    </div>
  `;
  
  // Add rarity stats
  ['common', 'uncommon', 'rare', 'mythic'].forEach(rarity => {
    const owned = rarityStats[rarity].owned;
    const total = rarityStats[rarity].total;
    const percentage = calculatePercentage(owned, total);
    
    statsHTML += `
      <div class='statBox' data-rarity='${rarity}'>
        <b>${rarity.toUpperCase()}</b> ${owned}/${total}
        <div class='progress'>
          <div style='width:${percentage}%'></div>
        </div>
      </div>
    `;
  });
  
  // Add full-art stats
  const fullArtPercentage = calculatePercentage(fullArtOwned, fullArtTotal);
  statsHTML += `
    <div class='statBox' data-rarity='${FILTER_TYPES.FULLART}' 
         style='background:linear-gradient(135deg,#2a2a3e,#1a1a2e);border:2px solid #ff6b6b'>
      <b>FULL ART</b> ${fullArtOwned}/${fullArtTotal}
      <div class='progress'>
        <div style='width:${fullArtPercentage}%;background:linear-gradient(90deg,#ff6b6b,#ee5a6f)'></div>
      </div>
    </div>
  `;
  
  // Add story spotlight stats (if any exist)
  if (storySpotlightTotal > 0) {
    const spotlightPercentage = calculatePercentage(storySpotlightOwned, storySpotlightTotal);
    statsHTML += `
      <div class='statBox' data-rarity='${FILTER_TYPES.SPOTLIGHT}' 
           style='background:linear-gradient(135deg,#2a3a4e,#1a2a3e);border:2px solid #3498db'>
        <b>STORY SPOTLIGHT</b> ${storySpotlightOwned}/${storySpotlightTotal}
        <div class='progress'>
          <div style='width:${spotlightPercentage}%;background:linear-gradient(90deg,#3498db,#2980b9)'></div>
        </div>
      </div>
    `;
  }
  
  // Add secrets stats (if any exist)
  if (masterpieceCards.length > 0) {
    statsHTML += `
      <div class='statBox' data-rarity='${FILTER_TYPES.SECRETS}' 
           style='background:linear-gradient(135deg,#3a1a5e,#1a0a2e);border:2px solid #9b59b6'>
        <b>SECRETS</b> ${masterpieceOwned}
      </div>
    `;
  }
  
  statsContainer.innerHTML = statsHTML;
  
  // Add click handlers to stat boxes
  statsContainer.querySelectorAll('.statBox').forEach(box => {
    box.onclick = () => {
      const rarity = box.dataset.rarity;
      setActiveRarity(rarity);
      
      // Update active state
      statsContainer.querySelectorAll('.statBox').forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      
      // Re-render collection
      renderCollection();
    };
  });
}

// ===== VIEW MANAGEMENT =====

/**
 * Show the collection view
 */
export function showCollectionView() {
  document.getElementById('homeScreen').style.display = 'none';
  document.getElementById('collectionView').style.display = 'block';
  document.querySelector('.setDropdown').style.display = 'none';
  
  renderCollection();
  updateStats();
}

/**
 * Show the home screen
 */
export function showHomeScreen() {
  document.getElementById('homeScreen').style.display = 'flex';
  document.getElementById('collectionView').style.display = 'none';
  document.querySelector('.setDropdown').style.display = 'block';
}
