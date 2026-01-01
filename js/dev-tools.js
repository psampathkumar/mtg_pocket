/**
 * MTG Pocket - Developer Tools (FIXED HOLOGRAPHIC EFFECTS)
 * 
 * Development features for testing and debugging.
 */

import { MTG_CARD_BACK, GLARE_CONFIG, GYRO_CONFIG } from './constants.js';
import { 
  getCurrentSet, 
  getAllCards, 
  getStorySpotlightCards,
  addCard,
  save
} from './state.js';
import { getCardImages, getRandomElement } from './utils.js';
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

// ===== TEST GLARE (MANUAL IMPLEMENTATION - FIXED) =====

/**
 * Initialize manual glare test
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
    modal.innerHTML = '<div style="padding:2rem;color:#fff">Loading card...</div>';
    
    // Get a random card from current set
    const allCards = getAllCards();
    let testCardData = null;
    
    if (allCards.length > 0) {
      const randomCard = getRandomElement(allCards);
      const imgs = getCardImages(randomCard);
      testCardData = {
        front: imgs.front,
        back: imgs.back,
        name: randomCard.name
      };
    } else {
      testCardData = {
        front: MTG_CARD_BACK,
        back: MTG_CARD_BACK,
        name: 'Test Card'
      };
    }
    
    modal.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1.5rem';
    
    const perspectiveDiv = document.createElement('div');
    perspectiveDiv.style.cssText = 'perspective:1000px;width:300px;height:420px';
    
    const testCard = document.createElement('div');
    testCard.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.1s ease-out;border-radius:12px';
    
    const innerContainer = document.createElement('div');
    innerContainer.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.6s';
    
    // Front face
    const front = document.createElement('div');
    front.style.cssText = 'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px;overflow:hidden';
    const frontImg = document.createElement('img');
    frontImg.src = testCardData.front;
    frontImg.style.cssText = 'width:100%;height:100%;object-fit:cover';
    front.appendChild(frontImg);
    
    // Back face
    const back = document.createElement('div');
    back.style.cssText = 'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px;transform:rotateY(180deg);overflow:hidden';
    const backImg = document.createElement('img');
    backImg.src = testCardData.back;
    backImg.style.cssText = 'width:100%;height:100%;object-fit:cover';
    back.appendChild(backImg);
    
    // Glare overlay on front
    const glare = document.createElement('div');
    glare.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 0.3s;overflow:hidden';
    
    const glareGradient = document.createElement('div');
    glareGradient.style.cssText = `position:absolute;width:${GLARE_CONFIG.glareSize}px;height:${GLARE_CONFIG.glareSize}px;background:radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 30%, transparent 70%);transform:translate(-50%, -50%);mix-blend-mode:overlay`;
    glare.appendChild(glareGradient);
    front.appendChild(glare);
    
    // Glare overlay on back
    const glareBack = document.createElement('div');
    glareBack.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 0.3s;overflow:hidden';
    
    const glareGradientBack = document.createElement('div');
    glareGradientBack.style.cssText = `position:absolute;width:${GLARE_CONFIG.glareSize}px;height:${GLARE_CONFIG.glareSize}px;background:radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 30%, transparent 70%);transform:translate(-50%, -50%);mix-blend-mode:overlay`;
    glareBack.appendChild(glareGradientBack);
    back.appendChild(glareBack);
    
    innerContainer.appendChild(front);
    innerContainer.appendChild(back);
    testCard.appendChild(innerContainer);
    perspectiveDiv.appendChild(testCard);
    
    // Track which face is showing
    let isFlipped = false;
    
    // Mouse movement handler
    testCard.onmousemove = (e) => {
      const rect = testCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const centerX = x - 0.5;
      const centerY = y - 0.5;
      
      const rotateX = -centerY * GLARE_CONFIG.maxTiltDegrees;
      const rotateY = centerX * GLARE_CONFIG.maxTiltDegrees;
      
      testCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      // Position glare based on which face is showing
      if (!isFlipped) {
        // Front face - normal positioning
        glareGradient.style.left = `${x * 100}%`;
        glareGradient.style.top = `${y * 100}%`;
        glare.style.opacity = '1';
        glareBack.style.opacity = '0';
      } else {
        // Back face - X is the same (card is already visually mirrored)
        glareGradientBack.style.left = `${x * 100}%`;
        glareGradientBack.style.top = `${y * 100}%`;
        glareBack.style.opacity = '1';
        glare.style.opacity = '0';
      }
    };
    
    testCard.onmouseleave = () => {
      testCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
      glare.style.opacity = '0';
      glareBack.style.opacity = '0';
    };
    
    // Gyroscope support for mobile
    let gyroActive = false;
    let orientationHandler = null;
    let baseOrientation = { beta: 0, gamma: 0 };
    let hasBaseOrientation = false;
    
    if (window.DeviceOrientationEvent) {
      orientationHandler = (e) => {
        if (!e.beta || !e.gamma) return;
        
        if (!hasBaseOrientation) {
          baseOrientation = { beta: e.beta, gamma: e.gamma };
          hasBaseOrientation = true;
          return;
        }
        
        const beta = e.beta - baseOrientation.beta;
        const gamma = e.gamma - baseOrientation.gamma;
        
        const tiltX = Math.max(-1, Math.min(1, beta / GYRO_CONFIG.maxTiltAngle));
        const tiltY = Math.max(-1, Math.min(1, gamma / GYRO_CONFIG.maxTiltAngle));
        
        const rotateX = -tiltX * GLARE_CONFIG.maxTiltDegrees;
        const rotateY = tiltY * GLARE_CONFIG.maxTiltDegrees;
        
        testCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        const glareX = (tiltY + 1) / 2;
        const glareY = (1 - tiltX) / 2;
        
        if (!isFlipped) {
          // Front face
          glareGradient.style.left = `${glareX * 100}%`;
          glareGradient.style.top = `${glareY * 100}%`;
          glare.style.opacity = '1';
          glareBack.style.opacity = '0';
        } else {
          // Back face
          glareGradientBack.style.left = `${glareX * 100}%`;
          glareGradientBack.style.top = `${glareY * 100}%`;
          glareBack.style.opacity = '1';
          glare.style.opacity = '0';
        }
      };
      
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              gyroActive = true;
              window.addEventListener('deviceorientation', orientationHandler);
            }
          })
          .catch(console.error);
      } else if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        gyroActive = true;
        window.addEventListener('deviceorientation', orientationHandler);
      }
    }
    
    const flipBtn = document.createElement('button');
    flipBtn.textContent = '🔄 Flip Test';
    flipBtn.style.cssText = 'padding:0.75rem 1.5rem;font-size:1rem';
    flipBtn.onclick = () => {
      isFlipped = !isFlipped;
      innerContainer.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'padding:0.5rem 1rem;font-size:0.9rem;background:#666';
    closeBtn.onclick = () => {
      if (gyroActive && orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler);
      }
      modal.style.display = 'none';
    };
    
    container.appendChild(perspectiveDiv);
    container.appendChild(flipBtn);
    container.appendChild(closeBtn);
    modal.appendChild(container);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        if (gyroActive && orientationHandler) {
          window.removeEventListener('deviceorientation', orientationHandler);
        }
        modal.style.display = 'none';
      }
    };
  };
}

/**
 * Initialize library glare test - REMOVED/DEPRECATED
 * The hover-tilt library is not reliably loading, so we're using manual implementation only
 */
export function initTestGlareLibrary() {
  const testLibraryBtn = document.getElementById('testLibraryBtn');
  
  if (!testLibraryBtn) {
    console.warn('Test library button not found - skipping initialization');
    return;
  }
  
  // Change button to show it's deprecated
  testLibraryBtn.textContent = '⚠️ Library Test (Deprecated)';
  testLibraryBtn.disabled = true;
  testLibraryBtn.style.opacity = '0.5';
  testLibraryBtn.style.cursor = 'not-allowed';
  
  testLibraryBtn.onclick = () => {
    alert('The hover-tilt library test has been deprecated.\n\nUse "✨ Test Glare (Manual)" instead, which provides the same holographic effect with better reliability.');
  };
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
