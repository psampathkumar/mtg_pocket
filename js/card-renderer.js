/**
 * MTG Pocket - Card Renderer (FIXED - NO HOLO IN COLLECTION)
 * 
 * CRITICAL FIX: Holographic effect is ONLY applied in card view modal.
 * Collection cards have NO holographic effect, NO touch blocking.
 * This allows free scrolling on mobile.
 */

import { MTG_CARD_BACK } from './constants.js';
import { enableTilt, isDoubleFaced } from './utils.js';

// ===== CARD ELEMENT CREATION =====

/**
 * Create a card DOM element (NO holographic effect - allows scrolling)
 * @param {Object} card - Card data object
 * @param {boolean} isRevealing - Whether this is during pack reveal (disables interactions)
 * @returns {HTMLElement} - Card DOM element
 */
export function createCardElement(card, isRevealing = false) {
  const cardDiv = document.createElement('div');
  cardDiv.className = `card rarity-${card.rarity}`;
  
  // ✅ NO touch-action: none on collection cards
  // ✅ NO pointer event handlers
  // ✅ Allows natural scrolling
  
  const innerDiv = document.createElement('div');
  innerDiv.className = 'card-inner';
  
  // Create front face
  const frontDiv = document.createElement('div');
  frontDiv.className = 'card-front';
  const frontImg = document.createElement('img');
  frontImg.src = card.img;
  frontImg.alt = card.name;
  frontDiv.appendChild(frontImg);
  
  // Create back face
  const backDiv = document.createElement('div');
  backDiv.className = 'card-back';
  const backImg = document.createElement('img');
  backImg.src = card.backImg || MTG_CARD_BACK;
  backImg.alt = 'Card back';
  backDiv.appendChild(backImg);
  
  // Create count badge
  const countDiv = document.createElement('div');
  countDiv.className = 'count';
  countDiv.textContent = `x${card.count}`;
  
  // Assemble card structure
  innerDiv.appendChild(frontDiv);
  innerDiv.appendChild(backDiv);
  innerDiv.appendChild(countDiv);
  
  // Add flip indicator for double-faced cards
  if (isDoubleFaced(card.backImg)) {
    const flipDiv = document.createElement('div');
    flipDiv.className = 'flip-indicator';
    flipDiv.textContent = '🔄';
    innerDiv.appendChild(flipDiv);
  }
  
  cardDiv.appendChild(innerDiv);
  
  // Add interaction handlers if not revealing
  if (!isRevealing) {
    // ✅ ONLY click handler - no holographic effect
    // ✅ NO touch-action blocking
    cardDiv.onclick = (e) => {
      e.stopPropagation();
      showCardModal(card);
    };
    
    // ✅ Simple hover effect (CSS only, no JS interference)
    // See cards.css: .card:hover for basic transform
  }
  
  return cardDiv;
}

/**
 * Add special badges to a card element (NEW, STORY)
 * @param {HTMLElement} cardElement - Card DOM element
 * @param {Object} card - Card data object
 */
export function addCardBadges(cardElement, card) {
  if (card.isNew) {
    cardElement.classList.add('new-card');
  }
  
  if (card.spotlight === true) {
    cardElement.classList.add('story-card');
  }
}

/**
 * Add special effects to a card element (god pack, bonus glow)
 * @param {HTMLElement} cardElement - Card DOM element
 * @param {Object} options - Effect options
 */
export function addCardEffects(cardElement, options = {}) {
  const { isGodPack, isBonus, isSecret, isMasterpiece } = options;
  
  if (isGodPack) {
    cardElement.classList.add('godpack');
  }
  
  if (isMasterpiece || isSecret) {
    cardElement.classList.add('godpack');
    cardElement.style.filter = 'brightness(1.5) drop-shadow(0 0 30px rgba(155,89,182,0.9))';
    
    const glowDiv = document.createElement('div');
    glowDiv.className = 'bonus-glow';
    glowDiv.style.background = 'radial-gradient(circle, rgba(155,89,182,0.6), transparent 70%)';
    glowDiv.style.pointerEvents = 'none';
    cardElement.insertBefore(glowDiv, cardElement.firstChild);
  } else if (isBonus) {
    cardElement.classList.add('godpack');
    cardElement.style.filter = 'brightness(1.3) drop-shadow(0 0 20px rgba(255,107,107,0.8))';
    
    const glowDiv = document.createElement('div');
    glowDiv.className = 'bonus-glow';
    glowDiv.style.pointerEvents = 'none';
    cardElement.insertBefore(glowDiv, cardElement.firstChild);
  }
}

