import Game from './Game/Game.class';
import ResourceLoader from './Game/Utils/ResourceLoader.class';
import ASSETS from './Config/assets.js';

const urlParams = new URLSearchParams(window.location.search);
const isDebugMode =
  typeof window !== 'undefined' && urlParams.get('mode') === 'debug';
const environmentMode = urlParams.get('env') || 'game'; // 'game' or 'dev'

const progressBar = document.getElementById('bar');
const progress = document.getElementById('progress');
const resources = new ResourceLoader(ASSETS);

resources.on('progress', ({ id, itemsLoaded, itemsTotal, percent }) => {
  progressBar.style.width = `${percent.toFixed(1)}%`;
  if (isDebugMode) {
    console.log(
      `Loaded asset: "${id}" (${itemsLoaded}/${itemsTotal} — ${percent.toFixed(
        1,
      )}%)`,
    );
  }
});

resources.on('error', ({ id, url, itemsLoaded, itemsTotal }) => {
  console.error(
    `❌ Failed to load item named "${id}" at "${url}" (${itemsLoaded}/${itemsTotal} so far)`,
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

  // Show environment indicator
  const envIndicator = document.getElementById('env-indicator');
  if (environmentMode === 'dev') {
    envIndicator.textContent = '</> DEV ENVIRONMENT';
    envIndicator.style.display = 'block';
    console.log('💡 Tip: Remove ?env=dev from URL to switch to game mode');
  }

  // Initialize game but don't start audio yet
  const game = new Game(
    document.getElementById('three'),
    resources,
    isDebugMode,
    environmentMode,
  );

  // Handle start button click
  const audioButton = document.getElementById('settings-btn');

  audioButton.addEventListener('click', () => {
    // Start audio after user interaction
    game.audioManager.startBGM();
  });
});
