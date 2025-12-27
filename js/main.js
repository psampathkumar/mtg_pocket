/**
 * MTG Pocket - Main Application
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
import { openPack, updatePackImage } from './pack-opening.js';
import { showCollectionView, showHomeScreen, updateStats } from './collection.js';
import {
  initDevPanel,
  initAddCard,
  initTestGlareManual,
  initTestGlareLibrary,
  initDiagnostic
} from './dev-tools.js';

// ===== INITIALIZATION =====

/**
 * Initialize the application
 */
async function init() {
  console.log('=== MTG Pocket Initializing ===');
  
  // Load saved data
  initializeState();
  
  // Load sets
  await loadSets();
  
  // Initialize UI
  initializeUI();
  
  // Start countdown timer
  startCountdownTimer();
  
  // Initial UI update
  updateUI();
  
  console.log('=== MTG Pocket Ready ===');
}

// ===== SET LOADING =====

/**
 * Load all MTG sets and populate the set selector
 */
async function loadSets() {
  console.log('Loading sets...');
  
  const allSets = await fetchAllSets();
  const filteredSets = filterSets(allSets);
  const sortedSets = sortSetsByDate(filteredSets);
  
  const setSelect = document.getElementById('setSelect');
  setSelect.innerHTML = '';
  
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
  setCurrentSet(initialSet);
  setSelect.value = initialSet;
  
  // Load the initial set
  await loadSet();
  
  console.log('Sets loaded');
}

/**
 * Load card data for the current set
 */
async function loadSet() {
  const currentSet = getCurrentSet();
  console.log('Loading set:', currentSet);
  
  // Get all sets from state
  const { getState } = await import('./state.js');
  const stateData = getState();
  const allSets = Object.keys(stateData.setData).map(code => ({
    code,
    ...stateData.setData[code]
  }));
  
  const setData = await loadCompleteSetData(currentSet, allSets);
  
  updateCardsData(
    setData.mainCards,
    setData.fullArtCards,
    setData.masterpieceCards,
    setData.storySpotlightCards
  );
  
  updatePackImage();
  updateStats();
  
  console.log('Set loaded:', currentSet);
}

// ===== UI INITIALIZATION =====

/**
 * Initialize all UI event handlers
 */
function initializeUI() {
  // Pack opening
  document.getElementById('openPackHome').onclick = handleOpenPack;
  document.getElementById('packImage').onclick = handleOpenPack;
  
  // Navigation
  document.getElementById('viewCollection').onclick = showCollectionView;
  document.getElementById('backHome').onclick = showHomeScreen;
  
  // Set selector
  document.getElementById('setSelect').onchange = handleSetChange;
  
  // Free mode toggle
  document.getElementById('freeMode').onchange = updateUI;
  
  // Dev tools
  initDevPanel();
  initAddCard();
  initTestGlareManual();
  initTestGlareLibrary();
  initDiagnostic();
}

// ===== EVENT HANDLERS =====

/**
 * Handle pack opening
 */
async function handleOpenPack() {
  const freeMode = document.getElementById('freeMode').checked;
  await openPack(freeMode);
  updateUI();
  updateStats();
}

/**
 * Handle set change
 */
async function handleSetChange(event) {
  setCurrentSet(event.target.value);
  await loadSet();
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