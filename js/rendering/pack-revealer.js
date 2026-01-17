/**
 * MTG Pocket - Pack Revealer Module
 * 
 * Handles card-by-card reveal animation in pack modal.
 * Single responsibility: Pack reveal sequence only.
 * 
 * TESTABLE: Reveal logic and state management.
 */

import { createCardInner, decorateCard } from './card-factory.js';

/**
 * Pack revealer class
 * Manages the card-by-card reveal sequence
 */
export class PackRevealer {
  /**
   * @param {HTMLElement} singleView - Single card view container
   * @param {HTMLElement} allView - All cards view container
   * @param {HTMLElement} allCardsContainer - Container for small cards
   * @param {Array} cards - Array of cards to reveal
   */
  constructor(singleView, allView, allCardsContainer, cards) {
    this.singleView = singleView;
    this.allView = allView;
    this.allCardsContainer = allCardsContainer;
    this.cards = cards;
    this.currentIndex = 0;
    this.complete = false;
  }
  
  /**
   * Start the reveal sequence
   * 
   * TESTABLE: Initiates first reveal
   */
  start() {
    this.showNext();
    this.singleView.onclick = () => this.showNext();
  }
  
  /**
   * Check if reveal is complete
   * @returns {boolean}
   * 
   * TESTABLE: Simple state check
   */
  isComplete() {
    return this.complete;
  }
  
  /**
   * Show next card or transition to all cards view
   * 
   * TESTABLE: State machine logic
   */
  showNext() {
    if (this.currentIndex < this.cards.length) {
      this.revealCard(this.cards[this.currentIndex]);
    } else {
      this.showAllCards();
    }
  }
  
  /**
   * Reveal a single card
   * @param {Object} card - Card to reveal
   * 
   * TESTABLE: Card display logic
   */
  revealCard(card) {
    if (this.singleView.children.length > 0) {
      this.animateCardExit(this.singleView.children[0]);
      setTimeout(() => this.displayCard(card), 500);
    } else {
      this.displayCard(card);
    }
  }
  
  /**
   * Display a card in single view
   * @param {Object} card - Card to display
   * 
   * TESTABLE: DOM creation logic
   */
  displayCard(card) {
    this.singleView.innerHTML = '';
    
    // Create large card for single view
    const cardDiv = document.createElement('div');
    cardDiv.className = `card rarity-${card.rarity}`;
    cardDiv.style.cssText = 'width:100%;max-width:400px;';
    
    const innerDiv = createCardInner(card);
    cardDiv.appendChild(innerDiv);
    
    decorateCard(cardDiv, card, {
      isGodPack: card.isGodPack,
      isBonus: card.isBonus,
      isSecret: card.isSecret,
      isMasterpiece: card.masterpiece === true
    });
    
    this.singleView.appendChild(cardDiv);
    
    // Create small card for all cards view
    const smallCard = this.createSmallCard(card);
    this.allCardsContainer.appendChild(smallCard);
    
    this.currentIndex++;
  }
  
  /**
   * Create small card for all cards view
   * @param {Object} card - Card data
   * @returns {HTMLElement} - Small card element
   * 
   * TESTABLE: Returns card element
   */
  createSmallCard(card) {
    const smallCard = document.createElement('div');
    smallCard.className = `card rarity-${card.rarity}`;
    
    const innerDiv = createCardInner(card);
    smallCard.appendChild(innerDiv);
    
    decorateCard(smallCard, card, {
      isGodPack: card.isGodPack,
      isBonus: card.isBonus,
      isSecret: card.isSecret,
      isMasterpiece: card.masterpiece === true
    });
    
    // Add click handler to show in card modal
    smallCard.onclick = (e) => {
      e.stopPropagation();
      // Import dynamically to avoid circular dependency
      import('./card-modal.js').then(({ showCardModal }) => {
        showCardModal(card);
      });
    };
    
    return smallCard;
  }
  
  /**
   * Animate card exit
   * @param {HTMLElement} cardElement - Card element to animate
   * 
   * TESTABLE: Adds animation classes
   */
  animateCardExit(cardElement) {
    const innerDiv = cardElement.querySelector('.card-inner');
    cardElement.classList.add('exiting');
    cardElement.style.animation = 'cardExit 0.5s ease-in forwards';
    
    if (innerDiv) {
      innerDiv.classList.add('no-transition');
      innerDiv.style.animation = 'cardFlipExit 0.5s ease-in forwards';
    }
  }
  
  /**
   * Show all cards view
   * 
   * TESTABLE: View transition logic
   */
  showAllCards() {
    if (this.singleView.children.length > 0) {
      this.animateCardExit(this.singleView.children[0]);
      setTimeout(() => this.transitionToAllCards(), 500);
    } else {
      this.transitionToAllCards();
    }
  }
  
  /**
   * Transition to all cards view
   * 
   * TESTABLE: Final state change
   */
  transitionToAllCards() {
    this.singleView.style.display = 'none';
    this.allView.style.display = 'block';
    this.complete = true;
    this.singleView.onclick = null;
  }
  
  /**
   * Get current reveal state for testing
   * @returns {Object}
   * 
   * TESTABLE: State inspection
   */
  getState() {
    return {
      currentIndex: this.currentIndex,
      totalCards: this.cards.length,
      complete: this.complete
    };
  }
}
