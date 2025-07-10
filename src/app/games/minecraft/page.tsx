"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"

export default function MinecraftGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      loadGame()
    }
  }, [status, router])

  const loadGame = async () => {
    try {
      // Load saved game state
      const response = await fetch("/api/games/minecraft/save")
      if (response.ok) {
        const savedState = await response.json()
        console.log("Loaded game state:", savedState)
        
        // Initialize the game with saved state
        initializeMinecraftGame(savedState)
      } else {
        // Initialize new game
        initializeMinecraftGame(null)
      }
    } catch (error) {
      console.error("Error loading game:", error)
      initializeMinecraftGame(null)
    }
  }

  const initializeMinecraftGame = (savedState: any) => {
    // Create script element for Phaser
    const phaserScript = document.createElement("script")
    phaserScript.src = "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"
    phaserScript.onload = () => {
      // Create game script
      const gameScript = document.createElement("script")
      gameScript.textContent = getMinecraftGameCode(savedState)
      document.head.appendChild(gameScript)
      setGameLoaded(true)
    }
    document.head.appendChild(phaserScript)
  }

  const saveGame = async () => {
    if (!gameLoaded || !window.minecraftGame) {
      setSaveStatus("Game not loaded")
      return
    }

    setSaveStatus("Saving...")
    
    try {
      const gameState = window.minecraftGame.getGameState()
      
      const response = await fetch("/api/games/minecraft/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: gameState.world,
          score: gameState.score,
          level: 1,
        }),
      })

      if (response.ok) {
        setSaveStatus("Game saved successfully!")
        setTimeout(() => setSaveStatus(""), 3000)
      } else {
        setSaveStatus("Failed to save game")
      }
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus("Error saving game")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Game Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:text-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-white">Minecraft Web Game</h1>
            </div>
            <div className="flex items-center space-x-4">
              {saveStatus && (
                <span className="text-sm text-green-400">{saveStatus}</span>
              )}
              <Button
                onClick={saveGame}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!gameLoaded}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Game
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Container */}
      <div className="relative">
        <div id="minecraft-game-container" className="flex justify-center items-center min-h-screen">
          {!gameLoaded && (
            <div className="text-white text-lg">Loading Minecraft Game...</div>
          )}
        </div>

        {/* Game UI Overlay */}
        <div id="game-ui" className="absolute top-4 left-4 text-white z-50">
          <div className="bg-black bg-opacity-50 rounded p-3 space-y-2">
            <div>Health: <span id="health-display">100</span></div>
            <div>Score: <span id="score-display">0</span></div>
            <div>Selected: <span id="selected-block-display">Grass</span></div>
          </div>
        </div>

        <div id="game-instructions" className="absolute top-4 right-4 text-white z-50">
          <div className="bg-black bg-opacity-50 rounded p-3 text-sm space-y-1">
            <div>WASD - Move</div>
            <div>Space - Jump</div>
            <div>Left Click - Place blocks</div>
            <div>Right Click - Break blocks</div>
            <div>1-5 - Select block type</div>
          </div>
        </div>

        <div id="game-inventory" className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex space-x-2">
            <div className="inventory-slot selected bg-black bg-opacity-70 border-2 border-white w-12 h-12 flex items-center justify-center text-white cursor-pointer" data-block="grass">🌱</div>
            <div className="inventory-slot bg-black bg-opacity-70 border-2 border-gray-600 w-12 h-12 flex items-center justify-center text-white cursor-pointer" data-block="stone">🪨</div>
            <div className="inventory-slot bg-black bg-opacity-70 border-2 border-gray-600 w-12 h-12 flex items-center justify-center text-white cursor-pointer" data-block="wood">🪵</div>
            <div className="inventory-slot bg-black bg-opacity-70 border-2 border-gray-600 w-12 h-12 flex items-center justify-center text-white cursor-pointer" data-block="dirt">🟫</div>
            <div className="inventory-slot bg-black bg-opacity-70 border-2 border-gray-600 w-12 h-12 flex items-center justify-center text-white cursor-pointer" data-block="water">💧</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Game code as a string to be injected
