import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { gameSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data, score, level } = await req.json()
    const { gameSlug } = params

    // Find or create game
    let game = await prisma.game.findUnique({
      where: { slug: gameSlug }
    })

    if (!game) {
      game = await prisma.game.create({
        data: {
          name: gameSlug.charAt(0).toUpperCase() + gameSlug.slice(1),
          slug: gameSlug,
          description: `${gameSlug} game`,
        }
      })
    }

    // Upsert game state
    const gameState = await prisma.gameState.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: game.id,
        }
      },
      update: {
        data,
        score: score || 0,
        level: level || 1,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        gameId: game.id,
        data,
        score: score || 0,
        level: level || 1,
      }
    })

    return NextResponse.json({
      message: "Game state saved successfully",
      gameState: {
        id: gameState.id,
        score: gameState.score,
        level: gameState.level,
        updatedAt: gameState.updatedAt,
      }
    })
  } catch (error) {
    console.error("Save game state error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { gameSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { gameSlug } = params

    const game = await prisma.game.findUnique({
      where: { slug: gameSlug }
    })

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      )
    }

    const gameState = await prisma.gameState.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: game.id,
        }
      }
    })

    if (!gameState) {
      return NextResponse.json({
        data: null,
        score: 0,
        level: 1,
        message: "No saved game state found"
      })
    }

    return NextResponse.json({
      data: gameState.data,
      score: gameState.score,
      level: gameState.level,
      updatedAt: gameState.updatedAt,
    })
  } catch (error) {
    console.error("Load game state error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
