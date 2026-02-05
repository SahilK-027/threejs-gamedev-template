import Game from './Game/Game.class';
import ResourceLoader from './Game/Utils/ResourceLoader.class';
import ASSETS from './Config/assets.js';

const isDebugMode =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mode') === 'debug';

const progressBar = document.getElementById('bar');
const progress = document.getElementById('progress');
const resources = new ResourceLoader(ASSETS);

resources.on('progress', ({ id, itemsLoaded, itemsTotal, percent }) => {
  progressBar.style.width = `${percent.toFixed(1)}%`;
  if (isDebugMode) {
    console.log(
      `Loaded asset: "${id}" (${itemsLoaded}/${itemsTotal} — ${percent.toFixed(
        1
      )}%)`
    );
  }
});

resources.on('error', ({ id, url, itemsLoaded, itemsTotal }) => {
  console.error(
    `❌ Failed to load item named "${id}" at "${url}" (${itemsLoaded}/${itemsTotal} so far)`
  );
});

resources.on('loaded', () => {
  if (isDebugMode) {
    if (Object.keys(resources.items).length) {
      console.log('✅ All assets are loaded. Initializing game…!');
    } else {
      console.log('☑️ No asset to load. Initializing game…!');
    }
  }

  // Hide progress bar
  progressBar.style.display = 'none';
  progress.style.display = 'none';

  // Show start overlay
  const startOverlay = document.getElementById('start-overlay');
  startOverlay.classList.add('visible');

  // Initialize game but don't start audio yet
  const game = new Game(document.getElementById('three'), resources, isDebugMode);

  // Handle start button click
  const startButton = document.getElementById('start-game-btn');

  startButton.addEventListener('click', () => {
    // Start audio after user interaction
    game.audioManager.startBGM();
    
    // Hide overlay
    startOverlay.classList.remove('visible');
    
    // Remove overlay after animation
    setTimeout(() => {
      startOverlay.remove();
    }, 500);
  });
});
