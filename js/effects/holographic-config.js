/**
 * MTG Pocket - Holographic Configuration Module
 * 
 * Calculates holographic effect parameters based on card data.
 * Single responsibility: Configuration calculation only.
 * 
 * TESTABLE: All calculations are pure functions.
 */

import { GLARE_CONFIG } from '../constants.js';

/**
 * Holographic configuration class
 * Calculates intensity, hue, and gradient based on card properties
 */
export class HolographicConfig {
  /**
   * @param {Object} cardData - Card data with rarity, fullart, masterpiece flags
   */
  constructor(cardData = {}) {
    this.cardData = cardData;
    this.intensity = this.calculateIntensity();
    this.hue = this.calculateHue();
  }
  
  /**
   * Calculate glare intensity based on card rarity and special flags
   * @returns {number} - Intensity multiplier
   * 
   * TESTABLE: Pure calculation based on card data
   */
  calculateIntensity() {
    // Masterpiece > Full-art > Rarity-based
    if (this.cardData.masterpiece) {
      return GLARE_CONFIG.rarityIntensity.masterpiece;
    }
    
    if (this.cardData.fullart) {
      return GLARE_CONFIG.rarityIntensity.fullart;
    }
    
    const rarity = this.cardData.rarity || 'common';
    return GLARE_CONFIG.rarityIntensity[rarity] || GLARE_CONFIG.rarityIntensity.common;
  }
  
  /**
   * Calculate hue based on card rarity
   * @returns {number} - Hue value (0-360)
   * 
   * TESTABLE: Pure function with hue map
   */
  calculateHue() {
    const hueMap = {
      mythic: 30,     // Orange
      rare: 220,      // Blue
      uncommon: 150,  // Green
      common: 270     // Purple
    };
    
    const rarity = this.cardData.rarity || 'common';
    return hueMap[rarity] || hueMap.common;
  }
  
  /**
   * Generate CSS gradient string for glare effect
   * @returns {string} - CSS radial-gradient
   * 
   * TESTABLE: Returns predictable CSS string
   */
  getGradient() {
    const { center, mid, edge } = GLARE_CONFIG.glareGradient;
    const i = this.intensity;
    const h = this.hue;
    
    return `radial-gradient(
      farthest-corner circle at var(--gradient-x, 50%) var(--gradient-y, 50%),
      hsla(${h}, ${center.chroma * 10}%, ${center.lightness}%, ${center.alpha * i}) 8%,
      hsla(${h}, ${mid.chroma * 10}%, ${mid.lightness}%, ${mid.alpha * i}) 28%,
      hsla(${h}, ${edge.chroma * 10}%, ${edge.lightness}%, ${edge.alpha * i}) 90%
    )`;
  }
  
  /**
   * Get configuration summary for debugging
   * @returns {Object}
   * 
   * TESTABLE: Returns all config values
   */
  getSummary() {
    return {
      cardData: this.cardData,
      intensity: this.intensity,
      hue: this.hue,
      gradient: this.getGradient()
    };
  }
}

/**
 * Create a configuration from card data
 * @param {Object} cardData - Card data object
 * @returns {HolographicConfig}
 * 
 * TESTABLE: Factory function for easy testing
 */
export function createConfig(cardData) {
  return new HolographicConfig(cardData);
}

/**
 * Calculate intensity for a specific card type
 * @param {string} rarity - Card rarity
 * @param {boolean} isFullArt - Is full-art card
 * @param {boolean} isMasterpiece - Is masterpiece card
 * @returns {number} - Intensity multiplier
 * 
 * TESTABLE: Pure function with explicit parameters
 */
export function calculateIntensityFor(rarity, isFullArt = false, isMasterpiece = false) {
  const cardData = {
    rarity,
    fullart: isFullArt,
    masterpiece: isMasterpiece
  };
  
  const config = new HolographicConfig(cardData);
  return config.intensity;
}

/**
 * Calculate hue for a specific rarity
 * @param {string} rarity - Card rarity
 * @returns {number} - Hue value (0-360)
 * 
 * TESTABLE: Pure function
 */
export function calculateHueFor(rarity) {
  const config = new HolographicConfig({ rarity });
  return config.hue;
}

/**
 * Validate card data for holographic effect
 * @param {Object} cardData - Card data to validate
 * @returns {boolean}
 * 
 * TESTABLE: Simple validation
 */
export function isValidCardData(cardData) {
  if (!cardData || typeof cardData !== 'object') return false;
  
  const validRarities = ['common', 'uncommon', 'rare', 'mythic'];
  const hasValidRarity = !cardData.rarity || validRarities.includes(cardData.rarity);
  
  return hasValidRarity;
}
