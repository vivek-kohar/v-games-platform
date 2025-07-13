export function getEnhancedMinecraftGameCode(savedState: any, roomId: string) {
  const timestamp = Date.now()
  const safeRoomId = roomId || 'single' // Fallback to 'single' if roomId is undefined
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
    
    // Day/Night cycle system
    this.dayNightCycle = {
      isDay: true,
      cycleTime: 0,
      cycleDuration: 120000, // 2 minutes per cycle (1 min day, 1 min night)
      dayDuration: 60000, // 1 minute day
      nightDuration: 60000, // 1 minute night
      transitionDuration: 5000 // 5 seconds transition
    };
    
    // Enhanced range and visibility
    this.INTERACTION_RANGE = 12; // Increased from 8
    this.WEAPON_RANGE = 15; // Extended weapon range
    
    // Mob system with night-only spawning
    this.mobs = [];
    this.mobSpawnTimer = 0;
    this.mobSpawnInterval = 3000; // Spawn mob every 3 seconds during night
    this.maxMobs = 15; // More mobs at once for challenge
    this.mobBurnTimer = 0;
    this.mobBurnInterval = 1000; // Check for burning every second
    this.mobsEnabled = true; // Allow disabling mobs
    
    // Resource gathering system
    this.gatheredResources = new Map(); // Track what resources have been gathered
    this.resourceCounters = new Map(); // Track resource quantities
    this.resourceGatheringRange = 2; // Range for gathering resources
    this.gatheringCooldown = 1000; // 1 second cooldown between gathering
    this.lastGatherTime = 0;
    
    // Resource and inventory system
    this.playerInventory = [];
    this.resourceNodes = []; // Initialize resource nodes array
    this.maxInventorySize = 50;
    
    // Available resources that can be gathered
    this.availableResources = {
      'wood': { gathered: false, required: ['tree', 'wood'] },
      'stone': { gathered: false, required: ['stone'] },
      'iron': { gathered: false, required: ['iron'] },
      'gold': { gathered: false, required: ['gold'] },
      'diamond': { gathered: false, required: ['diamond'] },
      'dirt': { gathered: true, required: ['dirt'] }, // Always available
      'grass': { gathered: true, required: ['grass'] } // Always available
    };
    
    // Initialize resource counters
    this.initializeResourceCounters();
    this.resourceSpawnTimer = 0;
    this.resourceSpawnInterval = 10000; // Spawn resources every 10 seconds
    this.maxResourceNodes = 20;
    
    // Resource depletion system
    this.blockDurability = new Map(); // Track how much each block has been mined
    this.resourceRarity = {
      grass: { rarity: 'common', value: 1, durability: 1 },
      dirt: { rarity: 'common', value: 1, durability: 1 },
      stone: { rarity: 'common', value: 2, durability: 3 },
      wood: { rarity: 'common', value: 3, durability: 2 },
      water: { rarity: 'common', value: 1, durability: 1 },
      iron: { rarity: 'rare', value: 10, durability: 5 },
      gold: { rarity: 'epic', value: 25, durability: 8 },
      diamond: { rarity: 'legendary', value: 50, durability: 12 }
    };
    
    // Multiplayer system
    this.isMultiplayer = '${safeRoomId}' && '${safeRoomId}' !== 'single';
    this.roomId = '${safeRoomId}';
    this.currentUserId = window.currentUserId || 'guest-' + Math.random().toString(36).substr(2, 9);
    this.multiplayerSyncTimer = 0;
    this.multiplayerSyncInterval = 500; // Sync every 500ms for better real-time feel
    this.lastSyncTime = 0;
    this.otherPlayers = new Map(); // Store other players' data and sprites
    this.playerSprites = new Map(); // Store player sprites
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
    
    // Initialize multiplayer if enabled
    if (this.isMultiplayer) {
      this.initializeMultiplayer();
    }
    
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
    
    // Initialize visual equipment system
    this.initializeEquipmentVisuals();
    
    // Initialize projectile system
    this.projectiles = [];
    
    // Initialize night overlay reference
    this.nightOverlay = null;
    
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
            this.applyWorldChange(x, y, savedWorld[x][y], true); // Skip multiplayer sync during loading
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
  
  applyWorldChange(x, y, blockType, skipMultiplayer = false) {
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
    
    // Send to multiplayer (only for user-initiated changes, not during terrain generation)
    if (this.isMultiplayer && !skipMultiplayer) {
      this.sendWorldChange(x, y, blockType, blockType ? 'place' : 'remove');
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
    
    if (distance > this.INTERACTION_RANGE) return; // Extended range
    
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
        const currentBlockType = this.world[gridX][gridY].blockType;
        const blockKey = gridX + '-' + gridY;
        
        // Get current durability or set initial
        let currentDurability = this.blockDurability.get(blockKey) || this.resourceRarity[currentBlockType]?.durability || 1;
        
        // Apply weapon damage to durability
        currentDurability -= this.damage;
        
        if (currentDurability <= 0) {
          // Block is fully mined - collect resource
          this.gatherResourceFromBlock(currentBlockType, gridX, gridY);
          
          // Remove block
          action = 'remove';
          blockType = null;
          this.applyWorldChange(gridX, gridY, null);
          this.blockDurability.delete(blockKey);
          
          // Show mining effect
          this.showMiningEffect(gridX * this.BLOCK_SIZE, gridY * this.BLOCK_SIZE, currentBlockType);
        } else {
          // Block still has durability - update it
          this.blockDurability.set(blockKey, currentDurability);
          
          // Show damage effect
          this.showBlockDamageEffect(gridX * this.BLOCK_SIZE, gridY * this.BLOCK_SIZE, currentDurability);
        }
        
        // Show weapon effect
        this.showWeaponEffect(gridX * this.BLOCK_SIZE, gridY * this.BLOCK_SIZE);
      } 
      // If no block, place a block (check if resource is available)
      else {
        if (this.canPlaceBlock(this.selectedBlock)) {
          // Consume the resource
          if (this.useResource(this.selectedBlock, 1)) {
            action = 'place';
            blockType = this.selectedBlock;
            this.applyWorldChange(gridX, gridY, blockType);
            this.score += 10;
            
            // Show resource consumption effect
            this.showResourceUsedEffect(gridX * this.BLOCK_SIZE, gridY * this.BLOCK_SIZE, this.selectedBlock);
          }
        } else {
          // Show message that resource needs to be gathered first
          this.showResourceRequiredMessage(this.selectedBlock);
        }
      }
    } else if (pointer.button === 2) { // Right click
      if (this.world[gridX][gridY]) {
        const removedBlockType = this.world[gridX][gridY].blockType;
        
        // Gather resources from removed block (instant removal)
        this.gatherResourceFromBlock(removedBlockType, gridX, gridY);
        
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
  
  // Redirect to enhanced attack method
  attackMob(mob) {
    // This method is now handled by the enhanced visual attack system
    // See the enhanced attackMob method in the visual equipment section
    return this.performEnhancedAttack(mob);
  }
  
  performEnhancedAttack(mob) {
    if (!mob.isAlive) return;
    
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y);
    if (distance > this.WEAPON_RANGE * this.BLOCK_SIZE) return;
    
    // Show weapon attack animation
    this.showWeaponAttackAnimation(mob);
    
    // Handle different weapon types
    switch (this.selectedWeapon) {
      case 'bow':
        this.fireArrow(mob);
        break;
      case 'sword':
        this.performMeleeAttack(mob);
        break;
      case 'axe':
        this.performAxeAttack(mob);
        break;
      default:
        this.performPunchAttack(mob);
        break;
    }
    
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
        
        this.applyWorldChange(x, y, blockType, true); // Skip multiplayer sync during terrain generation
      }
      
      // Add trees and ores
      if (Math.random() < 0.08 && height > 10) {
        for (let treeY = height - 4; treeY < height; treeY++) {
          if (treeY >= 0) this.applyWorldChange(x, treeY, 'wood', true); // Skip multiplayer sync
        }
      }
      
      // Add random ores
      if (Math.random() < 0.05) {
        const oreY = height + Math.floor(Math.random() * 10) + 5;
        if (oreY < this.WORLD_HEIGHT) {
          const oreType = Math.random() < 0.3 ? 'iron' : (Math.random() < 0.1 ? 'diamond' : 'gold');
          this.applyWorldChange(x, oreY, oreType, true); // Skip multiplayer sync
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
    
    // Update visual equipment
    this.updateEquipmentVisuals();
    
    // Day/Night cycle updates
    this.updateDayNightCycle();
    
    // Mob system updates (only spawn at night and if enabled)
    if (!this.dayNightCycle.isDay && this.mobsEnabled) {
      this.updateMobSpawning();
    }
    this.updateMobAI();
    this.updateCombat();
    this.updateMobBurning(); // Burn mobs during day
    this.cleanupDeadMobs();
    
    // Resource system updates
    this.updateResourceSpawning();
    this.updateResourceNodes();
    
    // Multiplayer system updates
    if (this.isMultiplayer) {
      this.updateMultiplayer();
    }
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
    this.updateWeaponVisual(); // Update visual immediately
    this.updateUI();
  }
  
  setSelectedArmor(armorType) {
    this.selectedArmor = armorType;
    this.armor = this.armorStats[armorType]?.protection || 0;
    this.updateArmorVisual(); // Update visual immediately
    this.updateUI();
  }
  
  loadWorldFromSave(savedWorld) {
    if (!savedWorld || !Array.isArray(savedWorld)) return;
    
    for (let x = 0; x < this.WORLD_WIDTH && x < savedWorld.length; x++) {
      if (savedWorld[x] && Array.isArray(savedWorld[x])) {
        for (let y = 0; y < this.WORLD_HEIGHT && y < savedWorld[x].length; y++) {
          if (savedWorld[x][y]) {
            this.applyWorldChange(x, y, savedWorld[x][y], true); // Skip multiplayer sync during loading
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
            this.applyWorldChange(gridX, gridY, null, true); // Skip multiplayer sync for explosion cleanup
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
  
  // Resource Management System
  updateResourceSpawning() {
    // Initialize resourceNodes if it doesn't exist
    if (!this.resourceNodes) {
      this.resourceNodes = [];
    }
    
    const currentTime = this.time.now;
    
    if (currentTime - this.resourceSpawnTimer > this.resourceSpawnInterval && 
        this.resourceNodes.length < this.maxResourceNodes) {
      this.spawnResourceNode();
      this.resourceSpawnTimer = currentTime;
    }
  }
  
  spawnResourceNode() {
    // Initialize resourceNodes if it doesn't exist
    if (!this.resourceNodes) {
      this.resourceNodes = [];
    }
    
    // Choose rare resource types for special nodes
    const rareResources = ['iron', 'gold', 'diamond'];
    const resourceType = rareResources[Math.floor(Math.random() * rareResources.length)];
    
    // Find empty spot
    let spawnX, spawnY;
    let attempts = 0;
    do {
      spawnX = Math.floor(Math.random() * this.WORLD_WIDTH);
      spawnY = Math.floor(Math.random() * this.WORLD_HEIGHT);
      attempts++;
    } while (this.world[spawnX][spawnY] && attempts < 20);
    
    if (attempts < 20) {
      // Create resource node
      this.applyWorldChange(spawnX, spawnY, resourceType, true); // Skip multiplayer sync for resource spawning
      
      // Add to resource nodes list
      this.resourceNodes.push({
        x: spawnX,
        y: spawnY,
        type: resourceType,
        spawnTime: this.time.now,
        isRich: true // Rich nodes give more resources
      });
      
      // Visual effect for new resource
      this.showResourceSpawnEffect(spawnX * this.BLOCK_SIZE, spawnY * this.BLOCK_SIZE, resourceType);
    }
  }
  
  updateResourceNodes() {
    // Initialize resourceNodes if it doesn't exist
    if (!this.resourceNodes) {
      this.resourceNodes = [];
      return;
    }
    
    // Remove old resource nodes after 2 minutes
    const currentTime = this.time.now;
    this.resourceNodes = this.resourceNodes.filter(node => {
      if (currentTime - node.spawnTime > 120000) { // 2 minutes
        // Remove the block if it still exists
        if (this.world[node.x] && this.world[node.x][node.y]) {
          this.applyWorldChange(node.x, node.y, null, true); // Skip multiplayer sync for resource cleanup
        }
        return false;
      }
      return true;
    });
  }
  
  collectResource(blockType, gridX, gridY) {
    const resourceData = this.resourceRarity[blockType];
    if (!resourceData) return;
    
    // Initialize resourceNodes if it doesn't exist
    if (!this.resourceNodes) {
      this.resourceNodes = [];
    }
    
    // Check if this is a rich resource node
    const isRichNode = this.resourceNodes.some(node => 
      node.x === gridX && node.y === gridY && node.isRich
    );
    
    // Calculate quantity based on weapon and node type
    let quantity = 1;
    if (this.selectedWeapon === 'axe' && blockType === 'wood') quantity += 1;
    if (this.selectedWeapon === 'sword' && ['iron', 'gold', 'diamond'].includes(blockType)) quantity += 1;
    if (isRichNode) quantity *= 2;
    
    // Create resource item
    const resourceItem = {
      id: blockType + '-' + Date.now(),
      name: blockType.charAt(0).toUpperCase() + blockType.slice(1),
      type: 'resource',
      quantity: quantity,
      icon: this.blockTypes[blockType]?.emoji || '🧱',
      rarity: resourceData.rarity,
      description: 'Mined ' + blockType + ' resource',
      value: resourceData.value
    };
    
    // Add to inventory if space available
    if (this.playerInventory.length < this.maxInventorySize) {
      // Check if item already exists in inventory
      const existingItem = this.playerInventory.find(item => 
        item.name === resourceItem.name && item.type === resourceItem.type
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.playerInventory.push(resourceItem);
      }
      
      // Update score
      this.score += resourceData.value * quantity;
      
      // Show collection effect
      this.showResourceCollectionEffect(gridX * this.BLOCK_SIZE, gridY * this.BLOCK_SIZE, resourceItem);
      
      // Remove from resource nodes if it was one
      if (this.resourceNodes) {
        this.resourceNodes = this.resourceNodes.filter(node => 
          !(node.x === gridX && node.y === gridY)
        );
      }
      
    } else {
      // Inventory full - show warning
      this.showInventoryFullWarning();
    }
    
    this.updateUI();
  }
  
  showMiningEffect(x, y, blockType) {
    // Create mining particles
    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(
        x + this.BLOCK_SIZE/2, 
        y + this.BLOCK_SIZE/2, 
        3, 
        this.blockTypes[blockType]?.color || 0x666666
      );
      
      const angle = (i / 8) * Math.PI * 2;
      const speed = 30 + Math.random() * 20;
      
      this.tweens.add({
        targets: particle,
        x: x + this.BLOCK_SIZE/2 + Math.cos(angle) * speed,
        y: y + this.BLOCK_SIZE/2 + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 600,
        onComplete: () => particle.destroy()
      });
    }
  }
  
  showBlockDamageEffect(x, y, remainingDurability) {
    // Show cracks or damage on block
    const damageOverlay = this.add.rectangle(
      x + this.BLOCK_SIZE/2, 
      y + this.BLOCK_SIZE/2, 
      this.BLOCK_SIZE, 
      this.BLOCK_SIZE, 
      0x000000, 
      0.1 + (0.3 * (1 - remainingDurability / 10))
    );
    
    // Remove overlay after short time
    this.time.delayedCall(200, () => {
      if (damageOverlay && damageOverlay.active) {
        damageOverlay.destroy();
      }
    });
  }
  
  showResourceSpawnEffect(x, y, resourceType) {
    const sparkle = this.add.circle(x + this.BLOCK_SIZE/2, y + this.BLOCK_SIZE/2, 20, 0xFFD700, 0.8);
    
    this.tweens.add({
      targets: sparkle,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => sparkle.destroy()
    });
  }
  
  showResourceCollectionEffect(x, y, item) {
    // Show floating text with item info
    const text = this.add.text(
      x + this.BLOCK_SIZE/2, 
      y, 
      '+' + item.quantity + ' ' + item.name, 
      { 
        fontSize: '12px', 
        fill: item.rarity === 'legendary' ? '#FFD700' : 
              item.rarity === 'epic' ? '#9D4EDD' :
              item.rarity === 'rare' ? '#00D4FF' : '#FFFFFF'
      }
    );
    
    text.setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }
  
  showInventoryFullWarning() {
    const warning = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 100,
      'Inventory Full!',
      { fontSize: '24px', fill: '#FF0000' }
    );
    
    warning.setOrigin(0.5);
    
    this.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 2000,
      onComplete: () => warning.destroy()
    });
  }
  
  getPlayerInventory() {
    return this.playerInventory;
  }
  
  addToInventory(item) {
    if (this.playerInventory.length >= this.maxInventorySize) {
      return false; // Inventory full
    }
    
    // Check if item already exists
    const existingItem = this.playerInventory.find(invItem => 
      invItem.name === item.name && invItem.type === item.type
    );
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.playerInventory.push(item);
    }
    
    return true;
  }
  
  removeFromInventory(itemId, quantity) {
    const itemIndex = this.playerInventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;
    
    const item = this.playerInventory[itemIndex];
    if (item.quantity <= quantity) {
      this.playerInventory.splice(itemIndex, 1);
    } else {
      item.quantity -= quantity;
    }
    
    return true;
  }
  
  // Day/Night Cycle System
  updateDayNightCycle() {
    this.dayNightCycle.cycleTime += this.time.delta;
    
    const wasDay = this.dayNightCycle.isDay;
    
    // Check if we should switch between day and night
    if (this.dayNightCycle.isDay && this.dayNightCycle.cycleTime >= this.dayNightCycle.dayDuration) {
      this.dayNightCycle.isDay = false;
      this.dayNightCycle.cycleTime = 0;
      this.startNightTransition();
    } else if (!this.dayNightCycle.isDay && this.dayNightCycle.cycleTime >= this.dayNightCycle.nightDuration) {
      this.dayNightCycle.isDay = true;
      this.dayNightCycle.cycleTime = 0;
      this.startDayTransition();
    }
    
    // Update background color based on time
    this.updateSkyColor();
    
    // Show day/night indicator
    this.updateTimeIndicator();
  }
  
  startNightTransition() {
    console.log('Night transition starting...');
    
    // Visual effect for night beginning
    this.showTimeTransitionEffect('🌙 Night Falls - Mobs Incoming!', 0x1a1a2e);
    
    // Increase mob spawn rate
    this.mobSpawnInterval = 2000; // Faster spawning at night
    
    // Play night sound effect (if available)
    this.cameras.main.flash(1000, 0, 0, 50, false);
    
    // Add night overlay
    this.createNightOverlay();
  }
  
  startDayTransition() {
    console.log('Day transition starting...');
    
    // Visual effect for day beginning
    this.showTimeTransitionEffect('☀️ Dawn Breaks - Mobs Burning!', 0x87CEEB);
    
    // All mobs start burning
    this.startMobBurning();
    
    // Play day sound effect (if available)
    this.cameras.main.flash(1000, 255, 255, 100, false);
    
    // Remove night overlay
    this.removeNightOverlay();
  }
  
  createNightOverlay() {
    if (this.nightOverlay) {
      this.nightOverlay.destroy();
    }
    
    this.nightOverlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width * 2,
      this.cameras.main.height * 2,
      0x000033,
      0.3
    );
    this.nightOverlay.setScrollFactor(0);
    this.nightOverlay.setDepth(1000);
    
    // Fade in the night overlay
    this.nightOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.nightOverlay,
      alpha: 0.3,
      duration: 2000,
      ease: 'Power2'
    });
  }
  
  removeNightOverlay() {
    if (this.nightOverlay) {
      this.tweens.add({
        targets: this.nightOverlay,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          if (this.nightOverlay) {
            this.nightOverlay.destroy();
            this.nightOverlay = null;
          }
        }
      });
    }
  }
  
  updateSkyColor() {
    const currentPhaseDuration = this.dayNightCycle.isDay ? this.dayNightCycle.dayDuration : this.dayNightCycle.nightDuration;
    const progress = currentPhaseDuration > 0 ? Math.min(1, this.dayNightCycle.cycleTime / currentPhaseDuration) : 0;
    
    if (this.dayNightCycle.isDay) {
      // Day colors: light blue to bright blue
      const dayColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 135, g: 206, b: 235 }, // Light blue
        { r: 100, g: 149, b: 237 }, // Cornflower blue
        1,
        progress
      );
      this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(dayColor.r, dayColor.g, dayColor.b));
    } else {
      // Night colors: dark blue to very dark
      const nightColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 25, g: 25, b: 112 }, // Midnight blue
        { r: 15, g: 15, b: 35 },  // Very dark blue
        1,
        progress
      );
      this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(nightColor.r, nightColor.g, nightColor.b));
    }
  }
  
  showTimeTransitionEffect(text, color) {
    const transitionText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      text,
      { 
        fontSize: '32px', 
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    transitionText.setOrigin(0.5);
    transitionText.setScrollFactor(0); // Stay fixed on screen
    
    // Animate the text
    this.tweens.add({
      targets: transitionText,
      alpha: 0,
      y: transitionText.y - 50,
      duration: 3000,
      onComplete: () => transitionText.destroy()
    });
  }
  
  updateTimeIndicator() {
    // Update UI with current time
    const timeEl = document.getElementById('time-display');
    if (timeEl) {
      // Ensure we have valid values
      const currentPhaseDuration = this.dayNightCycle.isDay ? this.dayNightCycle.dayDuration : this.dayNightCycle.nightDuration;
      const cycleTime = this.dayNightCycle.cycleTime || 0;
      
      // Calculate remaining time safely
      const timeLeft = Math.max(0, currentPhaseDuration - cycleTime);
      const seconds = Math.max(0, Math.ceil(timeLeft / 1000));
      
      const timeIcon = this.dayNightCycle.isDay ? '☀️' : '🌙';
      const timeText = this.dayNightCycle.isDay ? 'Day' : 'Night';
      
      timeEl.innerHTML = timeIcon + ' ' + timeText + ' (' + seconds + 's)';
    }
  }
  
  startMobBurning() {
    // Mark all existing mobs for burning
    this.mobs.forEach(mob => {
      if (mob.isAlive) {
        mob.isBurning = true;
        mob.burnStartTime = this.time.now;
        
        // Visual burning effect
        this.showBurningEffect(mob);
      }
    });
  }
  
  updateMobBurning() {
    if (!this.dayNightCycle.isDay) return; // Only burn during day
    
    const currentTime = this.time.now;
    
    if (currentTime - this.mobBurnTimer > this.mobBurnInterval) {
      this.mobs.forEach(mob => {
        if (mob.isAlive && mob.isBurning) {
          // Deal burning damage
          mob.health -= 5; // 5 damage per second
          
          if (mob.health <= 0) {
            this.killMob(mob);
          } else {
            // Show burning damage effect
            this.showBurningDamageEffect(mob.x, mob.y);
          }
        }
      });
      
      this.mobBurnTimer = currentTime;
    }
  }
  
  showBurningEffect(mob) {
    // Create fire particles around mob
    for (let i = 0; i < 3; i++) {
      const fire = this.add.circle(
        mob.x + (Math.random() - 0.5) * 20,
        mob.y - Math.random() * 15,
        3,
        0xFF4500,
        0.8
      );
      
      this.tweens.add({
        targets: fire,
        y: fire.y - 20,
        alpha: 0,
        duration: 1000,
        onComplete: () => fire.destroy()
      });
    }
  }
  
  showBurningDamageEffect(x, y) {
    const damageText = this.add.text(x, y - 20, '-5', { 
      fontSize: '14px', 
      fill: '#FF4500',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    damageText.setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy()
    });
  }
  
  setMobsEnabled(enabled) {
    this.mobsEnabled = enabled;
    
    if (!enabled) {
      // Remove all existing mobs when disabled
      this.mobs.forEach(mob => {
        if (mob.sprite && mob.sprite.active) {
          mob.sprite.destroy();
        }
        if (mob.healthBar && mob.healthBar.active) {
          mob.healthBar.destroy();
        }
        if (mob.healthBarBg && mob.healthBarBg.active) {
          mob.healthBarBg.destroy();
        }
      });
      this.mobs = [];
      this.updateUI();
    }
  }
  
  // Multiplayer System
  updateMultiplayer() {
    const currentTime = this.time.now;
    
    if (currentTime - this.multiplayerSyncTimer > this.multiplayerSyncInterval) {
      this.syncWithServer();
      this.multiplayerSyncTimer = currentTime;
    }
    
    // Update other players' positions smoothly
    this.updateOtherPlayers();
  }
  
  async syncWithServer() {
    if (!this.roomId) return;
    
    try {
      // Send current player position and state
      await fetch('/api/games/minecraft/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          action: 'move',
          data: {
            x: this.player.x,
            y: this.player.y
          }
        })
      });
      
      // Update player stats
      await fetch('/api/games/minecraft/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          action: 'updatePlayer',
          data: {
            health: this.health,
            armor: this.armor,
            weapon: this.selectedWeapon,
            inventory: this.playerInventory
          }
        })
      });
      
      // Get updated game state
      const response = await fetch('/api/games/minecraft/multiplayer?roomId=' + encodeURIComponent(this.roomId));
      
      if (response.ok) {
        const data = await response.json();
        this.handleMultiplayerUpdate(data);
        this.lastSyncTime = data.lastUpdate || Date.now();
      }
    } catch (error) {
      console.error('Multiplayer sync error:', error);
    }
  }
  
  handleMultiplayerUpdate(data) {
    console.log('Handling multiplayer update:', data);
    
    // Update other players
    if (data.players && Array.isArray(data.players)) {
      // Remove players that are no longer in the room
      this.playerSprites.forEach((spriteData, playerId) => {
        const playerExists = data.players.some(p => p.id === playerId);
        if (!playerExists) {
          this.removeOtherPlayer(playerId);
        }
      });
      
      // Update or create players
      data.players.forEach(player => {
        if (player.id !== this.currentUserId) {
          this.updateOtherPlayer(player);
        }
      });
    }
    
    // Apply recent world changes
    if (data.recentChanges && Array.isArray(data.recentChanges)) {
      data.recentChanges.forEach(change => {
        if (change.playerId !== this.currentUserId) {
          console.log('Applying remote world change:', change);
          this.applyRemoteWorldChange(change);
        }
      });
    }
    
    // Update UI with player count
    this.updateMultiplayerUI(data.players ? data.players.length : 0);
  }
  
  updateOtherPlayer(playerData) {
    const playerId = playerData.id;
    
    // Create or update player sprite
    if (!this.playerSprites.has(playerId)) {
      this.createOtherPlayerSprite(playerId, playerData);
    } else {
      this.updateOtherPlayerSprite(playerId, playerData);
    }
    
    // Store player data
    this.otherPlayers.set(playerId, playerData);
  }
  
  createOtherPlayerSprite(playerId, playerData) {
    // Create player sprite
    const playerSprite = this.add.rectangle(
      playerData.x, 
      playerData.y, 
      this.BLOCK_SIZE - 4, 
      this.BLOCK_SIZE - 4, 
      0x00FF00
    );
    
    // Create player name label
    const nameLabel = this.add.text(
      playerData.x, 
      playerData.y - 25, 
      playerData.name || 'Player', 
      { 
        fontSize: '12px', 
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    nameLabel.setOrigin(0.5);
    
    // Create health bar
    const healthBarBg = this.add.rectangle(
      playerData.x, 
      playerData.y - 15, 
      30, 4, 
      0x666666
    );
    
    const healthBar = this.add.rectangle(
      playerData.x, 
      playerData.y - 15, 
      30 * (playerData.health / 100), 4, 
      0xFF0000
    );
    
    // Create weapon indicator
    const weaponIcon = this.add.text(
      playerData.x + 15, 
      playerData.y - 15, 
      this.getWeaponEmoji(playerData.weapon), 
      { fontSize: '12px' }
    );
    
    // Store all sprite components
    this.playerSprites.set(playerId, {
      sprite: playerSprite,
      nameLabel: nameLabel,
      healthBarBg: healthBarBg,
      healthBar: healthBar,
      weaponIcon: weaponIcon,
      targetX: playerData.x,
      targetY: playerData.y
    });
  }
  
  updateOtherPlayerSprite(playerId, playerData) {
    const playerSprite = this.playerSprites.get(playerId);
    if (!playerSprite) return;
    
    // Update target position for smooth movement
    playerSprite.targetX = playerData.x;
    playerSprite.targetY = playerData.y;
    
    // Update health bar
    const healthPercent = playerData.health / 100;
    playerSprite.healthBar.width = 30 * healthPercent;
    
    // Update weapon icon
    playerSprite.weaponIcon.setText(this.getWeaponEmoji(playerData.weapon));
    
    // Update name if changed
    if (playerData.name) {
      playerSprite.nameLabel.setText(playerData.name);
    }
  }
  
  updateOtherPlayers() {
    // Smooth movement for other players
    this.playerSprites.forEach((spriteData, playerId) => {
      const currentX = spriteData.sprite.x;
      const currentY = spriteData.sprite.y;
      const targetX = spriteData.targetX;
      const targetY = spriteData.targetY;
      
      // Lerp to target position
      const lerpFactor = 0.1;
      const newX = currentX + (targetX - currentX) * lerpFactor;
      const newY = currentY + (targetY - currentY) * lerpFactor;
      
      // Update all sprite components
      spriteData.sprite.setPosition(newX, newY);
      spriteData.nameLabel.setPosition(newX, newY - 25);
      spriteData.healthBarBg.setPosition(newX, newY - 15);
      spriteData.healthBar.setPosition(newX, newY - 15);
      spriteData.weaponIcon.setPosition(newX + 15, newY - 15);
    });
  }
  
  getWeaponEmoji(weaponId) {
    const weaponEmojis = {
      'none': '✊',
      'sword': '⚔️',
      'bow': '🏹',
      'axe': '🪓'
    };
    return weaponEmojis[weaponId] || '✊';
  }
  
  applyRemoteWorldChange(change) {
    // Apply world change from another player
    console.log('Applying remote world change:', change);
    
    if (change.x >= 0 && change.x < this.WORLD_WIDTH && 
        change.y >= 0 && change.y < this.WORLD_HEIGHT) {
      
      // Use skipMultiplayer=true to avoid sending this change back to server
      this.applyWorldChange(change.x, change.y, change.blockType, true);
    }
  }
  
  async sendWorldChange(x, y, blockType, action) {
    if (!this.isMultiplayer || !this.roomId) return;
    
    try {
      console.log('Sending world change:', { x, y, blockType, action });
      
      const response = await fetch('/api/games/minecraft/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.roomId,
          action: action === 'place' ? 'placeBlock' : 'removeBlock',
          data: { x, y, blockType }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('World change sent successfully:', data);
      }
    } catch (error) {
      console.error('Failed to send world change:', error);
    }
  }
  
  cleanupMultiplayer() {
    // Clean up other player sprites
    this.playerSprites.forEach((spriteData, playerId) => {
      spriteData.sprite.destroy();
      spriteData.nameLabel.destroy();
      spriteData.healthBarBg.destroy();
      spriteData.healthBar.destroy();
      spriteData.weaponIcon.destroy();
    });
    this.playerSprites.clear();
    this.otherPlayers.clear();
  }
  
  // Visual Equipment System
  initializeEquipmentVisuals() {
    // Create weapon sprite (initially hidden)
    this.weaponSprite = this.add.sprite(this.player.x, this.player.y, 'weapon');
    this.weaponSprite.setVisible(false);
    this.weaponSprite.setDepth(10);
    
    // Create armor sprites
    this.armorSprites = {
      helmet: this.add.sprite(this.player.x, this.player.y - 8, 'armor'),
      chestplate: this.add.sprite(this.player.x, this.player.y, 'armor'),
      leggings: this.add.sprite(this.player.x, this.player.y + 8, 'armor'),
      boots: this.add.sprite(this.player.x, this.player.y + 12, 'armor')
    };
    
    // Hide armor initially
    Object.values(this.armorSprites).forEach(sprite => {
      sprite.setVisible(false);
      sprite.setDepth(5);
    });
    
    // Update equipment visuals
    this.updateEquipmentVisuals();
  }
  
  updateEquipmentVisuals() {
    // Update weapon visual
    this.updateWeaponVisual();
    
    // Update armor visual
    this.updateArmorVisual();
  }
  
  updateWeaponVisual() {
    if (!this.weaponSprite) return;
    
    // Position weapon relative to player
    this.weaponSprite.setPosition(this.player.x + 15, this.player.y - 5);
    
    // Show/hide and style weapon based on selection
    switch (this.selectedWeapon) {
      case 'sword':
        this.weaponSprite.setVisible(true);
        this.weaponSprite.setTint(0xC0C0C0); // Silver color
        this.weaponSprite.setScale(0.8, 1.2); // Sword shape
        this.weaponSprite.setRotation(0.3); // Slight angle
        break;
      case 'bow':
        this.weaponSprite.setVisible(true);
        this.weaponSprite.setTint(0x8B4513); // Brown color
        this.weaponSprite.setScale(0.6, 1.0); // Bow shape
        this.weaponSprite.setRotation(0);
        break;
      case 'axe':
        this.weaponSprite.setVisible(true);
        this.weaponSprite.setTint(0x654321); // Dark brown handle
        this.weaponSprite.setScale(1.0, 0.8); // Axe shape
        this.weaponSprite.setRotation(0.2);
        break;
      default:
        this.weaponSprite.setVisible(false);
        break;
    }
  }
  
  updateArmorVisual() {
    if (!this.armorSprites) return;
    
    // Position armor pieces relative to player
    this.armorSprites.helmet.setPosition(this.player.x, this.player.y - 8);
    this.armorSprites.chestplate.setPosition(this.player.x, this.player.y);
    this.armorSprites.leggings.setPosition(this.player.x, this.player.y + 8);
    this.armorSprites.boots.setPosition(this.player.x, this.player.y + 12);
    
    // Show/hide and style armor based on selection
    const armorColors = {
      'leather': 0x8B4513,  // Brown
      'iron': 0xC0C0C0,     // Silver
      'diamond': 0x00FFFF,  // Cyan
      'gold': 0xFFD700      // Gold
    };
    
    const armorColor = armorColors[this.selectedArmor] || 0xFFFFFF;
    const showArmor = this.selectedArmor !== 'none';
    
    Object.values(this.armorSprites).forEach(sprite => {
      sprite.setVisible(showArmor);
      sprite.setTint(armorColor);
      sprite.setAlpha(0.7); // Semi-transparent
    });
  }
  
  // Enhanced Attack System with Visuals - Integrated above
  
  showWeaponAttackAnimation(target) {
    if (!this.weaponSprite || !this.weaponSprite.visible) return;
    
    // Store original position and rotation
    const originalX = this.weaponSprite.x;
    const originalY = this.weaponSprite.y;
    const originalRotation = this.weaponSprite.rotation;
    
    // Attack animation based on weapon type
    switch (this.selectedWeapon) {
      case 'sword':
        // Sword slash animation
        this.tweens.add({
          targets: this.weaponSprite,
          rotation: originalRotation + 1.5,
          duration: 150,
          yoyo: true,
          ease: 'Power2'
        });
        break;
      case 'axe':
        // Axe swing animation
        this.tweens.add({
          targets: this.weaponSprite,
          rotation: originalRotation - 1.0,
          y: originalY + 10,
          duration: 200,
          yoyo: true,
          ease: 'Power2'
        });
        break;
      case 'bow':
        // Bow draw animation
        this.tweens.add({
          targets: this.weaponSprite,
          scaleX: 0.4,
          duration: 100,
          yoyo: true,
          ease: 'Power2'
        });
        break;
    }
  }
  
  fireArrow(target) {
    // Create arrow projectile
    const arrow = this.add.sprite(this.player.x, this.player.y, 'projectile');
    arrow.setTint(0x8B4513); // Brown arrow
    arrow.setScale(0.3, 0.8); // Arrow shape
    arrow.setDepth(15);
    
    // Calculate direction to target
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    arrow.setRotation(angle);
    
    // Add to projectiles array
    this.projectiles.push({
      sprite: arrow,
      target: target,
      damage: this.damage,
      speed: 400,
      startTime: this.time.now
    });
    
    // Animate arrow flight
    this.tweens.add({
      targets: arrow,
      x: target.x,
      y: target.y,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.hitTarget(target, this.damage);
        arrow.destroy();
        // Remove from projectiles array
        this.projectiles = this.projectiles.filter(p => p.sprite !== arrow);
      }
    });
    
    // Show arrow trail effect
    this.showArrowTrail(this.player.x, this.player.y, target.x, target.y);
  }
  
  showArrowTrail(startX, startY, endX, endY) {
    const trail = this.add.line(0, 0, startX, startY, endX, endY, 0xFFFF00, 0.5);
    trail.setLineWidth(2);
    trail.setDepth(12);
    
    // Fade out trail
    this.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 300,
      onComplete: () => trail.destroy()
    });
  }
  
  performMeleeAttack(target) {
    // Immediate damage for melee weapons
    this.hitTarget(target, this.damage);
    
    // Show slash effect
    this.showSlashEffect(target.x, target.y);
  }
  
  performAxeAttack(target) {
    // Higher damage for axe
    this.hitTarget(target, this.damage * 1.2);
    
    // Show heavy impact effect
    this.showHeavyImpactEffect(target.x, target.y);
  }
  
  performPunchAttack(target) {
    // Lower damage for fists
    this.hitTarget(target, this.damage * 0.5);
    
    // Show punch effect
    this.showPunchEffect(target.x, target.y);
  }
  
  hitTarget(target, damage) {
    // Deal damage to target
    this.damageMob(target, damage);
    
    // Show damage number
    this.showDamageNumber(target.x, target.y, damage);
  }
  
  showSlashEffect(x, y) {
    // Create slash visual effect
    const slash = this.add.graphics();
    slash.lineStyle(3, 0xFFFFFF, 0.8);
    slash.beginPath();
    slash.moveTo(x - 20, y - 20);
    slash.lineTo(x + 20, y + 20);
    slash.strokePath();
    slash.setDepth(20);
    
    // Animate and destroy
    this.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => slash.destroy()
    });
  }
  
  showHeavyImpactEffect(x, y) {
    // Create heavy impact effect
    for (let i = 0; i < 5; i++) {
      const spark = this.add.circle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        2,
        0xFFA500,
        0.8
      );
      spark.setDepth(20);
      
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 2,
        duration: 300,
        onComplete: () => spark.destroy()
      });
    }
  }
  
  showPunchEffect(x, y) {
    // Create simple punch effect
    const impact = this.add.circle(x, y, 8, 0xFFFFFF, 0.6);
    impact.setDepth(20);
    
    this.tweens.add({
      targets: impact,
      alpha: 0,
      scale: 2,
      duration: 150,
      onComplete: () => impact.destroy()
    });
  }
  
  // Resource Gathering System
  checkResourceGathering() {
    if (this.time.now - this.lastGatherTime < this.gatheringCooldown) return;
    
    const playerGridX = Math.floor(this.player.x / this.BLOCK_SIZE);
    const playerGridY = Math.floor(this.player.y / this.BLOCK_SIZE);
    
    // Check nearby blocks for resources to gather
    for (let dx = -this.resourceGatheringRange; dx <= this.resourceGatheringRange; dx++) {
      for (let dy = -this.resourceGatheringRange; dy <= this.resourceGatheringRange; dy++) {
        const checkX = playerGridX + dx;
        const checkY = playerGridY + dy;
        
        if (checkX >= 0 && checkX < this.WORLD_WIDTH && checkY >= 0 && checkY < this.WORLD_HEIGHT) {
          const block = this.world[checkX][checkY];
          if (block && block.blockType) {
            this.tryGatherResource(block.blockType, checkX, checkY);
          }
        }
      }
    }
  }
  
  tryGatherResource(blockType, x, y) {
    // Check if this resource type can be gathered
    const resourceInfo = this.availableResources[blockType];
    if (!resourceInfo) return;
    
    // Check if already gathered this type
    if (resourceInfo.gathered) return;
    
    // Mark as gathered
    resourceInfo.gathered = true;
    this.gatheredResources.set(blockType, true);
    this.lastGatherTime = this.time.now;
    
    // Show gathering effect
    this.showResourceGatheringEffect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, blockType);
    
    // Add to inventory
    this.addGatheredResourceToInventory(blockType);
    
    // Update UI
    this.updateResourceAvailability();
    
    console.log('Gathered resource:', blockType);
  }
  
  showResourceGatheringEffect(x, y, resourceType, quantity = 1, actionMessage = 'Gathered') {
    // Create gathering visual effect
    const gatherEffect = this.add.circle(x + this.BLOCK_SIZE/2, y + this.BLOCK_SIZE/2, 15, 0x00FF00, 0.6);
    gatherEffect.setDepth(30);
    
    // Add resource icon
    const resourceIcon = this.add.text(
      x + this.BLOCK_SIZE/2, 
      y + this.BLOCK_SIZE/2, 
      this.getResourceIcon(resourceType), 
      { fontSize: '20px' }
    );
    resourceIcon.setOrigin(0.5);
    resourceIcon.setDepth(31);
    
    // Add action-specific message with quantity
    const gatherText = this.add.text(
      x + this.BLOCK_SIZE/2, 
      y + this.BLOCK_SIZE/2 - 30, 
      actionMessage + ' +' + quantity + ' ' + resourceType + '!', 
      { 
        fontSize: '14px', 
        fill: '#00FF00',
        stroke: '#000000',
        strokeThickness: 2,
        fontStyle: 'bold'
      }
    );
    gatherText.setOrigin(0.5);
    gatherText.setDepth(31);
    
    // Animate effects
    this.tweens.add({
      targets: [gatherEffect, resourceIcon, gatherText],
      y: y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        gatherEffect.destroy();
        resourceIcon.destroy();
        gatherText.destroy();
      }
    });
  }
  
  getResourceIcon(resourceType) {
    const icons = {
      'wood': '🪵',
      'stone': '🪨',
      'iron': '⚙️',
      'gold': '🥇',
      'diamond': '💎',
      'dirt': '🟫',
      'grass': '🌱'
    };
    return icons[resourceType] || '📦';
  }
  
  addGatheredResourceToInventory(resourceType) {
    const resourceItem = {
      id: 'resource_' + resourceType + '_' + Date.now(),
      name: resourceType.charAt(0).toUpperCase() + resourceType.slice(1),
      type: 'resource',
      quantity: 1,
      icon: this.getResourceIcon(resourceType),
      rarity: this.getResourceRarity(resourceType),
      description: 'Gathered ' + resourceType + ' resource',
      value: this.getResourceValue(resourceType),
      blockType: resourceType
    };
    
    // Add to player inventory
    if (this.playerInventory.length < this.maxInventorySize) {
      // Check if item already exists
      const existingItem = this.playerInventory.find(item => 
        item.blockType === resourceType && item.type === 'resource'
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.playerInventory.push(resourceItem);
      }
    }
  }
  
  getResourceRarity(resourceType) {
    const rarities = {
      'dirt': 'common',
      'grass': 'common',
      'wood': 'common',
      'stone': 'common',
      'iron': 'rare',
      'gold': 'epic',
      'diamond': 'legendary'
    };
    return rarities[resourceType] || 'common';
  }
  
  getResourceValue(resourceType) {
    const values = {
      'dirt': 1,
      'grass': 1,
      'wood': 2,
      'stone': 3,
      'iron': 10,
      'gold': 25,
      'diamond': 100
    };
    return values[resourceType] || 1;
  }
  
  updateResourceAvailability() {
    // Update UI to show which resources are available for use
    const resourceStatus = {};
    for (const [resourceType, info] of Object.entries(this.availableResources)) {
      resourceStatus[resourceType] = info.gathered;
    }
    
    // Store in window for UI access
    window.gatheredResources = resourceStatus;
    
    // Trigger UI update
    if (typeof window.updateResourceUI === 'function') {
      window.updateResourceUI(resourceStatus);
    }
  }
  
  canUseResource(resourceType) {
    // Initialize availableResources if it doesn't exist
    if (!this.availableResources) {
      this.availableResources = {
        'wood': { gathered: false, required: ['tree', 'wood'] },
        'stone': { gathered: false, required: ['stone'] },
        'iron': { gathered: false, required: ['iron'] },
        'gold': { gathered: false, required: ['gold'] },
        'diamond': { gathered: false, required: ['diamond'] },
        'dirt': { gathered: true, required: ['dirt'] }, // Always available
        'grass': { gathered: true, required: ['grass'] } // Always available
      };
    }
    
    return this.availableResources[resourceType]?.gathered || false;
  }
  
  canPlaceBlock(blockType) {
    // Initialize availableResources if it doesn't exist
    if (!this.availableResources) {
      this.availableResources = {
        'wood': { gathered: false, required: ['tree', 'wood'] },
        'stone': { gathered: false, required: ['stone'] },
        'iron': { gathered: false, required: ['iron'] },
        'gold': { gathered: false, required: ['gold'] },
        'diamond': { gathered: false, required: ['diamond'] },
        'dirt': { gathered: true, required: ['dirt'] }, // Always available
        'grass': { gathered: true, required: ['grass'] } // Always available
      };
    }
    
    // Check if we have at least 1 of this resource
    return this.canAffordResource(blockType, 1);
  }
  
  // Override block placement to check resource availability
  // Resource Counter System
  initializeResourceCounters() {
    // Initialize all resource counters to 0
    const resourceTypes = ['wood', 'stone', 'iron', 'gold', 'diamond', 'dirt', 'grass'];
    resourceTypes.forEach(resource => {
      this.resourceCounters.set(resource, resource === 'dirt' || resource === 'grass' ? 10 : 0);
    });
  }
  
  getResourceCount(resourceType) {
    return this.resourceCounters.get(resourceType) || 0;
  }
  
  addResource(resourceType, quantity = 1) {
    const currentCount = this.getResourceCount(resourceType);
    this.resourceCounters.set(resourceType, currentCount + quantity);
    
    // Mark as gathered if not already
    if (!this.availableResources[resourceType]?.gathered) {
      this.availableResources[resourceType].gathered = true;
      this.gatheredResources.set(resourceType, true);
    }
    
    // Update UI
    this.updateResourceUI();
  }
  
  useResource(resourceType, quantity = 1) {
    const currentCount = this.getResourceCount(resourceType);
    if (currentCount >= quantity) {
      this.resourceCounters.set(resourceType, currentCount - quantity);
      this.updateResourceUI();
      return true;
    }
    return false;
  }
  
  canAffordResource(resourceType, quantity = 1) {
    return this.getResourceCount(resourceType) >= quantity;
  }
  
  updateResourceUI() {
    // Update the resource status display
    const resourceStatus = {};
    const resourceCounts = {};
    
    for (const [resourceType, info] of Object.entries(this.availableResources)) {
      resourceStatus[resourceType] = info.gathered;
      resourceCounts[resourceType] = this.getResourceCount(resourceType);
    }
    
    // Store in window for UI access
    window.gatheredResources = resourceStatus;
    window.resourceCounts = resourceCounts;
    
    // Trigger UI update
    if (typeof window.updateResourceUI === 'function') {
      window.updateResourceUI(resourceStatus, resourceCounts);
    }
  }
  
  showResourceRequiredMessage(blockType) {
    const currentCount = this.getResourceCount(blockType);
    const message = this.add.text(
      this.player.x, 
      this.player.y - 50, 
      'Need ' + blockType + '! (Have: ' + currentCount + ')', 
      { 
        fontSize: '16px', 
        fill: '#FF6B6B',
        stroke: '#000000',
        strokeThickness: 2,
        fontStyle: 'bold'
      }
    );
    
    message.setOrigin(0.5);
    message.setDepth(50);
    
    this.tweens.add({
      targets: message,
      y: this.player.y - 80,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => message.destroy()
    });
  }
  
  // Deliberate Resource Gathering (through mining/chopping)
  gatherResourceFromBlock(blockType, gridX, gridY) {
    // Check if this block type gives resources
    if (!this.availableResources[blockType]) return;
    
    // Calculate quantity based on block type, tools, and mining action
    let quantity = this.calculateMiningYield(blockType);
    
    // Add resources to inventory
    this.addResource(blockType, quantity);
    
    // Show gathering effect with action-specific message
    const actionMessage = this.getActionMessage(blockType);
    this.showResourceGatheringEffect(
      gridX * this.BLOCK_SIZE, 
      gridY * this.BLOCK_SIZE, 
      blockType, 
      quantity,
      actionMessage
    );
    
    console.log('Mined', quantity, blockType, 'from block - Total:', this.getResourceCount(blockType));
  }
  
  calculateMiningYield(blockType) {
    let baseQuantity = 1;
    
    // Tool efficiency bonuses for deliberate actions
    const toolBonuses = {
      'wood': this.selectedWeapon === 'axe' ? 2 : 1,      // Axe is best for wood
      'stone': this.selectedWeapon === 'sword' ? 2 : 1,   // Sword works well on stone
      'iron': this.selectedWeapon === 'sword' ? 3 : 1,    // Sword is best for metals
      'gold': this.selectedWeapon === 'sword' ? 3 : 1,    // Sword is best for metals
      'diamond': this.selectedWeapon === 'sword' ? 4 : 1, // Sword is best for precious metals
      'dirt': 2, // Always easy to dig
      'grass': 2  // Always easy to dig
    };
    
    return toolBonuses[blockType] || baseQuantity;
  }
  
  getActionMessage(blockType) {
    const actionMessages = {
      'wood': 'Chopped',
      'stone': 'Mined',
      'iron': 'Mined',
      'gold': 'Mined',
      'diamond': 'Mined',
      'dirt': 'Dug',
      'grass': 'Dug'
    };
    
    return actionMessages[blockType] || 'Gathered';
  }
  
  showResourceUsedEffect(x, y, resourceType) {
    // Show resource consumption effect
    const usedText = this.add.text(
      x + this.BLOCK_SIZE/2, 
      y + this.BLOCK_SIZE/2 - 20, 
      '-1 ' + resourceType, 
      { 
        fontSize: '12px', 
        fill: '#FF9999',
        stroke: '#000000',
        strokeThickness: 1,
        fontStyle: 'bold'
      }
    );
    usedText.setOrigin(0.5);
    usedText.setDepth(31);
    
    // Animate effect
    this.tweens.add({
      targets: usedText,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => usedText.destroy()
    });
  }
  
  showDamageNumber(x, y, damage) {
    const damageText = this.add.text(x, y - 20, '-' + Math.floor(damage), { 
      fontSize: '16px', 
      fill: '#FF0000',
      stroke: '#000000',
      strokeThickness: 2,
      fontStyle: 'bold'
    });
    
    damageText.setOrigin(0.5);
    damageText.setDepth(25);
    
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }
  
  removeOtherPlayer(playerId) {
    const spriteData = this.playerSprites.get(playerId);
    if (spriteData) {
      spriteData.sprite.destroy();
      spriteData.nameLabel.destroy();
      spriteData.healthBarBg.destroy();
      spriteData.healthBar.destroy();
      spriteData.weaponIcon.destroy();
      this.playerSprites.delete(playerId);
      this.otherPlayers.delete(playerId);
      console.log('Removed player:', playerId);
    }
  }
  
  updateMultiplayerUI(playerCount) {
    // Update UI to show multiplayer status
    const multiplayerEl = document.getElementById('multiplayer-status');
    if (multiplayerEl) {
      multiplayerEl.textContent = playerCount + ' players online';
    }
  }
  
  initializeMultiplayer() {
    console.log('Initializing multiplayer for room:', this.roomId);
    
    // Join the multiplayer room
    this.joinMultiplayerRoom();
    
    // Start immediate sync
    this.syncWithServer();
  }
  
  async joinMultiplayerRoom() {
    if (!this.roomId) return;
    
    try {
      const response = await fetch('/api/games/minecraft/multiplayer', {
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
            weapon: this.selectedWeapon,
            inventory: this.playerInventory
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Joined multiplayer room successfully:', data);
        this.handleMultiplayerUpdate(data);
      }
    } catch (error) {
      console.error('Failed to join multiplayer room:', error);
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
