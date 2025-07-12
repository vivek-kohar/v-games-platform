import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')
    
    // Use session user ID, email as fallback, or guest ID
    const userId = (session?.user as any)?.id || session?.user?.email || guestId

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Get or create player bank
    let playerBank = await prisma.playerBank.findUnique({
      where: { userId },
      include: { items: true }
    })

    if (!playerBank) {
      playerBank = await prisma.playerBank.create({
        data: {
          userId,
          totalValue: 0
        },
        include: { items: true }
      })
    }

    return NextResponse.json({
      bankItems: playerBank.items,
      totalValue: playerBank.totalValue,
      lastUpdated: playerBank.updatedAt
    })

  } catch (error) {
    console.error('Bank GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch bank data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { action, item, quantity, guestId } = body
    
    // Use session user ID, email as fallback, or guest ID
    const userId = (session?.user as any)?.id || session?.user?.email || guestId

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Get or create player bank
    let playerBank = await prisma.playerBank.findUnique({
      where: { userId },
      include: { items: true }
    })

    if (!playerBank) {
      playerBank = await prisma.playerBank.create({
        data: {
          userId,
          totalValue: 0
        },
        include: { items: true }
      })
    }

    if (action === 'deposit') {
      // Find existing item or create new one
      const existingItem = await prisma.bankItem.findFirst({
        where: {
          bankId: playerBank.id,
          itemId: item.id,
          itemType: item.type
        }
      })

      if (existingItem) {
        // Update existing item quantity
        await prisma.bankItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            lastUpdated: new Date()
          }
        })
      } else {
        // Create new bank item
        await prisma.bankItem.create({
          data: {
            bankId: playerBank.id,
            itemId: item.id,
            itemType: item.type,
            itemName: item.name,
            quantity: quantity,
            value: item.value,
            rarity: item.rarity,
            icon: item.icon,
            description: item.description
          }
        })
      }

      // Update bank total value
      await prisma.playerBank.update({
        where: { id: playerBank.id },
        data: {
          totalValue: playerBank.totalValue + (item.value * quantity)
        }
      })

      return NextResponse.json({ success: true, action: 'deposited' })

    } else if (action === 'withdraw') {
      // Find the item in bank
      const bankItem = await prisma.bankItem.findFirst({
        where: {
          bankId: playerBank.id,
          itemId: item.id
        }
      })

      if (!bankItem || bankItem.quantity < quantity) {
        return NextResponse.json({ error: 'Insufficient quantity in bank' }, { status: 400 })
      }

      if (bankItem.quantity === quantity) {
        // Remove item completely
        await prisma.bankItem.delete({
          where: { id: bankItem.id }
        })
      } else {
        // Reduce quantity
        await prisma.bankItem.update({
          where: { id: bankItem.id },
          data: {
            quantity: bankItem.quantity - quantity,
            lastUpdated: new Date()
          }
        })
      }

      // Update bank total value
      await prisma.playerBank.update({
        where: { id: playerBank.id },
        data: {
          totalValue: Math.max(0, playerBank.totalValue - (bankItem.value * quantity))
        }
      })

      return NextResponse.json({ success: true, action: 'withdrawn' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Bank POST error:', error)
    return NextResponse.json({ error: 'Failed to process bank operation' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')
    const itemId = searchParams.get('itemId')
    
    // Use session user ID, email as fallback, or guest ID
    const userId = (session?.user as any)?.id || session?.user?.email || guestId

    if (!userId || !itemId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Find and delete the bank item
    const bankItem = await prisma.bankItem.findFirst({
      where: {
        bank: { userId },
        itemId
      },
      include: { bank: true }
    })

    if (!bankItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Update bank total value
    await prisma.playerBank.update({
      where: { id: bankItem.bankId },
      data: {
        totalValue: Math.max(0, bankItem.bank.totalValue - (bankItem.value * bankItem.quantity))
      }
    })

    // Delete the item
    await prisma.bankItem.delete({
      where: { id: bankItem.id }
    })

    return NextResponse.json({ success: true, action: 'deleted' })

  } catch (error) {
    console.error('Bank DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete bank item' }, { status: 500 })
  }
}
