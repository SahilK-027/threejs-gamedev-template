# AudioManager - Improved Architecture

## Overview

The AudioManager has been refactored to support multiple audio categories with better organization, maintainability, and robustness.

## Key Improvements

### 1. **Multi-Category Support**
- **BGM (Background Music)**: Looping music tracks for ambiance
- **AMBIENT**: Environmental sounds (birds, wind, rain, crickets) that play alongside BGM
- **NARRATION**: Voice-overs, dialogue, tutorials
- **SFX (Sound Effects)**: One-shot sounds for user interactions (clicks, jumps, collisions)

### 2. **Unified API**
```javascript
// New unified play method
audioManager.play(assetId, category, options);

// Examples:
audioManager.play('menuMusic', AUDIO_CATEGORIES.BGM, { loop: true, fadeIn: 2.0 });
audioManager.play('birdsChirping', AUDIO_CATEGORIES.AMBIENT, { loop: true, volume: 0.6 });
audioManager.play('tutorialVoice', AUDIO_CATEGORIES.NARRATION, { volume: 0.9 });
audioManager.play('jumpSound', AUDIO_CATEGORIES.SFX, { volume: 0.8 });
```

### 3. **Better Organization**
- Separate tracking for each audio category
- Cleaner pause/resume state management
- Multiple SFX can play simultaneously using a Map
- Internal helper methods for better code reusability

### 4. **Enhanced Volume Control**
```javascript
// Set volume by category
audioManager.setVolume('master', 0.8);
audioManager.setVolume(AUDIO_CATEGORIES.BGM, 0.5);
audioManager.setVolume(AUDIO_CATEGORIES.AMBIENT, 0.6);
audioManager.setVolume(AUDIO_CATEGORIES.NARRATION, 0.9);
audioManager.setVolume(AUDIO_CATEGORIES.SFX, 1.0);

// Get current volume
const ambientVolume = audioManager.getVolume(AUDIO_CATEGORIES.AMBIENT);
```

### 5. **Improved Pause/Resume**
```javascript
// Pause/resume by category
audioManager.pause(AUDIO_CATEGORIES.BGM);
audioManager.resume(AUDIO_CATEGORIES.BGM);

audioManager.pause(AUDIO_CATEGORIES.NARRATION);
audioManager.resume(AUDIO_CATEGORIES.NARRATION);

// NEW: Pause/resume specific ambient sound
const birdsSound = audioManager.play('birdsChirping', AUDIO_CATEGORIES.AMBIENT, { loop: true });
audioManager.pause(AUDIO_CATEGORIES.AMBIENT, birdsSound.ambientId);
audioManager.resume(AUDIO_CATEGORIES.AMBIENT, birdsSound.ambientId);

// Pause/resume ALL ambient sounds
audioManager.pause(AUDIO_CATEGORIES.AMBIENT);
audioManager.resume(AUDIO_CATEGORIES.AMBIENT);

// Pause/resume specific SFX
const engineSound = audioManager.play('engineLoop', AUDIO_CATEGORIES.SFX, { loop: true });
audioManager.pause(AUDIO_CATEGORIES.SFX, engineSound.sfxId);
audioManager.resume(AUDIO_CATEGORIES.SFX, engineSound.sfxId);

// Pause/resume ALL SFX
audioManager.pause(AUDIO_CATEGORIES.SFX);
audioManager.resume(AUDIO_CATEGORIES.SFX);
```

### 6. **Better Status Checking**
```javascript
// Check if a category is playing
if (audioManager.isPlaying(AUDIO_CATEGORIES.BGM)) {
  console.log('BGM is playing');
}

// Check mute state
if (audioManager.isMutedState()) {
  console.log('Audio is muted');
}
```

### 7. **SFX Control**
```javascript
// Play looping SFX and get reference
const ambientSound = audioManager.play('ambientLoop', AUDIO_CATEGORIES.SFX, { 
  loop: true, 
  volume: 0.5 
});

// Control specific SFX using the returned sfxId
audioManager.pause(AUDIO_CATEGORIES.SFX, ambientSound.sfxId);
audioManager.resume(AUDIO_CATEGORIES.SFX, ambientSound.sfxId);
audioManager.stop(AUDIO_CATEGORIES.SFX, 0, ambientSound.sfxId);
```

### 8. **Backward Compatibility**
All legacy methods are still supported:
- `playBGM()`, `stopBGM()`, `pauseBGM()`, `resumeBGM()`
- `playSFX()`
- `setMasterVolume()`, `setBGMVolume()`, `setSFXVolume()`

## Architecture

