/**
 * MTG Pocket - Developer Tools (UPDATED TEST WITH REBALANCED INTENSITIES)
 * 
 * Development features for testing and debugging.
 */

import { MTG_CARD_BACK } from './constants.js';
import { 
  getCurrentSet, 
  getAllCards, 
  getStorySpotlightCards,
  addCard,
  save
} from './state.js';
import { getCardImages, getRandomElement, enableTilt } from './utils.js';
import { renderCollection, updateStats } from './collection.js';

// ===== DEV PANEL TOGGLE =====

/**
 * Initialize dev panel toggle
 */
export function initDevPanel() {
  const devToggle = document.getElementById('devToggle');
  const devPanel = document.getElementById('devPanel');
  
  if (!devToggle || !devPanel) {
    console.warn('Dev panel elements not found - skipping initialization');
    return;
  }
  
  devToggle.onclick = () => {
    devPanel.style.display = devPanel.style.display === 'none' ? 'block' : 'none';
  };
}

// ===== ADD CARD BY COLLECTOR NUMBER =====

/**
 * Initialize add card functionality
 */
export function initAddCard() {
  const addCardBtn = document.getElementById('addCardBtn');
  const collectorInput = document.getElementById('collectorInput');
  
  if (!addCardBtn || !collectorInput) {
    console.warn('Add card elements not found - skipping initialization');
    return;
  }
  
  addCardBtn.onclick = () => {
    const collectorNum = collectorInput.value.trim();
    
    if (!collectorNum) {
      alert('Please enter a collector number');
      return;
    }
    
    const currentSet = getCurrentSet();
    const allCards = getAllCards();
    const storySpotlightCards = getStorySpotlightCards();
    
    const card = allCards.find(c => c.collector_number === collectorNum);
    
    if (!card) {
      alert(`Card with collector number ${collectorNum} not found in current set`);
      return;
    }
    
    const cardId = card.id;
    const isSpotlight = storySpotlightCards.some(sc => sc.id === card.id);
    const imgs = getCardImages(card);
    
    const cardData = {
      name: card.name,
      rarity: card.rarity,
      img: imgs.front,
      backImg: imgs.back,
      count: 0,
      fullart: false,
      spotlight: isSpotlight,
      collectorNum: card.collector_number
    };
    
    addCard(currentSet, cardId, cardData);
    save();
    renderCollection();
    updateStats();
    
    alert(`Added ${card.name} (${collectorNum}) to collection!`);
    collectorInput.value = '';
  };
}

// ===== TEST ENHANCED HOLOGRAPHIC EFFECT =====

/**
 * Initialize enhanced holographic test with ALL card types including full-art and masterpiece
 */
