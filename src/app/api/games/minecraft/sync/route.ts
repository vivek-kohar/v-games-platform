import { NextRequest, NextResponse } from "next/server"

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
  try {
    // Allow guest users to play without authentication
    const userId = `guest-${Date.now()}`

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
    
    if (action === 'placeBlock' || action === 'removeBlock') {
      // Validate coordinates
      if (x >= 0 && x < 150 && y >= 0 && y < 80) {
        const newBlockType = action === 'placeBlock' ? blockType : null
        room.world[x][y] = newBlockType
        
        // Add to changes log
        room.changes.push({
          x,
          y,
          blockType: newBlockType,
          timestamp: Date.now(),
          playerId: userId
        })
        
        // Keep only last 1000 changes to prevent memory issues
        if (room.changes.length > 1000) {
          room.changes = room.changes.slice(-1000)
        }
        
        room.lastUpdate = Date.now()
      }
    }

    return NextResponse.json({ 
      success: true, 
      lastUpdate: room.lastUpdate 
    })
  } catch (error) {
    console.error('Sync POST error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Allow guest users to play without authentication
    const userId = `guest-${Date.now()}`

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
      lastUpdate: room.lastUpdate,
      worldSize: {
        width: 150,
        height: 80
      }
    })
  } catch (error) {
    console.error('Sync GET error:', error)
    return NextResponse.json({ 
      changes: [], 
      lastUpdate: Date.now(),
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
