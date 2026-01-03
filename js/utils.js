/**
 * MTG Pocket - Utility Functions (FINAL HOLOGRAPHIC FIX)
 * 
 * Systematic fixes for:
 * 1. Mobile tilt responsiveness (increased sensitivity for touch)
 * 2. Shadow layer separation (doesn't affect flip)
 */

import { RARITY_THRESHOLDS, MTG_CARD_BACK, GLARE_CONFIG } from './constants.js';

// ===== RARITY ROLLING =====

/**
 * Roll for a random card rarity based on configured probabilities
 * @returns {string} - 'common', 'uncommon', 'rare', or 'mythic'
 */
export function rollRarity() {
  const roll = Math.random() * 100;
  
  if (roll < RARITY_THRESHOLDS.mythic) return 'mythic';
  if (roll < RARITY_THRESHOLDS.rare) return 'rare';
  if (roll < RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

// ===== CARD IMAGE EXTRACTION =====

/**
 * Extract front and back images from a Scryfall card object
 * Handles both single-faced and multi-faced cards
 * @param {Object} card - Scryfall card object
 * @returns {Object} - { front: string, back: string }
 */
export function getCardImages(card) {
  // Single-faced card with top-level image_uris
  if (card.image_uris) {
    const front = card.image_uris.normal;
    const back = card.card_faces && 
                 card.card_faces.length > 1 && 
                 card.card_faces[1].image_uris
      ? card.card_faces[1].image_uris.normal
      : MTG_CARD_BACK;
    
    return { front, back };
  }
  
  // Multi-faced card with images in card_faces
  if (card.card_faces && card.card_faces.length > 0) {
    const front = card.card_faces[0].image_uris
      ? card.card_faces[0].image_uris.normal
      : MTG_CARD_BACK;
    
    const back = card.card_faces.length > 1 && card.card_faces[1].image_uris
      ? card.card_faces[1].image_uris.normal
      : MTG_CARD_BACK;
    
    return { front, back };
  }
  
  // Fallback if no images found
  return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
}

/**
 * Check if a card has a non-standard back (i.e., is double-faced)
 * @param {string} backImg - The back image URL
 * @returns {boolean}
 */
export function isDoubleFaced(backImg) {
  return backImg && backImg !== MTG_CARD_BACK;
}

// ===== TIME FORMATTING =====

/**
 * Format milliseconds into MM:SS format
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time string (e.g., "05:30")
 */
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== ENHANCED HOLOGRAPHIC CARD INTERACTIONS =====

/**
 * Get glare intensity multiplier based on card properties
 * @param {Object} card - Card data object
 * @returns {number} - Intensity multiplier
 */
function getGlareIntensity(card) {
  if (card.masterpiece) return GLARE_CONFIG.rarityIntensity.masterpiece;
  if (card.fullart) return GLARE_CONFIG.rarityIntensity.fullart;
  if (card.rarity === 'mythic') return GLARE_CONFIG.rarityIntensity.mythic;
  if (card.rarity === 'rare') return GLARE_CONFIG.rarityIntensity.rare;
  if (card.rarity === 'uncommon') return GLARE_CONFIG.rarityIntensity.uncommon;
  return GLARE_CONFIG.rarityIntensity.common;
}

/**
 * Create advanced gradient CSS (properly structured like library)
 * @param {number} intensity - Intensity multiplier (0-2)
 * @param {number} hue - Hue value in degrees (0-360)
 * @returns {string} - CSS gradient string
 */
function createAdvancedGradient(intensity, hue = 270) {
  const config = GLARE_CONFIG.glareGradient;
  
  // Calculate colors with intensity multiplier
  const centerAlpha = config.center.alpha * intensity;
  const midAlpha = config.mid.alpha * intensity;
  const edgeAlpha = config.edge.alpha * intensity;
  
  // Create gradient with CSS variables for position (like library does)
  return `radial-gradient(
    farthest-corner circle at var(--gradient-x, 50%) var(--gradient-y, 50%),
    hsla(${hue}, ${config.center.chroma * 10}%, ${config.center.lightness}%, ${centerAlpha}) 8%,
    hsla(${hue}, ${config.mid.chroma * 10}%, ${config.mid.lightness}%, ${midAlpha}) 28%,
    hsla(${hue}, ${config.edge.chroma * 10}%, ${config.edge.lightness}%, ${edgeAlpha}) 90%
  )`;
}

/**
 * Enable enhanced 3D tilt effect with advanced holographic glare
 * SYSTEMATIC FIXES:
 * 1. Increased touch sensitivity (2x multiplier for mobile)
 * 2. Shadow on separate layer (doesn't affect flip transform)
 * 3. Immediate visual feedback (no lag)
 * 
 * @param {HTMLElement} element - The card element to add tilt to
 * @param {Object} cardData - Card data for intensity calculation
 */
export function enableTilt(element, cardData = {}) {
  // Set perspective on parent for better 3D effect
  element.style.perspective = `${GLARE_CONFIG.perspective}px`;
  
  // Find the card-inner element for 3D rotation
  const cardInner = element.querySelector('.card-inner');
  if (!cardInner) {
    console.warn('No .card-inner found, skipping tilt effect');
    return;
  }
  
  // Calculate intensity based on card rarity
  const intensity = getGlareIntensity(cardData);
  
  // Determine hue based on rarity
  const hueMap = {
    mythic: 30,      // Orange/gold
    rare: 220,       // Blue
    uncommon: 150,   // Green
    common: 270      // Purple
  };
  const hue = hueMap[cardData.rarity] || 270;
  
  // ✅ FIX #2: Create SEPARATE shadow layer (won't affect flip)
  let shadowLayer = element.querySelector('.holo-shadow');
  if (!shadowLayer) {
    shadowLayer = document.createElement('div');
    shadowLayer.className = 'holo-shadow';
    shadowLayer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      z-index: -1;
      transition: none;
      will-change: box-shadow;
    `;
    element.appendChild(shadowLayer);
  }
  
  // Create glare overlay if it doesn't exist
  let glare = element.querySelector('.holo-glare');
  if (!glare) {
    glare = document.createElement('div');
    glare.className = 'holo-glare';
    glare.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      border-radius: inherit;
      mix-blend-mode: ${GLARE_CONFIG.blendMode};
      will-change: opacity;
      z-index: 5;
    `;
    
    // Set gradient as background-image
    glare.style.backgroundImage = createAdvancedGradient(intensity, hue);
    
    element.style.position = 'relative';
    element.appendChild(glare);
  }
  
  // State tracking
  let isActive = false;
  let isTouchInput = false;
  let currentOpacity = 0;
  let currentScale = 1;
  let rafId = null;
  
  // Prevent default touch behaviors
  element.style.touchAction = 'none';
  
  /**
   * Update card transform and effects
   * ✅ FIX #1: Touch sensitivity multiplier for mobile
   */
  const updateCard = (x, y, pointerType) => {
    // ✅ FIX #1: Detect if touch input and apply 2x sensitivity
    const isMobile = pointerType === 'touch' || pointerType === 'pen';
    const sensitivityMultiplier = isMobile ? 2.0 : 1.0;
    
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    // Calculate rotation with increased sensitivity for mobile
    const rotateX = -centerY * GLARE_CONFIG.maxTiltDegrees * sensitivityMultiplier;
    const rotateY = centerX * GLARE_CONFIG.maxTiltDegrees * sensitivityMultiplier;
    
    // Target values
    const targetOpacity = GLARE_CONFIG.glareOpacity;
    const targetScale = GLARE_CONFIG.scaleOnHover;
    
    // ✅ IMMEDIATE UPDATE (no animation lag for touch)
    if (isMobile) {
      // Direct update for touch - instant response
      currentOpacity = targetOpacity;
      currentScale = targetScale;
      
      // Apply transform immediately
      const transform = GLARE_CONFIG.useGPUAcceleration
        ? `scale(${currentScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, ${GLARE_CONFIG.translateZ}px)`
        : `scale(${currentScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      element.style.transform = transform;
      element.style.transformStyle = 'preserve-3d';
      
      // Calculate shadow offset
      const shadowX = x * 2 - 1;
      const shadowY = y * 2 - 1;
      
      // Set CSS custom properties
      element.style.setProperty('--gradient-x', `${x * 100}%`);
      element.style.setProperty('--gradient-y', `${y * 100}%`);
      
      // ✅ FIX #2: Apply shadow to SEPARATE layer
      if (GLARE_CONFIG.shadowEnabled) {
        const blur = GLARE_CONFIG.shadowBlur;
        const shadowOpacity = GLARE_CONFIG.shadowOpacity;
        
        // More dramatic shadow for better visibility
        const offsetX1 = shadowX * blur * 1.5;
        const offsetY1 = shadowY * blur * 0.75 + blur / 3;
        const blur1 = blur;
        
        const offsetX2 = shadowX * blur * 0.75;
        const offsetY2 = shadowY * blur * 0.375 + blur / 6;
        const blur2 = blur / 2;
        
        shadowLayer.style.boxShadow = `
          ${offsetX1}px ${offsetY1}px ${blur1}px rgba(0, 0, 0, ${shadowOpacity * 0.4}),
          ${offsetX2}px ${offsetY2}px ${blur2}px rgba(0, 0, 0, ${shadowOpacity * 0.3})
        `;
      }
      
      // Update glare opacity
      glare.style.opacity = currentOpacity;
      
    } else {
      // Mouse input - smooth animation
      if (rafId) cancelAnimationFrame(rafId);
      
      const animate = () => {
        // Ease towards target
        const ease = 0.2; // Faster easing
        currentOpacity += (targetOpacity - currentOpacity) * ease;
        currentScale += (targetScale - currentScale) * ease;
        
        // Calculate shadow offset
        const shadowX = x * 2 - 1;
        const shadowY = y * 2 - 1;
        
        // Apply 3D transform
        const transform = GLARE_CONFIG.useGPUAcceleration
          ? `scale(${currentScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, ${GLARE_CONFIG.translateZ}px)`
          : `scale(${currentScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        element.style.transform = transform;
        element.style.transformStyle = 'preserve-3d';
        
        // Set CSS custom properties
        element.style.setProperty('--gradient-x', `${x * 100}%`);
        element.style.setProperty('--gradient-y', `${y * 100}%`);
        
        // ✅ FIX #2: Apply shadow to SEPARATE layer
        if (GLARE_CONFIG.shadowEnabled) {
          const blur = GLARE_CONFIG.shadowBlur;
          const shadowOpacity = GLARE_CONFIG.shadowOpacity * currentOpacity;
          
          const offsetX1 = shadowX * blur * 1.5;
          const offsetY1 = shadowY * blur * 0.75 + blur / 3;
          const blur1 = blur;
          
          const offsetX2 = shadowX * blur * 0.75;
          const offsetY2 = shadowY * blur * 0.375 + blur / 6;
          const blur2 = blur / 2;
          
          shadowLayer.style.boxShadow = `
            ${offsetX1}px ${offsetY1}px ${blur1}px rgba(0, 0, 0, ${shadowOpacity * 0.4}),
            ${offsetX2}px ${offsetY2}px ${blur2}px rgba(0, 0, 0, ${shadowOpacity * 0.3})
          `;
        }
        
        // Update glare opacity
        glare.style.opacity = currentOpacity;
        
        // Continue animation if not at target
        if (Math.abs(currentOpacity - targetOpacity) > 0.01 || 
            Math.abs(currentScale - targetScale) > 0.001) {
          rafId = requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
    
    isActive = true;
  };
  
  /**
   * Reset card to neutral state
   */
  const resetCard = () => {
    isActive = false;
    
    if (rafId) cancelAnimationFrame(rafId);
    
    const animateOut = () => {
      // Ease back to rest state
      currentOpacity *= 0.85;
      currentScale += (1 - currentScale) * 0.15;
      
      element.style.transform = `scale(${currentScale})`;
      glare.style.opacity = currentOpacity;
      
      // ✅ FIX #2: Reset shadow on separate layer
      if (GLARE_CONFIG.shadowEnabled) {
        const shadowOpacity = currentOpacity * GLARE_CONFIG.shadowOpacity;
        shadowLayer.style.boxShadow = `0 4px 12px rgba(0, 0, 0, ${shadowOpacity * 0.3})`;
      }
      
      // Continue until fully reset
      if (currentOpacity > 0.01 || Math.abs(currentScale - 1) > 0.001) {
        rafId = requestAnimationFrame(animateOut);
      } else {
        element.style.transform = '';
        shadowLayer.style.boxShadow = '';
        glare.style.opacity = '0';
      }
    };
    
    animateOut();
  };
  
  // ===== POINTER EVENTS (handles both mouse and touch) =====
  
  element.addEventListener('pointerenter', (e) => {
    isTouchInput = e.pointerType === 'touch' || e.pointerType === 'pen';
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    updateCard(x, y, e.pointerType);
  });
  
  element.addEventListener('pointermove', (e) => {
    if (!isActive) return;
    
    // Prevent default to avoid scroll on mobile
    e.preventDefault();
    
    isTouchInput = e.pointerType === 'touch' || e.pointerType === 'pen';
    
    const rect = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    updateCard(x, y, e.pointerType);
  });
  
  element.addEventListener('pointerleave', (e) => {
    resetCard();
  });
  
  element.addEventListener('pointercancel', (e) => {
    resetCard();
  });
  
  // Ensure pointer events are enabled
  element.style.pointerEvents = 'auto';
}

// ===== ARRAY UTILITIES =====

/**
 * Get a random element from an array
 * @param {Array} array - The array to pick from
 * @returns {*} - Random element from the array
 */
export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array (modifies in place)
 */
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ===== RANDOM CHANCE =====

/**
 * Check if a random chance succeeds
 * @param {number} probability - Probability as decimal (0.0 to 1.0)
 * @returns {boolean}
 */
export function randomChance(probability) {
  return Math.random() < probability;
}

// ===== DOM UTILITIES =====

/**
 * Create an element with classes and optional text content
 * @param {string} tag - HTML tag name
 * @param {string|Array} classes - Class name(s) to add
 * @param {string} textContent - Optional text content
 * @returns {HTMLElement}
 */
export function createElement(tag, classes = [], textContent = '') {
  const element = document.createElement(tag);
  
  if (typeof classes === 'string') {
    classes = [classes];
  }
  
  classes.forEach(className => element.classList.add(className));
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== CARD COLLECTION UTILITIES =====

/**
 * Group cards by name (to handle variants)
 * @param {Object} cardsObject - Object of cards from state
 * @returns {Object} - Object with card names as keys, arrays of variants as values
 */
export function groupCardsByName(cardsObject) {
  const grouped = {};
  
  Object.values(cardsObject).forEach(card => {
    if (!grouped[card.name]) {
      grouped[card.name] = [];
    }
    grouped[card.name].push(card);
  });
  
  return grouped;
}

/**
 * Calculate collection statistics
 * @param {Object} ownedCards - Object of owned cards
 * @param {Array} allCards - Array of all cards in set
 * @returns {Object} - Statistics object
 */
export function calculateCollectionStats(ownedCards, allCards) {
  const stats = {
    common: { owned: 0, total: 0 },
    uncommon: { owned: 0, total: 0 },
    rare: { owned: 0, total: 0 },
    mythic: { owned: 0, total: 0 }
  };
  
  // Count totals
  allCards.forEach(card => {
    if (stats[card.rarity]) {
      stats[card.rarity].total++;
    }
  });
  
  // Count owned (only non-fullart variants)
  const ownedNames = new Set();
  Object.values(ownedCards).forEach(card => {
    if (card.fullart === false && !ownedNames.has(card.name)) {
      if (stats[card.rarity]) {
        stats[card.rarity].owned++;
      }
      ownedNames.add(card.name);
    }
  });
  
  return stats;
}

/**
 * Calculate completion percentage
 * @param {number} owned - Number of owned items
 * @param {number} total - Total number of items
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(owned, total) {
  if (total === 0) return 0;
  return Math.round((owned / total) * 100);
}
