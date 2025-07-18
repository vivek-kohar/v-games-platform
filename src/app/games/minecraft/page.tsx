"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Settings, Users, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import EnhancedInventory from "@/components/minecraft/EnhancedInventory"
import { PlayerBank } from "@/components/minecraft/PlayerBank"
import { getEnhancedMinecraftGameCode } from "@/components/minecraft/EnhancedGameScript"

// Extend Window interface for TypeScript
declare global {
  interface Window {
    minecraftGame: {
      getGameState: () => { 
        world: unknown; 
        score: number; 
        health: number; 
        selectedBlock: string;
        selectedWeapon: string;
        selectedArmor: string;
      };
      cleanup: () => void;
      setSelectedBlock: (blockType: string) => void;
      setSelectedWeapon: (weaponType: string) => void;
      setSelectedArmor: (armorType: string) => void;
      getPlayerInventory: () => any[];
      addToInventory: (item: any) => boolean;
      removeFromInventory: (itemId: string, quantity: number) => boolean;
      setMobsEnabled: (enabled: boolean) => void;
    } | null;
    currentUserId: string;
    updateResourceUI?: (resourceStatus: any, resourceCounts?: any) => void;
    gatheredResources?: any;
    resourceCounts?: any;
    game: {
      destroy: (removeCanvas?: boolean) => void;
    } | null;
    Phaser: unknown;
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
  const [gameLoadError, setGameLoadError] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")
  const [roomId, setRoomId] = useState("default")
  const [showRoomSelector, setShowRoomSelector] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [gatheredResources, setGatheredResources] = useState({
    wood: false,
    stone: false,
    iron: false,
    gold: false,
    diamond: false,
    dirt: true, // Always available
    grass: true, // Always available
    water: false,
    lava: false,
    sand: false,
    coal: false,
    emerald: false,
    obsidian: false,
    bedrock: false
  })
  
  const [resourceCounts, setResourceCounts] = useState({
    wood: 0,
    stone: 0,
    iron: 0,
    gold: 0,
    diamond: 0,
    dirt: 10, // Start with some basic resources
    grass: 10, // Start with some basic resources
    water: 0,
    lava: 0,
    sand: 0,
    coal: 0,
    emerald: 0,
    obsidian: 0,
    bedrock: 0
  })
  const [showGameUI, setShowGameUI] = useState(true)
  const [selectedBlock, setSelectedBlock] = useState("grass")
  const [selectedWeapon, setSelectedWeapon] = useState("none")
  const [selectedArmor, setSelectedArmor] = useState("none")
  const [showBank, setShowBank] = useState(false)
  const [bankItems, setBankItems] = useState<any[]>([])
  const [playerInventory, setPlayerInventory] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [mobsEnabled, setMobsEnabled] = useState(true)

  const handleBlockSelect = (blockId: string) => {
    setSelectedBlock(blockId)
    // Update the game's selected block
    if (window.minecraftGame && typeof window.minecraftGame.setSelectedBlock === 'function') {
      window.minecraftGame.setSelectedBlock(blockId)
    }
  }

  const handleWeaponSelect = (weaponId: string) => {
    console.log('Selecting weapon:', weaponId)
    setSelectedWeapon(weaponId)
    // Update the game's selected weapon
    if (window.minecraftGame && typeof window.minecraftGame.setSelectedWeapon === 'function') {
      window.minecraftGame.setSelectedWeapon(weaponId)
      console.log('Weapon updated in game')
    } else {
      console.log('Game not ready for weapon update')
    }
  }

  const handleArmorSelect = (armorId: string) => {
    console.log('Selecting armor:', armorId)
    setSelectedArmor(armorId)
    // Update the game's selected armor
    if (window.minecraftGame && typeof window.minecraftGame.setSelectedArmor === 'function') {
      window.minecraftGame.setSelectedArmor(armorId)
      console.log('Armor updated in game')
    } else {
      console.log('Game not ready for armor update')
    }
  }

  // Bank system functions
  const loadBankData = useCallback(async () => {
    try {
      const userId = session?.user?.email || 'guest-' + Math.random().toString(36).substr(2, 9)
      console.log('Loading bank data for user:', userId)
      
      const response = await fetch('/api/games/minecraft/bank?guestId=' + encodeURIComponent(userId))
      
      if (response.ok) {
        const data = await response.json()
        console.log('Bank data loaded:', data)
        setBankItems(data.bankItems || [])
      } else {
        console.error('Bank API error:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Failed to load bank data:', error)
    }
  }, [session])

  const loadPlayerInventory = useCallback(() => {
    if (window.minecraftGame && typeof window.minecraftGame.getPlayerInventory === 'function') {
      const inventory = window.minecraftGame.getPlayerInventory()
      setPlayerInventory(inventory || [])
    }
  }, [])

  const handleDepositItem = async (item: any) => {
    try {
      const userId = session?.user?.email || 'guest-' + Math.random().toString(36).substr(2, 9)
      const response = await fetch('/api/games/minecraft/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          item,
          quantity: item.quantity,
          guestId: userId
        })
      })

      if (response.ok) {
        // Remove from game inventory
        if (window.minecraftGame && typeof window.minecraftGame.removeFromInventory === 'function') {
          window.minecraftGame.removeFromInventory(item.id, item.quantity)
        }
        
        // Refresh both inventories
        await loadBankData()
        loadPlayerInventory()
      }
    } catch (error) {
      console.error('Failed to deposit item:', error)
    }
  }

  const handleWithdrawItem = async (itemId: string, quantity: number) => {
    try {
      const userId = session?.user?.email || 'guest-' + Math.random().toString(36).substr(2, 9)
      const bankItem = bankItems.find((item: any) => item.itemId === itemId)
      
      if (!bankItem) return

      const response = await fetch('/api/games/minecraft/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          item: { id: itemId },
          quantity,
          guestId: userId
        })
      })

      if (response.ok) {
        // Add to game inventory
        if (window.minecraftGame && typeof window.minecraftGame.addToInventory === 'function') {
          const itemToAdd = {
            id: bankItem.itemId,
            name: bankItem.itemName,
            type: bankItem.itemType,
            quantity,
            icon: bankItem.icon,
            rarity: bankItem.rarity,
            description: bankItem.description,
            value: bankItem.value
          }
          
          const success = window.minecraftGame.addToInventory(itemToAdd)
          if (success) {
            // Refresh both inventories
            await loadBankData()
            loadPlayerInventory()
          }
        }
      }
    } catch (error) {
      console.error('Failed to withdraw item:', error)
    }
  }

  const loadGame = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isInitializing) {
      console.log('🔄 Game already initializing, skipping...');
      return;
    }
    
    console.log('🎮 LoadGame called for room:', roomId);
    setIsInitializing(true);
    
    try {
      console.log('📡 Fetching saved game state...');
      setGameLoadError(null); // Clear any previous errors
      
      // Load saved game state
      const response = await fetch("/api/games/minecraft/save")
      if (response.ok) {
        const savedState = await response.json()
        console.log("✅ Loaded game state:", savedState)
        
        // Initialize the game with saved state and room ID
        initializeMinecraftGame(savedState, roomId)
      } else {
        console.log("🆕 No saved state, initializing new game");
        // Initialize new game
        initializeMinecraftGame(null, roomId)
      }
    } catch (error) {
      console.error("❌ Error loading game:", error)
      setGameLoadError(`Failed to load game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Still try to initialize the game
      initializeMinecraftGame(null, roomId)
    } finally {
      // Reset initializing state after a delay
      setTimeout(() => setIsInitializing(false), 1000);
    }
  }, [roomId, isInitializing])

  useEffect(() => {
    // Allow playing without authentication for demo purposes
    if (status === "unauthenticated") {
      // Set a guest user ID for multiplayer
      if (typeof window !== 'undefined') {
        window.currentUserId = `guest-${Math.random().toString(36).substr(2, 9)}`
      }
    }

    // Only load game once when component mounts and we have a roomId
    if (roomId && !gameLoaded && !gameLoadError && !isInitializing) {
      console.log('🎮 Initial game load for room:', roomId);
      loadGame()
    }
  }, [roomId]) // Only depend on roomId
  
  // Separate useEffect for other initialization
  useEffect(() => {
    // Load bank data
    loadBankData()
    
    // Add keyboard shortcut for save game
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        saveGame()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    // Set up periodic inventory refresh
    const inventoryInterval = setInterval(() => {
      loadPlayerInventory()
    }, 2000) // Refresh every 2 seconds
    
    // Listen for game initialization to sync state
    const handleGameInitialized = (event: CustomEvent) => {
      const { selectedBlock, selectedWeapon, selectedArmor } = event.detail
      setSelectedBlock(selectedBlock)
      setSelectedWeapon(selectedWeapon)
      setSelectedArmor(selectedArmor)
      
      // Load initial inventory
      setTimeout(() => loadPlayerInventory(), 1000)
    }
    
    window.addEventListener('gameInitialized', handleGameInitialized as EventListener)
    
    // Cleanup function to prevent memory leaks and stop API calls
    return () => {
      window.removeEventListener('gameInitialized', handleGameInitialized as EventListener)
      document.removeEventListener('keydown', handleKeyDown)
      clearInterval(inventoryInterval)
      
      if (window.minecraftGame && typeof window.minecraftGame.cleanup === 'function') {
        window.minecraftGame.cleanup()
      }
      
      // Clean up Phaser game instance
      if (window.game && typeof window.game.destroy === 'function') {
        window.game.destroy(true)
        window.game = null
      }
      
      // Remove game scripts (thorough cleanup)
      const existingGameScripts = document.querySelectorAll('script[data-minecraft-game]')
      existingGameScripts.forEach(script => script.remove())
      
      // Also remove any scripts that might contain MinecraftGame class
      const allScripts = document.querySelectorAll('script')
      allScripts.forEach(script => {
        if (script.textContent && script.textContent.includes('class MinecraftGame')) {
          script.remove()
        }
      })
      
      // Clear global references
      if (typeof window !== 'undefined') {
        try {
          if (window.minecraftGame) {
            window.minecraftGame = null
          }
          if ((window as any).MinecraftGame) {
            delete (window as any).MinecraftGame
          }
        } catch (e) {
          // Ignore errors if properties can't be deleted
        }
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Check for game instance periodically
  useEffect(() => {
    if (gameLoaded || isInitializing) return; // Already loaded or initializing
    
    const checkGameInstance = () => {
      if (window.minecraftGame && typeof window.minecraftGame.getGameState === 'function') {
        console.log('✅ Game instance detected, marking as loaded');
        setGameLoaded(true);
        setGameLoadError(null);
        setIsInitializing(false);
        
        // Clear timeout if game loaded successfully
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          setLoadingTimeout(null);
        }
      }
    };
    
    // Check immediately
    checkGameInstance();
    
    // Check periodically
    const interval = setInterval(checkGameInstance, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [gameLoaded, isInitializing, loadingTimeout]);

  // Expose resource update function to game
  useEffect(() => {
    window.updateResourceUI = (resourceStatus: any, resourceCounts?: any) => {
      setGatheredResources(resourceStatus)
      if (resourceCounts) {
        setResourceCounts(resourceCounts)
      }
    }
    
    return () => {
      delete window.updateResourceUI
    }
  }, [])

  const initializeMinecraftGame = (savedState: { data: unknown; score: number } | null, selectedRoomId: string) => {
    console.log('🎮 Starting game initialization...', { savedState, selectedRoomId });
    
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    // Set a timeout to detect if game fails to load
    const timeout = setTimeout(() => {
      if (!gameLoaded && !window.minecraftGame) {
        console.error('❌ Game loading timeout - game failed to initialize within 15 seconds');
        setGameLoadError('Game failed to load. This might be due to a network issue or script error. Please refresh the page.');
      }
    }, 15000); // 15 second timeout
    
    setLoadingTimeout(timeout);
    
    // Clean up any existing game instances and scripts
    if (window.minecraftGame && typeof window.minecraftGame.cleanup === 'function') {
      console.log('🧹 Cleaning up existing game instance');
      window.minecraftGame.cleanup()
    }
    
    // Destroy existing Phaser game instance
    if (window.game && typeof window.game.destroy === 'function') {
      console.log('🧹 Destroying existing Phaser game');
      window.game.destroy(true)
      window.game = null
    }
    
    // Clear the game container
    const gameContainer = document.getElementById('minecraft-game-container')
    if (gameContainer) {
      console.log('🧹 Clearing game container');
      const canvases = gameContainer.querySelectorAll('canvas')
      canvases.forEach(canvas => canvas.remove())
    }
    
    // Remove ALL existing game scripts (more thorough cleanup)
    const existingGameScripts = document.querySelectorAll('script[data-minecraft-game]')
    console.log('🧹 Removing existing game scripts:', existingGameScripts.length);
    existingGameScripts.forEach(script => {
      script.remove()
    })
    
    // Also remove any scripts that might contain MinecraftGame class
    const allScripts = document.querySelectorAll('script')
    allScripts.forEach(script => {
      if (script.textContent && script.textContent.includes('class MinecraftGame')) {
        script.remove()
      }
    })
    
    // Clear any existing references from global scope
    if (typeof window !== 'undefined') {
      try {
        if (window.minecraftGame) {
          window.minecraftGame = null
        }
        if ((window as any).MinecraftGame) {
          delete (window as any).MinecraftGame
        }
        // Force garbage collection hint
        if (window.gc) {
          window.gc()
        }
      } catch (e) {
        console.warn('⚠️ Cleanup error (non-critical):', e);
      }
    }
    
    // Use a longer timeout to ensure cleanup is complete before creating new script
    setTimeout(() => {
      console.log('🚀 Starting game creation after cleanup delay');
      
      // Additional cleanup for enhanced game
      if (typeof window !== 'undefined') {
        try {
          if ((window as any).EnhancedMinecraftGame) {
            delete (window as any).EnhancedMinecraftGame
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      // Check if Phaser is already loaded
      if (window.Phaser) {
        console.log('✅ Phaser already loaded, creating game directly');
        try {
          // Phaser already loaded, create game directly
          const gameScript = document.createElement("script")
          gameScript.setAttribute('data-minecraft-game', 'true')
          gameScript.setAttribute('data-timestamp', Date.now().toString())
          
          const scriptContent = getEnhancedMinecraftGameCode(savedState, selectedRoomId);
          console.log('📝 Generated script length:', scriptContent.length, 'characters');
          
          if (scriptContent.length < 1000) {
            console.error('❌ Generated script seems too short, might be invalid');
            setGameLoadError('Game script generation failed. Please refresh the page.');
            return;
          }
          
          gameScript.textContent = scriptContent;
          
          // Add error handling to the script
          gameScript.onerror = (error) => {
            console.error('❌ Game script error:', error);
            setGameLoadError('Game script failed to execute. Please refresh the page.');
          };
          
          document.head.appendChild(gameScript)
          console.log('✅ Game script added to document');
          
          // Don't set gameLoaded here, let the detection mechanism handle it
        } catch (error) {
          console.error('❌ Error creating game script:', error);
          setGameLoadError(`Failed to create game script: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        console.log('📦 Loading Phaser first...');
        // Load Phaser first
        const phaserScript = document.createElement("script")
        phaserScript.src = "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"
        phaserScript.onload = () => {
          console.log('✅ Phaser loaded successfully, creating game');
          try {
            // Create game script
            const gameScript = document.createElement("script")
            gameScript.setAttribute('data-minecraft-game', 'true')
            gameScript.setAttribute('data-timestamp', Date.now().toString())
            
            const scriptContent = getEnhancedMinecraftGameCode(savedState, selectedRoomId);
            console.log('📝 Generated script length:', scriptContent.length, 'characters');
            
            if (scriptContent.length < 1000) {
              console.error('❌ Generated script seems too short, might be invalid');
              setGameLoadError('Game script generation failed. Please refresh the page.');
              return;
            }
            
            gameScript.textContent = scriptContent;
            
            // Add error handling to the script
            gameScript.onerror = (error) => {
              console.error('❌ Game script error:', error);
              setGameLoadError('Game script failed to execute. Please refresh the page.');
            };
            
            document.head.appendChild(gameScript)
            console.log('✅ Game script added to document');
            
            // Don't set gameLoaded here, let the detection mechanism handle it
          } catch (error) {
            console.error('❌ Error creating game script after Phaser load:', error);
            setGameLoadError(`Failed to create game script: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        phaserScript.onerror = (error) => {
          console.error('❌ Failed to load Phaser:', error);
          setGameLoadError('Failed to load Phaser game engine. Please check your internet connection and refresh the page.');
        };
        document.head.appendChild(phaserScript)
        console.log('📦 Phaser script added to document');
      }
    }, 300) // Increased delay to ensure cleanup is complete
  }

  const saveGame = async () => {
    if (!gameLoaded || !window.minecraftGame) {
      setSaveStatus("Game not loaded")
      return
    }

    setIsSaving(true)
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
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
        <div className="text-center">
          {gameLoadError ? (
            <>
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <div className="text-xl font-semibold text-white mb-2">Game Loading Failed</div>
              <div className="text-sm text-gray-300 mb-4 max-w-md mx-auto">{gameLoadError}</div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setGameLoadError(null);
                    setGameLoaded(false);
                    loadGame();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mr-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Refresh Page
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mx-auto mb-4"></div>
              <div className="text-xl font-semibold text-white mb-2">Loading Minecraft Game</div>
              <div className="text-sm text-gray-300">Preparing your adventure...</div>
              <div className="text-xs text-gray-400 mt-2">This may take a few seconds...</div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 transition-all duration-300">
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
                    <span>Leave as &apos;default&apos; to join the public room</span>
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
                onClick={() => {
                  loadPlayerInventory()
                  setShowBank(true)
                }}
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              >
                🏦 Bank
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
          __html: `window.currentUserId = "${session?.user?.email || `guest-${Math.random().toString(36).substr(2, 9)}`}";`
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

        {/* Floating Save Button - Always accessible */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
          <Button
            onClick={saveGame}
            disabled={isSaving || !gameLoaded}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg rounded-full w-16 h-16"
          >
            {isSaving ? <div className="animate-spin text-xl">⏳</div> : <Save className="h-6 w-6" />}
          </Button>
          
          <Button
            onClick={() => {
              setMobsEnabled(!mobsEnabled)
              if (window.minecraftGame && typeof window.minecraftGame.setMobsEnabled === 'function') {
                window.minecraftGame.setMobsEnabled(!mobsEnabled)
              }
            }}
            size="sm"
            className={`${mobsEnabled 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium transition-all duration-200 shadow-lg rounded-lg px-3 py-2`}
          >
            {mobsEnabled ? '👹 ON' : '🕊️ OFF'}
          </Button>
        </div>

        {/* Game UI Overlay */}
        {showGameUI && (
          <div id="game-ui" className="absolute top-4 left-4 text-white z-50 animate-in slide-in-from-left duration-300">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-2 space-y-2 border border-gray-700 shadow-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="text-red-400">❤️</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Health</div>
                  <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-300" style={{width: '100%'}}></div>
                  </div>
                </div>
                <span id="health-display" className="text-xs font-bold">100</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-yellow-400">⭐</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Score</div>
                  <span id="score-display" className="text-sm font-bold text-yellow-400">0</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-green-400">🧱</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Selected</div>
                  <span id="selected-block-display" className="text-sm font-medium text-green-400">Grass</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-red-400">⚔️</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Weapon</div>
                  <span id="selected-weapon-display" className="text-sm font-medium text-red-400">None</span>
                </div>
                <div className="text-xs text-red-300" id="weapon-damage">DMG: 1</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-blue-400">🛡️</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Armor</div>
                  <span id="selected-armor-display" className="text-sm font-medium text-blue-400">None</span>
                </div>
                <div className="text-xs text-blue-300" id="armor-protection">DEF: 0</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-red-500">👹</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Mobs</div>
                  <span id="mob-count-display" className="text-sm font-medium text-red-500">0</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-yellow-400">⏰</div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Time</div>
                  <span id="time-display" className="text-sm font-medium text-yellow-400">☀️ Day (60s)</span>
                </div>
              </div>
              
              {/* Resource Status Display */}
              <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-700 max-w-xs">
                <div className="text-xs text-gray-400 mb-2">📦 Resource Inventory</div>
                <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                  {Object.entries(gatheredResources).map(([resource, gathered]) => (
                    <div 
                      key={resource}
                      className={`flex flex-col items-center p-1 rounded text-xs ${
                        gathered 
                          ? 'bg-green-900/50 text-green-300' 
                          : 'bg-gray-800/50 text-gray-500'
                      }`}
                      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} - ${gathered ? 'Available' : 'Mine blocks to gather'}`}
                    >
                      <span className="text-xs">
                        {resource === 'wood' && '🪵'}
                        {resource === 'stone' && '🪨'}
                        {resource === 'iron' && '⚙️'}
                        {resource === 'gold' && '🥇'}
                        {resource === 'diamond' && '💎'}
                        {resource === 'dirt' && '🟫'}
                        {resource === 'grass' && '🌱'}
                        {resource === 'water' && '💧'}
                        {resource === 'lava' && '🌋'}
                        {resource === 'sand' && '🏖️'}
                        {resource === 'coal' && '⚫'}
                        {resource === 'emerald' && '💚'}
                        {resource === 'obsidian' && '⚫'}
                        {resource === 'bedrock' && '🗿'}
                      </span>
                      <span className="text-xs font-bold">
                        {(resourceCounts as any)[resource] || 0}
                      </span>
                      {gathered && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Mine blocks to gather resources • Use resources to build
                </div>
              </div>
              
              {roomId && roomId !== 'single' && (
                <div className="flex items-center space-x-2">
                  <div className="text-green-400">👥</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">Multiplayer</div>
                    <span id="multiplayer-status" className="text-sm font-medium text-green-400">Connecting...</span>
                  </div>
                </div>
              )}
              
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
          <div id="game-instructions" className="absolute top-4 right-4 text-white z-[60] animate-in slide-in-from-right duration-300">
            <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-3 text-sm border border-gray-700 shadow-lg max-w-sm">
              <div className="flex items-center justify-between mb-2">
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
                    <div>Left Click - Mine/Place</div>
                    <div>Right Click - Quick Mine</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-purple-400 font-medium mb-1">Resources</div>
                  <div className="text-xs">Mine blocks to gather materials</div>
                  <div className="text-xs">Use axe for wood, sword for metals</div>
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
        <EnhancedInventory
          selectedBlock={selectedBlock}
          selectedWeapon={selectedWeapon}
          selectedArmor={selectedArmor}
          onBlockSelect={handleBlockSelect}
          onWeaponSelect={handleWeaponSelect}
          onArmorSelect={handleArmorSelect}
        />

        {/* Player Bank */}
        <PlayerBank
          isOpen={showBank}
          onClose={() => setShowBank(false)}
          onDepositItem={handleDepositItem}
          onWithdrawItem={handleWithdrawItem}
          bankItems={bankItems}
          playerInventory={playerInventory}
        />
      </div>
    </div>
    </>
  )
}
