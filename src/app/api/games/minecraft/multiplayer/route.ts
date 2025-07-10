import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// In-memory storage for game rooms (in production, use Redis or similar)
const gameRooms = new Map<string, {
  players: Map<string, {
    id: string
    name: string
    x: number
    y: number
    lastUpdate: number
  }>
  world: any[][]
  lastWorldUpdate: number
}>()

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId') || 'default'

  // Get or create room
  if (!gameRooms.has(roomId)) {
    gameRooms.set(roomId, {
      players: new Map(),
      world: [],
      lastWorldUpdate: Date.now()
    })
  }

  const room = gameRooms.get(roomId)!
  
  return NextResponse.json({
    roomId,
    players: Array.from(room.players.values()),
    world: room.world,
    lastUpdate: room.lastWorldUpdate
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { roomId = 'default', action, data } = await req.json()

  // Get or create room
  if (!gameRooms.has(roomId)) {
    gameRooms.set(roomId, {
      players: new Map(),
      world: [],
      lastWorldUpdate: Date.now()
    })
  }

  const room = gameRooms.get(roomId)!

  switch (action) {
    case 'join':
      room.players.set(session.user.id, {
        id: session.user.id,
        name: session.user.name || 'Player',
        x: data.x || 400,
        y: data.y || 100,
        lastUpdate: Date.now()
      })
      break

    case 'move':
      if (room.players.has(session.user.id)) {
        const player = room.players.get(session.user.id)!
        player.x = data.x
        player.y = data.y
        player.lastUpdate = Date.now()
      }
      break

    case 'placeBlock':
      room.world = data.world
      room.lastWorldUpdate = Date.now()
      break

    case 'leave':
      room.players.delete(session.user.id)
      break
  }

  // Clean up inactive players (older than 30 seconds)
  const now = Date.now()
  for (const [playerId, player] of room.players.entries()) {
    if (now - player.lastUpdate > 30000) {
      room.players.delete(playerId)
    }
  }

  return NextResponse.json({
    success: true,
    players: Array.from(room.players.values()),
    world: room.world,
    lastUpdate: room.lastWorldUpdate
  })
}
