/**
 * MTG Pocket - Utility Functions (ENHANCED HOLOGRAPHIC SYSTEM)
 * 
 * Helper functions with advanced holographic effects inspired by hover-tilt library.
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
 * Create advanced LCH-inspired gradient with smooth color transitions
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
  
  // Create gradient with smooth transitions
  return `radial-gradient(
    farthest-corner circle at var(--gradient-x) var(--gradient-y),
    hsla(${hue}, ${config.center.chroma * 10}%, ${config.center.lightness}%, ${centerAlpha}) 8%,
    hsla(${hue}, ${config.mid.chroma * 10}%, ${config.mid.lightness}%, ${midAlpha}) 28%,
    hsla(${hue}, ${config.edge.chroma * 10}%, ${config.edge.lightness}%, ${edgeAlpha}) 90%
  )`;
}

/**
 * Create dynamic shadow based on tilt position
 * @param {number} shadowX - Shadow X offset (-1 to 1)
 * @param {number} shadowY - Shadow Y offset (-1 to 1)
 * @param {number} opacity - Current activation opacity (0-1)
 * @returns {string} - CSS box-shadow string
 */
function createDynamicShadow(shadowX, shadowY, opacity) {
  if (!GLARE_CONFIG.shadowEnabled) return 'none';
  
  const blur = GLARE_CONFIG.shadowBlur;
  const offset = GLARE_CONFIG.shadowOffsetMultiplier;
  const shadowOpacity = GLARE_CONFIG.shadowOpacity * opacity;
  
  const offsetX = shadowX * blur * offset;
  const offsetY = shadowY * blur * offset / 2 + blur / 4;
  const blurRadius = blur / 2;
  const spread = blur * -0.25;
  
  return `
    ${offsetX}px ${offsetY}px ${blurRadius}px ${spread}px rgba(0, 0, 0, ${shadowOpacity * 0.5}),
    ${offsetX / 2}px ${offsetY / 2}px ${blurRadius / 2}px ${spread / 2}px rgba(0, 0, 0, ${shadowOpacity * 0.3})
  `;
}

/**
 * Enable enhanced 3D tilt effect with advanced holographic glare
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
  
  // Create glare overlay if it doesn't exist
  let glare = element.querySelector('.holo-glare');
  if (!glare) {
    glare = document.createElement('div');
    glare.className = 'holo-glare';
    glare.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      overflow: hidden;
      z-index: 10;
      border-radius: inherit;
      mix-blend-mode: ${GLARE_CONFIG.blendMode};
    `;
    
    element.style.position = 'relative';
    element.appendChild(glare);
  }
  
  // State for tracking activation
  let isActive = false;
  let currentOpacity = 0;
  let currentScale = 1;
  
  // Animation frame for smooth updates
  let rafId = null;
  
  // Mouse movement handler
  element.onmousemove = (e) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    // Calculate rotation with max degrees from config
    const rotateX = -centerY * GLARE_CONFIG.maxTiltDegrees;
    const rotateY = centerX * GLARE_CONFIG.maxTiltDegrees;
    
    // Target values
    const targetOpacity = GLARE_CONFIG.glareOpacity;
    const targetScale = GLARE_CONFIG.scaleOnHover;
    
    // Smooth animation
    if (rafId) cancelAnimationFrame(rafId);
    
    const animate = () => {
      // Ease towards target
      currentOpacity += (targetOpacity - currentOpacity) * 0.15;
      currentScale += (targetScale - currentScale) * 0.15;
      
      // Calculate shadow offset
      const shadowX = x * 2 - 1;
      const shadowY = y * 2 - 1;
      
      // Apply 3D transform with GPU acceleration
      const transform = GLARE_CONFIG.useGPUAcceleration
        ? `scale(${currentScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, ${GLARE_CONFIG.translateZ}px)`
        : `scale(${currentScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      element.style.transform = transform;
      element.style.transformStyle = 'preserve-3d';
      
      // Apply dynamic shadow
      if (GLARE_CONFIG.shadowEnabled) {
        element.style.boxShadow = createDynamicShadow(shadowX, shadowY, currentOpacity);
      }
      
      // Update glare gradient and position
      glare.style.background = createAdvancedGradient(intensity, hue);
      glare.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
      glare.style.backgroundSize = `${GLARE_CONFIG.glareSize}px ${GLARE_CONFIG.glareSize}px`;
      glare.style.opacity = currentOpacity;
      
      // Set CSS custom properties for advanced effects
      element.style.setProperty('--gradient-x', `${x * 100}%`);
      element.style.setProperty('--gradient-y', `${y * 100}%`);
      element.style.setProperty('--shadow-x', shadowX);
      element.style.setProperty('--shadow-y', shadowY);
      
      // Continue animation if not at target
      if (Math.abs(currentOpacity - targetOpacity) > 0.01 || 
          Math.abs(currentScale - targetScale) > 0.001) {
        rafId = requestAnimationFrame(animate);
      }
    };
    
    isActive = true;
    animate();
  };
  
  // Mouse leave handler with smooth exit
  element.onmouseleave = () => {
    isActive = false;
    
    if (rafId) cancelAnimationFrame(rafId);
    
    const animateOut = () => {
      // Ease back to rest state
      currentOpacity *= 0.85;
      currentScale += (1 - currentScale) * 0.15;
      
      element.style.transform = `scale(${currentScale})`;
      glare.style.opacity = currentOpacity;
      
      if (GLARE_CONFIG.shadowEnabled) {
        const shadowOpacity = currentOpacity * GLARE_CONFIG.shadowOpacity;
        element.style.boxShadow = `0 4px 12px rgba(0, 0, 0, ${shadowOpacity * 0.3})`;
      }
      
      // Continue until fully reset
      if (currentOpacity > 0.01 || Math.abs(currentScale - 1) > 0.001) {
        rafId = requestAnimationFrame(animateOut);
      } else {
        element.style.transform = '';
        element.style.boxShadow = '';
        glare.style.opacity = '0';
      }
    };
    
    animateOut();
  };
  
  // Touch support
  element.ontouchmove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    const rotateX = -centerY * GLARE_CONFIG.maxTiltDegrees;
    const rotateY = centerX * GLARE_CONFIG.maxTiltDegrees;
    
    const transform = GLARE_CONFIG.useGPUAcceleration
      ? `scale(${GLARE_CONFIG.scaleOnHover}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, ${GLARE_CONFIG.translateZ}px)`
      : `scale(${GLARE_CONFIG.scaleOnHover}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    element.style.transform = transform;
    
    glare.style.background = createAdvancedGradient(intensity, hue);
    glare.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
    glare.style.backgroundSize = `${GLARE_CONFIG.glareSize}px ${GLARE_CONFIG.glareSize}px`;
    glare.style.opacity = GLARE_CONFIG.glareOpacity;
  };
  
  element.ontouchend = () => {
    element.style.transform = '';
    glare.style.opacity = '0';
  };
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