### Data Structure
```javascript
// Volume controls
volumes = {
  master: 1.0,
  bgm: 0.5,
  ambient: 0.6,
  narration: 0.8,
  sfx: 1.0
}

// Active tracks
activeTracks = {
  bgm: { source, gainNode, id, loop },
  ambient: Map<ambientId, { source, gainNode, id, loop, ambientId }>,
  narration: { source, gainNode, id, loop },
  sfx: Map<sfxId, { source, gainNode, id, loop, sfxId }>
}

// Pause state
pauseState = {
  bgm: { isPaused, startTime, pauseTime, savedId, savedLoop },
  ambient: Map<ambientId, { isPaused, startTime, pauseTime, savedId, savedLoop, savedVolume }>,
  narration: { isPaused, startTime, pauseTime, savedId, savedLoop },
  sfx: Map<sfxId, { isPaused, startTime, pauseTime, savedId, savedLoop, savedVolume }>
}
```

### Internal Methods
- `_createAudioTrack()`: Creates source and gain nodes
- `_stopTrack()`: Stops and disconnects audio nodes
- `_playBGM()`, `_playAmbient()`, `_playNarration()`, `_playSFX()`: Category-specific playback
- `_pauseAmbient()`, `_resumeAmbient()`: Ambient-specific pause/resume handling
- `_pauseSFX()`, `_resumeSFX()`: SFX-specific pause/resume handling
- `_updateActiveVolumes()`, `_updateCategoryVolume()`: Volume management
- `_setupUserInteractionHandlers()`: Browser autoplay policy handling

## Usage Examples

See `AudioManager.example.js` for comprehensive usage examples.

## Common Use Cases

### Looping Ambient SFX
```javascript
// Start ambient sound (rain, wind, engine, etc.)
const rainSound = audioManager.play('rainLoop', AUDIO_CATEGORIES.SFX, {
  loop: true,
  volume: 0.4,
});

// Pause when player enters building
audioManager.pause(AUDIO_CATEGORIES.SFX, rainSound.sfxId);

// Resume when player exits
audioManager.resume(AUDIO_CATEGORIES.SFX, rainSound.sfxId);
```

### Game Pause Menu
```javascript
// When game pauses
function onGamePause() {
  audioManager.pause(AUDIO_CATEGORIES.BGM);
  audioManager.pause(AUDIO_CATEGORIES.SFX); // Pause all SFX
}

// When game resumes
function onGameResume() {
  audioManager.resume(AUDIO_CATEGORIES.BGM);
  audioManager.resume(AUDIO_CATEGORIES.SFX); // Resume all SFX
}
```

### Cutscene with Narration
```javascript
// Start cutscene
function startCutscene() {
  // Lower BGM and ambient volumes
  audioManager.setVolume(AUDIO_CATEGORIES.BGM, 0.2);
  audioManager.setVolume(AUDIO_CATEGORIES.AMBIENT, 0.3);
  
  // Play narration
  audioManager.play('cutsceneVoice', AUDIO_CATEGORIES.NARRATION, {
    volume: 1.0,
  });
}

// End cutscene
function endCutscene() {
  // Restore volumes
  audioManager.setVolume(AUDIO_CATEGORIES.BGM, 0.5);
  audioManager.setVolume(AUDIO_CATEGORIES.AMBIENT, 0.6);
  
  // Stop narration
  audioManager.stop(AUDIO_CATEGORIES.NARRATION);
}
```

### Environmental Ambient Sounds
```javascript
// Forest scene - layer multiple ambient sounds
const birdsAmbient = audioManager.play('forestBirds', AUDIO_CATEGORIES.AMBIENT, {
  loop: true,
  fadeIn: 3.0,
  volume: 0.6,
});

const windAmbient = audioManager.play('forestWind', AUDIO_CATEGORIES.AMBIENT, {
  loop: true,
  fadeIn: 3.0,
  volume: 0.4,
});

// Transition to night
audioManager.stop(AUDIO_CATEGORIES.AMBIENT, 2.0, birdsAmbient.ambientId);
const cricketsAmbient = audioManager.play('nightCrickets', AUDIO_CATEGORIES.AMBIENT, {
  loop: true,
  fadeIn: 3.0,
  volume: 0.5,
});
```

## Migration Guide

### Old Code
```javascript
audioManager.playBGM('myMusic', true, 2.0);
audioManager.playSFX('jumpSound', 0.8);
```

### New Code (Recommended)
```javascript
audioManager.play('myMusic', AUDIO_CATEGORIES.BGM, { loop: true, fadeIn: 2.0 });
audioManager.play('jumpSound', AUDIO_CATEGORIES.SFX, { volume: 0.8 });
```

### Both Work!
The old methods still work for backward compatibility, but the new API is more flexible and maintainable.

## Benefits

1. **Scalability**: Easy to add new audio categories if needed
2. **Maintainability**: Clear separation of concerns, DRY principles
3. **Flexibility**: Unified API with options object for extensibility
4. **Robustness**: Better state management and error handling
5. **Readability**: Self-documenting code with clear method names
6. **Backward Compatible**: Existing code continues to work
7. **Fine-grained Control**: Pause/resume individual SFX or all at once
8. **Looping SFX Support**: Can now pause/resume looping sound effects
