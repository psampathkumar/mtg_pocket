/**
 * MTG Pocket - Holographic Input Handlers Module
 * 
 * Handles user input (gyroscope, pointer) for holographic effects.
 * Single responsibility: Input handling and conversion to visual state.
 * 
 * TESTABLE: Input handlers can be tested with mock events.
 */

import { GLARE_CONFIG } from '../constants.js';

/**
 * Base input handler class
 * Abstract class for common input handler functionality
 */
class InputHandler {
  constructor(renderer, config) {
    this.renderer = renderer;
    this.config = config;
  }
  
  initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }
  
  destroy() {
    throw new Error('destroy() must be implemented by subclass');
  }
}

/**
 * Gyroscope input handler (mobile devices)
 */
export class GyroscopeInput extends InputHandler {
  constructor(renderer, config, device) {
    super(renderer, config);
    this.device = device;
    this.baseline = null;
    this.boundHandler = null;
    
    // Mobile: 45° max tilt for strong visible effect
    this.maxTiltDegrees = 45;
    this.deviceMaxTilt = 45;
    
    console.log(`📱 Mobile tilt: ${this.maxTiltDegrees}° max`);
  }
  
  /**
   * Initialize gyroscope input
   * 
   * TESTABLE: Can mock DeviceOrientationEvent.requestPermission
   */
  async initialize() {
    console.log('🎮 Init gyroscope...');
    
    if (this.device.requiresPermission()) {
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
  
  /**
   * Capture baseline orientation
   * 
   * TESTABLE: Can inject baseline values
   */
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
    
    // Timeout fallback
    setTimeout(() => {
      if (!this.baseline) {
        console.warn('⚠️ No gyro data, using default');
        this.baseline = { beta: 0, gamma: 0 };
        window.removeEventListener('deviceorientation', captureHandler);
        this.start();
      }
    }, 2000);
  }
  
  /**
   * Start listening to gyroscope
   */
  start() {
    this.boundHandler = (e) => this.handle(e);
    window.addEventListener('deviceorientation', this.boundHandler);
    console.log('✅ Gyroscope active');
  }
  
  /**
   * Handle gyroscope event
   * @param {DeviceOrientationEvent} event
   * 
   * TESTABLE: Can pass mock events
   */
  handle(event) {
    if (!this.baseline || event.beta === null || event.gamma === null) return;
    
    // Calculate relative tilt from baseline
    const beta = event.beta - this.baseline.beta;
    const gamma = event.gamma - this.baseline.gamma;
    
    // Normalize to -1 to 1 based on device tilt range
    const normX = Math.max(-1, Math.min(1, gamma / this.deviceMaxTilt));
    const normY = Math.max(-1, Math.min(1, beta / this.deviceMaxTilt));
    
    // Convert to 0-1 for gradient positioning
    const x = (normX + 1) / 2;
    const y = (normY + 1) / 2;
    
    // Apply mobile max tilt (45°)
    const rotateX = -normY * this.maxTiltDegrees;
    const rotateY = normX * this.maxTiltDegrees;
    
    this.renderer.render({
      x, y,
      rotateX, rotateY,
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    });
  }
  
  /**
   * Clean up gyroscope listener
   */
  destroy() {
    if (this.boundHandler) {
      window.removeEventListener('deviceorientation', this.boundHandler);
    }
    this.renderer.reset();
    console.log('🔴 Gyroscope destroyed');
  }
  
  /**
   * Set baseline manually (for testing)
   * @param {Object} baseline - { beta, gamma }
   * 
   * TESTABLE: Allows injecting baseline
   */
  setBaseline(baseline) {
    this.baseline = baseline;
  }
}

/**
 * Pointer input handler (desktop/mouse)
 */
export class PointerInput extends InputHandler {
  constructor(element, renderer, config) {
    super(renderer, config);
    this.element = element;
    this.currentOpacity = 0;
    this.currentScale = 1;
    this.rafId = null;
    
    // Desktop: 15° max tilt for precise control
    this.maxTiltDegrees = 15;
    
    console.log(`🖱️ Desktop tilt: ${this.maxTiltDegrees}° max`);
  }
  
  /**
   * Initialize pointer listeners
   */
  initialize() {
    this.element.addEventListener('pointerenter', (e) => this.onEnter(e));
    this.element.addEventListener('pointermove', (e) => this.onMove(e));
    this.element.addEventListener('pointerleave', () => this.onLeave());
    console.log('✅ Pointer active');
  }
  
  /**
   * Handle pointer enter
   * @param {PointerEvent} e
   * 
   * TESTABLE: Can pass mock events
   */
  onEnter(e) {
    const pos = this.getPosition(e);
    this.update(pos.x, pos.y);
  }
  
  /**
   * Handle pointer move
   * @param {PointerEvent} e
   * 
   * TESTABLE: Can pass mock events
   */
  onMove(e) {
    const pos = this.getPosition(e);
    this.update(pos.x, pos.y);
  }
  
  /**
   * Handle pointer leave
   */
  onLeave() {
    this.reset();
  }
  
  /**
   * Get normalized pointer position (0-1, 0-1)
   * @param {PointerEvent} e
   * @returns {Object} - { x, y }
   * 
   * TESTABLE: Pure calculation from event coords
   */
  getPosition(e) {
    const rect = this.element.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    };
  }
  
  /**
   * Update visual state based on pointer position
   * @param {number} x - Position 0-1
   * @param {number} y - Position 0-1
   * 
   * TESTABLE: Can call with explicit values
   */
  update(x, y) {
    const centerX = x - 0.5;
    const centerY = y - 0.5;
    
    // Apply desktop max tilt (15°)
    const rotateX = -centerY * this.maxTiltDegrees * 2;
    const rotateY = centerX * this.maxTiltDegrees * 2;
    
    this.animateTo({
      x, y,
      rotateX, rotateY,
      scale: GLARE_CONFIG.scaleOnHover,
      opacity: GLARE_CONFIG.glareOpacity
    });
  }
  
  /**
   * Animate to target state
   * @param {Object} target - Target state
   */
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
  
  /**
   * Reset to default state
   */
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
  
  /**
   * Clean up pointer listeners
   */
  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.renderer.reset();
    console.log('🔴 Pointer destroyed');
  }
}

/**
 * Create appropriate input handler based on device
 * @param {HTMLElement} element - Card element
 * @param {HolographicRenderer} renderer - Renderer instance
 * @param {HolographicConfig} config - Config instance
 * @param {DeviceDetector} device - Device detector
 * @returns {InputHandler}
 * 
 * TESTABLE: Factory function
 */
export function createInputHandler(element, renderer, config, device) {
  if (device.shouldUseGyroscope()) {
    return new GyroscopeInput(renderer, config, device);
  } else {
    return new PointerInput(element, renderer, config);
  }
}
