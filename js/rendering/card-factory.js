/**
 * MTG Pocket - Card Factory Module
 * 
 * Handles DOM creation for card elements.
 * Single responsibility: Card element construction only.
 * 
 * TESTABLE: All functions return predictable DOM elements.
 */

import { MTG_CARD_BACK } from '../constants.js';
import { isDoubleFaced } from '../ui/image-loader.js';

/**
 * Create the inner card structure (front/back faces)
 * @param {Object} card - Card data
 * @param {Object} options - { showCount, showFlipIndicator }
 * @returns {HTMLElement} - Card inner div
 * 
 * TESTABLE: Returns predictable DOM structure
 */
export function createCardInner(card, options = {}) {
  const { showCount = true, showFlipIndicator = true } = options;
  
  const innerDiv = document.createElement('div');
  innerDiv.className = 'card-inner';
  
  // Front face
  const frontDiv = document.createElement('div');
  frontDiv.className = 'card-front';
  const frontImg = document.createElement('img');
  frontImg.src = card.img;
  frontImg.alt = card.name;
  frontDiv.appendChild(frontImg);
  
  // Back face
  const backDiv = document.createElement('div');
  backDiv.className = 'card-back';
  const backImg = document.createElement('img');
  backImg.src = card.backImg || MTG_CARD_BACK;
  backImg.alt = 'Card back';
  backDiv.appendChild(backImg);
  
  innerDiv.appendChild(frontDiv);
  innerDiv.appendChild(backDiv);
  
  // Count badge
  if (showCount) {
    const countDiv = document.createElement('div');
    countDiv.className = 'count';
    countDiv.textContent = `x${card.count}`;
    innerDiv.appendChild(countDiv);
  }
  
  // Flip indicator (🔄)
  if (showFlipIndicator && isDoubleFaced(card.backImg)) {
    const flipDiv = document.createElement('div');
    flipDiv.className = 'flip-indicator';
    flipDiv.textContent = '🔄';
    innerDiv.appendChild(flipDiv);
  }
  
  return innerDiv;
}

/**
 * Create a complete card element
 * @param {Object} card - Card data
 * @param {Function} onClick - Optional click handler
 * @returns {HTMLElement} - Complete card div
 * 
 * TESTABLE: Returns card with proper classes
 */
export function createCardElement(card, onClick = null) {
  const cardDiv = document.createElement('div');
  cardDiv.className = `card rarity-${card.rarity}`;
  
  const innerDiv = createCardInner(card);
  cardDiv.appendChild(innerDiv);
  
  if (onClick) {
    cardDiv.onclick = (e) => {
      e.stopPropagation();
      onClick(card);
    };
  }
  
  return cardDiv;
}

/**
 * Create a placeholder element for uncollected cards
 * @param {string} collectorNumber - Card collector number
 * @returns {HTMLElement} - Placeholder div
 * 
 * TESTABLE: Simple DOM creation
 */
export function createPlaceholderElement(collectorNumber) {
  const placeholder = document.createElement('div');
  placeholder.className = 'card-placeholder';
  placeholder.textContent = `#${collectorNumber}`;
  return placeholder;
}

/**
 * Apply visual badges to a card element
 * @param {HTMLElement} cardElement - Card DOM element
 * @param {Object} card - Card data
 * 
 * TESTABLE: Adds specific classes based on flags
 */
export function applyBadges(cardElement, card) {
  if (card.isNew) {
    cardElement.classList.add('new-card');
  }
  if (card.spotlight === true) {
    cardElement.classList.add('story-card');
  }
}

/**
 * Apply special effects to a card element
 * @param {HTMLElement} cardElement - Card DOM element
 * @param {Object} options - { isGodPack, isBonus, isSecret, isMasterpiece }
 * 
 * TESTABLE: Adds effects based on flags
 */
export function applyEffects(cardElement, options = {}) {
  const { isGodPack, isBonus, isSecret, isMasterpiece } = options;
  
  if (isGodPack) {
    cardElement.classList.add('godpack');
  }
  
  if (isMasterpiece || isSecret) {
    cardElement.classList.add('godpack');
    cardElement.style.filter = 'brightness(1.5) drop-shadow(0 0 30px rgba(155,89,182,0.9))';
    cardElement.appendChild(createGlowElement('rgba(155,89,182,0.6)'));
  } else if (isBonus) {
    cardElement.classList.add('godpack');
    cardElement.style.filter = 'brightness(1.3) drop-shadow(0 0 20px rgba(255,107,107,0.8))';
    cardElement.appendChild(createGlowElement());
  }
}

/**
 * Create a glow element for special cards
 * @param {string} color - RGBA color string
 * @returns {HTMLElement} - Glow div
 * 
 * TESTABLE: Returns element with specific styles
 */
export function createGlowElement(color = 'rgba(255,107,107,0.4)') {
  const glowDiv = document.createElement('div');
  glowDiv.className = 'bonus-glow';
  glowDiv.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;
  glowDiv.style.pointerEvents = 'none';
  return glowDiv;
}

/**
 * Decorate a card with badges and effects
 * @param {HTMLElement} cardElement - Card DOM element
 * @param {Object} card - Card data
 * @param {Object} effects - Effect flags
 * 
 * TESTABLE: Combines badge and effect application
 */
export function decorateCard(cardElement, card, effects = {}) {
  applyBadges(cardElement, card);
  applyEffects(cardElement, effects);
}

/**
 * Toggle card flip state
 * @param {HTMLElement} innerDiv - Card inner element
 * 
 * TESTABLE: Changes transform property predictably
 */
export function toggleFlip(innerDiv) {
  const current = innerDiv.style.transform || 'rotateY(0deg)';
  const isFlipped = current.includes('180');
  innerDiv.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
  console.log('🔄 Flipped:', isFlipped ? 'back → front' : 'front → back');
}
