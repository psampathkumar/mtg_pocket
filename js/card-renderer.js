/**
 * MTG Pocket - Card Renderer (REFACTORED)
 * 
 * Consolidated card creation with shared builders.
 * Removed duplication, added reusable components.
 */

import { MTG_CARD_BACK } from './constants.js';
import { enableTilt, isDoubleFaced } from './utils.js';

// ===== SHARED CARD STRUCTURE BUILDERS =====

/**
 * Create the inner card structure (front, back, badges)
 * Reusable across all card types
 */
function createCardInner(card, options = {}) {
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
  
  // Flip indicator for double-faced cards
  if (showFlipIndicator && isDoubleFaced(card.backImg)) {
    const flipDiv = document.createElement('div');
    flipDiv.className = 'flip-indicator';
    flipDiv.textContent = '🔄';
    innerDiv.appendChild(flipDiv);
  }
  
  return innerDiv;
}

/**
 * Apply special badges (NEW, STORY) to a card element
 */
function applyBadges(cardElement, card) {
  if (card.isNew) cardElement.classList.add('new-card');
  if (card.spotlight === true) cardElement.classList.add('story-card');
}

/**
 * Apply special effects (god pack, bonus glow, masterpiece)
 */
function applyEffects(cardElement, options = {}) {
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
 * Create a bonus glow element
 */
function createGlowElement(color = 'rgba(255,107,107,0.4)') {
  const glowDiv = document.createElement('div');
  glowDiv.className = 'bonus-glow';
  glowDiv.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;
  glowDiv.style.pointerEvents = 'none';
  return glowDiv;
}

// ===== PUBLIC API =====

/**
 * Create a card DOM element for collection/grid view
 * NO holographic effect - allows natural scrolling
 */
export function createCardElement(card, isRevealing = false) {
  const cardDiv = document.createElement('div');
  cardDiv.className = `card rarity-${card.rarity}`;
  
  const innerDiv = createCardInner(card);
  cardDiv.appendChild(innerDiv);
  
  // Add interaction only if not revealing
  if (!isRevealing) {
    cardDiv.onclick = (e) => {
      e.stopPropagation();
      showCardModal(card);
    };
  }
  
  return cardDiv;
}

/**
 * Create a card placeholder for uncollected cards
 */
export function createPlaceholderElement(collectorNumber) {
  const placeholder = document.createElement('div');
  placeholder.className = 'card-placeholder';
  placeholder.textContent = `#${collectorNumber}`;
  return placeholder;
}

/**
 * Add badges and effects to an existing card element
 * Consolidated public API for pack opening
 */
export function decorateCard(cardElement, card, effects = {}) {
  applyBadges(cardElement, card);
  applyEffects(cardElement, effects);
}

// ===== MODAL SYSTEMS =====

/**
 * Show card in fullscreen modal with holographic effect
 * ONLY place where holographic effect is applied
 */
export function showCardModal(card) {
  const modal = document.getElementById('cardViewModal');
  modal.style.display = 'flex';
  modal.innerHTML = '';
  
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1.5rem;max-width:90vw';
  
  // Card with perspective wrapper
  const perspectiveDiv = document.createElement('div');
  perspectiveDiv.style.cssText = 'perspective:1000px;max-width:400px;width:clamp(250px,60vw,400px)';
  
  const cardDiv = document.createElement('div');
  cardDiv.className = `card rarity-${card.rarity}`;
  
  const innerDiv = createCardInner(card, { showCount: false }); // Hide count in modal
  cardDiv.appendChild(innerDiv);
  perspectiveDiv.appendChild(cardDiv);
  
  // Apply holographic effect (ONLY in modal)
  enableTilt(cardDiv, card);
  
  // Flip button
  const flipBtn = createFlipButton(innerDiv);
  
  // Allow clicking card to flip
  innerDiv.onclick = (e) => {
    if (e.target.tagName === 'IMG') {
      toggleFlip(innerDiv);
    }
  };
  
  container.appendChild(perspectiveDiv);
  container.appendChild(flipBtn);
  modal.appendChild(container);
  
  // Close on background click
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

/**
 * Create flip button
 */
function createFlipButton(innerDiv) {
  const flipBtn = document.createElement('button');
  flipBtn.textContent = '🔄 Flip Card';
  flipBtn.style.cssText = 'padding:0.75rem 1.5rem;font-size:1rem';
  flipBtn.onclick = () => toggleFlip(innerDiv);
  return flipBtn;
}

/**
 * Toggle card flip state
 */
function toggleFlip(innerDiv) {
  const current = innerDiv.style.transform || 'rotateY(0deg)';
  const isFlipped = current.includes('180');
  innerDiv.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
}

/**
 * Show pack opening modal with card-by-card reveal
 */
export function showPackModal(pack, isGodPack) {
  const modal = document.getElementById('packModal');
  modal.style.display = 'flex';
  
  // Create modal structure
  modal.innerHTML = isGodPack 
    ? createGodPackHeader() + createModalViews()
    : createModalViews();
  
  const singleView = modal.querySelector('.singleCardView');
  const allView = modal.querySelector('.allCardsView');
  const allCardsContainer = modal.querySelector('.packCards');
  
  // Separate cards by type
  const cardsByType = separateCardsByType(pack);
  const allPackCards = [...cardsByType.regular, ...cardsByType.bonus, ...cardsByType.secret];
  
  // Reveal controller
  const revealer = new PackRevealer(singleView, allView, allCardsContainer, allPackCards);
  revealer.start();
  
  // Modal close handlers
  setupModalCloseHandlers(modal, singleView, allView, () => revealer.isComplete());
}

/**
 * Create god pack header HTML
 */
function createGodPackHeader() {
  return `
    <div style="text-align:center;margin-bottom:1rem">
      <h2 style="color:#ffd700;font-size:2rem;text-shadow:0 0 20px rgba(255,215,0,0.8)">
        🌟 GOD PACK! 🌟
      </h2>
    </div>
  `;
}

/**
 * Create modal views HTML
 */
function createModalViews() {
  return `
    <div class="singleCardView"></div>
    <div class="allCardsView"><div class="packCards"></div></div>
  `;
}

/**
 * Separate pack cards by type
 */
function separateCardsByType(pack) {
  return {
    regular: pack.filter(c => !c.isBonus && !c.isSecret),
    bonus: pack.filter(c => c.isBonus),
    secret: pack.filter(c => c.isSecret)
  };
}

/**
 * Setup modal close handlers
 */
function setupModalCloseHandlers(modal, singleView, allView, isCompleteCallback) {
  modal.onclick = (e) => {
    if (isCompleteCallback() && e.target === modal) {
      closeModal(modal);
    }
  };
  
  allView.onclick = (e) => {
    if (e.target === allView || e.target.closest('.packCards')) {
      closeModal(modal);
    }
  };
}

/**
 * Close modal
 */
function closeModal(modal) {
  modal.style.display = 'none';
  modal.innerHTML = '';
}

// ===== PACK REVEALER CLASS =====

/**
 * Manages pack card-by-card reveal animation
 */
class PackRevealer {
  constructor(singleView, allView, allCardsContainer, cards) {
    this.singleView = singleView;
    this.allView = allView;
    this.allCardsContainer = allCardsContainer;
    this.cards = cards;
    this.currentIndex = 0;
    this.complete = false;
  }
  
  start() {
    this.showNext();
    this.singleView.onclick = () => this.showNext();
  }
  
  isComplete() {
    return this.complete;
  }
  
  showNext() {
    if (this.currentIndex < this.cards.length) {
      this.revealCard(this.cards[this.currentIndex]);
    } else {
      this.showAllCards();
    }
  }
  
  revealCard(card) {
    // Animate out existing card
    if (this.singleView.children.length > 0) {
      this.animateCardExit(this.singleView.children[0]);
      setTimeout(() => this.displayCard(card), 500);
    } else {
      this.displayCard(card);
    }
  }
  
  displayCard(card) {
    this.singleView.innerHTML = '';
    
    // Create large card for single view
    const cardDiv = document.createElement('div');
    cardDiv.className = `card rarity-${card.rarity}`;
    cardDiv.style.cssText = 'width:100%;max-width:400px';
    
    const innerDiv = createCardInner(card);
    cardDiv.appendChild(innerDiv);
    
    decorateCard(cardDiv, card, {
      isGodPack: card.isGodPack,
      isBonus: card.isBonus,
      isSecret: card.isSecret,
      isMasterpiece: card.masterpiece === true
    });
    
    this.singleView.appendChild(cardDiv);
    
    // Create small card for final view
    const smallCard = createCardElement(card, false);
    decorateCard(smallCard, card, {
      isGodPack: card.isGodPack,
      isBonus: card.isBonus,
      isSecret: card.isSecret,
      isMasterpiece: card.masterpiece === true
    });
    
    this.allCardsContainer.appendChild(smallCard);
    this.currentIndex++;
  }
  
  animateCardExit(cardElement) {
    const innerDiv = cardElement.querySelector('.card-inner');
    cardElement.classList.add('exiting');
    cardElement.style.animation = 'cardExit 0.5s ease-in forwards';
    
    if (innerDiv) {
      innerDiv.classList.add('no-transition');
      innerDiv.style.animation = 'cardFlipExit 0.5s ease-in forwards';
    }
  }
  
  showAllCards() {
    if (this.singleView.children.length > 0) {
      this.animateCardExit(this.singleView.children[0]);
      setTimeout(() => this.transitionToAllCards(), 500);
    } else {
      this.transitionToAllCards();
    }
  }
  
  transitionToAllCards() {
    this.singleView.style.display = 'none';
    this.allView.style.display = 'block';
    this.complete = true;
    this.singleView.onclick = null;
  }
}
