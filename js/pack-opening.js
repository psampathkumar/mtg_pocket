/**
 * MTG Pocket - Pack Opening (Phase 3 - Refactored)
 * 
 * Thin wrapper that re-exports from specialized modules.
 * This file maintains backwards compatibility while delegating to new modules.
 * 
 * REFACTORED: Split into 2 focused modules:
 * - pack-generator.js: Pack generation logic
 * - pack-opener.js: High-level opening flow
 */

// Re-export pack opener functions
export {
  canOpenPack,
  openPack,
  processPackCards,
  isCardOwned,
  ensureCardExists,
  getPackOpeningStats
} from './game-logic/pack-opener.js';

// Re-export pack generator functions
export {
  generatePack,
  generateGodPack,
  generateRegularPack,
  tryAddBonusCard,
  selectRandomCard,
  createCardData,
  validateCardPools,
  calculatePackStats
} from './game-logic/pack-generator.js';
