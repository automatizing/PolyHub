// app/api/markets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Market, MarketCategory } from '@/types'

// Simple Polymarket API types based on actual response
interface PolymarketMarket {
  id: string
  question: string
  description?: string
  outcomes: string
  outcomePrices: string
  volume: string
  volumeNum?: number
  liquidity: string
  liquidityNum?: number
  volume24hr?: number
  endDate: string
  startDate: string
  active: boolean
  closed: boolean
  featured?: boolean
  new?: boolean
  tags?: Array<{label: string, slug: string}>
  categories?: Array<{label: string, slug: string}>
  createdAt: string
}

// Parse outcomes and prices from API strings
function parseOutcomesAndPrices(outcomes: string, outcomePrices: string) {
  try {
    const outcomeArray = JSON.parse(outcomes || '["Yes", "No"]')
    const priceArray = JSON.parse(outcomePrices || '[0.5, 0.5]')

    return outcomeArray.map((name: string, index: number) => ({
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
      price: parseFloat(priceArray[index]) || 0.5,
      probability: parseFloat(priceArray[index]) || 0.5,
      volume24h: 0, // Will be calculated from market volume
      priceChange24h: (Math.random() - 0.5) * 0.1,
    }))
  } catch (error) {
    // Fallback to binary outcomes
    return [
      { id: 'yes', name: 'Yes', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
      { id: 'no', name: 'No', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
    ]
  }
}

// Get category from tags and categories
function getCategoryFromMarket(market: PolymarketMarket): MarketCategory {
  const tags = market.tags?.map(t => t.label.toLowerCase()) || []
  const categories = market.categories?.map(c => c.label.toLowerCase()) || []
  const allLabels = [...tags, ...categories]
  const question = market.question.toLowerCase()

  if (allLabels.some(label => ['politics', 'election', 'government'].includes(label)) ||
      question.includes('election') || question.includes('president') || question.includes('trump') ||
      question.includes('powell') || question.includes('fed')) {
    return { id: 'politics', name: 'Politics', slug: 'politics', description: 'Elections and political events', color: '#3B82F6', icon: 'Vote' }
  }

  if (allLabels.some(label => ['sports', 'nfl', 'nba'].includes(label)) ||
      question.includes('sport') || question.includes('super bowl') || question.includes('nfl')) {
    return { id: 'sports', name: 'Sports', slug: 'sports', description: 'Sports predictions and outcomes', color: '#EF4444', icon: 'Trophy' }
  }

  if (allLabels.some(label => ['crypto', 'bitcoin', 'ethereum'].includes(label)) ||
      question.includes('bitcoin') || question.includes('crypto')) {
    return { id: 'crypto', name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', color: '#F59E0B', icon: 'Coins' }
  }

  if (allLabels.some(label => ['business', 'stock', 'economy'].includes(label)) ||
      question.includes('stock') || question.includes('fed')) {
    return { id: 'business', name: 'Business', slug: 'business', description: 'Corporate and economic events', color: '#10B981', icon: 'Building' }
  }

  if (allLabels.some(label => ['technology', 'tech'].includes(label)) ||
      question.includes('tiktok') || question.includes('tech')) {
    return { id: 'technology', name: 'Technology', slug: 'technology', description: 'Tech developments and releases', color: '#8B5CF6', icon: 'Cpu' }
  }

  if (question.includes('taylor swift') || question.includes('celebrity')) {
    return { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Movies, TV, and celebrity events', color: '#F97316', icon: 'Film' }
  }

  return { id: 'other', name: 'Other', slug: 'other', description: 'Miscellaneous predictions', color: '#6B7280', icon: 'HelpCircle' }
}

// Transform Polymarket data to our format
function transformMarket(market: PolymarketMarket): Market {
  const category = getCategoryFromMarket(market)
  const outcomes = parseOutcomesAndPrices(market.outcomes, market.outcomePrices)

  // Distribute volume among outcomes
  const volume24h = market.volume24hr || 0
  outcomes.forEach((outcome: typeof outcomes[number]) => {
    outcome.volume24h = volume24h / outcomes.length
  })

  return {
    id: market.id,
    question: market.question,
    description: market.description || market.question,
    category,
    outcomes,
    liquidity: market.liquidityNum || parseFloat(market.liquidity || '0'),
    totalVolume: market.volumeNum || parseFloat(market.volume || '0'),
    createdAt: market.createdAt,
    closingTime: market.endDate,
    resolved: market.closed,
    featured: market.featured || false,
    trending: market.new || false,
    tags: market.tags?.map(t => t.label) || [],
    creator: 'Polymarket',
    rules: 'Market resolves based on Polymarket resolution criteria.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: outcomes.reduce((acc, outcome) => {
      acc[outcome.id] = outcome.price
      return acc
    }, {} as Record<string, number>),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log(`Fetching ${type || 'all'} markets from Gamma API`)

    // Build API URL with proper parameters for different types
    let apiUrl: string

    switch (type) {
      case 'featured':
        apiUrl = `https://gamma-api.polymarket.com/markets?limit=100&closed=false&volume_num_min=5000&liquidity_num_min=1000&order=volumeNum&ascending=false&include_tag=true`
        break
      case 'trending':
        apiUrl = `https://gamma-api.polymarket.com/markets?limit=100&closed=false&volume_num_min=1000&order=volume24hr&ascending=false&include_tag=true`
        break
      default:
        apiUrl = `https://gamma-api.polymarket.com/markets?limit=100&closed=false&order=volumeNum&ascending=false&include_tag=true`
    }

    console.log(`API call: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PolyHub/1.0',
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Received ${Array.isArray(data) ? data.length : 0} markets from Gamma API`)

    if (!Array.isArray(data) || data.length === 0) {
      console.log('No valid markets returned, using fallback')
      throw new Error('No markets returned')
    }

    // Transform all markets
    const allMarkets = data
      .filter(market => !market.closed && market.active !== false)
      .map(transformMarket)
      .filter(market => market && market.totalVolume >= 0)

    console.log(`Successfully transformed ${allMarkets.length} markets`)

    // Filter and limit based on request type
    let markets: Market[] = []

    switch (type) {
      case 'featured':
        markets = allMarkets
          .filter(m => m.totalVolume > 5000 && m.liquidity > 1000)
          .slice(0, 6)
          .map(m => ({ ...m, featured: true }))
        break
      case 'trending':
        markets = allMarkets
          .filter(m => m.totalVolume > 1000)
          .slice(0, 8)
          .map(m => ({ ...m, trending: true }))
        break
      default:
        markets = allMarkets.slice(0, limit)
    }

    console.log(`Returning ${markets.length} ${type || 'total'} markets`)

    return NextResponse.json({
      success: true,
      data: markets,
      count: markets.length,
      timestamp: new Date().toISOString(),
      source: 'polymarket-gamma-api'
    })

  } catch (error) {
    console.error('API error:', error)

    const fallbackMarkets: Market[] = [
      {
        id: 'fallback-jerome-powell',
        question: 'Jerome Powell out as Fed Chair in 2025?',
        description: 'Will Jerome Powell cease to be the Chair of the U.S. Federal Reserve in 2025?',
        category: { id: 'politics', name: 'Politics', slug: 'politics', description: 'Elections and political events', color: '#3B82F6', icon: 'Vote' },
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.05, probability: 0.05, volume24h: 45000, priceChange24h: 0.01 },
          { id: 'no', name: 'No', price: 0.95, probability: 0.95, volume24h: 185000, priceChange24h: -0.01 },
        ],
        liquidity: 212763,
        totalVolume: 978750,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        closingTime: new Date('2025-12-31T23:59:59Z').toISOString(),
        resolved: false,
        featured: true,
        trending: true,
        tags: ['jerome powell', 'fed chair'],
        creator: 'Polymarket',
        rules: 'Market resolves based on official Federal Reserve announcements.',
        minPrice: 0.01,
        maxPrice: 0.99,
        currentPrices: { yes: 0.05, no: 0.95 },
      }
    ]

    const markets = type === 'featured' ? fallbackMarkets.slice(0, 6).map(m => ({...m, featured: true})) : 
                   type === 'trending' ? fallbackMarkets.slice(0, 8).map(m => ({...m, trending: true})) : 
                   fallbackMarkets.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: markets,
      count: markets.length,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    })
  }
}