export function initTestGlareManual() {
  const testGlareBtn = document.getElementById('testGlareBtn');
  
  if (!testGlareBtn) {
    console.warn('Test glare button not found - skipping initialization');
    return;
  }
  
  testGlareBtn.onclick = async () => {
    const modal = document.getElementById('cardViewModal');
    modal.style.display = 'flex';
    modal.innerHTML = '<div style="padding:2rem;color:#fff">Loading cards...</div>';
    
    // Get cards of different types from current set
    const allCards = getAllCards();
    
    const testCards = [
      { 
        type: 'masterpiece', 
        label: 'MASTERPIECE',
        card: allCards.find(c => c.rarity === 'mythic'),
        cardData: { rarity: 'mythic', fullart: false, masterpiece: true }
      },
      { 
        type: 'fullart', 
        label: 'FULL-ART',
        card: allCards.find(c => c.rarity === 'rare'),
        cardData: { rarity: 'rare', fullart: true, masterpiece: false }
      },
      { 
        type: 'mythic', 
        label: 'MYTHIC',
        card: allCards.find(c => c.rarity === 'mythic'),
        cardData: { rarity: 'mythic', fullart: false, masterpiece: false }
      },
      { 
        type: 'rare', 
        label: 'RARE',
        card: allCards.find(c => c.rarity === 'rare'),
        cardData: { rarity: 'rare', fullart: false, masterpiece: false }
      },
      { 
        type: 'uncommon', 
        label: 'UNCOMMON',
        card: allCards.find(c => c.rarity === 'uncommon'),
        cardData: { rarity: 'uncommon', fullart: false, masterpiece: false }
      },
      { 
        type: 'common', 
        label: 'COMMON',
        card: allCards.find(c => c.rarity === 'common'),
        cardData: { rarity: 'common', fullart: false, masterpiece: false }
      }
    ].filter(item => item.card); // Remove any that don't exist
    
    if (testCards.length === 0) {
      modal.innerHTML = '<div style="padding:2rem;color:#fff">No cards available for testing. Please load a set first.</div>';
      setTimeout(() => modal.style.display = 'none', 2000);
      return;
    }
    
    modal.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2rem;padding:2rem;max-width:95vw;overflow-y:auto;max-height:90vh';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = '✨ Enhanced Holographic Effect Test';
    title.style.cssText = 'color:#fff;margin:0;text-align:center;font-size:clamp(1.2rem, 4vw, 1.5rem)';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Hover/touch each card to see intensity differences';
    subtitle.style.cssText = 'color:#aaa;margin:0.5rem 0 0 0;text-align:center;font-size:clamp(0.8rem, 3vw, 0.9rem)';
    
    container.appendChild(title);
    container.appendChild(subtitle);
    
    // Create card display grid
    const cardGrid = document.createElement('div');
    cardGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:clamp(1rem, 3vw, 2rem);width:100%;max-width:900px';
    
    testCards.forEach(({ type, label, card, cardData }) => {
      const cardContainer = document.createElement('div');
      cardContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:0.5rem';
      
      // Card wrapper
      const perspectiveDiv = document.createElement('div');
      perspectiveDiv.style.cssText = 'perspective:800px;width:clamp(140px, 30vw, 200px);height:clamp(196px, 42vw, 280px)';
      
      const testCard = document.createElement('div');
      testCard.className = `card rarity-${cardData.rarity}`;
      testCard.style.cssText = 'width:100%;height:100%;position:relative';
      
      const innerContainer = document.createElement('div');
      innerContainer.className = 'card-inner';
      innerContainer.style.cssText = 'width:100%;height:100%;position:relative';
      
      // Front face
      const front = document.createElement('div');
      front.className = 'card-front';
      front.style.cssText = 'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px;overflow:hidden';
      const frontImg = document.createElement('img');
      const imgs = getCardImages(card);
      frontImg.src = imgs.front;
      frontImg.style.cssText = 'width:100%;height:100%;object-fit:cover';
      front.appendChild(frontImg);
      
      innerContainer.appendChild(front);
      testCard.appendChild(innerContainer);
      perspectiveDiv.appendChild(testCard);
      
      // ✨ APPLY ENHANCED HOLOGRAPHIC EFFECT WITH PROPER CARD DATA ✨
      const fullCardData = { 
        ...cardData,
        name: card.name
      };
      enableTilt(testCard, fullCardData);
      
      // Type label
      const labelDiv = document.createElement('div');
      labelDiv.textContent = label;
      labelDiv.style.cssText = `
        color:#fff;
        font-weight:700;
        font-size:clamp(0.75rem, 2.5vw, 0.9rem);
        text-transform:uppercase;
        letter-spacing:0.1em;
        padding:0.4rem 0.8rem;
        border-radius:6px;
        background:${getTypeColor(type)};
        white-space:nowrap;
      `;
      
      // Intensity info
      const intensityInfo = document.createElement('div');
      intensityInfo.textContent = getIntensityText(type);
      intensityInfo.style.cssText = 'color:#aaa;font-size:clamp(0.7rem, 2vw, 0.8rem);text-align:center';
      
      cardContainer.appendChild(perspectiveDiv);
      cardContainer.appendChild(labelDiv);
      cardContainer.appendChild(intensityInfo);
      cardGrid.appendChild(cardContainer);
    });
    
    container.appendChild(cardGrid);
    
    // Mobile instruction
    const mobileNote = document.createElement('p');
    mobileNote.textContent = '📱 On mobile: Touch and drag to see the effect';
    mobileNote.style.cssText = 'color:#888;font-size:clamp(0.75rem, 2.5vw, 0.85rem);text-align:center;margin-top:0.5rem';
    container.appendChild(mobileNote);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'padding:0.75rem 2rem;font-size:1rem;background:#666;margin-top:1rem';
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };
    
    container.appendChild(closeBtn);
    modal.appendChild(container);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  };
}

