/**
 * MTG Pocket - Utility Functions (REFACTORED)
 * 
 * Consolidated holographic effect with cleaner separation of concerns.
 * Extracted configuration, reduced duplication.
 */

import { RARITY_THRESHOLDS, MTG_CARD_BACK, GLARE_CONFIG } from './constants.js';

// ===== RARITY ROLLING =====

export function rollRarity() {
  const roll = Math.random() * 100;
  if (roll < RARITY_THRESHOLDS.mythic) return 'mythic';
  if (roll < RARITY_THRESHOLDS.rare) return 'rare';
  if (roll < RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

// ===== CARD IMAGE EXTRACTION =====

export function getCardImages(card) {
  // Single-faced card with top-level image_uris
  if (card.image_uris) {
    return {
      front: card.image_uris.normal,
      back: card.card_faces?.[1]?.image_uris?.normal || MTG_CARD_BACK
    };
  }
  
  // Multi-faced card with images in card_faces
  if (card.card_faces?.[0]?.image_uris) {
    return {
      front: card.card_faces[0].image_uris.normal,
      back: card.card_faces[1]?.image_uris?.normal || MTG_CARD_BACK
    };
  }
  
  // Fallback
  return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
}

export function isDoubleFaced(backImg) {
  return backImg && backImg !== MTG_CARD_BACK;
}

// ===== TIME FORMATTING =====

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== HOLOGRAPHIC EFFECT SYSTEM =====

/**
 * Enable holographic tilt effect on a card element
 * ONLY called from card modal - never in collection
 */
export function enableTilt(element, cardData = {}) {
  const config = new HolographicConfig(cardData);
  const renderer = new HolographicRenderer(element, config);
  const controller = new HolographicController(element, renderer, config);
  controller.initialize();
}

// ===== HOLOGRAPHIC CONFIGURATION =====

class HolographicConfig {
  constructor(cardData) {
    this.cardData = cardData;
    this.intensity = this.calculateIntensity();
    this.hue = this.calculateHue();
  }
  
  calculateIntensity() {
    if (this.cardData.masterpiece) return GLARE_CONFIG.rarityIntensity.masterpiece;
    if (this.cardData.fullart) return GLARE_CONFIG.rarityIntensity.fullart;
    return GLARE_CONFIG.rarityIntensity[this.cardData.rarity] || GLARE_CONFIG.rarityIntensity.common;
  }
  
  calculateHue() {
    const hueMap = { mythic: 30, rare: 220, uncommon: 150, common: 270 };
    return hueMap[this.cardData.rarity] || 270;
  }
  
  getSensitivity(isMobile) {
    return isMobile ? 2.0 : 1.0;
  }
  
  getGradient() {
    const { center, mid, edge } = GLARE_CONFIG.glareGradient;
    const i = this.intensity;
    
    return `radial-gradient(
      farthest-corner circle at var(--gradient-x, 50%) var(--gradient-y, 50%),
      hsla(${this.hue}, ${center.chroma * 10}%, ${center.lightness}%, ${center.alpha * i}) 8%,
      hsla(${this.hue}, ${mid.chroma * 10}%, ${mid.lightness}%, ${mid.alpha * i}) 28%,
      hsla(${this.hue}, ${edge.chroma * 10}%, ${edge.lightness}%, ${edge.alpha * i}) 90%
    )`;
  }
}

// ===== HOLOGRAPHIC RENDERER =====

class HolographicRenderer {
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.shadowLayer = null;
    this.glareLayer = null;
    this.cardInner = element.querySelector('.card-inner');
    
    this.setupLayers();
  }
  
  setupLayers() {
    // Set perspective
    this.element.style.perspective = `${GLARE_CONFIG.perspective}px`;
    
    // Create shadow layer
    this.shadowLayer = this.createShadowLayer();
    this.element.appendChild(this.shadowLayer);
    
    // Create glare layer
    this.glareLayer = this.createGlareLayer();
    this.element.appendChild(this.glareLayer);
  }
  
  createShadowLayer() {
    const layer = document.createElement('div');
    layer.className = 'holo-shadow';
    layer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      z-index: -1;
      transition: none;
      will-change: box-shadow;
    `;
    return layer;
  }
  
  createGlareLayer() {
    const layer = document.createElement('div');
    layer.className = 'holo-glare';
    layer.style.cssText = `
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
    layer.style.backgroundImage = this.config.getGradient();
    return layer;
  }
  
  render(state) {
    this.renderTransform(state);
    this.renderGradientPosition(state);
    this.renderShadow(state);
    this.renderGlareOpacity(state);
  }
  
  renderTransform(state) {
    const transform = GLARE_CONFIG.useGPUAcceleration
      ? `scale(${state.scale}) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) translate3d(0, 0, ${GLARE_CONFIG.translateZ}px)`
      : `scale(${state.scale}) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`;
    
    this.element.style.transform = transform;
    this.element.style.transformStyle = 'preserve-3d';
  }
  
  renderGradientPosition(state) {
    this.element.style.setProperty('--gradient-x', `${state.x * 100}%`);
    this.element.style.setProperty('--gradient-y', `${state.y * 100}%`);
  }
  
  renderShadow(state) {
    if (!GLARE_CONFIG.shadowEnabled) return;
    
    const shadowX = state.x * 2 - 1;
    const shadowY = state.y * 2 - 1;
    const blur = GLARE_CONFIG.shadowBlur;
    const opacity = GLARE_CONFIG.shadowOpacity * state.opacity;
    
    const shadow1 = this.createShadowString(shadowX * blur * 1.5, shadowY * blur * 0.75 + blur / 3, blur, opacity * 0.4);
    const shadow2 = this.createShadowString(shadowX * blur * 0.75, shadowY * blur * 0.375 + blur / 6, blur / 2, opacity * 0.3);
    
    this.shadowLayer.style.boxShadow = `${shadow1}, ${shadow2}`;
  }
  
  createShadowString(x, y, blur, opacity) {
    return `${x}px ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`;
  }
  
  renderGlareOpacity(state) {
    this.glareLayer.style.opacity = state.opacity;
  }
  
  reset() {
    this.element.style.transform = '';
    this.shadowLayer.style.boxShadow = '';
    this.glareLayer.style.opacity = '0';
  }
}

// ===== HOLOGRAPHIC CONTROLLER =====

class HolographicController {
  constructor(element, renderer, config) {
    this.element = element;
    this.renderer = renderer;
    this.config = config;
    
    this.state = {
      isActive: false,
      currentOpacity: 0,
      currentScale: 1,
      rafId: null
    };
  }
  
  initialize() {
    this.element.style.touchAction = 'none';
    this.element.style.pointerEvents = 'auto';
    
    this.element.addEventListener('pointerenter', (e) => this.onPointerEnter(e));
    this.element.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.element.addEventListener('pointerleave', () => this.onPointerLeave());
    this.element.addEventListener('pointercancel', () => this.onPointerLeave());
  }
  
  onPointerEnter(e) {
    const { x, y } = this.getPointerPosition(e);
    this.updateCard(x, y, e.pointerType);
  }
  
  onPointerMove(e) {
    if (!this.state.isActive) return;
    e.preventDefault();
    
    const { x, y } = this.getPointerPosition(e);
    this.updateCard(x, y, e.pointerType);
  }
  
  onPointerLeave() {
    this.resetCard();
  }
  
  getPointerPosition(e) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    };
  }
  
  updateCard(x, y, pointerType) {
    const isMobile = pointerType === 'touch' || pointerType === 'pen';
    const sensitivity = this.config.getSensitivity(isMobile);
    
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    const rotateX = -centerY * GLARE_CONFIG.maxTiltDegrees * sensitivity;
    const rotateY = centerX * GLARE_CONFIG.maxTiltDegrees * sensitivity;
    
    const renderState = {
      x, y,
      rotateX, rotateY,
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    };
    
    if (isMobile) {
      // Immediate update for touch
      this.state.currentOpacity = renderState.opacity;
      this.state.currentScale = renderState.scale;
      this.renderer.render(renderState);
    } else {
      // Animated update for mouse
      this.animateToState(renderState);
    }
    
    this.state.isActive = true;
  }
  
  animateToState(targetState) {
    if (this.state.rafId) cancelAnimationFrame(this.state.rafId);
    
    const animate = () => {
      const ease = 0.2;
      this.state.currentOpacity += (targetState.opacity - this.state.currentOpacity) * ease;
      this.state.currentScale += (targetState.scale - this.state.currentScale) * ease;
      
      const renderState = {
        ...targetState,
        opacity: this.state.currentOpacity,
        scale: this.state.currentScale
      };
      
      this.renderer.render(renderState);
      
      if (Math.abs(this.state.currentOpacity - targetState.opacity) > 0.01 || 
          Math.abs(this.state.currentScale - targetState.scale) > 0.001) {
        this.state.rafId = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  resetCard() {
    this.state.isActive = false;
    if (this.state.rafId) cancelAnimationFrame(this.state.rafId);
    
    const animateOut = () => {
      this.state.currentOpacity *= 0.85;
      this.state.currentScale += (1 - this.state.currentScale) * 0.15;
      
      this.renderer.render({
        x: 0.5, y: 0.5,
        rotateX: 0, rotateY: 0,
        scale: this.state.currentScale,
        opacity: this.state.currentOpacity
      });
      
      if (this.state.currentOpacity > 0.01 || Math.abs(this.state.currentScale - 1) > 0.001) {
        this.state.rafId = requestAnimationFrame(animateOut);
      } else {
        this.renderer.reset();
      }
    };
    
    animateOut();
  }
}

// ===== ARRAY UTILITIES =====

export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function randomChance(probability) {
  return Math.random() < probability;
}

// ===== DOM UTILITIES =====

export function createElement(tag, classes = [], textContent = '') {
  const element = document.createElement(tag);
  
  if (typeof classes === 'string') classes = [classes];
  classes.forEach(className => element.classList.add(className));
  
  if (textContent) element.textContent = textContent;
  
  return element;
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== COLLECTION UTILITIES =====

export function groupCardsByName(cardsObject) {
  const grouped = {};
  Object.values(cardsObject).forEach(card => {
    if (!grouped[card.name]) grouped[card.name] = [];
    grouped[card.name].push(card);
  });
  return grouped;
}

export function calculateCollectionStats(ownedCards, allCards) {
  const stats = {
    common: { owned: 0, total: 0 },
    uncommon: { owned: 0, total: 0 },
    rare: { owned: 0, total: 0 },
    mythic: { owned: 0, total: 0 }
  };
  
  // Count totals
  allCards.forEach(card => {
    if (stats[card.rarity]) stats[card.rarity].total++;
  });
  
  // Count owned (only non-fullart variants)
  const ownedNames = new Set();
  Object.values(ownedCards).forEach(card => {
    if (card.fullart === false && !ownedNames.has(card.name)) {
      if (stats[card.rarity]) stats[card.rarity].owned++;
      ownedNames.add(card.name);
    }
  });
  
  return stats;
}

export function calculatePercentage(owned, total) {
  if (total === 0) return 0;
  return Math.round((owned / total) * 100);
}