function getMinecraftGameCode(savedState: any) {
  return `
// Global reference for save/load
window.minecraftGame = null;

// Minecraft Web Game using Phaser 3
class MinecraftGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MinecraftGame' });
        
        // Game constants
        this.BLOCK_SIZE = 32;
        this.WORLD_WIDTH = 50;
        this.WORLD_HEIGHT = 30;
        this.GRAVITY = 800;
        this.JUMP_VELOCITY = -400;
        this.PLAYER_SPEED = 200;
        
        // Game state
        this.world = [];
        this.selectedBlock = 'grass';
        this.score = 0;
        this.health = 100;
        
        // Saved state
        this.savedState = ${JSON.stringify(savedState)};
        
        // Block types with colors
        this.blockTypes = {
            grass: { color: 0x7CB342, emoji: '🌱' },
            stone: { color: 0x757575, emoji: '🪨' },
            wood: { color: 0x8D6E63, emoji: '🪵' },
            dirt: { color: 0x5D4037, emoji: '🟫' },
            water: { color: 0x2196F3, emoji: '💧' }
        };
    }
    
    preload() {
        // Create colored rectangles for blocks
        Object.keys(this.blockTypes).forEach(blockType => {
            this.add.graphics()
                .fillStyle(this.blockTypes[blockType].color)
                .fillRect(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE)
                .generateTexture(blockType, this.BLOCK_SIZE, this.BLOCK_SIZE);
        });
        
        // Create player texture
        this.add.graphics()
            .fillStyle(0xFF5722)
            .fillRect(0, 0, this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4)
            .generateTexture('player', this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4);
    }
    
    create() {
        // Set global reference
        window.minecraftGame = this;
        
        // Initialize world array
        this.initializeWorld();
        
        // Create world blocks
        this.blocks = this.physics.add.staticGroup();
        
        // Load saved state or generate new terrain
        if (this.savedState && this.savedState.data) {
            this.loadWorldFromSave(this.savedState.data);
            this.score = this.savedState.score || 0;
        } else {
            this.generateTerrain();
        }
        
        // Create player
        this.player = this.physics.add.sprite(400, 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(this.GRAVITY);
        
        // Player physics
        this.physics.add.collider(this.player, this.blocks);
        
        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
        this.numbers = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE');
        
        // Mouse input
        this.input.on('pointerdown', (pointer) => {
            this.handleClick(pointer);
        });
        
        // Camera setup
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH * this.BLOCK_SIZE, this.WORLD_HEIGHT * this.BLOCK_SIZE);
        this.cameras.main.startFollow(this.player);
        
        // Physics world bounds
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH * this.BLOCK_SIZE, this.WORLD_HEIGHT * this.BLOCK_SIZE);
        
        // Setup inventory UI
        this.setupInventoryHandlers();
        
        // Background
        this.add.rectangle(
            this.WORLD_WIDTH * this.BLOCK_SIZE / 2, 
            this.WORLD_HEIGHT * this.BLOCK_SIZE / 2, 
            this.WORLD_WIDTH * this.BLOCK_SIZE, 
            this.WORLD_HEIGHT * this.BLOCK_SIZE, 
            0x87CEEB
        ).setDepth(-1);
        
        // Update UI
        this.updateUI();
        
        console.log('Minecraft game loaded successfully');
    }
    
    getGameState() {
        return {
            world: this.serializeWorld(),
            score: this.score,
            health: this.health,
            selectedBlock: this.selectedBlock
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
    
    loadWorldFromSave(savedWorld) {
        for (let x = 0; x < this.WORLD_WIDTH; x++) {
            for (let y = 0; y < this.WORLD_HEIGHT; y++) {
                if (savedWorld[x] && savedWorld[x][y]) {
                    this.placeBlock(x, y, savedWorld[x][y]);
                }
            }
        }
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
    
    generateTerrain() {
        const groundLevel = Math.floor(this.WORLD_HEIGHT * 0.7);
        
        for (let x = 0; x < this.WORLD_WIDTH; x++) {
            const height = groundLevel + Math.floor(Math.sin(x * 0.1) * 3);
            
            for (let y = height; y < this.WORLD_HEIGHT; y++) {
                let blockType;
                if (y === height) {
                    blockType = 'grass';
                } else if (y < height + 3) {
                    blockType = 'dirt';
                } else {
                    blockType = 'stone';
                }
                
                this.placeBlock(x, y, blockType);
            }
            
            if (Math.random() < 0.1 && height > 5) {
                for (let treeY = height - 3; treeY < height; treeY++) {
                    if (treeY >= 0) {
                        this.placeBlock(x, treeY, 'wood');
                    }
                }
            }
        }
    }
    
    placeBlock(x, y, blockType) {
        if (x < 0 || x >= this.WORLD_WIDTH || y < 0 || y >= this.WORLD_HEIGHT) return false;
        if (this.world[x][y]) return false;
        
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
        
        if (blockType !== 'grass' && blockType !== 'dirt' && blockType !== 'stone') {
            this.score += 10;
            this.updateUI();
        }
        
        return true;
    }
    
    removeBlock(x, y) {
        if (x < 0 || x >= this.WORLD_WIDTH || y < 0 || y >= this.WORLD_HEIGHT) return false;
        if (!this.world[x][y]) return false;
        
        const block = this.world[x][y];
        block.destroy();
        this.world[x][y] = null;
        
        this.score += 5;
        this.updateUI();
        return true;
    }
    
    handleClick(pointer) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        
        const gridX = Math.floor(worldX / this.BLOCK_SIZE);
        const gridY = Math.floor(worldY / this.BLOCK_SIZE);
        
        if (gridX < 0 || gridX >= this.WORLD_WIDTH || gridY < 0 || gridY >= this.WORLD_HEIGHT) return;
        
        const playerGridX = Math.floor(this.player.x / this.BLOCK_SIZE);
        const playerGridY = Math.floor(this.player.y / this.BLOCK_SIZE);
        const distance = Math.abs(gridX - playerGridX) + Math.abs(gridY - playerGridY);
        
        if (distance > 6) return;
        
        if (pointer.button === 0) {
            if (!this.world[gridX][gridY]) {
                this.placeBlock(gridX, gridY, this.selectedBlock);
            }
        } else if (pointer.button === 2) {
            if (this.world[gridX][gridY]) {
                this.removeBlock(gridX, gridY);
            }
        }
    }
    
    setupInventoryHandlers() {
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.inventory-slot').forEach(s => {
                    s.classList.remove('selected');
                    s.classList.remove('border-white');
                    s.classList.add('border-gray-600');
                });
                slot.classList.add('selected');
                slot.classList.add('border-white');
                slot.classList.remove('border-gray-600');
                this.selectedBlock = slot.dataset.block;
                this.updateUI();
            });
        });
    }
    
    update() {
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
        
        if (Phaser.Input.Keyboard.JustDown(this.numbers.ONE)) this.selectBlock(0);
        if (Phaser.Input.Keyboard.JustDown(this.numbers.TWO)) this.selectBlock(1);
        if (Phaser.Input.Keyboard.JustDown(this.numbers.THREE)) this.selectBlock(2);
        if (Phaser.Input.Keyboard.JustDown(this.numbers.FOUR)) this.selectBlock(3);
        if (Phaser.Input.Keyboard.JustDown(this.numbers.FIVE)) this.selectBlock(4);
        
        this.checkWaterDamage();
    }
    
    selectBlock(index) {
        const blockTypes = Object.keys(this.blockTypes);
        if (index < blockTypes.length) {
            this.selectedBlock = blockTypes[index];
            
            document.querySelectorAll('.inventory-slot').forEach((slot, i) => {
                if (i === index) {
                    slot.classList.add('selected', 'border-white');
                    slot.classList.remove('border-gray-600');
                } else {
                    slot.classList.remove('selected', 'border-white');
                    slot.classList.add('border-gray-600');
                }
            });
            
            this.updateUI();
        }
    }
    
    checkWaterDamage() {
        const playerGridX = Math.floor(this.player.x / this.BLOCK_SIZE);
        const playerGridY = Math.floor(this.player.y / this.BLOCK_SIZE);
        
        if (playerGridX >= 0 && playerGridX < this.WORLD_WIDTH && 
            playerGridY >= 0 && playerGridY < this.WORLD_HEIGHT) {
            const block = this.world[playerGridX][playerGridY];
            if (block && block.blockType === 'water') {
                this.health -= 0.5;
                if (this.health <= 0) {
                    this.health = 0;
                    this.gameOver();
                }
            }
        }
    }
    
    gameOver() {
        this.scene.pause();
        alert(\`Game Over! Final Score: \${this.score}\`);
        this.scene.restart();
        this.health = 100;
        this.score = 0;
    }
    
    updateUI() {
        const healthEl = document.getElementById('health-display');
        const scoreEl = document.getElementById('score-display');
        const selectedEl = document.getElementById('selected-block-display');
        
        if (healthEl) healthEl.textContent = Math.floor(this.health);
        if (scoreEl) scoreEl.textContent = this.score;
        if (selectedEl) selectedEl.textContent = this.selectedBlock.charAt(0).toUpperCase() + this.selectedBlock.slice(1);
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'minecraft-game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: MinecraftGame
};

// Start the game
const game = new Phaser.Game(config);

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});
`;
}
