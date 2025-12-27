/**
 * MTG Pocket - Constants
 * 
 * Global configuration values and constants used throughout the application.
 */

// ===== GAME MECHANICS =====
export const PACK_COST = 6;                    // Points required to open a pack
export const INTERVAL = 3600000;               // Time between point generation (1 hour in ms)
export const FULLART_BONUS_CHANCE = 0.10;      // 10% chance for 6th full-art card
export const GODPACK_CHANCE = 0.015;           // 1.5% chance for god pack (all full-art)
export const MASTERPIECE_CHANCE = 0.25;        // 25% chance for 7th masterpiece card (if 6th exists)

// ===== CARD ASSETS =====
export const MTG_CARD_BACK = 'https://files.mtg.wiki/Magic_card_back.jpg';

// ===== RARITY DISTRIBUTION =====
// Used for pack generation - percentage chances for each rarity
export const RARITY_WEIGHTS = {
  common: 60,      // 60% chance (0-59.99)
  uncommon: 30,    // 30% chance (60-89.99)
  rare: 9,         // 9% chance (90-98.99)
  mythic: 1        // 1% chance (99-99.99)
};

// Cumulative thresholds for rarity roll
export const RARITY_THRESHOLDS = {
  mythic: 3,       // 0-2.99%
  rare: 10,        // 3-9.99%
  uncommon: 30     // 10-29.99%
  // common: everything else (30-100%)
};

// ===== API CONFIGURATION =====
export const SCRYFALL_API_BASE = 'https://api.scryfall.com';
export const SCRYFALL_RATE_LIMIT_DELAY = 100; // Delay between paginated requests (ms)

// ===== SET FILTERS =====
// Sets to exclude from the set selector dropdown
export const EXCLUDED_SET_KEYWORDS = [
  'jumpstart',
  'promo'
];

export const EXCLUDED_SET_PATTERNS = [
  /Commander\s*$/i  // Exclude sets ending with "Commander"
];

// Minimum card count for a set to be included
export const MIN_SET_SIZE = 100;

// ===== CARD TYPES =====
export const CARD_RARITIES = ['common', 'uncommon', 'rare', 'mythic'];

// ===== ANIMATION TIMING =====
export const PACK_RIP_DURATION = 800;          // Pack ripping animation duration (ms)
export const CARD_EXIT_DURATION = 500;         // Card exit animation duration (ms)
export const CARD_FLIP_DURATION = 600;         // Card flip transition duration (ms)

// ===== UI CONFIGURATION =====
export const COUNTDOWN_UPDATE_INTERVAL = 1000; // Update countdown timer every 1 second

// ===== STORAGE KEYS =====
export const STORAGE_KEY = 'mtgPocket';

// ===== HOLOGRAPHIC GLARE SETTINGS =====
export const GLARE_CONFIG = {
  tiltFactor: 1.2,
  scaleFactor: 1.05,
  maxTiltDegrees: 20,
  glareSize: 200  // Width/height of glare gradient in pixels
};

// ===== GYROSCOPE SETTINGS =====
export const GYRO_CONFIG = {
  maxTiltAngle: 45,  // Maximum tilt angle in degrees for normalization
  smoothing: 0.1     // Smoothing factor for gyro movements (not currently used)
};

// ===== CARD ID SUFFIXES =====
export const CARD_SUFFIXES = {
  fullart: '_fullart',
  masterpiece: '_masterpiece'
};

// ===== FILTER TYPES =====
export const FILTER_TYPES = {
  ALL: 'all',
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  MYTHIC: 'mythic',
  FULLART: 'fullart',
  SPOTLIGHT: 'spotlight',
  SECRETS: 'secrets'
};