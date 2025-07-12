import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

// Enhanced multiplayer room structure
interface Player {
  id: string
  name: string
  x: number
  y: number
  health: number
  armor: number
  weapon: string
  inventory: Record<string, number>
  lastUpdate: number
}

interface GameRoom {
  players: Map<string, Player>
  world: (string | null)[][]
  worldWidth: number
  worldHeight: number
  lastWorldUpdate: number
  worldChanges: Array<{
    x: number
    y: number
    blockType: string | null
    playerId: string
    timestamp: number
  }>
}

// In-memory storage for game rooms (in production, use Redis or similar)
const gameRooms = new Map<string, GameRoom>()

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null
  
  // Allow guest users to play
  const userId = session?.user?.id || `guest-${Date.now()}`
  
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId') || 'default'

  // Get or create room with larger world size
  if (!gameRooms.has(roomId)) {
    const worldWidth = 150  // Increased from 50
    const worldHeight = 80  // Increased from 30
    const emptyWorld: (string | null)[][] = []
    
    for (let x = 0; x < worldWidth; x++) {
      emptyWorld[x] = []
      for (let y = 0; y < worldHeight; y++) {
        emptyWorld[x][y] = null
      }
    }
    
    gameRooms.set(roomId, {
      players: new Map(),
      world: emptyWorld,
      worldWidth,
      worldHeight,
      lastWorldUpdate: Date.now(),
      worldChanges: []
    })
  }

  const room = gameRooms.get(roomId)!
  
  return NextResponse.json({
    roomId,
    players: Array.from(room.players.values()),
    world: room.world,
    worldWidth: room.worldWidth,
    worldHeight: room.worldHeight,
    lastUpdate: room.lastWorldUpdate,
    recentChanges: room.worldChanges.slice(-50) // Last 50 changes
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null
  
  // Allow guest users to play
  const userId = session?.user?.id || `guest-${Date.now()}`
  const userName = session?.user?.name || 'Guest Player'

  const { roomId = 'default', action, data } = await req.json()

  // Get or create room with larger world size
  if (!gameRooms.has(roomId)) {
    const worldWidth = 150  // Increased from 50
    const worldHeight = 80  // Increased from 30
    const emptyWorld: (string | null)[][] = []
    
    for (let x = 0; x < worldWidth; x++) {
      emptyWorld[x] = []
      for (let y = 0; y < worldHeight; y++) {
        emptyWorld[x][y] = null
      }
    }
    
    gameRooms.set(roomId, {
      players: new Map(),
      world: emptyWorld,
      worldWidth,
      worldHeight,
      lastWorldUpdate: Date.now(),
      worldChanges: []
    })
  }

  const room = gameRooms.get(roomId)!

  switch (action) {
    case 'join':
      room.players.set(userId, {
        id: userId,
        name: userName,
        x: data.x || 400,
        y: data.y || 100,
        health: data.health || 100,
        armor: data.armor || 0,
        weapon: data.weapon || 'none',
        inventory: data.inventory || {},
        lastUpdate: Date.now()
      })
      break

    case 'move':
      if (room.players.has(userId)) {
        const player = room.players.get(userId)!
        player.x = data.x
        player.y = data.y
        player.lastUpdate = Date.now()
      }
      break

    case 'updatePlayer':
      if (room.players.has(userId)) {
        const player = room.players.get(userId)!
        if (data.health !== undefined) player.health = data.health
        if (data.armor !== undefined) player.armor = data.armor
        if (data.weapon !== undefined) player.weapon = data.weapon
        if (data.inventory !== undefined) player.inventory = data.inventory
        player.lastUpdate = Date.now()
      }
      break

    case 'placeBlock':
      // Handle individual block placement for better synchronization
      const { x, y, blockType } = data
      if (x >= 0 && x < room.worldWidth && y >= 0 && y < room.worldHeight) {
        room.world[x][y] = blockType
        room.lastWorldUpdate = Date.now()
        
        // Track the change
        room.worldChanges.push({
          x,
          y,
          blockType,
          playerId: userId,
          timestamp: Date.now()
        })
        
        // Keep only last 100 changes to prevent memory issues
        if (room.worldChanges.length > 100) {
          room.worldChanges = room.worldChanges.slice(-100)
        }
      }
      break

    case 'removeBlock':
      // Handle individual block removal
      const { x: removeX, y: removeY } = data
      if (removeX >= 0 && removeX < room.worldWidth && removeY >= 0 && removeY < room.worldHeight) {
        room.world[removeX][removeY] = null
        room.lastWorldUpdate = Date.now()
        
        // Track the change
        room.worldChanges.push({
          x: removeX,
          y: removeY,
          blockType: null,
          playerId: userId,
          timestamp: Date.now()
        })
        
        // Keep only last 100 changes
        if (room.worldChanges.length > 100) {
          room.worldChanges = room.worldChanges.slice(-100)
        }
      }
      break

    case 'syncWorld':
      // Full world sync (fallback)
      if (data.world && Array.isArray(data.world)) {
        room.world = data.world
        room.lastWorldUpdate = Date.now()
      }
      break

    case 'leave':
      room.players.delete(userId)
      break
  }

  // Clean up inactive players (older than 60 seconds)
  const now = Date.now()
  for (const [playerId, player] of room.players.entries()) {
    if (now - player.lastUpdate > 60000) {
      room.players.delete(playerId)
    }
  }

  return NextResponse.json({
    success: true,
    players: Array.from(room.players.values()),
    world: room.world,
    worldWidth: room.worldWidth,
    worldHeight: room.worldHeight,
    lastUpdate: room.lastWorldUpdate,
    recentChanges: room.worldChanges.slice(-10) // Last 10 changes for immediate sync
  })
}
