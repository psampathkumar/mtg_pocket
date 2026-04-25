/**
 * MTG Pocket - Holographic Effect (Main API)
 * 
 * Public API for enabling/disabling holographic effects on cards.
 * Single responsibility: Coordinate holographic modules.
 * 
 * TESTABLE: Simple orchestration, minimal logic.
 */

import { device } from './device-detector.js';
import { HolographicConfig } from './holographic-config.js';
import { HolographicRenderer } from './holographic-renderer.js';
import { createInputHandler } from './holographic-input.js';

/**
 * Enable holographic tilt effect on a card element
 * @param {HTMLElement} element - Card element to apply effect to
 * @param {Object} cardData - Card data (rarity, fullart, masterpiece flags)
 * 
 * TESTABLE: Can mock all dependencies
 */
export function enableTilt(element, cardData = {}) {
  console.log('✨ Enabling tilt...');
  
  // Create configuration
  const config = new HolographicConfig(cardData);
  
  // Create renderer
  const renderer = new HolographicRenderer(element, config);
  
  // Create and initialize input handler
  const inputHandler = createInputHandler(element, renderer, config, device);
  inputHandler.initialize();
  
  // Store reference for cleanup
  element._holoInputHandler = inputHandler;
  
  console.log(device.isMobile ? '📱 Glare-only touch' : '🖱️ Pointer tilt (15° max)');
}

/**
 * Disable holographic effect on a card element
 * @param {HTMLElement} element - Card element
 * 
 * TESTABLE: Simple cleanup
 */
export function disableTilt(element) {
  if (element._holoInputHandler) {
    element._holoInputHandler.destroy();
    delete element._holoInputHandler;
  }
}

/**
 * Check if holographic effect is enabled on an element
 * @param {HTMLElement} element - Card element
 * @returns {boolean}
 * 
 * TESTABLE: Simple check
 */
export function isTiltEnabled(element) {
  return !!element._holoInputHandler;
}

/**
 * Get device information
 * @returns {Object} - Device capabilities summary
 * 
 * TESTABLE: Returns device state
 */
export function getDeviceInfo() {
  return device.getSummary();
}

/**
 * Re-export device for convenience
 */
export { device };
