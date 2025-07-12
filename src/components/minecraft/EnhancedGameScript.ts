export function getEnhancedMinecraftGameCode(savedState: any, roomId: string) {
  const timestamp = Date.now()
  return `
// Prevent duplicate class declarations - ${timestamp}
if (typeof window.EnhancedMinecraftGame !== 'undefined') {
  delete window.EnhancedMinecraftGame;
}

// Clean up existing game instance
if (window.game && typeof window.game.destroy === 'function') {
  window.game.destroy(true);
  window.game = null;
}

// Enhanced Minecraft Game with Real-time Multiplayer
(function() {
  'use strict';
  
  class EnhancedMinecraftGame extends Phaser.Scene {
  constructor() {
    super({ key: 'EnhancedMinecraftGame' });
    
    // Enhanced constants - Larger world
    this.BLOCK_SIZE = 32;
    this.WORLD_WIDTH = 150;  // 3x larger
    this.WORLD_HEIGHT = 80;  // 2.5x larger
    this.GRAVITY = 800;
    this.JUMP_VELOCITY = -400;
    this.PLAYER_SPEED = 200;
    
    // Game state
    this.world = [];
    this.selectedBlock = 'grass';
    this.selectedWeapon = 'none';
    this.selectedArmor = 'none';
    this.score = 0;
    this.health = 100;
    this.armor = 0;
    this.damage = 1;
    
    // Multiplayer
    this.roomId = '${roomId}';
    this.otherPlayers = new Map();
    this.lastSyncTime = 0;
    this.syncInterval = 1000; // Sync every second
    
    // Block types with new materials
    this.blockTypes = {
      grass: { color: 0x7CB342, emoji: '🌱' },
      stone: { color: 0x757575, emoji: '🪨' },
      wood: { color: 0x8D6E63, emoji: '🪵' },
      dirt: { color: 0x5D4037, emoji: '🟫' },
      water: { color: 0x2196F3, emoji: '💧' },
      diamond: { color: 0x00BCD4, emoji: '💎' },
      gold: { color: 0xFFD700, emoji: '🟨' },
      iron: { color: 0x9E9E9E, emoji: '⬜' }
    };
    
    // Weapons and armor stats
    this.weaponStats = {
      none: { damage: 1, emoji: '✊' },
      sword: { damage: 5, emoji: '⚔️' },
      bow: { damage: 3, emoji: '🏹' },
      axe: { damage: 4, emoji: '🪓' }
    };
    
    this.armorStats = {
      none: { protection: 0, emoji: '👕' },
      leather: { protection: 2, emoji: '🦺' },
      iron: { protection: 5, emoji: '🛡️' },
      diamond: { protection: 8, emoji: '💎' }
    };
  }
  
  preload() {
    // Create block textures
    Object.keys(this.blockTypes).forEach(blockType => {
      this.add.graphics()
        .fillStyle(this.blockTypes[blockType].color)
        .fillRect(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE)
        .generateTexture(blockType, this.BLOCK_SIZE, this.BLOCK_SIZE);
    });
    
    this.createPlayerSprites();
  }
  
  createPlayerSprites() {
    // Main player (detailed human character)
    const graphics = this.add.graphics();
    const size = this.BLOCK_SIZE - 4;
    
    // Body (blue shirt)
    graphics.fillStyle(0x4A90E2);
    graphics.fillRect(6, 12, 20, 16);
    
    // Head (skin tone)
    graphics.fillStyle(0xFFDBAE);
    graphics.fillRect(8, 2, 16, 12);
    
    // Hair (brown)
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(8, 2, 16, 6);
    
    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillRect(11, 6, 2, 2);
    graphics.fillRect(19, 6, 2, 2);
    
    // Legs (dark blue pants)
    graphics.fillStyle(0x2C3E50);
    graphics.fillRect(8, 28, 6, 12);
    graphics.fillRect(18, 28, 6, 12);
    
    // Arms (skin tone)
    graphics.fillStyle(0xFFDBAE);
    graphics.fillRect(2, 14, 4, 10);
    graphics.fillRect(26, 14, 4, 10);
    
    graphics.generateTexture('player', size, size);
    graphics.destroy();
    
    // Other players (red shirt for distinction)
    const graphics2 = this.add.graphics();
    
    // Body (red shirt)
    graphics2.fillStyle(0xE74C3C);
    graphics2.fillRect(6, 12, 20, 16);
    
    // Head (skin tone)
    graphics2.fillStyle(0xFFDBAE);
    graphics2.fillRect(8, 2, 16, 12);
    
    // Hair (black)
    graphics2.fillStyle(0x2C3E50);
    graphics2.fillRect(8, 2, 16, 6);
    
    // Eyes
    graphics2.fillStyle(0x000000);
    graphics2.fillRect(11, 6, 2, 2);
    graphics2.fillRect(19, 6, 2, 2);
    
    // Legs (green pants)
    graphics2.fillStyle(0x27AE60);
    graphics2.fillRect(8, 28, 6, 12);
    graphics2.fillRect(18, 28, 6, 12);
    
    // Arms (skin tone)
    graphics2.fillStyle(0xFFDBAE);
    graphics2.fillRect(2, 14, 4, 10);
    graphics2.fillRect(26, 14, 4, 10);
    
    graphics2.generateTexture('otherPlayer', size, size);
    graphics2.destroy();
  }
  
  create() {
    window.minecraftGame = this;
    
    // Initialize larger world
    this.initializeWorld();
    this.blocks = this.physics.add.staticGroup();
    
    // Load or generate terrain
    const savedStateData = ${JSON.stringify(savedState)};
    if (savedStateData && savedStateData.data && typeof this.loadWorldFromSave === 'function') {
      this.loadWorldFromSave(savedStateData.data);
      this.score = savedStateData.score || 0;
    } else {
      this.generateEnhancedTerrain();
    }
    
    // Create player
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(this.GRAVITY);
    this.physics.add.collider(this.player, this.blocks);
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
    this.numbers = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT');
    
    this.input.on('pointerdown', (pointer) => this.handleClick(pointer));
    
    // Camera
    this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH * this.BLOCK_SIZE, this.WORLD_HEIGHT * this.BLOCK_SIZE);
    this.cameras.main.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH * this.BLOCK_SIZE, this.WORLD_HEIGHT * this.BLOCK_SIZE);
    
    // Background
    this.add.rectangle(
      this.WORLD_WIDTH * this.BLOCK_SIZE / 2, 
      this.WORLD_HEIGHT * this.BLOCK_SIZE / 2, 
      this.WORLD_WIDTH * this.BLOCK_SIZE, 
      this.WORLD_HEIGHT * this.BLOCK_SIZE, 
      0x87CEEB
    ).setDepth(-1);
    
    // Start multiplayer sync
    this.startMultiplayerSync();
    
    // Initialize UI with current selections
    this.updateUI();
    
    // Sync initial selections with UI
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Set initial selections in the React component
        const event = new CustomEvent('gameInitialized', {
          detail: {
            selectedBlock: this.selectedBlock,
            selectedWeapon: this.selectedWeapon,
            selectedArmor: this.selectedArmor
          }
        });
        window.dispatchEvent(event);
      }
    }, 100);
  }
  
  loadWorldFromSave(savedWorld) {
    if (!savedWorld || !Array.isArray(savedWorld)) return;
    
    for (let x = 0; x < this.WORLD_WIDTH && x < savedWorld.length; x++) {
      if (savedWorld[x] && Array.isArray(savedWorld[x])) {
        for (let y = 0; y < this.WORLD_HEIGHT && y < savedWorld[x].length; y++) {
          if (savedWorld[x][y]) {
            this.applyWorldChange(x, y, savedWorld[x][y]);
          }
        }
      }
    }
  }
  
  async startMultiplayerSync() {
    // Join room
    await fetch('/api/games/minecraft/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.roomId,
        action: 'join',
        data: { 
          x: this.player.x, 
          y: this.player.y,
          health: this.health,
          armor: this.armor,
          weapon: this.selectedWeapon
        }
      })
    });
    
    // Start sync timer
    this.syncTimer = this.time.addEvent({
      delay: this.syncInterval,
      callback: this.syncWithServer,
      callbackScope: this,
      loop: true
    });
  }
  
  async syncWithServer() {
    try {
      // Get world changes
      const response = await fetch('/api/games/minecraft/sync?' + new URLSearchParams({
        roomId: this.roomId,
        since: this.lastSyncTime.toString()
      }));
      
      if (response.ok) {
        const data = await response.json();
        
        // Apply world changes from other players
        data.changes.forEach(change => {
          if (change.playerId !== window.currentUserId) {
            this.applyWorldChange(change.x, change.y, change.blockType);
          }
        });
        
        this.lastSyncTime = data.lastUpdate;
      }
      
      // Update player position
      await fetch('/api/games/minecraft/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          action: 'move',
          data: { x: this.player.x, y: this.player.y }
        })
      });
      
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
  
  applyWorldChange(x, y, blockType) {
    if (x < 0 || x >= this.WORLD_WIDTH || y < 0 || y >= this.WORLD_HEIGHT) return;
    
    // Remove existing block
    if (this.world[x][y]) {
      this.world[x][y].destroy();
      this.world[x][y] = null;
    }
    
    // Place new block
    if (blockType) {
      const block = this.blocks.create(
        x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2,
        y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2,
        blockType
      );
      block.setOrigin(0.5, 0.5);
      block.body.setSize(this.BLOCK_SIZE, this.BLOCK_SIZE);
      block.blockType = blockType;
      block.gridX = x;
      block.gridY = y;
      this.world[x][y] = block;
    }
  }
  
  async handleClick(pointer) {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    const gridX = Math.floor(worldX / this.BLOCK_SIZE);
    const gridY = Math.floor(worldY / this.BLOCK_SIZE);
    
    if (gridX < 0 || gridX >= this.WORLD_WIDTH || gridY < 0 || gridY >= this.WORLD_HEIGHT) return;
    
    const playerGridX = Math.floor(this.player.x / this.BLOCK_SIZE);
    const playerGridY = Math.floor(this.player.y / this.BLOCK_SIZE);
    const distance = Math.abs(gridX - playerGridX) + Math.abs(gridY - playerGridY);
    
    if (distance > 8) return; // Increased reach
    
    let action = null;
    let blockType = null;
    
    if (pointer.button === 0) { // Left click
      // Check if there's a block to attack/break
      if (this.world[gridX][gridY]) {
        // Use weapon to break blocks faster
        const breakPower = this.damage;
        action = 'remove';
        blockType = null;
        this.applyWorldChange(gridX, gridY, null);
        this.score += (5 * breakPower); // More score with better weapons
        
        // Show weapon effect
        this.showWeaponEffect(gridX * this.BLOCK_SIZE, gridY * this.BLOCK_SIZE);
      } 
      // If no block, place a block
      else {
        action = 'place';
        blockType = this.selectedBlock;
        this.applyWorldChange(gridX, gridY, blockType);
        this.score += 10;
      }
    } else if (pointer.button === 2) { // Right click
      if (this.world[gridX][gridY]) {
        action = 'remove';
        blockType = null;
        this.applyWorldChange(gridX, gridY, null);
        this.score += 5;
      }
    }
    
    // Sync with server immediately
    if (action) {
      await fetch('/api/games/minecraft/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          action,
          x: gridX,
          y: gridY,
          blockType
        })
      });
    }
    
    this.updateUI();
  }
  
  initializeWorld() {
    this.world = [];
    for (let x = 0; x < this.WORLD_WIDTH; x++) {
      this.world[x] = [];
      for (let y = 0; y < this.WORLD_HEIGHT; y++) {
        this.world[x][y] = null;
      }
    }
  }
  
  generateEnhancedTerrain() {
    const groundLevel = Math.floor(this.WORLD_HEIGHT * 0.6);
    
    for (let x = 0; x < this.WORLD_WIDTH; x++) {
      const height = groundLevel + Math.floor(Math.sin(x * 0.05) * 8);
      
      for (let y = height; y < this.WORLD_HEIGHT; y++) {
        let blockType;
        if (y === height) {
          blockType = 'grass';
        } else if (y < height + 5) {
          blockType = 'dirt';
        } else if (y < height + 15) {
          blockType = 'stone';
        } else {
          blockType = Math.random() < 0.1 ? 'diamond' : 'stone';
        }
        
        this.applyWorldChange(x, y, blockType);
      }
      
      // Add trees and ores
      if (Math.random() < 0.08 && height > 10) {
        for (let treeY = height - 4; treeY < height; treeY++) {
          if (treeY >= 0) this.applyWorldChange(x, treeY, 'wood');
        }
      }
      
      // Add random ores
      if (Math.random() < 0.05) {
        const oreY = height + Math.floor(Math.random() * 10) + 5;
        if (oreY < this.WORLD_HEIGHT) {
          const oreType = Math.random() < 0.3 ? 'iron' : (Math.random() < 0.1 ? 'diamond' : 'gold');
          this.applyWorldChange(x, oreY, oreType);
        }
      }
    }
  }
  
  update() {
    // Player movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }
    
    if ((this.cursors.up.isDown || this.wasd.W.isDown || this.wasd.SPACE.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
    }
    
    // Block selection with keyboard
    if (Phaser.Input.Keyboard.JustDown(this.numbers.ONE)) this.setSelectedBlock('grass');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.TWO)) this.setSelectedBlock('stone');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.THREE)) this.setSelectedBlock('wood');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.FOUR)) this.setSelectedBlock('dirt');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.FIVE)) this.setSelectedBlock('water');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.SIX)) this.setSelectedBlock('diamond');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.SEVEN)) this.setSelectedBlock('gold');
    if (Phaser.Input.Keyboard.JustDown(this.numbers.EIGHT)) this.setSelectedBlock('iron');
    
    // Weapon selection with Q, W, E, R keys
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('Q'))) this.setSelectedWeapon('none');
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('W'))) this.setSelectedWeapon('sword');
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) this.setSelectedWeapon('bow');
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('R'))) this.setSelectedWeapon('axe');
    
    // Armor selection with Z, X, C, V keys
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('Z'))) this.setSelectedArmor('none');
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('X'))) this.setSelectedArmor('leather');
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('C'))) this.setSelectedArmor('iron');
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('V'))) this.setSelectedArmor('diamond');
    
    this.checkEnvironmentalEffects();
  }
  
  checkEnvironmentalEffects() {
    const playerGridX = Math.floor(this.player.x / this.BLOCK_SIZE);
    const playerGridY = Math.floor(this.player.y / this.BLOCK_SIZE);
    
    if (playerGridX >= 0 && playerGridX < this.WORLD_WIDTH && 
        playerGridY >= 0 && playerGridY < this.WORLD_HEIGHT) {
      const block = this.world[playerGridX][playerGridY];
      if (block && block.blockType === 'water') {
        // Apply armor protection
        const damage = Math.max(0.3 - (this.armor * 0.05), 0.1);
        this.health -= damage;
        if (this.health <= 0) {
          this.health = 0;
          this.gameOver();
        }
      }
    }
  }
  
  showWeaponEffect(x, y) {
    // Create visual effect based on weapon type
    const effectColor = this.selectedWeapon === 'sword' ? 0xFFD700 : 
                       this.selectedWeapon === 'axe' ? 0xFF4500 :
                       this.selectedWeapon === 'bow' ? 0x00FF00 : 0xFFFFFF;
    
    // Create a temporary effect sprite
    const effect = this.add.circle(x + this.BLOCK_SIZE/2, y + this.BLOCK_SIZE/2, 8, effectColor);
    effect.setAlpha(0.8);
    
    // Animate the effect
    this.tweens.add({
      targets: effect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Add weapon-specific effects
    if (this.selectedWeapon === 'bow') {
      // Create arrow effect
      const arrow = this.add.rectangle(x + this.BLOCK_SIZE/2, y + this.BLOCK_SIZE/2, 4, 12, 0x8B4513);
      this.tweens.add({
        targets: arrow,
        y: y - 20,
        alpha: 0,
        duration: 200,
        onComplete: () => arrow.destroy()
      });
    }
  }
  
  updateUI() {
    const healthEl = document.getElementById('health-display');
    const scoreEl = document.getElementById('score-display');
    const selectedEl = document.getElementById('selected-block-display');
    const weaponEl = document.getElementById('selected-weapon-display');
    const armorEl = document.getElementById('selected-armor-display');
    const damageEl = document.getElementById('weapon-damage');
    const protectionEl = document.getElementById('armor-protection');
    
    if (healthEl) healthEl.textContent = Math.floor(this.health);
    if (scoreEl) scoreEl.textContent = this.score;
    if (selectedEl) selectedEl.textContent = this.selectedBlock.charAt(0).toUpperCase() + this.selectedBlock.slice(1);
    if (weaponEl) weaponEl.textContent = this.selectedWeapon.charAt(0).toUpperCase() + this.selectedWeapon.slice(1);
    if (armorEl) armorEl.textContent = this.selectedArmor.charAt(0).toUpperCase() + this.selectedArmor.slice(1);
    if (damageEl) damageEl.textContent = 'DMG: ' + this.damage;
    if (protectionEl) protectionEl.textContent = 'DEF: ' + this.armor;
  }
  
  // Methods for inventory communication
  setSelectedBlock(blockType) {
    this.selectedBlock = blockType;
    this.updateUI();
  }
  
  setSelectedWeapon(weaponType) {
    this.selectedWeapon = weaponType;
    this.damage = this.weaponStats[weaponType]?.damage || 1;
    this.updateUI();
  }
  
  setSelectedArmor(armorType) {
    this.selectedArmor = armorType;
    this.armor = this.armorStats[armorType]?.protection || 0;
    this.updateUI();
  }
  
  loadWorldFromSave(savedWorld) {
    if (!savedWorld || !Array.isArray(savedWorld)) return;
    
    for (let x = 0; x < this.WORLD_WIDTH && x < savedWorld.length; x++) {
      if (savedWorld[x] && Array.isArray(savedWorld[x])) {
        for (let y = 0; y < this.WORLD_HEIGHT && y < savedWorld[x].length; y++) {
          if (savedWorld[x][y]) {
            this.applyWorldChange(x, y, savedWorld[x][y]);
          }
        }
      }
    }
  }
  
  getGameState() {
    return {
      world: this.serializeWorld(),
      score: this.score,
      health: this.health,
      selectedBlock: this.selectedBlock,
      selectedWeapon: this.selectedWeapon,
      selectedArmor: this.selectedArmor
    };
  }
  
  serializeWorld() {
    const serializedWorld = [];
    for (let x = 0; x < this.WORLD_WIDTH; x++) {
      serializedWorld[x] = [];
      for (let y = 0; y < this.WORLD_HEIGHT; y++) {
        if (this.world[x][y]) {
          serializedWorld[x][y] = this.world[x][y].blockType;
        } else {
          serializedWorld[x][y] = null;
        }
      }
    }
    return serializedWorld;
  }
  
  cleanup() {
    if (this.syncTimer) {
      this.syncTimer.destroy();
    }
    window.minecraftGame = null;
  }
  
  gameOver() {
    this.scene.pause();
    alert("Game Over! Final Score: " + this.score);
    this.scene.restart();
    this.health = 100;
    this.score = 0;
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'minecraft-game-container',
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: EnhancedMinecraftGame
};

// Make the class available globally
window.EnhancedMinecraftGame = EnhancedMinecraftGame;

// Start the game
window.game = new Phaser.Game(config);

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'CANVAS') {
    e.preventDefault();
  }
});

})(); // End IIFE
`;
}
