/**
 * MTG Pocket - API Module
 * 
 * Handles all interactions with the Scryfall API including pagination,
 * set loading, and card queries.
 */

import { 
  SCRYFALL_API_BASE, 
  SCRYFALL_RATE_LIMIT_DELAY,
  EXCLUDED_SET_KEYWORDS,
  EXCLUDED_SET_PATTERNS,
  MIN_SET_SIZE,
  CARD_RARITIES
} from './constants.js';

// ===== CORE API FUNCTIONS =====

/**
 * Fetch all pages from a paginated Scryfall API endpoint
 * @param {string} url - The initial API URL
 * @returns {Promise<Array>} - Array of all data across all pages
 */
export async function fetchAllPages(url) {
  let allData = [];
  let nextUrl = url;
  
  while (nextUrl) {
    const res = await fetch(nextUrl);
    const json = await res.json();
    allData.push(...json.data);
    nextUrl = json.next_page || null;
    
    if (nextUrl) {
      console.log('Fetching next page:', nextUrl);
      // Small delay to respect Scryfall rate limits
      await new Promise(resolve => setTimeout(resolve, SCRYFALL_RATE_LIMIT_DELAY));
    }
  }
  
  return allData;
}

// ===== SET QUERIES =====

/**
 * Fetch all available MTG sets from Scryfall
 * @returns {Promise<Array>} - Array of set objects
 */
export async function fetchAllSets() {
  const url = `${SCRYFALL_API_BASE}/sets`;
  return await fetchAllPages(url);
}

/**
 * Filter sets based on app requirements
 * @param {Array} sets - Array of set objects from Scryfall
 * @returns {Array} - Filtered array of sets
 */
export function filterSets(sets) {
  return sets.filter(set => {
    // Must have a release date
    if (!set.released_at) return false;
    
    // Must have sufficient cards
    if (set.card_count <= MIN_SET_SIZE) return false;
    
    // Must have an icon
    if (!set.icon_svg_uri) return false;
    
    // Skip child sets (those with a parent set)
    if (set.parent_set_code) return false;
    
    // Skip excluded keywords
    const setNameLower = set.name.toLowerCase();
    for (const keyword of EXCLUDED_SET_KEYWORDS) {
      if (setNameLower.includes(keyword)) return false;
    }
    
    // Skip excluded patterns
    for (const pattern of EXCLUDED_SET_PATTERNS) {
      if (pattern.test(set.name)) return false;
    }
    
    return true;
  });
}

/**
 * Sort sets by release date (newest first)
 * @param {Array} sets - Array of set objects
 * @returns {Array} - Sorted array of sets
 */
export function sortSetsByDate(sets) {
  return sets.sort((a, b) => new Date(b.released_at) - new Date(a.released_at));
}

// ===== CARD QUERIES =====

/**
 * Fetch all cards for a specific set
 * @param {string} setCode - The set code (e.g., 'BLB', 'MH3')
 * @returns {Promise<Array>} - Array of card objects
 */
export async function fetchSetCards(setCode) {
  const url = `${SCRYFALL_API_BASE}/cards/search?q=set:${setCode}+game:paper&unique=cards`;
  
  try {
    const allData = await fetchAllPages(url);
    console.log(`Total cards from API for ${setCode}:`, allData.length);
    return allData;
  } catch (error) {
    console.error(`Error fetching cards for set ${setCode}:`, error);
    return [];
  }
}

/**
 * Fetch full-art and extended-art cards for a set
 * @param {string} setCode - The set code
 * @returns {Promise<Array>} - Array of full-art card objects
 */
export async function fetchFullArtCards(setCode) {
  const url = `${SCRYFALL_API_BASE}/cards/search?q=set:${setCode}+game:paper+(is:extended+OR+is:fullart)&unique=cards`;
  
  try {
    const data = await fetchAllPages(url);
    console.log(`Full-art cards for ${setCode}:`, data.length);
    return data;
  } catch (error) {
    console.log(`No full-art cards found for ${setCode}`);
    return [];
  }
}

/**
 * Fetch story spotlight cards for a set
 * @param {string} setCode - The set code
 * @returns {Promise<Array>} - Array of story spotlight card objects
 */
