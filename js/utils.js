/**
 * MTG Pocket - Utility Functions (MINIMAL WORKING FIX)
 * 
 * Back to basics - restore working tilt, minimal flip adjustment
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
    
    console.log('🔍 Device:', this.isMobile ? 'Mobile' : 'Desktop', 
                 this.hasGyro ? 'with gyro' : 'no gyro');
  }
  
  shouldUseGyroscope() {
    return this.isMobile && this.hasGyro;
  }
  
  requiresPermission() {
    return this.isIOS && typeof DeviceOrientationEvent.requestPermission === 'function';
  }
}

export const device = new DeviceDetector();

// ===== RARITY & IMAGES =====

export function rollRarity() {
  const roll = Math.random() * 100;
  if (roll < RARITY_THRESHOLDS.mythic) return 'mythic';
  if (roll < RARITY_THRESHOLDS.rare) return 'rare';
  if (roll < RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

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

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== HOLOGRAPHIC EFFECT (BACK TO WORKING BASELINE) =====

export function enableTilt(element, cardData = {}) {
  console.log('✨ Enabling tilt...');
  
  const config = new HolographicConfig(cardData);
  const renderer = new HolographicRenderer(element, config);
  
  let inputHandler;
  if (device.shouldUseGyroscope()) {
    console.log('📱 Gyroscope');
    inputHandler = new GyroscopeInput(renderer, config);
  } else {
    console.log('🖱️ Pointer');
    inputHandler = new PointerInput(element, renderer, config);
  }
  
  inputHandler.initialize();
  element._holoInputHandler = inputHandler;
}

export function disableTilt(element) {
  if (element._holoInputHandler) {
    element._holoInputHandler.destroy();
    delete element._holoInputHandler;
  }
}

// ===== CONFIG =====

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

// ===== RENDERER (RESTORED WORKING VERSION) =====

class HolographicRenderer {
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.setupLayers();
  }
  
  setupLayers() {
    this.element.style.perspective = `${GLARE_CONFIG.perspective}px`;
    
    this.shadowLayer = document.createElement('div');
    this.shadowLayer.className = 'holo-shadow';
    this.shadowLayer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      z-index: -1;
    `;
    this.element.appendChild(this.shadowLayer);
    
    this.glareLayer = document.createElement('div');
    this.glareLayer.className = 'holo-glare';
    this.glareLayer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      border-radius: inherit;
      mix-blend-mode: ${GLARE_CONFIG.blendMode};
      z-index: 5;
    `;
    this.glareLayer.style.backgroundImage = this.config.getGradient();
    this.element.appendChild(this.glareLayer);
  }
  
  render(state) {
    // ✅ RESTORE TILT - Apply transform to CARD element (not card-inner)
    const transform = `scale(${state.scale}) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`;
    this.element.style.transform = transform;
    this.element.style.transformStyle = 'preserve-3d';
    
    // Gradient position
    this.element.style.setProperty('--gradient-x', `${state.x * 100}%`);
    this.element.style.setProperty('--gradient-y', `${state.y * 100}%`);
    
    // Shadow
    const shadowX = state.x * 2 - 1;
    const shadowY = state.y * 2 - 1;
    const blur = GLARE_CONFIG.shadowBlur;
    const opacity = GLARE_CONFIG.shadowOpacity * state.opacity;
    
    const shadow1 = `${shadowX * blur * 1.5}px ${shadowY * blur * 0.75 + blur / 3}px ${blur}px rgba(0,0,0,${opacity * 0.4})`;
    const shadow2 = `${shadowX * blur * 0.75}px ${shadowY * blur * 0.375 + blur / 6}px ${blur / 2}px rgba(0,0,0,${opacity * 0.3})`;
    this.shadowLayer.style.boxShadow = `${shadow1}, ${shadow2}`;
    
    // Glare
    this.glareLayer.style.opacity = state.opacity;
  }
  
  reset() {
    this.element.style.transform = '';
    this.shadowLayer.style.boxShadow = '';
    this.glareLayer.style.opacity = '0';
  }
}

// ===== GYROSCOPE INPUT (SIMPLIFIED) =====

class GyroscopeInput {
  constructor(renderer, config) {
    this.renderer = renderer;
    this.config = config;
    this.baseline = null;
    this.boundHandler = null;
  }
  
  async initialize() {
    console.log('🎮 Init gyroscope...');
    
    if (device.requiresPermission()) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          console.warn('⚠️ Permission denied');
          return;
        }
        console.log('✅ Permission granted');
      } catch (error) {
        console.error('❌ Permission error:', error);
        return;
      }
    }
    
    this.captureBaseline();
  }
  
  captureBaseline() {
    const captureHandler = (event) => {
      if (event.beta !== null && event.gamma !== null) {
        this.baseline = { beta: event.beta, gamma: event.gamma };
        console.log('✅ Baseline:', this.baseline);
        window.removeEventListener('deviceorientation', captureHandler);
        this.start();
      }
    };
    
    window.addEventListener('deviceorientation', captureHandler);
    
    setTimeout(() => {
      if (!this.baseline) {
        this.baseline = { beta: 0, gamma: 0 };
        window.removeEventListener('deviceorientation', captureHandler);
        this.start();
      }
    }, 2000);
  }
  
  start() {
    this.boundHandler = (e) => this.handle(e);
    window.addEventListener('deviceorientation', this.boundHandler);
    console.log('✅ Gyroscope active');
  }
  
  handle(event) {
    if (!this.baseline || event.beta === null || event.gamma === null) return;
    
    const beta = event.beta - this.baseline.beta;
    const gamma = event.gamma - this.baseline.gamma;
    
    const maxTilt = 45;
    const normX = Math.max(-1, Math.min(1, gamma / maxTilt));
    const normY = Math.max(-1, Math.min(1, beta / maxTilt));
    
    const x = (normX + 1) / 2;
    const y = (normY + 1) / 2;
    
    const rotateX = -normY * GLARE_CONFIG.maxTiltDegrees;
    const rotateY = normX * GLARE_CONFIG.maxTiltDegrees;
    
    this.renderer.render({
      x, y,
      rotateX, rotateY,
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    });
  }
  
  destroy() {
    if (this.boundHandler) {
      window.removeEventListener('deviceorientation', this.boundHandler);
    }
    this.renderer.reset();
  }
}

// ===== POINTER INPUT (RESTORED WORKING VERSION) =====

class PointerInput {
  constructor(element, renderer, config) {
    this.element = element;
    this.renderer = renderer;
    this.config = config;
    this.currentOpacity = 0;
    this.currentScale = 1;
    this.rafId = null;
  }
  
  initialize() {
    this.element.addEventListener('pointerenter', (e) => this.onEnter(e));
    this.element.addEventListener('pointermove', (e) => this.onMove(e));
    this.element.addEventListener('pointerleave', () => this.onLeave());
    console.log('✅ Pointer active');
  }
  
  onEnter(e) {
    const pos = this.getPosition(e);
    this.update(pos.x, pos.y);
  }
  
  onMove(e) {
    const pos = this.getPosition(e);
    this.update(pos.x, pos.y);
  }
  
  onLeave() {
    this.reset();
  }
  
  getPosition(e) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    };
  }
  
  update(x, y) {
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    const rotateX = -centerY * GLARE_CONFIG.maxTiltDegrees;
    const rotateY = centerX * GLARE_CONFIG.maxTiltDegrees;
    
    this.animateTo({
      x, y,
      rotateX, rotateY,
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    });
  }
  
  animateTo(target) {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    const animate = () => {
      this.currentOpacity += (target.opacity - this.currentOpacity) * 0.2;
      this.currentScale += (target.scale - this.currentScale) * 0.2;
      
      this.renderer.render({
        ...target,
        opacity: this.currentOpacity,
        scale: this.currentScale
      });
      
      if (Math.abs(this.currentOpacity - target.opacity) > 0.01 || 
          Math.abs(this.currentScale - target.scale) > 0.001) {
        this.rafId = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  reset() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    const animateOut = () => {
      this.currentOpacity *= 0.85;
      this.currentScale += (1 - this.currentScale) * 0.15;
      
      this.renderer.render({
        x: 0.5, y: 0.5,
        rotateX: 0, rotateY: 0,
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
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.renderer.reset();
  }
}

// ===== UTILITIES =====

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

export function createElement(tag, classes = [], textContent = '') {
  const element = document.createElement(tag);
  if (typeof classes === 'string') classes = [classes];
  classes.forEach(c => element.classList.add(c));
  if (textContent) element.textContent = textContent;
  return element;
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
