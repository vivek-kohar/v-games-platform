import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for player banks (for demo purposes)
const playerBanks = new Map<string, {
  coins: number
  gems: number
  experience: number
  lastUpdated: number
}>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId') || 'default-guest'
    
    // Get or create player bank
    if (!playerBanks.has(guestId)) {
      playerBanks.set(guestId, {
        coins: 100, // Starting coins
        gems: 10,   // Starting gems
        experience: 0,
        lastUpdated: Date.now()
      })
    }
    
    const bank = playerBanks.get(guestId)!
    
    return NextResponse.json({
      success: true,
      bank: {
        coins: bank.coins,
        gems: bank.gems,
        experience: bank.experience
      }
    })
  } catch (error) {
    console.error('Bank GET error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch bank data',
      bank: { coins: 0, gems: 0, experience: 0 }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId') || 'default-guest'
    
    const { action, amount, currency } = await request.json()
    
    // Get or create player bank
    if (!playerBanks.has(guestId)) {
      playerBanks.set(guestId, {
        coins: 100,
        gems: 10,
        experience: 0,
        lastUpdated: Date.now()
      })
    }
    
    const bank = playerBanks.get(guestId)!
    
    if (action === 'add') {
      switch (currency) {
        case 'coins':
          bank.coins += Math.max(0, amount)
          break
        case 'gems':
          bank.gems += Math.max(0, amount)
          break
        case 'experience':
          bank.experience += Math.max(0, amount)
          break
      }
    } else if (action === 'subtract') {
      switch (currency) {
        case 'coins':
          bank.coins = Math.max(0, bank.coins - amount)
          break
        case 'gems':
          bank.gems = Math.max(0, bank.gems - amount)
          break
        case 'experience':
          bank.experience = Math.max(0, bank.experience - amount)
          break
      }
    }
    
    bank.lastUpdated = Date.now()
    
    return NextResponse.json({
      success: true,
      bank: {
        coins: bank.coins,
        gems: bank.gems,
        experience: bank.experience
      }
    })
  } catch (error) {
    console.error('Bank POST error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update bank data' 
    }, { status: 500 })
  }
}
