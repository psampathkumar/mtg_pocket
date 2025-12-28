/**
 * MTG Pocket - Pack Carousel (REFACTORED WITH PROPER SEQUENCING)
 * 
 * Manages the 3-pack carousel display on home screen.
 * 
 * CRITICAL FIX: Proper async/await sequencing to ensure:
 * 1. State is updated
 * 2. Card data is loaded
 * 3. THEN carousel is rendered
 * 
 * NEW FEATURE: Vertical pack names on side packs for mobile visibility
 */

import { getRecentPacks, setCurrentSet, getCurrentSet, getSetMetadata } from './state.js';

/**
 * Render the pack carousel
 */
export function renderPackCarousel() {
  console.log('🎨 === renderPackCarousel START ===');
  
  const carousel = document.getElementById('packCarousel');
  if (!carousel) {
    console.error('❌ Pack carousel element not found');
    return;
  }
  
  const currentSet = getCurrentSet();
  console.log('📍 Current set from state:', currentSet);
  
  if (!currentSet) {
    console.warn('⚠️ No current set selected');
    carousel.innerHTML = '<div style="color:#666;text-align:center;padding:2rem">Select a set from the dropdown to begin</div>';
    return;
  }
  
  const recentPacks = getRecentPacks();
  console.log('📚 Recent packs from state:', recentPacks);
  
  // Build display array: [left, center, right]
  const displayPacks = buildDisplayArray(currentSet, recentPacks);
  console.log('🎯 Display array built:', displayPacks);
  
  carousel.innerHTML = '';
  
  // Create 3 pack elements
  displayPacks.forEach((setCode, index) => {
    const position = ['left', 'center', 'right'][index];
    console.log(`  └─ Creating pack [${index}]: ${setCode} at position: ${position}`);
    const packDiv = createPackElement(setCode, position);
    carousel.appendChild(packDiv);
  });
  
  console.log('✅ === renderPackCarousel COMPLETE ===\n');
}

/**
 * Build the display array [left, center, right]
 * Center is always currentSet, sides are recent history
 */
function buildDisplayArray(currentSet, recentPacks) {
  const center = currentSet;
  const uniqueRecent = recentPacks.filter(code => code !== center);
  
  let left, right;
  
  if (uniqueRecent.length === 0) {
    left = center;
    right = center;
  } else if (uniqueRecent.length === 1) {
    left = uniqueRecent[0];
    right = uniqueRecent[0];
  } else {
    left = uniqueRecent[0];
    right = uniqueRecent[1];
  }
  
  return [left, center, right];
}

