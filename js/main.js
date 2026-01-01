/**
 * MTG Pocket - Main Application (FIXED DEV TOOLS)
 * 
 * Entry point for the application. Initializes all modules and sets up event handlers.
 */

import { PACK_COST, INTERVAL, COUNTDOWN_UPDATE_INTERVAL } from './constants.js';
import {
  initializeState,
  save,
  getPoints,
  setPoints,
  addPoints,
  updateLastTimestamp,
  getLastTimestamp,
  setCurrentSet,
  updateCardsData,
  addSetMetadata,
  getLastPack,
  getCurrentSet
} from './state.js';
import {
  fetchAllSets,
  filterSets,
  sortSetsByDate,
  loadCompleteSetData
} from './api.js';
import { formatTime } from './utils.js';
import { openPack } from './pack-opening.js';
import { showCollectionView, showHomeScreen, updateStats } from './collection.js';
import { initPackCarousel, renderPackCarousel } from './pack-carousel.js';
import {
  initDevPanel,
  initAddCard,
  initTestGlareManual,
  initDiagnostic
} from './dev-tools.js';

// ===== INITIALIZATION =====

/**
 * Initialize the application
 */
async function init() {
  console.log('🚀 === MTG POCKET INITIALIZING ===\n');
  
  // Load saved data
  console.log('📂 Loading saved data...');
  initializeState();
  
  // Load sets
  console.log('📦 Loading sets...');
  await loadSets();
  
  // Initialize UI
  console.log('🎨 Initializing UI...');
  initializeUI();
  
  // Start countdown timer
  console.log('⏰ Starting countdown timer...');
  startCountdownTimer();
  
  // Initial UI update
  console.log('🔄 Initial UI update...');
  updateUI();
  
  console.log('✅ === MTG POCKET READY ===\n');
}

// ===== SET LOADING =====

/**
 * Load all MTG sets and populate the set selector
 */
async function loadSets() {
  console.log('  └─ Fetching all sets from API...');
  const allSets = await fetchAllSets();
  console.log(`    ✅ Fetched ${allSets.length} sets`);
  
  console.log('  └─ Filtering sets...');
  const filteredSets = filterSets(allSets);
  console.log(`    ✅ Filtered to ${filteredSets.length} sets`);
  
  console.log('  └─ Sorting sets by date...');
  const sortedSets = sortSetsByDate(filteredSets);
  
  const setSelect = document.getElementById('setSelect');
  setSelect.innerHTML = '';
  
  console.log('  └─ Populating dropdown and storing metadata...');
  // Populate dropdown and store metadata
  sortedSets.forEach(set => {
    const option = document.createElement('option');
    option.value = set.code;
    option.textContent = set.name;
    setSelect.appendChild(option);
    
    addSetMetadata(set.code, {
      name: set.name,
      icon: set.icon_svg_uri
    });
  });
  
  // Store all sets metadata (including child sets for masterpieces)
  allSets.forEach(set => {
    addSetMetadata(set.code, {
      name: set.name,
      icon: set.icon_svg_uri,
      parent: set.parent_set_code,
      type: set.set_type
    });
  });
  
  // Set current set to last opened pack or first in list
  const lastPack = getLastPack();
  const initialSet = lastPack || setSelect.value;
  console.log('  └─ Setting initial set:', initialSet, lastPack ? '(from last pack)' : '(first in list)');
  setCurrentSet(initialSet);
  setSelect.value = initialSet;
  
  // Load the initial set
  console.log('  └─ Loading initial set data...');
  await loadSet();
  
  console.log('✅ Sets loaded\n');
}

/**
 * Load card data for the current set
 */
async function loadSet() {
  const currentSet = getCurrentSet();
  console.log('📦 === LOAD SET START ===');
  console.log('  └─ Set code:', currentSet);
  
  // Get all sets from state
  const { getState } = await import('./state.js');
  const stateData = getState();
  const allSets = Object.keys(stateData.setData).map(code => ({
    code,
    ...stateData.setData[code]
  }));
  
  console.log('  └─ Fetching complete set data from API...');
  const setData = await loadCompleteSetData(currentSet, allSets);
  
  console.log('  └─ Card counts:');
  console.log(`    • Main cards: ${setData.mainCards.length}`);
  console.log(`    • Full-art cards: ${setData.fullArtCards.length}`);
  console.log(`    • Masterpiece cards: ${setData.masterpieceCards.length}`);
  console.log(`    • Story spotlight cards: ${setData.storySpotlightCards.length}`);
  
  console.log('  └─ Updating state with card data...');
  updateCardsData(
    setData.mainCards,
    setData.fullArtCards,
    setData.masterpieceCards,
    setData.storySpotlightCards
  );
  
  console.log('  └─ Rendering carousel...');
  renderPackCarousel();
  
  console.log('  └─ Updating stats...');
  updateStats();
  
  console.log('✅ === LOAD SET COMPLETE ===\n');
}

// ===== UI INITIALIZATION =====

/**
 * Initialize all UI event handlers
 */
