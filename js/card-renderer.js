/**
 * MTG Pocket - Card Renderer (Phase 2 - Refactored)
 * 
 * Thin wrapper that re-exports from specialized modules.
 * This file maintains backwards compatibility while delegating to new modules.
 * 
 * REFACTORED: Split into 4 focused modules:
 * - card-factory.js: DOM creation
 * - card-modal.js: Single card detail view
 * - pack-modal.js: Pack opening modal
 * - pack-revealer.js: Card-by-card reveal
 */

// Re-export card factory functions
export {
  createCardElement,
  createPlaceholderElement,
  decorateCard,
  createCardInner,
  toggleFlip,
  applyBadges,
  applyEffects,
  createGlowElement
} from './rendering/card-factory.js';

// Re-export card modal functions
export {
  showCardModal,
  closeModal,
  isModalOpen
} from './rendering/card-modal.js';

// Re-export pack modal functions
export {
  showPackModal,
  closePackModal,
  isPackModalOpen,
  createGodPackHeader,
  createModalViews,
  separateCardsByType,
  setupModalCloseHandlers
} from './rendering/pack-modal.js';

// Re-export pack revealer class
export {
  PackRevealer
} from './rendering/pack-revealer.js';
