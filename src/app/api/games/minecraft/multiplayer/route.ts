import { NextRequest, NextResponse } from "next/server"

// Enhanced multiplayer room structure
interface Player {
  id: string
  name: string
  x: number
  y: number
  health: number
  lastSeen: number
  selectedBlock: string
  selectedWeapon: string
  selectedArmor: string
}

interface Room {
  id: string
  players: Map<string, Player>
  worldChanges: Array<{
    x: number
    y: number
    blockType: string | null
    timestamp: number
    playerId: string
  }>
  lastActivity: number
}

// In-memory storage for multiplayer rooms
const rooms = new Map<string, Room>()

// Clean up inactive rooms (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [roomId, room] of rooms.entries()) {
    if (room.lastActivity < oneHourAgo) {
      rooms.delete(roomId)
    }
  }
}, 5 * 60 * 1000) // Check every 5 minutes

export async function POST(req: NextRequest) {
  try {
    // Allow guest users to play without authentication
    const userId = `guest-${Math.random().toString(36).substr(2, 9)}`
    const userName = `Guest_${userId.slice(-4)}`

    const { roomId, action, data } = await req.json()

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Get or create room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        players: new Map(),
        worldChanges: [],
        lastActivity: Date.now()
      })
    }

    const room = rooms.get(roomId)!
    room.lastActivity = Date.now()

    switch (action) {
      case 'join':
        room.players.set(userId, {
          id: userId,
          name: userName,
          x: data?.x || 400,
          y: data?.y || 300,
          health: data?.health || 100,
          lastSeen: Date.now(),
          selectedBlock: data?.selectedBlock || 'dirt',
          selectedWeapon: data?.selectedWeapon || 'sword',
          selectedArmor: data?.selectedArmor || 'leather'
        })
        break

      case 'move':
        if (room.players.has(userId)) {
          const player = room.players.get(userId)!
          player.x = data.x
          player.y = data.y
          player.lastSeen = Date.now()
        }
        break

      case 'updatePlayer':
        if (room.players.has(userId)) {
          const player = room.players.get(userId)!
          Object.assign(player, data, { lastSeen: Date.now() })
        }
        break

      case 'placeBlock':
      case 'removeBlock':
        room.worldChanges.push({
          x: data.x,
          y: data.y,
          blockType: action === 'placeBlock' ? data.blockType : null,
          timestamp: Date.now(),
          playerId: userId
        })
        
        // Keep only last 1000 changes
        if (room.worldChanges.length > 1000) {
          room.worldChanges = room.worldChanges.slice(-1000)
        }
        break

      case 'leave':
        room.players.delete(userId)
        break
    }

    return NextResponse.json({ 
      success: true,
      playerId: userId,
      roomId: roomId
    })
  } catch (error) {
    console.error('Multiplayer POST error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const room = rooms.get(roomId)
    if (!room) {
      return NextResponse.json({
        players: [],
        worldChanges: [],
        roomExists: false
      })
    }

    // Remove inactive players (not seen for 30 seconds)
    const thirtySecondsAgo = Date.now() - 30 * 1000
    for (const [playerId, player] of room.players.entries()) {
      if (player.lastSeen < thirtySecondsAgo) {
        room.players.delete(playerId)
      }
    }

    // Convert Map to Array for JSON response
    const players = Array.from(room.players.values())

    return NextResponse.json({
      players,
      worldChanges: room.worldChanges,
      roomExists: true,
      playerCount: players.length
    })
  } catch (error) {
    console.error('Multiplayer GET error:', error)
    return NextResponse.json({ 
      players: [], 
      worldChanges: [],
      roomExists: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
