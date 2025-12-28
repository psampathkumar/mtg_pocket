/**
 * MTG Pocket - Pack Carousel
 * 
 * Manages the 3-pack carousel display on home screen.
 * - Center pack always matches dropdown selection
 * - Left/right show recent history (duplicated if < 3 unique)
 * - Clicking sides rotates carousel clockwise/counter-clockwise
 * - Only center pack can be opened
 */

import { getRecentPacks, setCurrentSet, getCurrentSet, getSetMetadata } from './state.js';

/**
 * Render the pack carousel
 */
export function renderPackCarousel() {
  console.log('=== renderPackCarousel called ===');
  
  const carousel = document.getElementById('packCarousel');
  if (!carousel) {
    console.warn('Pack carousel element not found');
    return;
  }
  
  const currentSet = getCurrentSet();
  console.log('Current set:', currentSet);
  
  if (!currentSet) {
    console.warn('No current set selected');
    carousel.innerHTML = '<div style="color:#666;text-align:center;padding:2rem">Select a set from the dropdown to begin</div>';
    return;
  }
  
  const recentPacks = getRecentPacks();
  console.log('Recent packs:', recentPacks);
  
  // Build display array: [left, center, right]
  const displayPacks = buildDisplayArray(currentSet, recentPacks);
  console.log('Display packs:', displayPacks);
  
  carousel.innerHTML = '';
  
  // Create 3 pack elements
  displayPacks.forEach((setCode, index) => {
    const position = ['left', 'center', 'right'][index];
    console.log(`Creating pack ${index}: ${setCode} at position ${position}`);
    const packDiv = createPackElement(setCode, position);
    carousel.appendChild(packDiv);
  });
  
  console.log('=== renderPackCarousel complete ===');
}

/**
 * Build the display array [left, center, right]
 * Center is always currentSet, sides are recent history
 */
function buildDisplayArray(currentSet, recentPacks) {
  // Center is always the current set
  const center = currentSet;
  
  // Get unique recent packs excluding the current center
  const uniqueRecent = recentPacks.filter(code => code !== center);
  
  // Ensure we have at least 2 items for left/right
  let left, right;
  
  if (uniqueRecent.length === 0) {
    // No history - duplicate center
    left = center;
    right = center;
  } else if (uniqueRecent.length === 1) {
    // One in history - use it for both sides
    left = uniqueRecent[0];
    right = uniqueRecent[0];
  } else {
    // Two or more in history
    left = uniqueRecent[0];
    right = uniqueRecent[1];
  }
  
  return [left, center, right];
}

/**
 * Create a pack element
 */
function createPackElement(setCode, position) {
  const packDiv = document.createElement('div');
  packDiv.className = `packImage ${position}`;
  packDiv.dataset.setCode = setCode;
  packDiv.dataset.position = position;
  
  const bgDiv = document.createElement('div');
  bgDiv.className = 'packBg';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'packContent';
  
  // Try mtgpics.com logo first, fallback to set name
  const logo = document.createElement('img');
  logo.className = 'packLogo';
  logo.alt = 'Set Logo';
  logo.src = `https://www.mtgpics.com/graph/sets/logos_big/${setCode}.png`;
  logo.style.display = 'block';
  
  logo.onerror = () => { 
    console.warn(`Failed to load mtgpics logo for ${setCode}, using fallback`);
    // Fallback: show set name as text
    logo.style.display = 'none';
    const setMetadata = getSetMetadata(setCode);
    if (setMetadata && setMetadata.name) {
      const nameDiv = document.createElement('div');
      nameDiv.textContent = setMetadata.name;
      nameDiv.style.cssText = 'font-size:clamp(1.2rem,3vw,1.8rem);font-weight:bold;text-align:center;color:#4facfe;text-shadow:0 2px 10px rgba(79,172,254,0.5)';
      contentDiv.appendChild(nameDiv);
    }
  };
  
  logo.onload = () => { 
    console.log(`✅ Logo loaded for ${setCode}`);
    logo.style.display = 'block'; 
  };
  
  const icon = document.createElement('img');
  icon.className = 'packIcon';
  icon.alt = 'Set Icon';
  
  const setMetadata = getSetMetadata(setCode);
  if (setMetadata && setMetadata.icon) {
    icon.src = setMetadata.icon;
    icon.style.display = 'block';
    icon.onerror = () => {
      console.warn(`Failed to load icon for ${setCode}`);
      icon.style.display = 'none';
    };
    icon.onload = () => {
      console.log(`✅ Icon loaded for ${setCode}`);
    };
  } else {
    icon.style.display = 'none';
  }
  
  contentDiv.appendChild(logo);
  contentDiv.appendChild(icon);
  packDiv.appendChild(bgDiv);
  packDiv.appendChild(contentDiv);
  
  // Click handlers
  if (position === 'center') {
    // Center pack opens
    packDiv.onclick = (e) => {
      if (packDiv.classList.contains('ripping')) return;
      const event = new CustomEvent('openPack', { detail: { setCode } });
      document.dispatchEvent(event);
    };
  } else {
    // Side packs rotate carousel
    packDiv.onclick = (e) => {
      if (packDiv.classList.contains('ripping')) return;
      rotateTo(setCode, position);
    };
  }
  
  return packDiv;
}

/**
 * Rotate carousel to bring a side pack to center
 * @param {string} setCode - The set code to bring to center
 * @param {string} fromPosition - 'left' or 'right'
 */
function rotateTo(setCode, fromPosition) {
  // Update current set (which updates dropdown via binding)
  setCurrentSet(setCode);
  
  // Update dropdown UI
  const dropdown = document.getElementById('setSelect');
  if (dropdown) {
    dropdown.value = setCode;
  }
  
  // Re-render carousel with new center
  renderPackCarousel();
  
  // Dispatch event for other modules
  const event = new CustomEvent('packSelected', { detail: { setCode } });
  document.dispatchEvent(event);
}

/**
 * Add ripping animation to center pack
 */
export function startRipAnimation() {
  const centerPack = document.querySelector('.packImage.center');
  if (centerPack) {
    centerPack.classList.add('ripping');
    return new Promise(resolve => {
      setTimeout(() => {
        if (centerPack) {
          centerPack.classList.remove('ripping');
        }
        resolve();
      }, 800);
    });
  }
  return Promise.resolve();
}

/**
 * Initialize carousel
 */
export function initPackCarousel() {
  console.log('Initializing pack carousel');
  
  const currentSet = getCurrentSet();
  if (!currentSet) {
    console.warn('No current set, waiting for set selection');
    return;
  }
  
  renderPackCarousel();
}