/**
 * Get type color for label background (UPDATED)
 */
function getTypeColor(type) {
  const colors = {
    masterpiece: 'linear-gradient(135deg, #9b59b6, #8e44ad)', // Purple (most intense)
    fullart: 'linear-gradient(135deg, #e74c3c, #c0392b)',      // Red (very strong)
    mythic: 'linear-gradient(135deg, #ff8000, #ff6000)',       // Orange
    rare: 'linear-gradient(135deg, #0070dd, #0050aa)',         // Blue
    uncommon: 'linear-gradient(135deg, #1eff00, #00cc00)',     // Green
    common: 'linear-gradient(135deg, #999, #666)'              // Gray
  };
  return colors[type] || colors.common;
}

/**
 * Get intensity description (UPDATED)
 */
function getIntensityText(type) {
  const intensities = {
    masterpiece: '2.0x (Maximum)',
    fullart: '1.7x (Very Strong)',
    mythic: '1.3x (Strong)',
    rare: '1.0x (Standard)',
    uncommon: '0.75x (Medium)',
    common: '0.5x (Subtle)'
  };
  return intensities[type] || '1.0x';
}

/**
 * Initialize library glare test - REMOVED/DEPRECATED
 */
export function initTestGlareLibrary() {
  // This function is no longer needed
}

/**
 * Initialize diagnostic tool
 */
export function initDiagnostic() {
  const diagnosticBtn = document.getElementById('diagnosticBtn');
  
  if (!diagnosticBtn) {
    console.warn('Diagnostic button not found - skipping initialization');
    return;
  }
  
  diagnosticBtn.onclick = async () => {
    const { getData, getCurrentSet, getAllCards, getSetCards } = await import('./state.js');
    
    const data = getData();
    const currentSet = getCurrentSet();
    const allCards = getAllCards();
    const ownedCards = currentSet ? getSetCards(currentSet) : {};
    
    const info = {
      'Current Set': currentSet || 'None',
      'Points': data.points,
      'Last Pack': data.lastPack || 'None',
      'Total Sets with Cards': Object.keys(data.cards).length,
      'Cards in Current Set': Object.keys(ownedCards).length,
      'All Cards Loaded': allCards.length,
      'LocalStorage Size': new Blob([JSON.stringify(data)]).size + ' bytes',
      'Sample Card': ownedCards[Object.keys(ownedCards)[0]] || 'None'
    };
    
    let output = '╔══ MTG POCKET DIAGNOSTIC ══╗\n\n';
    
    for (const [key, value] of Object.entries(info)) {
      output += `${key}:\n`;
      if (typeof value === 'object') {
        output += JSON.stringify(value, null, 2) + '\n\n';
      } else {
        output += `  ${value}\n\n`;
      }
    }
    
    output += '╔══ SETS WITH CARDS ══╗\n';
    for (const [setCode, cards] of Object.entries(data.cards)) {
      const cardCount = Object.keys(cards).length;
      const totalCount = Object.values(cards).reduce((sum, c) => sum + c.count, 0);
      output += `${setCode}: ${cardCount} unique cards, ${totalCount} total\n`;
    }
    
    console.log(output);
    alert('Diagnostic info logged to console! Press F12 to view.');
  };
}
