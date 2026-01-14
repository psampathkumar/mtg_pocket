/**
 * MTG Pocket - Image Loading Module
 * 
 * Handles card image extraction from Scryfall API data.
 * Single responsibility: Image URL extraction only.
 * 
 * TESTABLE: All functions are pure with predictable outputs.
 */

import { MTG_CARD_BACK } from '../constants.js';

/**
 * Extract front and back image URLs from a Scryfall card object
 * @param {Object} card - Scryfall card object
 * @returns {Object} - { front: string, back: string }
 * 
 * TESTABLE: Pure function, no side effects
 */
export function getCardImages(card) {
  if (!card) {
    return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
  }
  
  // Single-faced cards have top-level image_uris
  if (card.image_uris) {
    return {
      front: card.image_uris.normal,
      back: card.card_faces?.[1]?.image_uris?.normal || MTG_CARD_BACK
    };
  }
  
  // Double-faced cards have image_uris in card_faces
  if (card.card_faces?.[0]?.image_uris) {
    return {
      front: card.card_faces[0].image_uris.normal,
      back: card.card_faces[1]?.image_uris?.normal || MTG_CARD_BACK
    };
  }
  
  // Fallback if no images found
  return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
}

/**
 * Check if a card is double-faced (has alternate back image)
 * @param {string} backImg - Back image URL
 * @returns {boolean}
 * 
 * TESTABLE: Simple comparison
 */
export function isDoubleFaced(backImg) {
  return backImg && backImg !== MTG_CARD_BACK;
}

/**
 * Get the front image URL from a card object
 * @param {Object} card - Scryfall card object
 * @returns {string} - Front image URL
 * 
 * TESTABLE: Pure function
 */
export function getFrontImage(card) {
  return getCardImages(card).front;
}

/**
 * Get the back image URL from a card object
 * @param {Object} card - Scryfall card object
 * @returns {string} - Back image URL
 * 
 * TESTABLE: Pure function
 */
export function getBackImage(card) {
  return getCardImages(card).back;
}

/**
 * Check if a card has valid images
 * @param {Object} card - Scryfall card object
 * @returns {boolean}
 * 
 * TESTABLE: Pure validation
 */
export function hasValidImages(card) {
  if (!card) return false;
  
  const hasTopLevelImage = !!card.image_uris;
  const hasCardFaceImage = card.card_faces && 
                           card.card_faces.length > 0 && 
                           card.card_faces[0].image_uris;
  
  return hasTopLevelImage || hasCardFaceImage;
}

/**
 * Extract all image URLs from a card (front, back, and any additional faces)
 * @param {Object} card - Scryfall card object
 * @returns {Array<string>} - Array of image URLs
 * 
 * TESTABLE: Pure function
 */
export function getAllCardImages(card) {
  if (!card) return [];
  
  const images = [];
  
  if (card.image_uris) {
    images.push(card.image_uris.normal);
  }
  
  if (card.card_faces) {
    card.card_faces.forEach(face => {
      if (face.image_uris?.normal) {
        images.push(face.image_uris.normal);
      }
    });
  }
  
  return images;
}

/**
 * Get image URL for a specific size variant
 * @param {Object} card - Scryfall card object
 * @param {string} size - 'small', 'normal', 'large', 'png', 'art_crop', 'border_crop'
 * @returns {Object} - { front: string, back: string }
 * 
 * TESTABLE: Pure function with size parameter
 */
export function getCardImagesBySize(card, size = 'normal') {
  if (!card) {
    return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
  }
  
  if (card.image_uris) {
    return {
      front: card.image_uris[size] || card.image_uris.normal,
      back: card.card_faces?.[1]?.image_uris?.[size] || MTG_CARD_BACK
    };
  }
  
  if (card.card_faces?.[0]?.image_uris) {
    return {
      front: card.card_faces[0].image_uris[size] || card.card_faces[0].image_uris.normal,
      back: card.card_faces[1]?.image_uris?.[size] || MTG_CARD_BACK
    };
  }
  
  return { front: MTG_CARD_BACK, back: MTG_CARD_BACK };
}
