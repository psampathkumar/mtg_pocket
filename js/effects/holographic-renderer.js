/**
 * MTG Pocket - Holographic Renderer Module
 * 
 * Handles visual rendering of holographic effects (3D transform, glare, shadow).
 * Single responsibility: DOM manipulation for visual effects only.
 * 
 * TESTABLE: Minimal DOM dependencies, visual state is readable.
 */

import { GLARE_CONFIG } from '../constants.js';

/**
 * Holographic renderer class
 * Manages DOM elements and applies visual transforms
 */
export class HolographicRenderer {
  /**
   * @param {HTMLElement} element - Card element to apply effects to
   * @param {HolographicConfig} config - Configuration object
   */
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.shadowLayer = null;
    this.glareLayer = null;
    this.setupLayers();
  }
  
  /**
   * Create and attach shadow and glare layers
   * 
   * TESTABLE: Check if layers are created
   */
  setupLayers() {
    // Set perspective on card element
    this.element.style.perspective = `${GLARE_CONFIG.perspective}px`;
    
    // Create shadow layer
    this.shadowLayer = this.createShadowLayer();
    this.element.appendChild(this.shadowLayer);
    
    // Create glare layer
    this.glareLayer = this.createGlareLayer();
    this.element.appendChild(this.glareLayer);
  }
  
  /**
   * Create shadow layer element
   * @returns {HTMLElement}
   * 
   * TESTABLE: Returns element with specific styles
   */
  createShadowLayer() {
    const layer = document.createElement('div');
    layer.className = 'holo-shadow';
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      z-index: -1;
    `;
    return layer;
  }
  
  /**
   * Create glare layer element
   * @returns {HTMLElement}
   * 
   * TESTABLE: Returns element with gradient
   */
  createGlareLayer() {
    const layer = document.createElement('div');
    layer.className = 'holo-glare';
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      border-radius: inherit;
      mix-blend-mode: ${GLARE_CONFIG.blendMode};
      z-index: 5;
    `;
    layer.style.backgroundImage = this.config.getGradient();
    return layer;
  }
  
  /**
   * Render visual state
   * @param {Object} state - { x, y, rotateX, rotateY, scale, opacity }
   * 
   * TESTABLE: State changes are observable in DOM
   */
  render(state) {
    // Apply 3D transform to card element
    const transform = `scale(${state.scale}) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`;
    this.element.style.transform = transform;
    this.element.style.transformStyle = 'preserve-3d';
    
    // Update gradient position
    this.element.style.setProperty('--gradient-x', `${state.x * 100}%`);
    this.element.style.setProperty('--gradient-y', `${state.y * 100}%`);
    
    // Update shadow
    if (GLARE_CONFIG.shadowEnabled) {
      this.renderShadow(state);
    }
    
    // Update glare opacity
    this.glareLayer.style.opacity = state.opacity;
  }
  
  /**
   * Render dynamic shadow based on tilt
   * @param {Object} state - Visual state
   * 
   * TESTABLE: Shadow values are calculable
   */
  renderShadow(state) {
    const shadowX = state.x * 2 - 1;  // Convert 0-1 to -1 to 1
    const shadowY = state.y * 2 - 1;
    const blur = GLARE_CONFIG.shadowBlur;
    const opacity = GLARE_CONFIG.shadowOpacity * state.opacity;
    
    const shadow1 = `${shadowX * blur * 1.5}px ${shadowY * blur * 0.75 + blur / 3}px ${blur}px rgba(0,0,0,${opacity * 0.4})`;
    const shadow2 = `${shadowX * blur * 0.75}px ${shadowY * blur * 0.375 + blur / 6}px ${blur / 2}px rgba(0,0,0,${opacity * 0.3})`;
    
    this.shadowLayer.style.boxShadow = `${shadow1}, ${shadow2}`;
  }
  
  /**
   * Reset all visual effects
   * 
   * TESTABLE: All styles return to default
   */
  reset() {
    this.element.style.transform = '';
    this.shadowLayer.style.boxShadow = '';
    this.glareLayer.style.opacity = '0';
  }
  
  /**
   * Remove all effect layers
   * 
   * TESTABLE: Layers are removed from DOM
   */
  destroy() {
    if (this.shadowLayer && this.shadowLayer.parentNode) {
      this.shadowLayer.parentNode.removeChild(this.shadowLayer);
    }
    if (this.glareLayer && this.glareLayer.parentNode) {
      this.glareLayer.parentNode.removeChild(this.glareLayer);
    }
    this.reset();
  }
  
  /**
   * Get current visual state (for testing)
   * @returns {Object}
   * 
   * TESTABLE: Readable state
   */
  getState() {
    return {
      transform: this.element.style.transform,
      gradientX: this.element.style.getPropertyValue('--gradient-x'),
      gradientY: this.element.style.getPropertyValue('--gradient-y'),
      glareOpacity: this.glareLayer.style.opacity,
      shadow: this.shadowLayer.style.boxShadow
    };
  }
}

/**
 * Create a renderer instance
 * @param {HTMLElement} element - Card element
 * @param {HolographicConfig} config - Configuration
 * @returns {HolographicRenderer}
 * 
 * TESTABLE: Factory function
 */
export function createRenderer(element, config) {
  return new HolographicRenderer(element, config);
}
