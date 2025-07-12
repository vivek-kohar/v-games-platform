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
    this.lastAttackTime = 0;
    this.attackCooldown = 500; // 500ms between attacks
    
    // Mob system
    this.mobs = [];
    this.mobSpawnTimer = 0;
    this.mobSpawnInterval = 5000; // Spawn mob every 5 seconds
    this.maxMobs = 8; // Maximum mobs on screen
    
    // Combat system
    this.playerInvulnerable = false;
    this.invulnerabilityTime = 1000; // 1 second invulnerability after taking damage
    
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
    
    // Mob types with different stats and behaviors
    this.mobTypes = {
      zombie: {
        health: 20,
        damage: 3,
        speed: 30,
        color: 0x228B22,
        emoji: '🧟',
        points: 50,
        dropChance: 0.3,
        size: 24
      },
      skeleton: {
        health: 15,
        damage: 4,
        speed: 25,
        color: 0xF5F5DC,
        emoji: '💀',
        points: 75,
        dropChance: 0.4,
        ranged: true,
        size: 24
      },
      spider: {
        health: 12,
        damage: 2,
        speed: 50,
        color: 0x8B0000,
        emoji: '🕷️',
        points: 40,
        dropChance: 0.2,
        size: 20
      },
      creeper: {
        health: 25,
        damage: 8,
        speed: 20,
        color: 0x00FF00,
        emoji: '💥',
        points: 100,
        dropChance: 0.5,
        explosive: true,
        size: 26
      }
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
  
  createMobSprites() {
    // Create sprites for each mob type
    Object.keys(this.mobTypes).forEach(mobType => {
      const mobData = this.mobTypes[mobType];
      const graphics = this.add.graphics();
      const size = mobData.size;
      
      if (mobType === 'zombie') {
        // Zombie - green humanoid
        graphics.fillStyle(0x228B22); // Dark green body
        graphics.fillRect(4, 8, 16, 12);
        graphics.fillStyle(0x90EE90); // Light green head
        graphics.fillRect(6, 2, 12, 8);
        graphics.fillStyle(0x000000); // Black eyes
        graphics.fillRect(8, 4, 2, 2);
        graphics.fillRect(14, 4, 2, 2);
        graphics.fillStyle(0x8B0000); // Dark red mouth
        graphics.fillRect(10, 6, 4, 1);
        // Arms and legs
        graphics.fillStyle(0x228B22);
        graphics.fillRect(0, 10, 4, 8);
        graphics.fillRect(20, 10, 4, 8);
        graphics.fillRect(6, 20, 4, 6);
        graphics.fillRect(14, 20, 4, 6);
      } 
      else if (mobType === 'skeleton') {
        // Skeleton - bone white
        graphics.fillStyle(0xF5F5DC); // Beige body
        graphics.fillRect(4, 8, 16, 12);
        graphics.fillRect(6, 2, 12, 8); // Head
        graphics.fillStyle(0x000000); // Black eye sockets
        graphics.fillRect(8, 4, 3, 3);
        graphics.fillRect(13, 4, 3, 3);
        // Bow
        graphics.fillStyle(0x8B4513); // Brown bow
        graphics.fillRect(20, 6, 2, 8);
        graphics.fillRect(18, 6, 1, 2);
        graphics.fillRect(18, 12, 1, 2);
      }
      else if (mobType === 'spider') {
        // Spider - dark red with legs
        graphics.fillStyle(0x8B0000); // Dark red body
        graphics.fillEllipse(12, 12, 16, 10);
        graphics.fillStyle(0x000000); // Black eyes
        graphics.fillRect(8, 8, 2, 2);
        graphics.fillRect(14, 8, 2, 2);
        // Spider legs
        graphics.fillStyle(0x654321);
        for (let i = 0; i < 4; i++) {
          graphics.fillRect(2 + i * 5, 6, 1, 4);
          graphics.fillRect(2 + i * 5, 18, 1, 4);
        }
      }
      else if (mobType === 'creeper') {
        // Creeper - green with face pattern
        graphics.fillStyle(0x00FF00); // Bright green body
        graphics.fillRect(4, 4, 16, 20);
        graphics.fillStyle(0x000000); // Black face pattern
        graphics.fillRect(8, 8, 2, 4);
        graphics.fillRect(14, 8, 2, 4);
        graphics.fillRect(10, 12, 4, 2);
        graphics.fillRect(8, 14, 8, 2);
      }
      
      graphics.generateTexture(mobType, size, size);
      graphics.destroy();
    });
  }
  
  create() {
    window.minecraftGame = this;
    
    // Initialize larger world
    this.initializeWorld();
    this.blocks = this.physics.add.staticGroup();
    this.mobGroup = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();
    
    // Create mob sprites
    this.createMobSprites();
    
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
    this.physics.add.collider(this.mobGroup, this.blocks);
    
    // Combat collisions
    this.physics.add.overlap(this.player, this.mobGroup, this.playerHitByMob, null, this);
    this.physics.add.overlap(this.projectileGroup, this.mobGroup, this.projectileHitMob, null, this);
    this.physics.add.overlap(this.projectileGroup, this.blocks, this.projectileHitBlock, null, this);
    
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
    
    // Check if clicking on a mob first
    const clickedMob = this.getMobAtPosition(worldX, worldY);
    if (clickedMob && pointer.button === 0) { // Left click on mob
      if (this.time.now - this.lastAttackTime > this.attackCooldown) {
        this.attackMob(clickedMob);
        this.lastAttackTime = this.time.now;
        return;
      }
    }
    
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
  
  getMobAtPosition(x, y) {
    return this.mobs.find(mob => {
      if (!mob.isAlive) return false;
      const distance = Phaser.Math.Distance.Between(x, y, mob.x, mob.y);
      return distance < 30; // Within 30 pixels
    });
  }
  
  attackMob(mob) {
    if (!mob.isAlive) return;
    
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y);
    if (distance > 100) return; // Too far to attack
    
    // Deal damage based on weapon
    this.damageMob(mob, this.damage);
    
    // Show attack effect
    this.showAttackEffect(this.player.x, this.player.y, mob.x, mob.y);
    this.showWeaponEffect(mob.x, mob.y);
    
    // Camera shake for impact
    this.cameras.main.shake(50, 0.01);
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
    
    // Mob system updates
    this.updateMobSpawning();
    this.updateMobAI();
    this.updateCombat();
    this.cleanupDeadMobs();
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
    const mobCountEl = document.getElementById('mob-count-display');
    
    if (healthEl) healthEl.textContent = Math.floor(this.health);
    if (scoreEl) scoreEl.textContent = this.score;
    if (selectedEl) selectedEl.textContent = this.selectedBlock.charAt(0).toUpperCase() + this.selectedBlock.slice(1);
    if (weaponEl) weaponEl.textContent = this.selectedWeapon.charAt(0).toUpperCase() + this.selectedWeapon.slice(1);
    if (armorEl) armorEl.textContent = this.selectedArmor.charAt(0).toUpperCase() + this.selectedArmor.slice(1);
    if (damageEl) damageEl.textContent = 'DMG: ' + this.damage;
    if (protectionEl) protectionEl.textContent = 'DEF: ' + this.armor;
    if (mobCountEl) mobCountEl.textContent = this.mobs.filter(mob => mob.isAlive).length;
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
  
  // Mob System Methods
  updateMobSpawning() {
    const currentTime = this.time.now;
    
    if (currentTime - this.mobSpawnTimer > this.mobSpawnInterval && this.mobs.length < this.maxMobs) {
      this.spawnMob();
      this.mobSpawnTimer = currentTime;
    }
  }
  
  spawnMob() {
    // Choose random mob type
    const mobTypeNames = Object.keys(this.mobTypes);
    const randomType = mobTypeNames[Math.floor(Math.random() * mobTypeNames.length)];
    const mobData = this.mobTypes[randomType];
    
    // Find spawn position away from player
    let spawnX, spawnY;
    let attempts = 0;
    do {
      spawnX = Phaser.Math.Between(100, (this.WORLD_WIDTH - 1) * this.BLOCK_SIZE - 100);
      spawnY = Phaser.Math.Between(100, (this.WORLD_HEIGHT - 1) * this.BLOCK_SIZE - 100);
      attempts++;
    } while (Phaser.Math.Distance.Between(spawnX, spawnY, this.player.x, this.player.y) < 200 && attempts < 10);
    
    // Create mob sprite
    const mob = this.physics.add.sprite(spawnX, spawnY, randomType);
    mob.setCollideWorldBounds(true);
    mob.body.setGravityY(this.GRAVITY);
    mob.setScale(0.8);
    
    // Mob properties
    mob.mobType = randomType;
    mob.health = mobData.health;
    mob.maxHealth = mobData.health;
    mob.damage = mobData.damage;
    mob.speed = mobData.speed;
    mob.lastAttackTime = 0;
    mob.attackCooldown = 1500;
    mob.lastRangedAttack = 0;
    mob.rangedCooldown = 2000;
    mob.target = null;
    mob.isAlive = true;
    
    // Add to groups
    this.mobGroup.add(mob);
    this.mobs.push(mob);
    
    // Create health bar
    this.createMobHealthBar(mob);
  }
  
  createMobHealthBar(mob) {
    const healthBarBg = this.add.rectangle(mob.x, mob.y - 20, 30, 4, 0x000000);
    const healthBar = this.add.rectangle(mob.x, mob.y - 20, 30, 4, 0x00FF00);
    
    mob.healthBarBg = healthBarBg;
    mob.healthBar = healthBar;
  }
  
  updateMobAI() {
    this.mobs.forEach(mob => {
      if (!mob.isAlive) return;
      
      // Find closest target (player or other players)
      let closestTarget = this.player;
      let closestDistance = Phaser.Math.Distance.Between(mob.x, mob.y, this.player.x, this.player.y);
      
      // Check other players in multiplayer
      this.otherPlayers.forEach(otherPlayer => {
        const distance = Phaser.Math.Distance.Between(mob.x, mob.y, otherPlayer.x, otherPlayer.y);
        if (distance < closestDistance) {
          closestTarget = otherPlayer;
          closestDistance = distance;
        }
      });
      
      mob.target = closestTarget;
      
      // Update health bar position
      if (mob.healthBar && mob.healthBarBg) {
        mob.healthBarBg.x = mob.x;
        mob.healthBarBg.y = mob.y - 25;
        mob.healthBar.x = mob.x;
        mob.healthBar.y = mob.y - 25;
        
        // Update health bar width
        const healthPercent = mob.health / mob.maxHealth;
        mob.healthBar.scaleX = healthPercent;
        mob.healthBar.fillColor = healthPercent > 0.5 ? 0x00FF00 : healthPercent > 0.25 ? 0xFFFF00 : 0xFF0000;
      }
      
      // AI behavior based on distance
      if (closestDistance < 300) {
        this.moveMobTowardsTarget(mob, closestTarget);
        
        // Attack if close enough
        if (closestDistance < 40 && this.time.now - mob.lastAttackTime > mob.attackCooldown) {
          this.mobAttack(mob, closestTarget);
        }
        
        // Ranged attack for skeletons
        if (mob.mobType === 'skeleton' && closestDistance < 200 && closestDistance > 60 && 
            this.time.now - mob.lastRangedAttack > mob.rangedCooldown) {
          this.mobRangedAttack(mob, closestTarget);
        }
      }
    });
  }
  
  moveMobTowardsTarget(mob, target) {
    const angle = Phaser.Math.Angle.Between(mob.x, mob.y, target.x, target.y);
    const velocityX = Math.cos(angle) * mob.speed;
    
    mob.setVelocityX(velocityX);
    
    // Only set Y velocity if mob is on ground or jumping
    if (mob.body.touching.down) {
      if (Math.abs(target.y - mob.y) > 32) {
        mob.setVelocityY(-150); // Jump
      }
    }
  }
  
  mobAttack(mob, target) {
    mob.lastAttackTime = this.time.now;
    
    // Special creeper explosion
    if (mob.mobType === 'creeper') {
      this.creeperExplode(mob);
      return;
    }
    
    // Regular melee attack
    const distance = Phaser.Math.Distance.Between(mob.x, mob.y, target.x, target.y);
    if (distance < 40) {
      if (target === this.player) {
        this.playerTakeDamage(mob.damage);
      }
      
      // Visual attack effect
      this.showAttackEffect(mob.x, mob.y, target.x, target.y);
    }
  }
  
  mobRangedAttack(mob, target) {
    mob.lastRangedAttack = this.time.now;
    
    // Create projectile
    const projectile = this.physics.add.sprite(mob.x, mob.y - 10, 'stone');
    projectile.setScale(0.3);
    projectile.setTint(0x8B4513); // Brown arrow color
    
    // Calculate trajectory
    const angle = Phaser.Math.Angle.Between(mob.x, mob.y, target.x, target.y);
    const speed = 200;
    projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    
    projectile.damage = mob.damage;
    projectile.shooter = mob;
    this.projectileGroup.add(projectile);
    
    // Auto-destroy after 3 seconds
    this.time.delayedCall(3000, () => {
      if (projectile && projectile.active) {
        projectile.destroy();
      }
    });
  }
  
  creeperExplode(creeper) {
    // Create explosion effect
    const explosion = this.add.circle(creeper.x, creeper.y, 60, 0xFF4500, 0.7);
    
    // Damage all nearby targets
    const explosionRadius = 80;
    
    // Damage player
    const playerDistance = Phaser.Math.Distance.Between(creeper.x, creeper.y, this.player.x, this.player.y);
    if (playerDistance < explosionRadius) {
      const damage = Math.max(creeper.damage - Math.floor(playerDistance / 10), 2);
      this.playerTakeDamage(damage);
    }
    
    // Destroy nearby blocks
    this.destroyBlocksInRadius(creeper.x, creeper.y, 40);
    
    // Animation
    this.tweens.add({
      targets: explosion,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => explosion.destroy()
    });
    
    // Kill creeper
    this.killMob(creeper);
  }
  
  destroyBlocksInRadius(x, y, radius) {
    const centerGridX = Math.floor(x / this.BLOCK_SIZE);
    const centerGridY = Math.floor(y / this.BLOCK_SIZE);
    const gridRadius = Math.ceil(radius / this.BLOCK_SIZE);
    
    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const gridX = centerGridX + dx;
        const gridY = centerGridY + dy;
        
        if (gridX >= 0 && gridX < this.WORLD_WIDTH && gridY >= 0 && gridY < this.WORLD_HEIGHT) {
          const distance = Math.sqrt(dx * dx + dy * dy) * this.BLOCK_SIZE;
          if (distance <= radius && this.world[gridX][gridY]) {
            this.applyWorldChange(gridX, gridY, null);
            this.score += 5; // Bonus points for explosion cleanup
          }
        }
      }
    }
  }
  
  updateCombat() {
    // Update invulnerability
    if (this.playerInvulnerable && this.time.now - this.lastDamageTime > this.invulnerabilityTime) {
      this.playerInvulnerable = false;
      this.player.clearTint();
    }
  }
  
  cleanupDeadMobs() {
    this.mobs = this.mobs.filter(mob => {
      if (!mob.isAlive || mob.health <= 0) {
        // Remove health bars
        if (mob.healthBar) mob.healthBar.destroy();
        if (mob.healthBarBg) mob.healthBarBg.destroy();
        
        // Remove from physics group
        this.mobGroup.remove(mob);
        mob.destroy();
        return false;
      }
      return true;
    });
  }
  
  // Combat collision handlers
  playerHitByMob(player, mob) {
    if (!this.playerInvulnerable && mob.isAlive) {
      this.playerTakeDamage(mob.damage);
    }
  }
  
  projectileHitMob(projectile, mob) {
    if (mob.isAlive) {
      this.damageMob(mob, projectile.damage || this.damage);
      this.showHitEffect(mob.x, mob.y);
      projectile.destroy();
    }
  }
  
  projectileHitBlock(projectile, block) {
    projectile.destroy();
  }
  
  playerTakeDamage(damage) {
    if (this.playerInvulnerable) return;
    
    // Apply armor protection
    const actualDamage = Math.max(damage - this.armor, 1);
    this.health -= actualDamage;
    this.lastDamageTime = this.time.now;
    this.playerInvulnerable = true;
    
    // Visual feedback
    this.player.setTint(0xFF0000);
    this.cameras.main.shake(100, 0.02);
    
    // Check game over
    if (this.health <= 0) {
      this.health = 0;
      this.gameOver();
    }
    
    this.updateUI();
  }
  
  damageMob(mob, damage) {
    mob.health -= damage;
    this.score += 10;
    
    if (mob.health <= 0) {
      this.killMob(mob);
    }
    
    this.updateUI();
  }
  
  killMob(mob) {
    const mobData = this.mobTypes[mob.mobType];
    this.score += mobData.points;
    
    // Drop chance for items
    if (Math.random() < mobData.dropChance) {
      this.createDrop(mob.x, mob.y);
    }
    
    // Death effect
    this.showDeathEffect(mob.x, mob.y);
    
    mob.isAlive = false;
    this.updateUI();
  }
  
  createDrop(x, y) {
    // Create a simple drop item
    const drop = this.add.circle(x, y, 8, 0xFFD700);
    
    // Animate drop
    this.tweens.add({
      targets: drop,
      y: y - 20,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
    
    // Collect on overlap with player
    this.physics.add.overlap(this.player, drop, () => {
      this.score += 25;
      drop.destroy();
      this.updateUI();
    });
    
    // Auto-destroy after 10 seconds
    this.time.delayedCall(10000, () => {
      if (drop && drop.active) {
        drop.destroy();
      }
    });
  }
  
  showAttackEffect(fromX, fromY, toX, toY) {
    const line = this.add.line(0, 0, fromX, fromY, toX, toY, 0xFF0000, 0.8);
    line.setLineWidth(3);
    
    this.time.delayedCall(100, () => {
      if (line && line.active) {
        line.destroy();
      }
    });
  }
  
  showHitEffect(x, y) {
    const effect = this.add.circle(x, y, 15, 0xFF4500, 0.8);
    
    this.tweens.add({
      targets: effect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => effect.destroy()
    });
  }
  
  showDeathEffect(x, y) {
    // Create multiple particles for death effect
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(x, y, 4, 0x666666);
      const angle = (i / 5) * Math.PI * 2;
      const speed = 50;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
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
