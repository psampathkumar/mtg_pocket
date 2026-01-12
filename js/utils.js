/**
 * MTG Pocket - Utility Functions (FLIP-AWARE HOLOGRAPHIC SYSTEM)
 * 
 * Fixed holographic effect to work correctly with flipped cards
 * - Tracks flip state
 * - Adjusts coordinates when flipped
 * - Works on both desktop and mobile
 */

import { RARITY_THRESHOLDS, MTG_CARD_BACK, GLARE_CONFIG } from './constants.js';

// ===== DEVICE DETECTION =====

class DeviceDetector {
  constructor() {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.hasGyro = typeof DeviceOrientationEvent !== 'undefined';
    this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.isAndroid = /Android/i.test(navigator.userAgent);
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    
    console.log('🔍 Device Detection:', {
      isMobile: this.isMobile,
      hasTouch: this.hasTouch,
      hasGyro: this.hasGyro,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      screen: `${this.screenWidth}x${this.screenHeight}`
    });
  }
  
  shouldUseGyroscope() {
    return this.isMobile && this.hasGyro;
  }
  
  requiresPermission() {
    return this.isIOS && typeof DeviceOrientationEvent.requestPermission === 'function';
  }
}

export const device = new DeviceDetector();

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
  if (card.image_uris) {
    return {
      front: card.image_uris.normal,
      back: card.card_faces?.[1]?.image_uris?.normal || MTG_CARD_BACK
    };
  }
  
  if (card.card_faces?.[0]?.image_uris) {
    return {
      front: card.card_faces[0].image_uris.normal,
      back: card.card_faces[1]?.image_uris?.normal || MTG_CARD_BACK
    };
  }
  
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

// ===== HOLOGRAPHIC EFFECT SYSTEM (FLIP-AWARE) =====

/**
 * Enable holographic tilt effect on a card element
 * Now flip-aware - tracks and adjusts for card rotation
 */
export function enableTilt(element, cardData = {}) {
  console.log('✨ Enabling flip-aware tilt effect...');
  
  const config = new HolographicConfig(cardData);
  const renderer = new HolographicRenderer(element, config);
  
  // Create flip state tracker
  const flipTracker = new FlipStateTracker(element);
  
  // Choose input method based on device
  let inputHandler;
  if (device.shouldUseGyroscope()) {
    console.log('📱 Using gyroscope input');
    inputHandler = new GyroscopeInput(renderer, config, flipTracker);
  } else {
    console.log('🖱️ Using pointer input');
    inputHandler = new PointerInput(element, renderer, config, flipTracker);
  }
  
  inputHandler.initialize();
  
  // Store references for cleanup
  element._holoInputHandler = inputHandler;
  element._holoFlipTracker = flipTracker;
}

/**
 * Disable holographic effect and clean up
 */
export function disableTilt(element) {
  if (element._holoInputHandler) {
    element._holoInputHandler.destroy();
    delete element._holoInputHandler;
  }
  if (element._holoFlipTracker) {
    element._holoFlipTracker.destroy();
    delete element._holoFlipTracker;
  }
}

// ===== FLIP STATE TRACKER =====

class FlipStateTracker {
  constructor(cardElement) {
    this.cardElement = cardElement;
    this.cardInner = cardElement.querySelector('.card-inner');
    this.isFlipped = false;
    this.observer = null;
    
    this.setupObserver();
  }
  
