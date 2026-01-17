/**
 * MTG Pocket - Pack Modal Module
 * 
 * Handles the pack opening modal setup and structure.
 * Single responsibility: Pack modal initialization only.
 * 
 * TESTABLE: Modal structure creation logic.
 */

import { PackRevealer } from './pack-revealer.js';

/**
 * Show pack opening modal
 * @param {Array} pack - Array of card objects
 * @param {boolean} isGodPack - Is this a god pack?
 * 
 * TESTABLE: Creates modal with proper structure
 */
export function showPackModal(pack, isGodPack) {
  const modal = document.getElementById('packModal');
  modal.style.display = 'flex';
  
  // Build modal HTML
  modal.innerHTML = isGodPack 
    ? createGodPackHeader() + createModalViews()
    : createModalViews();
  
  // Get view elements
  const singleView = modal.querySelector('.singleCardView');
  const allView = modal.querySelector('.allCardsView');
  const allCardsContainer = modal.querySelector('.packCards');
  
  // Separate cards by type
  const cardsByType = separateCardsByType(pack);
  const allPackCards = [
    ...cardsByType.regular,
    ...cardsByType.bonus,
    ...cardsByType.secret
  ];
  
  // Create and start revealer
  const revealer = new PackRevealer(singleView, allView, allCardsContainer, allPackCards);
  revealer.start();
  
  // Setup close handlers
  setupModalCloseHandlers(modal, singleView, allView, () => revealer.isComplete());
}

/**
 * Create god pack header HTML
 * @returns {string} - HTML string
 * 
 * TESTABLE: Returns specific HTML string
 */
export function createGodPackHeader() {
  return `<div style="text-align:center;margin-bottom:1rem;pointer-events:none">
    <h2 style="color:#ffd700;font-size:2rem;text-shadow:0 0 20px rgba(255,215,0,0.8)">🌟 GOD PACK! 🌟</h2>
  </div>`;
}

/**
 * Create modal view structure HTML
 * @returns {string} - HTML string
 * 
 * TESTABLE: Returns specific HTML string
 */
export function createModalViews() {
  return `<div class="singleCardView"></div><div class="allCardsView"><div class="packCards"></div></div>`;
}

/**
 * Separate pack cards by type
 * @param {Array} pack - Array of card objects
 * @returns {Object} - { regular, bonus, secret }
 * 
 * TESTABLE: Pure function, predictable grouping
 */
export function separateCardsByType(pack) {
  return {
    regular: pack.filter(c => !c.isBonus && !c.isSecret),
    bonus: pack.filter(c => c.isBonus),
    secret: pack.filter(c => c.isSecret)
  };
}

/**
 * Setup modal close handlers
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLElement} singleView - Single card view element
 * @param {HTMLElement} allView - All cards view element
 * @param {Function} isCompleteCallback - Function to check if reveal is complete
 * 
 * TESTABLE: Event handler setup
 */
export function setupModalCloseHandlers(modal, singleView, allView, isCompleteCallback) {
  // Close on modal background click (only when reveal complete)
  modal.onclick = (e) => {
    if (isCompleteCallback() && e.target === modal) {
      closePackModal(modal);
    }
  };
  
  // Close on all cards view click
  allView.onclick = (e) => {
    if (e.target === allView || e.target.closest('.packCards')) {
      closePackModal(modal);
    }
  };
}

/**
 * Close pack modal
 * @param {HTMLElement} modal - Modal element
 * 
 * TESTABLE: Simple cleanup
 */
export function closePackModal(modal) {
  modal.style.display = 'none';
  modal.innerHTML = '';
}

/**
 * Check if pack modal is open
 * @returns {boolean}
 * 
 * TESTABLE: Simple state check
 */
export function isPackModalOpen() {
  const modal = document.getElementById('packModal');
  return modal && modal.style.display === 'flex';
}