/**
 * Create a card placeholder element (for uncollected cards)
 * @param {string} collectorNumber - Collector number to display
 * @returns {HTMLElement}
 */
export function createPlaceholderElement(collectorNumber) {
  const placeholder = document.createElement('div');
  placeholder.className = 'card-placeholder';
  placeholder.textContent = `#${collectorNumber}`;
  return placeholder;
}

// ===== CARD MODAL (WITH HOLOGRAPHIC EFFECT) =====

/**
 * Show a card in a fullscreen modal with flip functionality and HOLOGRAPHIC EFFECT
 * ✅ THIS IS THE ONLY PLACE WHERE HOLOGRAPHIC EFFECT IS APPLIED
 * @param {Object} card - Card data object
 */
export function showCardModal(card) {
  const modal = document.getElementById('cardViewModal');
  modal.style.display = 'flex';
  modal.innerHTML = '';
  
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1.5rem;max-width:90vw';
  
  const perspectiveDiv = document.createElement('div');
  perspectiveDiv.style.cssText = 'perspective:1000px;max-width:400px;width:clamp(250px,60vw,400px)';
  
  const cardDiv = document.createElement('div');
  cardDiv.className = `card rarity-${card.rarity}`;
  
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
  
  // Count badge (hidden in modal via CSS)
  const countDiv = document.createElement('div');
  countDiv.className = 'count';
  countDiv.textContent = `x${card.count}`;
  
  innerDiv.appendChild(frontDiv);
  innerDiv.appendChild(backDiv);
  innerDiv.appendChild(countDiv);
  cardDiv.appendChild(innerDiv);
  perspectiveDiv.appendChild(cardDiv);
  
  // ✨ APPLY HOLOGRAPHIC EFFECT ONLY HERE ✨
  // This sets touch-action: none ONLY on the modal card
  enableTilt(cardDiv, card);
  
  // Flip button
  const flipBtn = document.createElement('button');
  flipBtn.textContent = '🔄 Flip Card';
  flipBtn.style.cssText = 'padding:0.75rem 1.5rem;font-size:1rem';
  
  flipBtn.onclick = () => {
    const current = innerDiv.style.transform || 'rotateY(0deg)';
    const isFlipped = current.includes('180');
    innerDiv.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
  };
  
  // Also allow clicking on the card image to flip
  innerDiv.onclick = (e) => {
    if (e.target.tagName !== 'IMG') return;
    const current = innerDiv.style.transform || 'rotateY(0deg)';
    const isFlipped = current.includes('180');
    innerDiv.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
  };
  
  container.appendChild(perspectiveDiv);
  container.appendChild(flipBtn);
  modal.appendChild(container);
  
  // Close on background click
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// ===== PACK REVEAL MODAL =====

/**
 * Create and show the pack reveal modal
 * @param {Array} pack - Array of card objects in the pack
 * @param {boolean} isGodPack - Whether this is a god pack
 */
export function showPackModal(pack, isGodPack) {
  const modal = document.getElementById('packModal');
  modal.style.display = 'flex';
  
  // Create modal content
  if (isGodPack) {
    modal.innerHTML = `
      <div style="text-align:center;margin-bottom:1rem">
        <h2 style="color:#ffd700;font-size:2rem;text-shadow:0 0 20px rgba(255,215,0,0.8)">
          🌟 GOD PACK! 🌟
        </h2>
      </div>
      <div class="singleCardView"></div>
      <div class="allCardsView"><div class="packCards"></div></div>
    `;
  } else {
    modal.innerHTML = `
      <div class="singleCardView"></div>
      <div class="allCardsView"><div class="packCards"></div></div>
    `;
  }
  
  const singleView = modal.querySelector('.singleCardView');
  const allView = modal.querySelector('.allCardsView');
  const allCardsContainer = modal.querySelector('.packCards');
  
  // Separate cards by type
  const regularCards = pack.filter(card => !card.isBonus && !card.isSecret);
  const bonusCards = pack.filter(card => card.isBonus);
  const secretCards = pack.filter(card => card.isSecret);
  const allPackCards = [...regularCards, ...bonusCards, ...secretCards];
  
  let currentIndex = 0;
  let allCardsShown = false;
  
  function closeModal() {
    modal.style.display = 'none';
    modal.innerHTML = '';
  }
  
  function showNextCard() {
    if (currentIndex < allPackCards.length) {
      const card = allPackCards[currentIndex];
      const isBonus = card.isBonus;
      const isSecret = card.isSecret;
      
      // Animate out existing card
      if (singleView.children.length > 0) {
        const existingCard = singleView.children[0];
        const existingInner = existingCard.querySelector('.card-inner');
        
        existingCard.classList.add('exiting');
        existingCard.style.animation = 'cardExit 0.5s ease-in forwards';
        if (existingInner) {
          existingInner.classList.add('no-transition');
          existingInner.style.animation = 'cardFlipExit 0.5s ease-in forwards';
        }
        
        setTimeout(() => showCardInPack(card, isBonus, isSecret), 500);
      } else {
        showCardInPack(card, isBonus, isSecret);
      }
    } else {
      // Show all cards view
      if (singleView.children.length > 0) {
        const existingCard = singleView.children[0];
        const existingInner = existingCard.querySelector('.card-inner');
        
        existingCard.classList.add('exiting');
        existingCard.style.animation = 'cardExit 0.5s ease-in forwards';
        if (existingInner) {
          existingInner.classList.add('no-transition');
          existingInner.style.animation = 'cardFlipExit 0.5s ease-in forwards';
        }
        
        setTimeout(() => {
          singleView.style.display = 'none';
          allView.style.display = 'block';
          allCardsShown = true;
          singleView.onclick = null;
        }, 500);
      } else {
        singleView.style.display = 'none';
        allView.style.display = 'block';
        allCardsShown = true;
        singleView.onclick = null;
      }
    }
  }
  
  function showCardInPack(card, isBonus, isSecret) {
    singleView.innerHTML = '';
    
    // Create large card for single view (NO holographic effect during reveal)
    const cardDiv = document.createElement('div');
    cardDiv.className = `card rarity-${card.rarity}`;
    cardDiv.style.cssText = 'width:100%;max-width:400px';
    
    const innerDiv = document.createElement('div');
    innerDiv.className = 'card-inner';
    
    const frontDiv = document.createElement('div');
    frontDiv.className = 'card-front';
    const frontImg = document.createElement('img');
    frontImg.src = card.img;
    frontImg.alt = card.name;
    frontDiv.appendChild(frontImg);
    
    const backDiv = document.createElement('div');
    backDiv.className = 'card-back';
    const backImg = document.createElement('img');
    backImg.src = card.backImg || MTG_CARD_BACK;
    backImg.alt = 'Card back';
    backDiv.appendChild(backImg);
    
    const countDiv = document.createElement('div');
    countDiv.className = 'count';
    countDiv.textContent = `x${card.count}`;
    
    innerDiv.appendChild(frontDiv);
    innerDiv.appendChild(backDiv);
    innerDiv.appendChild(countDiv);
    
    if (isDoubleFaced(card.backImg)) {
      const flipDiv = document.createElement('div');
      flipDiv.className = 'flip-indicator';
      flipDiv.textContent = '🔄';
      innerDiv.appendChild(flipDiv);
    }
    
    cardDiv.appendChild(innerDiv);
    
    // Add badges
    addCardBadges(cardDiv, card);
    
    // Add effects
    addCardEffects(cardDiv, {
      isGodPack: card.isGodPack,
      isBonus,
      isSecret,
      isMasterpiece: card.masterpiece === true
    });
    
    singleView.appendChild(cardDiv);
    
    // Create small card for final view (NO holographic effect)
    const smallCard = createCardElement(card, false);
    addCardBadges(smallCard, card);
    addCardEffects(smallCard, {
      isGodPack: card.isGodPack,
      isBonus,
      isSecret,
      isMasterpiece: card.masterpiece === true
    });
    
    allCardsContainer.appendChild(smallCard);
    currentIndex++;
  }
  
  showNextCard();
  singleView.onclick = showNextCard;
  
  modal.onclick = (e) => {
    if (allCardsShown && e.target === modal) {
      closeModal();
    }
  };
  
  allView.onclick = (e) => {
    if (e.target === allView || e.target.closest('.packCards') === allCardsContainer) {
      closeModal();
    }
  };
}