function initializeUI() {
  // Initialize pack carousel
  initPackCarousel();
  
  // CRITICAL: Listen for carousel rotation BEFORE other events
  // This ensures proper sequencing: rotate → load → render → open
  document.addEventListener('carouselSetChange', async (e) => {
    console.log('📨 === EVENT: carouselSetChange ===');
    console.log('  └─ Set code:', e.detail?.setCode);
    console.log('  └─ Source:', e.detail?.source);
    console.log('  └─ Timestamp:', e.detail?.timestamp);
    
    console.log('  └─ Loading set data (THIS MUST COMPLETE FIRST)...');
    await loadSet();
    console.log('    ✅ Set data loaded');
    
    console.log('  └─ Updating UI...');
    updateUI();
    console.log('    ✅ UI updated');
    
    console.log('✅ === EVENT: carouselSetChange COMPLETE ===\n');
  });
  
  // Pack opening event
  document.addEventListener('openPack', async (e) => {
    console.log('📨 === EVENT: openPack ===');
    console.log('  └─ Event detail setCode:', e.detail?.setCode);
    console.log('  └─ getCurrentSet():', getCurrentSet());
    
    const freeMode = document.getElementById('freeMode').checked;
    console.log('  └─ Free mode:', freeMode);
    
    console.log('  └─ Calling openPack()...');
    await openPack(freeMode);
    
    console.log('  └─ Refreshing carousel...');
    renderPackCarousel();
    
    console.log('  └─ Updating UI and stats...');
    updateUI();
    updateStats();
    
    console.log('✅ === EVENT: openPack COMPLETE ===\n');
  });
  
  // Open pack button
  document.getElementById('openPackHome').onclick = () => {
    console.log('🔘 === BUTTON: Open Pack ===');
    const currentSet = getCurrentSet();
    console.log('  └─ getCurrentSet():', currentSet);
    
    const event = new CustomEvent('openPack', { 
      detail: { setCode: currentSet } 
    });
    document.dispatchEvent(event);
  };
  
  // Navigation
  document.getElementById('viewCollection').onclick = () => {
    console.log('🔘 === BUTTON: View Collection ===');
    showCollectionView();
  };
  
  document.getElementById('backHome').onclick = () => {
    console.log('🔘 === BUTTON: Back Home ===');
    showHomeScreen();
  };
  
  // Set selector - changing dropdown
  document.getElementById('setSelect').onchange = async (event) => {
    console.log('🔽 === DROPDOWN: Set Changed ===');
    console.log('  └─ New value:', event.target.value);
    
    console.log('  └─ Updating state...');
    setCurrentSet(event.target.value);
    
    console.log('  └─ Loading set...');
    await loadSet();
    
    console.log('✅ === DROPDOWN: Set Changed COMPLETE ===\n');
  };
  
  // Free mode toggle
  document.getElementById('freeMode').onchange = () => {
    console.log('🔘 === TOGGLE: Free Mode ===');
    updateUI();
  };
  
  // Dev tools (FIXED - removed library test)
  initDevPanel();
  initAddCard();
  initTestGlareManual();
  initDiagnostic();
  
  console.log('✅ UI initialized\n');
}

// ===== COUNTDOWN TIMER =====

/**
 * Start the countdown timer for point regeneration
 */
function startCountdownTimer() {
  tick(); // Initial tick
  setInterval(tick, COUNTDOWN_UPDATE_INTERVAL);
}

/**
 * Update countdown timer and regenerate points
 */
function tick() {
  const now = Date.now();
  const lastTimestamp = getLastTimestamp();
  const diff = now - lastTimestamp;
  const hoursElapsed = Math.floor(diff / INTERVAL);
  
  // Add points for elapsed hours
  if (hoursElapsed > 0) {
    addPoints(hoursElapsed);
    updateLastTimestamp(lastTimestamp + (hoursElapsed * INTERVAL));
  }
  
  // Calculate time remaining until next point
  const remaining = INTERVAL - (now - getLastTimestamp());
  const formattedTime = formatTime(remaining);
  
  document.getElementById('countdown').textContent = `Next point in: ${formattedTime}`;
  
  updateUI();
}

// ===== UI UPDATES =====

/**
 * Update UI elements based on current state
 */
function updateUI() {
  const freeMode = document.getElementById('freeMode').checked;
  const btn = document.getElementById('openPackHome');
  const costSpan = document.getElementById('packCost');
  const pointsSpan = document.getElementById('points');
  
  if (freeMode) {
    costSpan.textContent = '0';
    pointsSpan.textContent = '∞';
    btn.style.background = 'linear-gradient(135deg,#ff6b6b,#ee5a6f)';
    btn.disabled = false;
  } else {
    costSpan.textContent = PACK_COST;
    pointsSpan.textContent = getPoints();
    btn.style.background = 'linear-gradient(135deg,#4facfe,#00f2fe)';
    btn.disabled = getPoints() < PACK_COST;
  }
}

// ===== START APPLICATION =====

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
