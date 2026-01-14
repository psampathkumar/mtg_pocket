/**
 * MTG Pocket - Device Detection Module
 * 
 * Detects device capabilities (mobile, touch, gyroscope, platform).
 * Single responsibility: Device & capability detection only.
 * 
 * TESTABLE: All detection logic is in pure functions or getter methods.
 */

/**
 * Device detector class - encapsulates all device detection logic
 */
export class DeviceDetector {
  constructor() {
    this._isMobile = this._detectMobile();
    this._hasTouch = this._detectTouch();
    this._hasGyro = this._detectGyro();
    this._isIOS = this._detectIOS();
    this._isAndroid = this._detectAndroid();
    
    console.log('📱 Device:', this._isMobile ? 'Mobile' : 'Desktop', 
                 this._hasGyro ? 'with gyro' : 'no gyro');
  }
  
  // ===== PRIVATE DETECTION METHODS (testable by exposing them) =====
  
  _detectMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }
  
  _detectTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  _detectGyro() {
    return typeof DeviceOrientationEvent !== 'undefined';
  }
  
  _detectIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  
  _detectAndroid() {
    return /Android/i.test(navigator.userAgent);
  }
  
  // ===== PUBLIC GETTERS =====
  
  get isMobile() {
    return this._isMobile;
  }
  
  get hasTouch() {
    return this._hasTouch;
  }
  
  get hasGyro() {
    return this._hasGyro;
  }
  
  get isIOS() {
    return this._isIOS;
  }
  
  get isAndroid() {
    return this._isAndroid;
  }
  
  // ===== CAPABILITY CHECKS =====
  
  /**
   * Should this device use gyroscope for holographic effect?
   * @returns {boolean}
   */
  shouldUseGyroscope() {
    return this._isMobile && this._hasGyro;
  }
  
  /**
   * Does this device require permission for gyroscope? (iOS 13+)
   * @returns {boolean}
   */
  requiresPermission() {
    return this._isIOS && typeof DeviceOrientationEvent.requestPermission === 'function';
  }
  
  /**
   * Get a summary object for debugging
   * @returns {Object}
   */
  getSummary() {
    return {
      isMobile: this._isMobile,
      hasTouch: this._hasTouch,
      hasGyro: this._hasGyro,
      isIOS: this._isIOS,
      isAndroid: this._isAndroid,
      shouldUseGyro: this.shouldUseGyroscope(),
      requiresPermission: this.requiresPermission()
    };
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Global device detector instance
 * Use this throughout the app instead of creating new instances
 */
export const device = new DeviceDetector();

// ===== TESTING EXPORTS =====

/**
 * Create a new detector instance for testing
 * @returns {DeviceDetector}
 */
export function createDetector() {
  return new DeviceDetector();
}

/**
 * Mock device for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} - Mock device object
 */
export function createMockDevice(overrides = {}) {
  return {
    isMobile: false,
    hasTouch: false,
    hasGyro: false,
    isIOS: false,
    isAndroid: false,
    shouldUseGyroscope: () => false,
    requiresPermission: () => false,
    getSummary: function() {
      return { ...this };
    },
    ...overrides
  };
}
