/**
 * MTG Pocket - Card Modal Module
 * 
 * Handles the single card detail view modal.
 * Single responsibility: Card detail modal only.
 * 
 * TESTABLE: Modal creation and management logic.
 */

import { enableTilt, disableTilt } from '../effects/holographic.js';
import { createCardInner, toggleFlip } from './card-factory.js';

/**
 * Show card detail modal
 * @param {Object} card - Card data to display
 * 
 * TESTABLE: Creates modal with specific structure
 */
export function showCardModal(card) {
  console.log('🃏 Opening card modal...');
  
  const modal = document.getElementById('cardViewModal');
  modal.style.display = 'flex';
  modal.innerHTML = '';
  
  // Create modal content wrapper
  const wrapper = createModalWrapper();
  
  // Create perspective container for 3D effect
  const perspectiveDiv = createPerspectiveContainer();
  
  // Create card element
  const cardDiv = createCardElement(card);
  const innerDiv = createCardInner(card, { showCount: false });
  cardDiv.appendChild(innerDiv);
  perspectiveDiv.appendChild(cardDiv);
  
  // Add click handler to flip card
  cardDiv.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    toggleFlip(innerDiv);
    e.stopPropagation();
  });
  
  // Enable holographic effect
  enableTilt(cardDiv, card);
  
  // Create flip button
  const flipBtn = createFlipButton(() => {
    toggleFlip(innerDiv);
  });
  
  // Assemble modal
  wrapper.appendChild(perspectiveDiv);
  wrapper.appendChild(flipBtn);
  modal.appendChild(wrapper);
  
  // Add close handler
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  };
  
  console.log('✅ Modal ready');
}

/**
 * Close card modal and cleanup
 * @param {HTMLElement} modal - Modal element
 * 
 * TESTABLE: Cleanup logic
 */
export function closeModal(modal) {
  const cardDiv = modal.querySelector('.card');
  if (cardDiv) {
    disableTilt(cardDiv);
  }
  modal.style.display = 'none';
  modal.innerHTML = '';
}

/**
 * Create modal wrapper element
 * @returns {HTMLElement}
 * 
 * TESTABLE: Returns element with specific styles
 */
function createModalWrapper() {
  const wrapper = document.createElement('div');
  wrapper.className = 'modal-content-wrapper';
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 90vw;
  `;
  return wrapper;
}

/**
 * Create perspective container for 3D transforms
 * @returns {HTMLElement}
 * 
 * TESTABLE: Returns container with perspective
 */
function createPerspectiveContainer() {
  const perspectiveDiv = document.createElement('div');
  perspectiveDiv.style.cssText = `
    perspective: 1200px;
    perspective-origin: center center;
    max-width: 400px;
    width: clamp(250px, 60vw, 400px);
  `;
  return perspectiveDiv;
}

/**
 * Create card element for modal
 * @param {Object} card - Card data
 * @returns {HTMLElement}
 * 
 * TESTABLE: Returns card with proper class
 */
function createCardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = `card rarity-${card.rarity}`;
  cardDiv.style.transformStyle = 'preserve-3d';
  return cardDiv;
}

/**
 * Create flip button
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement}
 * 
 * TESTABLE: Returns button element
 */
function createFlipButton(onClick) {
  const flipBtn = document.createElement('button');
  flipBtn.textContent = '🔄 Flip Card';
  flipBtn.style.cssText = 'padding:0.75rem 1.5rem;font-size:1rem;';
  flipBtn.onclick = (e) => {
    onClick();
    e.stopPropagation();
  };
  return flipBtn;
}

/**
 * Check if modal is currently open
 * @returns {boolean}
 * 
 * TESTABLE: Simple state check
 */
export function isModalOpen() {
  const modal = document.getElementById('cardViewModal');
  return modal && modal.style.display === 'flex';
}