/**
 * Create a pack element with vertical name labels
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
  
  // Get set metadata
  const setMetadata = getSetMetadata(setCode);
  const setName = setMetadata?.name || setCode;
  
  // NEW FEATURE: Add vertical label for side packs
  if (position !== 'center') {
    const verticalLabel = document.createElement('div');
    verticalLabel.className = 'packVerticalLabel';
    verticalLabel.textContent = setName;
    packDiv.appendChild(verticalLabel);
  }
  
  // Try mtgpics.com logo first, fallback to set name
  const logo = document.createElement('img');
  logo.className = 'packLogo';
  logo.alt = 'Set Logo';
  logo.src = `https://www.mtgpics.com/graph/sets/logos_big/${setCode}.png`;
  logo.style.display = 'block';
  
  logo.onerror = () => { 
    console.warn(`⚠️ Failed to load logo for ${setCode}, using fallback`);
    logo.style.display = 'none';
    
    const nameDiv = document.createElement('div');
    nameDiv.textContent = setName;
    nameDiv.style.cssText = 'font-size:clamp(1.2rem,3vw,1.8rem);font-weight:bold;text-align:center;color:#4facfe;text-shadow:0 2px 10px rgba(79,172,254,0.5)';
    contentDiv.appendChild(nameDiv);
  };
  
  logo.onload = () => { 
    console.log(`  └─ ✅ Logo loaded for ${setCode}`);
    logo.style.display = 'block'; 
  };
  
  const icon = document.createElement('img');
  icon.className = 'packIcon';
  icon.alt = 'Set Icon';
  
  if (setMetadata?.icon) {
    icon.src = setMetadata.icon;
    icon.style.display = 'block';
    icon.onerror = () => {
      console.warn(`⚠️ Failed to load icon for ${setCode}`);
      icon.style.display = 'none';
    };
    icon.onload = () => {
      console.log(`  └─ ✅ Icon loaded for ${setCode}`);
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
    // Center pack opens - ALWAYS uses getCurrentSet()
    packDiv.onclick = (e) => {
      if (packDiv.classList.contains('ripping')) return;
      
      const actualCurrentSet = getCurrentSet();
      console.log('🎯 === CENTER PACK CLICKED ===');
      console.log('  └─ Pack element dataset:', packDiv.dataset.setCode);
      console.log('  └─ getCurrentSet():', actualCurrentSet);
      console.log('  └─ Dropdown value:', document.getElementById('setSelect')?.value);
      
      const event = new CustomEvent('openPack', { 
        detail: { setCode: actualCurrentSet } 
      });
      document.dispatchEvent(event);
    };
  } else {
    // Side packs rotate carousel
    packDiv.onclick = async (e) => {
      if (packDiv.classList.contains('ripping')) return;
      
      console.log('🔄 === SIDE PACK CLICKED ===');
      console.log('  └─ Set code:', setCode);
      console.log('  └─ Position:', position);
      
      await rotateTo(setCode, position);
    };
  }
  
  return packDiv;
}

/**
 * Rotate carousel to bring a side pack to center
 * REFACTORED: Proper async/await sequencing
 */
async function rotateTo(setCode, fromPosition) {
  console.log('⚙️ === ROTATE TO START ===');
  console.log('  └─ Target set:', setCode);
  console.log('  └─ From position:', fromPosition);
  
  // Step 1: Update state
  console.log('  └─ STEP 1: Updating state...');
  setCurrentSet(setCode);
  console.log('    ✅ State updated. getCurrentSet():', getCurrentSet());
  
  // Step 2: Update dropdown UI
  console.log('  └─ STEP 2: Updating dropdown...');
  const dropdown = document.getElementById('setSelect');
  if (dropdown) {
    dropdown.value = setCode;
    console.log('    ✅ Dropdown updated to:', dropdown.value);
  }
  
  // Step 3: Load set data (CRITICAL - must happen before rendering)
  console.log('  └─ STEP 3: Loading set data...');
  const event = new CustomEvent('carouselSetChange', { 
    detail: { 
      setCode, 
      source: 'carousel-rotation',
      timestamp: Date.now()
    } 
  });
  document.dispatchEvent(event);
  console.log('    ✅ carouselSetChange event dispatched');
  
  // Note: The actual loadSet() happens in main.js listener
  // Carousel will be re-rendered after loadSet() completes
  
  console.log('✅ === ROTATE TO COMPLETE ===\n');
}

/**
 * Add ripping animation to center pack
 */
export function startRipAnimation() {
  console.log('🎬 Starting rip animation...');
  const centerPack = document.querySelector('.packImage.center');
  
  if (centerPack) {
    centerPack.classList.add('ripping');
    console.log('  ✅ Rip animation started');
    
    return new Promise(resolve => {
      setTimeout(() => {
        if (centerPack) {
          centerPack.classList.remove('ripping');
          console.log('  ✅ Rip animation complete');
        }
        resolve();
      }, 800);
    });
  }
  
  console.log('  ⚠️ No center pack found for animation');
  return Promise.resolve();
}

/**
 * Initialize carousel
 */
export function initPackCarousel() {
  console.log('🚀 Initializing pack carousel...');
  
  const currentSet = getCurrentSet();
  if (!currentSet) {
    console.warn('⚠️ No current set, waiting for set selection');
    return;
  }
  
  console.log('  └─ Initial set:', currentSet);
  renderPackCarousel();
  console.log('✅ Pack carousel initialized\n');
}