export async function fetchStorySpotlightCards(setCode) {
  const url = `${SCRYFALL_API_BASE}/cards/search?q=set:${setCode}+is:spotlight&unique=cards`;
  
  try {
    const data = await fetchAllPages(url);
    console.log(`Story spotlight cards for ${setCode}:`, data.length);
    return data;
  } catch (error) {
    console.log(`No story spotlight cards found for ${setCode}`);
    return [];
  }
}

/**
 * Fetch masterpiece cards for child masterpiece sets
 * @param {string} parentSetCode - The parent set code
 * @param {Array} allSets - Array of all set objects
 * @returns {Promise<Array>} - Array of masterpiece card objects
 */
export async function fetchMasterpieceCards(parentSetCode, allSets) {
  const childMasterpieceSets = allSets.filter(set => 
    set.parent_set_code === parentSetCode && 
    set.set_type === 'masterpiece'
  );
  
  if (childMasterpieceSets.length === 0) {
    return [];
  }
  
  let allMasterpieces = [];
  
  for (const childSet of childMasterpieceSets) {
    try {
      const url = `${SCRYFALL_API_BASE}/cards/search?q=set:${childSet.code}+game:paper&unique=cards`;
      const data = await fetchAllPages(url);
      allMasterpieces.push(...data);
    } catch (error) {
      console.log(`No masterpieces found for ${childSet.code}`);
    }
  }
  
  console.log(`Masterpiece cards for ${parentSetCode}:`, allMasterpieces.length);
  return allMasterpieces;
}

// ===== CARD FILTERING =====

/**
 * Filter cards to include only those with valid images
 * @param {Array} cards - Array of card objects
 * @returns {Array} - Filtered array of cards
 */
export function filterCardsWithImages(cards) {
  return cards.filter(card => {
    // Must have a valid rarity
    const hasRarity = CARD_RARITIES.includes(card.rarity);
    if (!hasRarity) return false;
    
    // Must have either top-level image_uris OR card_faces with images
    const hasTopLevelImage = card.image_uris;
    const hasCardFaceImage = card.card_faces && 
                             card.card_faces.length > 0 && 
                             card.card_faces[0].image_uris;
    
    return hasTopLevelImage || hasCardFaceImage;
  });
}

/**
 * Sort cards by collector number
 * @param {Array} cards - Array of card objects
 * @returns {Array} - Sorted array of cards
 */
export function sortCardsByCollectorNumber(cards) {
  return cards.sort((a, b) => {
    const numA = parseInt(a.collector_number) || 0;
    const numB = parseInt(b.collector_number) || 0;
    return numA - numB;
  });
}

// ===== COMPLETE SET LOADING =====

/**
 * Load all card data for a set (main cards, full-art, masterpieces, spotlights)
 * @param {string} setCode - The set code
 * @param {Array} allSets - Array of all set objects
 * @returns {Promise<Object>} - Object containing all card arrays
 */
export async function loadCompleteSetData(setCode, allSets) {
  console.log('=== LOADING SET DATA ===');
  console.log('Set code:', setCode);
  
  // Fetch all card types in parallel for better performance
  const [
    rawCards,
    rawFullArt,
    rawMasterpieces,
    rawSpotlights
  ] = await Promise.all([
    fetchSetCards(setCode),
    fetchFullArtCards(setCode),
    fetchMasterpieceCards(setCode, allSets),
    fetchStorySpotlightCards(setCode)
  ]);
  
  // Filter and sort main cards
  const mainCards = sortCardsByCollectorNumber(
    filterCardsWithImages(rawCards)
  );
  
  // Filter full-art cards
  const fullArtCards = rawFullArt.filter(card => 
    card.image_uris || card.card_faces
  );
  
  // Filter masterpiece cards
  const masterpieceCards = rawMasterpieces.filter(card => 
    card.image_uris || card.card_faces
  );
  
  // Filter and sort story spotlight cards
  const storySpotlightCards = sortCardsByCollectorNumber(
    rawSpotlights.filter(card => card.image_uris || card.card_faces)
  );
  
  console.log('Final counts:', {
    main: mainCards.length,
    fullArt: fullArtCards.length,
    masterpieces: masterpieceCards.length,
    spotlights: storySpotlightCards.length
  });
  console.log('=== END LOADING SET DATA ===');
  
  return {
    mainCards,
    fullArtCards,
    masterpieceCards,
    storySpotlightCards
  };
}