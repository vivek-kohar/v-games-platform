import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Enhanced world sync for real-time multiplayer
const worldState = new Map<string, {
  world: (string | null)[][]
  lastUpdate: number
  changes: Array<{
    x: number
    y: number
    blockType: string | null
    timestamp: number
    playerId: string
  }>
}>()

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Allow guest users to play
  const userId = session?.user?.id || `guest-${Date.now()}`

  const { roomId, action, x, y, blockType } = await req.json()

  if (!worldState.has(roomId)) {
    // Initialize larger world (150x80)
    const world: (string | null)[][] = []
    for (let i = 0; i < 150; i++) {
      world[i] = new Array(80).fill(null)
    }
    
    worldState.set(roomId, {
      world,
      lastUpdate: Date.now(),
      changes: []
    })
  }

  const room = worldState.get(roomId)!

  if (action === 'place' || action === 'remove') {
    const newBlockType = action === 'place' ? blockType : null
    
    // Update world state
    if (x >= 0 && x < 150 && y >= 0 && y < 80) {
      room.world[x][y] = newBlockType
      room.lastUpdate = Date.now()
      
      // Track change for other players
      room.changes.push({
        x,
        y,
        blockType: newBlockType,
        timestamp: Date.now(),
        playerId: userId
      })
      
      // Keep only last 50 changes
      if (room.changes.length > 50) {
        room.changes = room.changes.slice(-50)
      }
    }
  }

  return NextResponse.json({
    success: true,
    changes: room.changes.slice(-10), // Return last 10 changes
    lastUpdate: room.lastUpdate
  })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Allow guest users to play
  const userId = session?.user?.id || `guest-${Date.now()}`

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId') || 'default'
  const since = parseInt(searchParams.get('since') || '0')

  const room = worldState.get(roomId)
  if (!room) {
    return NextResponse.json({ changes: [], lastUpdate: Date.now() })
  }

  // Return changes since timestamp
  const recentChanges = room.changes.filter(change => change.timestamp > since)
  
  return NextResponse.json({
    changes: recentChanges,
    lastUpdate: room.lastUpdate
  })
}