  setupObserver() {
    if (!this.cardInner) return;
    
    // Watch for transform changes on card-inner
    this.observer = new MutationObserver(() => {
      this.updateFlipState();
    });
    
    this.observer.observe(this.cardInner, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    // Initial check
    this.updateFlipState();
  }
  
  updateFlipState() {
    if (!this.cardInner) return;
    
    const transform = this.cardInner.style.transform || '';
    const wasFlipped = this.isFlipped;
    this.isFlipped = transform.includes('180deg');
    
    if (wasFlipped !== this.isFlipped) {
      console.log('🔄 Flip state changed:', this.isFlipped ? 'FLIPPED' : 'NORMAL');
    }
  }
  
  getIsFlipped() {
    return this.isFlipped;
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
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

// ===== HOLOGRAPHIC RENDERER (FLIP-AWARE) =====

class HolographicRenderer {
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.shadowLayer = null;
    this.glareLayer = null;
    
    this.setupLayers();
  }
  
  setupLayers() {
    this.element.style.perspective = `${GLARE_CONFIG.perspective}px`;
    
    this.shadowLayer = this.createShadowLayer();
    this.element.appendChild(this.shadowLayer);
    
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
    // Don't apply tilt transform - let card-inner handle its own flip
    // Only apply scale
    this.element.style.transform = `scale(${state.scale})`;
    this.element.style.transformStyle = 'preserve-3d';
    
    this.renderGradientPosition(state);
    this.renderShadow(state);
    this.renderGlareOpacity(state);
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
    
    const shadow1 = `${shadowX * blur * 1.5}px ${shadowY * blur * 0.75 + blur / 3}px ${blur}px rgba(0, 0, 0, ${opacity * 0.4})`;
    const shadow2 = `${shadowX * blur * 0.75}px ${shadowY * blur * 0.375 + blur / 6}px ${blur / 2}px rgba(0, 0, 0, ${opacity * 0.3})`;
    
    this.shadowLayer.style.boxShadow = `${shadow1}, ${shadow2}`;
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

// ===== GYROSCOPE INPUT HANDLER (FLIP-AWARE) =====

class GyroscopeInput {
  constructor(renderer, config, flipTracker) {
    this.renderer = renderer;
    this.config = config;
    this.flipTracker = flipTracker;
    this.baseline = null;
    this.isActive = false;
    this.boundHandler = null;
    this.permissionGranted = false;
  }
  
  async initialize() {
    console.log('🎮 Initializing gyroscope input...');
    
    if (device.requiresPermission()) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        this.permissionGranted = permission === 'granted';
        
        if (!this.permissionGranted) {
          console.warn('⚠️ Gyroscope permission denied');
          return;
        }
        
        console.log('✅ Gyroscope permission granted');
      } catch (error) {
        console.error('❌ Gyroscope permission error:', error);
        return;
      }
    } else {
      this.permissionGranted = true;
    }
    
    this.captureBaseline();
  }
  
  captureBaseline() {
    console.log('📍 Capturing gyroscope baseline...');
    
    const captureHandler = (event) => {
      if (event.beta !== null && event.gamma !== null) {
        this.baseline = {
          beta: event.beta,
          gamma: event.gamma
        };
        
        console.log('✅ Baseline captured:', this.baseline);
        window.removeEventListener('deviceorientation', captureHandler);
        this.startOrientationTracking();
      }
    };
    
    window.addEventListener('deviceorientation', captureHandler);
    
    setTimeout(() => {
      if (!this.baseline) {
        console.warn('⚠️ No gyroscope data, using default baseline');
        this.baseline = { beta: 0, gamma: 0 };
        window.removeEventListener('deviceorientation', captureHandler);
        this.startOrientationTracking();
      }
    }, 2000);
  }
  
  startOrientationTracking() {
    this.boundHandler = (event) => this.handleOrientation(event);
    window.addEventListener('deviceorientation', this.boundHandler);
    this.isActive = true;
    console.log('✅ Gyroscope tracking active');
  }
  
  handleOrientation(event) {
    if (!this.baseline || event.beta === null || event.gamma === null) return;
    
    const beta = event.beta - this.baseline.beta;
    const gamma = event.gamma - this.baseline.gamma;
    
    const maxTilt = 45;
    let normalizedX = Math.max(-1, Math.min(1, gamma / maxTilt));
    let normalizedY = Math.max(-1, Math.min(1, beta / maxTilt));
    
    // ✅ FIX: Mirror coordinates when flipped
    if (this.flipTracker.getIsFlipped()) {
      normalizedX = -normalizedX;
      normalizedY = -normalizedY;
    }
    
    const x = (normalizedX + 1) / 2;
    const y = (normalizedY + 1) / 2;
    
    this.renderer.render({
      x, y,
      rotateX: 0, // Don't apply rotation
      rotateY: 0, // Don't apply rotation
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    });
  }
  
  destroy() {
    if (this.boundHandler) {
      window.removeEventListener('deviceorientation', this.boundHandler);
      this.boundHandler = null;
    }
    this.isActive = false;
    this.renderer.reset();
    console.log('🔴 Gyroscope input destroyed');
  }
}

// ===== POINTER INPUT HANDLER (FLIP-AWARE) =====

class PointerInput {
  constructor(element, renderer, config, flipTracker) {
    this.element = element;
    this.renderer = renderer;
    this.config = config;
    this.flipTracker = flipTracker;
    this.isActive = false;
    this.currentOpacity = 0;
    this.currentScale = 1;
    this.rafId = null;
  }
  
  initialize() {
    console.log('🖱️ Initializing pointer input...');
    
    this.element.addEventListener('pointerenter', (e) => this.onPointerEnter(e));
    this.element.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.element.addEventListener('pointerleave', () => this.onPointerLeave());
    this.element.addEventListener('pointercancel', () => this.onPointerLeave());
    
    this.isActive = true;
    console.log('✅ Pointer input active');
  }
  
  onPointerEnter(e) {
    const { x, y } = this.getPointerPosition(e);
    this.updateCard(x, y);
  }
  
  onPointerMove(e) {
    if (!this.isActive) return;
    const { x, y } = this.getPointerPosition(e);
    this.updateCard(x, y);
  }
  
  onPointerLeave() {
    this.resetCard();
  }
  
  getPointerPosition(e) {
    const rect = this.element.getBoundingClientRect();
    let x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    let y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    // ✅ FIX: Mirror coordinates when flipped
    if (this.flipTracker.getIsFlipped()) {
      x = 1 - x;
      y = 1 - y;
    }
    
    return { x, y };
  }
  
  updateCard(x, y) {
    const targetState = {
      x, y,
      rotateX: 0, // Don't apply rotation
      rotateY: 0, // Don't apply rotation
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    };
    
    this.animateToState(targetState);
  }
  
  animateToState(targetState) {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    const animate = () => {
      const ease = 0.2;
      this.currentOpacity += (targetState.opacity - this.currentOpacity) * ease;
      this.currentScale += (targetState.scale - this.currentScale) * ease;
      
      this.renderer.render({
        ...targetState,
        opacity: this.currentOpacity,
        scale: this.currentScale
      });
      
      if (Math.abs(this.currentOpacity - targetState.opacity) > 0.01 || 
          Math.abs(this.currentScale - targetState.scale) > 0.001) {
        this.rafId = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  resetCard() {
    this.isActive = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    const animateOut = () => {
      this.currentOpacity *= 0.85;
      this.currentScale += (1 - this.currentScale) * 0.15;
      
      this.renderer.render({
        x: 0.5, y: 0.5,
        rotateX: 0,
        rotateY: 0,
        scale: this.currentScale,
        opacity: this.currentOpacity
      });
      
      if (this.currentOpacity > 0.01 || Math.abs(this.currentScale - 1) > 0.001) {
        this.rafId = requestAnimationFrame(animateOut);
      } else {
        this.renderer.reset();
      }
    };
    
    animateOut();
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isActive = false;
    this.renderer.reset();
    console.log('🔴 Pointer input destroyed');
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
  
  allCards.forEach(card => {
    if (stats[card.rarity]) stats[card.rarity].total++;
  });
  
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
