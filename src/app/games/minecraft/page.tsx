"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Upload, Settings, Users, Eye, EyeOff, Maximize, Minimize } from "lucide-react"
import Link from "next/link"

// Extend Window interface for TypeScript
declare global {
  interface Window {
    minecraftGame: any;
    currentUserId: string;
    game: any;
    Phaser: any;
  }
}

// Custom styles for animations
const customStyles = `
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  .animation-delay-400 {
    animation-delay: 400ms;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInFromBottom {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideInFromLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideInFromRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
    50% { box-shadow: 0 0 25px rgba(255, 255, 255, 0.9); }
  }
  @keyframes selectedPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .inventory-slot.selected {
    animation: pulseGlow 2s infinite;
    position: relative;
  }
  .inventory-slot.selected::after {
    content: '✓';
    position: absolute;
    top: -8px;
    right: -8px;
    background: rgba(34, 197, 94, 0.9);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    border: 2px solid white;
    z-index: 10;
  }
`

export default function MinecraftGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")
  const [roomId, setRoomId] = useState("default")
  const [showRoomSelector, setShowRoomSelector] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showGameUI, setShowGameUI] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      loadGame()
    }
    
    // Cleanup function to prevent memory leaks and stop API calls
    return () => {
      if (window.minecraftGame && typeof window.minecraftGame.cleanup === 'function') {
        window.minecraftGame.cleanup()
      }
      
      // Clean up Phaser game instance
      if (window.game && typeof window.game.destroy === 'function') {
        window.game.destroy(true)
        window.game = null
      }
      
      // Remove game scripts
      const existingGameScripts = document.querySelectorAll('script[data-minecraft-game]')
      existingGameScripts.forEach(script => script.remove())
    }
  }, [status, router])

  const loadGame = async () => {
    try {
      // Load saved game state
      const response = await fetch("/api/games/minecraft/save")
      if (response.ok) {
        const savedState = await response.json()
        console.log("Loaded game state:", savedState)
        
        // Initialize the game with saved state and room ID
        initializeMinecraftGame(savedState, roomId)
      } else {
        // Initialize new game
        initializeMinecraftGame(null, roomId)
      }
    } catch (error) {
      console.error("Error loading game:", error)
      initializeMinecraftGame(null, roomId)
    }
  }

  const initializeMinecraftGame = (savedState: any, selectedRoomId: string) => {
    // Clean up any existing game instances and scripts
    if (window.minecraftGame && typeof window.minecraftGame.cleanup === 'function') {
      window.minecraftGame.cleanup()
    }
    
    // Remove existing game scripts
    const existingGameScripts = document.querySelectorAll('script[data-minecraft-game]')
    existingGameScripts.forEach(script => script.remove())
    
    // Destroy existing Phaser game instance
    if (window.game && typeof window.game.destroy === 'function') {
      window.game.destroy(true)
      window.game = null
    }
    
    // Clear the game container
    const gameContainer = document.getElementById('minecraft-game-container')
    if (gameContainer) {
      const canvases = gameContainer.querySelectorAll('canvas')
      canvases.forEach(canvas => canvas.remove())
    }
    
    // Check if Phaser is already loaded
    if (window.Phaser) {
      // Phaser already loaded, create game directly
      const gameScript = document.createElement("script")
      gameScript.setAttribute('data-minecraft-game', 'true')
      gameScript.textContent = getMinecraftGameCode(savedState, selectedRoomId)
      document.head.appendChild(gameScript)
      setGameLoaded(true)
    } else {
      // Load Phaser first
      const phaserScript = document.createElement("script")
      phaserScript.src = "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"
      phaserScript.onload = () => {
        // Create game script
        const gameScript = document.createElement("script")
        gameScript.setAttribute('data-minecraft-game', 'true')
        gameScript.textContent = getMinecraftGameCode(savedState, selectedRoomId)
        document.head.appendChild(gameScript)
        setGameLoaded(true)
      }
      document.head.appendChild(phaserScript)
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-white mb-2">Loading Minecraft Game</div>
          <div className="text-sm text-gray-300">Preparing your adventure...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 transition-all duration-300 ${isFullscreen ? 'overflow-hidden' : ''}`}>
      {/* Room Selection Modal */}
      {showRoomSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Multiplayer Room</h2>
              <p className="text-gray-400 text-sm">Connect with friends or join a public game</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter room ID (e.g., 'friends', 'public')"
                />
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span>Use the same Room ID to play with friends</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Leave as 'default' to join the public room</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowRoomSelector(false)
                    loadGame()
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200 shadow-lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Room
                </Button>
                <Button
                  onClick={() => {
                    setRoomId(`room-${Math.random().toString(36).substr(2, 9)}`)
                  }}
                  variant="outline"
                  className="text-white border-gray-500 hover:bg-gray-700 hover:border-gray-400 transition-all duration-200 py-3"
                >
                  Create New
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <header className="bg-gray-800/90 backdrop-blur-md border-b border-gray-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⛏️</div>
                <div>
                  <h1 className="text-xl font-bold text-white">Minecraft Web Game</h1>
                  <div className="text-xs text-gray-400">Multiplayer Edition</div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {saveStatus && (
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-sm text-green-400 font-medium">{saveStatus}</span>
                </div>
              )}
              <Button
                onClick={() => setShowGameUI(!showGameUI)}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700/50"
              >
                {showGameUI ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setShowInstructions(!showInstructions)}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700/50"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                onClick={saveGame}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg"
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
        {/* Set current user ID for multiplayer */}
        <script dangerouslySetInnerHTML={{
          __html: `window.currentUserId = "${session.user.id}";`
        }} />
        
        <div id="minecraft-game-container" className="flex justify-center items-center min-h-screen">
          {!gameLoaded && (
            <div className="text-center">
              <div className="animate-bounce text-6xl mb-4">⛏️</div>
              <div className="text-white text-xl font-semibold mb-2">Loading Minecraft Game...</div>
              <div className="text-gray-400 text-sm">Building your world</div>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-400"></div>
              </div>
            </div>
          )}
        </div>

        {/* Game UI Overlay */}
        {showGameUI && (
          <div id="game-ui" className="absolute top-4 left-4 text-white z-50 animate-in slide-in-from-left duration-300">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 space-y-3 border border-gray-700 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="text-red-400">❤️</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Health</div>
                  <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-300" style={{width: '100%'}}></div>
                  </div>
                </div>
                <span id="health-display" className="text-sm font-bold">100</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-yellow-400">⭐</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Score</div>
                  <span id="score-display" className="text-lg font-bold text-yellow-400">0</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-green-400">🧱</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Selected</div>
                  <span id="selected-block-display" className="text-sm font-medium text-green-400">Grass</span>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="text-xs text-green-400 font-medium">Multiplayer Active</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <span id="players-count">1</span> online
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInstructions && (
          <div id="game-instructions" className="absolute top-4 right-4 text-white z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 text-sm border border-gray-700 shadow-lg max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="text-yellow-400">🎮</div>
                  <div className="font-bold text-yellow-400">Controls</div>
                </div>
                <Button
                  onClick={() => setShowInstructions(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-blue-400 font-medium mb-1">Movement</div>
                    <div>WASD - Move</div>
                    <div>Space - Jump</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-green-400 font-medium mb-1">Building</div>
                    <div>Left Click - Place</div>
                    <div>Right Click - Break</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-purple-400 font-medium mb-1">Inventory</div>
                  <div className="text-xs">1-5 - Select block type</div>
                </div>
                
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="text-xs text-gray-300 space-y-1">
                    <div className="text-green-400 font-medium">🌐 Multiplayer Features</div>
                    <div>• Other players appear in red</div>
                    <div>• World changes sync in real-time</div>
                    <div>• Voice chat coming soon!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Game Inventory */}
        <div id="game-inventory" className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="bg-gradient-to-t from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-2xl p-6 border-2 border-gray-600 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="text-xl">🎒</div>
                <div className="text-sm text-white font-bold tracking-wide">BUILD BLOCKS</div>
              </div>
              <div className="text-xs text-gray-400">Press number keys or click to select</div>
            </div>
            
            {/* Inventory Grid */}
            <div className="flex space-x-3">
              {/* Grass Block */}
              <div className="group relative">
                <div className="inventory-slot selected bg-gradient-to-br from-green-600 to-green-800 border-3 border-green-400 w-20 h-20 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-green-400/25" data-block="grass">
                  <div className="text-3xl mb-1">🌱</div>
                  <div className="text-[10px] text-white font-semibold">GRASS</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Grass Block • Press 1
                </div>
              </div>
              
              {/* Stone Block */}
              <div className="group relative">
                <div className="inventory-slot bg-gradient-to-br from-gray-600 to-gray-800 border-3 border-gray-500 w-20 h-20 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:scale-105 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-gray-400/25" data-block="stone">
                  <div className="text-3xl mb-1">🪨</div>
                  <div className="text-[10px] text-white font-semibold">STONE</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Stone Block • Press 2
                </div>
              </div>
              
              {/* Wood Block */}
              <div className="group relative">
                <div className="inventory-slot bg-gradient-to-br from-amber-700 to-amber-900 border-3 border-amber-600 w-20 h-20 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:scale-105 hover:border-amber-500 transition-all duration-200 shadow-lg hover:shadow-amber-400/25" data-block="wood">
                  <div className="text-3xl mb-1">🪵</div>
                  <div className="text-[10px] text-white font-semibold">WOOD</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Wood Block • Press 3
                </div>
              </div>
              
              {/* Dirt Block */}
              <div className="group relative">
                <div className="inventory-slot bg-gradient-to-br from-yellow-800 to-yellow-900 border-3 border-yellow-700 w-20 h-20 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:scale-105 hover:border-yellow-600 transition-all duration-200 shadow-lg hover:shadow-yellow-400/25" data-block="dirt">
                  <div className="text-3xl mb-1">🟫</div>
                  <div className="text-[10px] text-white font-semibold">DIRT</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">4</div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Dirt Block • Press 4
                </div>
              </div>
              
              {/* Water Block */}
              <div className="group relative">
                <div className="inventory-slot bg-gradient-to-br from-blue-600 to-blue-800 border-3 border-blue-500 w-20 h-20 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:scale-105 hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-blue-400/25" data-block="water">
                  <div className="text-3xl mb-1">💧</div>
                  <div className="text-[10px] text-white font-semibold">WATER</div>
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">5</div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Water Block • Press 5
                </div>
              </div>
            </div>
            
            {/* Quick Help */}
            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="text-center text-xs text-gray-400 space-y-1">
                <div className="flex items-center justify-center space-x-4">
                  <span>🖱️ <strong>Left Click:</strong> Place</span>
                  <span>🖱️ <strong>Right Click:</strong> Remove</span>
                </div>
                <div>Currently selected: <span className="text-green-400 font-semibold" id="current-block-display">Grass</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

// Game code as a string to be injected
function getMinecraftGameCode(savedState: any, selectedRoomId: string) {
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
        
        // Multiplayer state
        this.roomId = '${selectedRoomId}';
        this.otherPlayers = new Map();
        this.lastMultiplayerUpdate = 0;
        this.multiplayerUpdateInterval = 2000; // Update every 2 seconds
        this.lastPlayerPosition = { x: 0, y: 0 }; // Track position changes
        this.isUpdatingMultiplayer = false; // Prevent concurrent updates
        this.worldSyncTimeout = null; // Debounce timer for world sync
        
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
        
        // Create boy player sprite
        this.createBoyPlayerSprite();
        
        // Create other player sprite for multiplayer
        this.createOtherPlayerSprite();
    }
    
    createBoyPlayerSprite() {
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
    }
    
    createOtherPlayerSprite() {
        const graphics = this.add.graphics();
        const size = this.BLOCK_SIZE - 4;
        
        // Body (red shirt)
        graphics.fillStyle(0xE74C3C);
        graphics.fillRect(6, 12, 20, 16);
        
        // Head (skin tone)
        graphics.fillStyle(0xFFDBAE);
        graphics.fillRect(8, 2, 16, 12);
        
        // Hair (black)
        graphics.fillStyle(0x2C3E50);
        graphics.fillRect(8, 2, 16, 6);
        
        // Eyes
        graphics.fillStyle(0x000000);
        graphics.fillRect(11, 6, 2, 2);
        graphics.fillRect(19, 6, 2, 2);
        
        // Legs (green pants)
        graphics.fillStyle(0x27AE60);
        graphics.fillRect(8, 28, 6, 12);
        graphics.fillRect(18, 28, 6, 12);
        
        // Arms (skin tone)
        graphics.fillStyle(0xFFDBAE);
        graphics.fillRect(2, 14, 4, 10);
        graphics.fillRect(26, 14, 4, 10);
        
        graphics.generateTexture('otherPlayer', size, size);
        graphics.destroy();
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
        
        // Initialize multiplayer
        this.initializeMultiplayer();
        
        console.log('Minecraft game loaded successfully');
    }
    
    async initializeMultiplayer() {
        try {
            // Join the multiplayer room
            await this.joinMultiplayerRoom();
            
            // Start multiplayer update loop
            this.multiplayerTimer = this.time.addEvent({
                delay: this.multiplayerUpdateInterval,
                callback: this.updateMultiplayer,
                callbackScope: this,
                loop: true
            });
            
            console.log('Multiplayer initialized');
        } catch (error) {
            console.error('Failed to initialize multiplayer:', error);
        }
    }
    
    async joinMultiplayerRoom() {
        const response = await fetch('/api/games/minecraft/multiplayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomId: this.roomId,
                action: 'join',
                data: { x: this.player.x, y: this.player.y }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            this.updateOtherPlayers(data.players);
        }
    }
    
    async updateMultiplayer() {
        // Prevent concurrent updates
        if (this.isUpdatingMultiplayer) return;
        
        // Only update if player position has changed significantly
        const currentPos = { x: Math.floor(this.player.x / 10) * 10, y: Math.floor(this.player.y / 10) * 10 };
        const positionChanged = Math.abs(currentPos.x - this.lastPlayerPosition.x) > 10 || 
                               Math.abs(currentPos.y - this.lastPlayerPosition.y) > 10;
        
        if (!positionChanged) return;
        
        try {
            this.isUpdatingMultiplayer = true;
            
            // Send player position
            const response = await fetch('/api/games/minecraft/multiplayer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: this.roomId,
                    action: 'move',
                    data: { x: this.player.x, y: this.player.y }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateOtherPlayers(data.players);
                this.lastPlayerPosition = currentPos;
            }
        } catch (error) {
            console.error('Multiplayer update failed:', error);
        } finally {
            this.isUpdatingMultiplayer = false;
        }
    }
    
    updateOtherPlayers(players) {
        // Remove old player sprites
        this.otherPlayers.forEach(playerData => {
            playerData.sprite.destroy();
            playerData.nameText.destroy();
        });
        this.otherPlayers.clear();
        
        // Add current players (excluding self)
        const otherPlayersList = players.filter(player => player.id !== window.currentUserId);
        
        otherPlayersList.forEach(player => {
            const playerSprite = this.add.sprite(player.x, player.y, 'otherPlayer');
            playerSprite.setOrigin(0.5, 0.5);
            
            // Add player name label
            const nameText = this.add.text(player.x, player.y - 40, player.name, {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            nameText.setOrigin(0.5, 0.5);
            
            this.otherPlayers.set(player.id, {
                sprite: playerSprite,
                nameText: nameText,
                targetX: player.x,
                targetY: player.y
            });
        });
        
        // Update player count in UI
        const playersCountEl = document.getElementById('players-count');
        if (playersCountEl) {
            playersCountEl.textContent = (otherPlayersList.length + 1).toString();
        }
    }
    
    syncWorldState() {
        // Debounce world state sync to prevent excessive API calls
        if (this.worldSyncTimeout) {
            clearTimeout(this.worldSyncTimeout);
        }
        
        this.worldSyncTimeout = setTimeout(async () => {
            try {
                const response = await fetch('/api/games/minecraft/multiplayer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId: this.roomId,
                        action: 'placeBlock',
                        data: { world: this.serializeWorld() }
                    })
                });
            } catch (error) {
                console.error('Failed to sync world state:', error);
            }
        }, 500); // Wait 500ms before syncing
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
        
        // Sync with multiplayer
        this.syncWorldState();
        
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
        
        // Sync with multiplayer
        this.syncWorldState();
        
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
                // Remove selected class from all slots and update border colors
                document.querySelectorAll('.inventory-slot').forEach(s => {
                    s.classList.remove('selected');
                    // Update border colors for unselected state
                    const blockType = s.dataset.block;
                    s.classList.remove('border-green-400', 'border-gray-300', 'border-amber-400', 'border-yellow-500', 'border-blue-300');
                    if (blockType === 'grass') {
                        s.classList.add('border-green-600');
                    } else if (blockType === 'stone') {
                        s.classList.add('border-gray-500');
                    } else if (blockType === 'wood') {
                        s.classList.add('border-amber-600');
                    } else if (blockType === 'dirt') {
                        s.classList.add('border-yellow-700');
                    } else if (blockType === 'water') {
                        s.classList.add('border-blue-500');
                    }
                });
                
                // Apply selected styling to clicked slot
                slot.classList.add('selected');
                const blockType = slot.dataset.block;
                slot.classList.remove('border-green-600', 'border-gray-500', 'border-amber-600', 'border-yellow-700', 'border-blue-500');
                if (blockType === 'grass') {
                    slot.classList.add('border-green-400');
                } else if (blockType === 'stone') {
                    slot.classList.add('border-gray-300');
                } else if (blockType === 'wood') {
                    slot.classList.add('border-amber-400');
                } else if (blockType === 'dirt') {
                    slot.classList.add('border-yellow-500');
                } else if (blockType === 'water') {
                    slot.classList.add('border-blue-300');
                }
                
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
        
        // Update other players' positions smoothly
        this.otherPlayers.forEach(playerData => {
            const { sprite, nameText, targetX, targetY } = playerData;
            
            // Smooth movement interpolation
            const lerpFactor = 0.1;
            sprite.x = Phaser.Math.Linear(sprite.x, targetX, lerpFactor);
            sprite.y = Phaser.Math.Linear(sprite.y, targetY, lerpFactor);
            
            // Update name position
            nameText.x = sprite.x;
            nameText.y = sprite.y - 40;
        });
    }
    
    selectBlock(index) {
        const blockTypes = Object.keys(this.blockTypes);
        if (index < blockTypes.length) {
            this.selectedBlock = blockTypes[index];
            
            document.querySelectorAll('.inventory-slot').forEach((slot, i) => {
                const blockType = slot.dataset.block;
                if (i === index) {
                    // Apply selected styling
                    slot.classList.add('selected');
                    slot.classList.remove('border-green-600', 'border-gray-500', 'border-amber-600', 'border-yellow-700', 'border-blue-500');
                    if (blockType === 'grass') {
                        slot.classList.add('border-green-400');
                    } else if (blockType === 'stone') {
                        slot.classList.add('border-gray-300');
                    } else if (blockType === 'wood') {
                        slot.classList.add('border-amber-400');
                    } else if (blockType === 'dirt') {
                        slot.classList.add('border-yellow-500');
                    } else if (blockType === 'water') {
                        slot.classList.add('border-blue-300');
                    }
                } else {
                    // Apply unselected styling
                    slot.classList.remove('selected');
                    slot.classList.remove('border-green-400', 'border-gray-300', 'border-amber-400', 'border-yellow-500', 'border-blue-300');
                    if (blockType === 'grass') {
                        slot.classList.add('border-green-600');
                    } else if (blockType === 'stone') {
                        slot.classList.add('border-gray-500');
                    } else if (blockType === 'wood') {
                        slot.classList.add('border-amber-600');
                    } else if (blockType === 'dirt') {
                        slot.classList.add('border-yellow-700');
                    } else if (blockType === 'water') {
                        slot.classList.add('border-blue-500');
                    }
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
        alert("Game Over! Final Score: " + this.score);
        this.scene.restart();
        this.health = 100;
        this.score = 0;
    }
    
    updateUI() {
        const healthEl = document.getElementById('health-display');
        const scoreEl = document.getElementById('score-display');
        const selectedEl = document.getElementById('selected-block-display');
        const currentBlockEl = document.getElementById('current-block-display');
        
        if (healthEl) healthEl.textContent = Math.floor(this.health);
        if (scoreEl) scoreEl.textContent = this.score;
        if (selectedEl) selectedEl.textContent = this.selectedBlock.charAt(0).toUpperCase() + this.selectedBlock.slice(1);
        if (currentBlockEl) currentBlockEl.textContent = this.selectedBlock.charAt(0).toUpperCase() + this.selectedBlock.slice(1);
    }
    
    cleanup() {
        // Stop multiplayer timer
        if (this.multiplayerTimer) {
            this.multiplayerTimer.destroy();
            this.multiplayerTimer = null;
        }
        
        // Clear world sync timeout
        if (this.worldSyncTimeout) {
            clearTimeout(this.worldSyncTimeout);
            this.worldSyncTimeout = null;
        }
        
        // Clear global reference
        if (window.minecraftGame === this) {
            window.minecraftGame = null;
        }
        
        console.log('Minecraft game cleaned up');
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
window.game = new Phaser.Game(config);

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});
`;
}
