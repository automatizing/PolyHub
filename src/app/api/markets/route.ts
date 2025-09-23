// app/api/markets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Market, MarketCategory } from '@/types'

// Local outcome type for parsed markets
interface Outcome {
  id: string
  name: string
  price: number
  probability: number
  volume24h: number
  priceChange24h: number
}

// Polymarket Event type
interface PolymarketEvent {
  id: string
  title: string
  slug: string
  description?: string
  startDate: string
  endDate: string
  active: boolean
  closed: boolean
  featured?: boolean
  new?: boolean
  volume?: number
  volume24hr?: number
  liquidity?: number
  openInterest?: number
  markets?: PolymarketMarket[]
  tags?: Array<{ label: string; slug: string }>
  categories?: Array<{ label: string; slug: string }>
  createdAt: string
}

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
  tags?: Array<{ label: string; slug: string }>
  categories?: Array<{ label: string; slug: string }>
  createdAt: string
  events?: Array<{ id: string; title: string; slug: string }>
}

// Parse outcomes and prices from API strings
function parseOutcomesAndPrices(outcomes: string, outcomePrices: string): Outcome[] {
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
  } catch (_error) {
    // Fallback to binary outcomes
    return [
      { id: 'yes', name: 'Yes', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
      { id: 'no', name: 'No', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
    ]
  }
}

// Get category from tags and categories
function getCategoryFromMarket(market: PolymarketMarket | PolymarketEvent): MarketCategory {
  const tags = market.tags?.map((t) => t.label.toLowerCase()) || []
  const categories = market.categories?.map((c) => c.label.toLowerCase()) || []
  const allLabels = [...tags, ...categories]
  const title = ('question' in market ? market.question : market.title).toLowerCase()

  if (
    allLabels.some((label) => ['politics', 'election', 'government'].includes(label)) ||
    title.includes('election') ||
    title.includes('president') ||
    title.includes('trump') ||
    title.includes('powell') ||
    title.includes('fed')
  ) {
    return {
      id: 'politics',
      name: 'Politics',
      slug: 'politics',
      description: 'Elections and political events',
      color: '#3B82F6',
      icon: 'Vote',
    }
  }

  if (
    allLabels.some((label) => ['sports', 'nfl', 'nba'].includes(label)) ||
    title.includes('sport') ||
    title.includes('super bowl') ||
    title.includes('nfl')
  ) {
    return {
      id: 'sports',
      name: 'Sports',
      slug: 'sports',
      description: 'Sports predictions and outcomes',
      color: '#EF4444',
      icon: 'Trophy',
    }
  }

  if (
    allLabels.some((label) => ['crypto', 'bitcoin', 'ethereum'].includes(label)) ||
    title.includes('bitcoin') ||
    title.includes('crypto')
  ) {
    return {
      id: 'crypto',
      name: 'Crypto',
      slug: 'crypto',
      description: 'Cryptocurrency and blockchain',
      color: '#F59E0B',
      icon: 'Coins',
    }
  }

  if (
    allLabels.some((label) => ['business', 'stock', 'economy'].includes(label)) ||
    title.includes('stock') ||
    title.includes('fed')
  ) {
    return {
      id: 'business',
      name: 'Business',
      slug: 'business',
      description: 'Corporate and economic events',
      color: '#10B981',
      icon: 'Building',
    }
  }

  if (
    allLabels.some((label) => ['technology', 'tech'].includes(label)) ||
    title.includes('tiktok') ||
    title.includes('tech')
  ) {
    return {
      id: 'technology',
      name: 'Technology',
      slug: 'technology',
      description: 'Tech developments and releases',
      color: '#8B5CF6',
      icon: 'Cpu',
    }
  }

  if (title.includes('taylor swift') || title.includes('celebrity')) {
    return {
      id: 'entertainment',
      name: 'Entertainment',
      slug: 'entertainment',
      description: 'Movies, TV, and celebrity events',
      color: '#F97316',
      icon: 'Film',
    }
  }

  return {
    id: 'other',
    name: 'Other',
    slug: 'other',
    description: 'Miscellaneous predictions',
    color: '#6B7280',
    icon: 'HelpCircle',
  }
}

// Transform Polymarket market data to our format
function transformMarket(market: PolymarketMarket): Market {
  const category = getCategoryFromMarket(market)
  const outcomes = parseOutcomesAndPrices(market.outcomes, market.outcomePrices)

  // Distribute volume among outcomes
  const volume24h = market.volume24hr || 0
  outcomes.forEach((outcome: Outcome) => {
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
    tags: market.tags?.map((t) => t.label) || [],
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

// Transform Event data to Market format (using the highest volume market within the event)
function transformEventToMarket(event: PolymarketEvent): Market | null {
  if (!event.markets || event.markets.length === 0) {
    return null
  }

  // Find the highest volume market in the event, or use the first one
  const primaryMarket = event.markets.reduce((highest, current) => {
    const currentVolume = current.volumeNum || parseFloat(current.volume || '0')
    const highestVolume = highest.volumeNum || parseFloat(highest.volume || '0')
    return currentVolume > highestVolume ? current : highest
  })

  const category = getCategoryFromMarket(event)
  const outcomes = parseOutcomesAndPrices(primaryMarket.outcomes, primaryMarket.outcomePrices)

  // Calculate total event volume and liquidity
  const totalEventVolume = event.volume || event.markets.reduce((sum, market) => {
    return sum + (market.volumeNum || parseFloat(market.volume || '0'))
  }, 0)

  const totalEventLiquidity = event.liquidity || event.markets.reduce((sum, market) => {
    return sum + (market.liquidityNum || parseFloat(market.liquidity || '0'))
  }, 0)

  const volume24h = event.volume24hr || 0
  outcomes.forEach((outcome: Outcome) => {
    outcome.volume24h = volume24h / outcomes.length
  })

  return {
    id: `event-${event.id}`,
    question: event.title,
    description: event.description || `${event.title} - Event with ${event.markets.length} related markets`,
    category,
    outcomes,
    liquidity: totalEventLiquidity,
    totalVolume: totalEventVolume,
    createdAt: event.createdAt,
    closingTime: event.endDate,
    resolved: event.closed,
    featured: event.featured || false,
    trending: event.new || false,
    tags: [...(event.tags?.map((t) => t.label) || []), 'Event'],
    creator: 'Polymarket',
    rules: `Event with ${event.markets.length} related markets. Market resolves based on Polymarket resolution criteria.`,
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: outcomes.reduce((acc, outcome) => {
      acc[outcome.id] = outcome.price
      return acc
    }, {} as Record<string, number>),
  }
}

// Fetch events with markets included
async function fetchEvents(limit: number = 50): Promise<PolymarketEvent[]> {
  const apiUrl = `https://gamma-api.polymarket.com/events?limit=${limit}&closed=false&order=volume&ascending=false&related_tags=true`
  
  console.log(`Fetching events: ${apiUrl}`)
  
  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PolyHub/1.0',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Events API error: ${response.status} - ${response.statusText}`)
  }

  return await response.json()
}

// Fetch individual markets
async function fetchMarkets(limit: number = 100): Promise<PolymarketMarket[]> {
  const apiUrl = `https://gamma-api.polymarket.com/markets?limit=${limit}&closed=false&order=volumeNum&ascending=false&include_tag=true`
  
  console.log(`Fetching markets: ${apiUrl}`)
  
  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PolyHub/1.0',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Markets API error: ${response.status} - ${response.statusText}`)
  }

  return await response.json()
}

// Generate fallback markets only when needed
function generateFallbackMarkets(): Market[] {
  return [
    {
      id: 'fallback-election-2024',
      question: '2024 Presidential Election Winner',
      description: 'Who will win the 2024 U.S. Presidential Election?',
      category: {
        id: 'politics',
        name: 'Politics',
        slug: 'politics',
        description: 'Elections and political events',
        color: '#3B82F6',
        icon: 'Vote',
      },
      outcomes: [
        { id: 'trump', name: 'Trump', price: 0.52, probability: 0.52, volume24h: 2100000, priceChange24h: 0.03 },
        { id: 'harris', name: 'Harris', price: 0.48, probability: 0.48, volume24h: 1900000, priceChange24h: -0.03 },
      ],
      liquidity: 8500000,
      totalVolume: 84000000,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      closingTime: new Date('2024-11-06T00:00:00Z').toISOString(),
      resolved: false,
      featured: true,
      trending: true,
      tags: ['2024 election', 'president'],
      creator: 'Polymarket',
      rules: 'Market resolves based on official election results.',
      minPrice: 0.01,
      maxPrice: 0.99,
      currentPrices: { trump: 0.52, harris: 0.48 },
    },
    {
      id: 'fallback-bitcoin-100k',
      question: 'Bitcoin above $100k by EOY 2024?',
      description: 'Will Bitcoin reach $100,000 before January 1, 2025?',
      category: {
        id: 'crypto',
        name: 'Crypto',
        slug: 'crypto',
        description: 'Cryptocurrency and blockchain',
        color: '#F59E0B',
        icon: 'Coins',
      },
      outcomes: [
        { id: 'yes', name: 'Yes', price: 0.35, probability: 0.35, volume24h: 450000, priceChange24h: 0.05 },
        { id: 'no', name: 'No', price: 0.65, probability: 0.65, volume24h: 550000, priceChange24h: -0.05 },
      ],
      liquidity: 2500000,
      totalVolume: 12000000,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      closingTime: new Date('2024-12-31T23:59:59Z').toISOString(),
      resolved: false,
      featured: true,
      trending: false,
      tags: ['bitcoin', 'crypto', 'price'],
      creator: 'Polymarket',
      rules: 'Market resolves YES if Bitcoin trades above $100,000 on any major exchange before 2025.',
      minPrice: 0.01,
      maxPrice: 0.99,
      currentPrices: { yes: 0.35, no: 0.65 },
    },
    {
      id: 'fallback-super-bowl',
      question: 'Super Bowl 2025 Winner',
      description: 'Which team will win Super Bowl LIX?',
      category: {
        id: 'sports',
        name: 'Sports',
        slug: 'sports',
        description: 'Sports predictions and outcomes',
        color: '#EF4444',
        icon: 'Trophy',
      },
      outcomes: [
        { id: 'chiefs', name: 'Chiefs', price: 0.18, probability: 0.18, volume24h: 80000, priceChange24h: 0.02 },
        { id: '49ers', name: '49ers', price: 0.15, probability: 0.15, volume24h: 70000, priceChange24h: -0.01 },
        { id: 'eagles', name: 'Eagles', price: 0.12, probability: 0.12, volume24h: 60000, priceChange24h: 0.01 },
        { id: 'other', name: 'Other', price: 0.55, probability: 0.55, volume24h: 190000, priceChange24h: -0.02 },
      ],
      liquidity: 1800000,
      totalVolume: 8500000,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      closingTime: new Date('2025-02-09T23:00:00Z').toISOString(),
      resolved: false,
      featured: false,
      trending: true,
      tags: ['nfl', 'super bowl', 'football'],
      creator: 'Polymarket',
      rules: 'Market resolves to the team that wins Super Bowl LIX.',
      minPrice: 0.01,
      maxPrice: 0.99,
      currentPrices: { chiefs: 0.18, '49ers': 0.15, eagles: 0.12, other: 0.55 },
    },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log(`Fetching ${type || 'all'} markets and events from Gamma API`)

    // Fetch both events and individual markets
    const [eventsData, marketsData] = await Promise.allSettled([
      fetchEvents(50),
      fetchMarkets(100)
    ])

    let allMarkets: Market[] = []
    let apiCallsSucceeded = false

    // Process events (these often have the highest volumes)
    if (eventsData.status === 'fulfilled' && Array.isArray(eventsData.value)) {
      console.log(`Processing ${eventsData.value.length} events`)
      apiCallsSucceeded = true
      
      for (const event of eventsData.value) {
        if (!event.closed && event.active !== false) {
          // Fetch detailed event with markets
          try {
            const eventDetailUrl = `https://gamma-api.polymarket.com/events/${event.id}`
            const eventDetailResponse = await fetch(eventDetailUrl, {
              headers: { Accept: 'application/json', 'User-Agent': 'PolyHub/1.0' },
              signal: AbortSignal.timeout(5000),
            })
            
            if (eventDetailResponse.ok) {
              const detailedEvent = await eventDetailResponse.json()
              if (detailedEvent.markets && detailedEvent.markets.length > 0) {
                const eventMarket = transformEventToMarket(detailedEvent)
                if (eventMarket) {
                  allMarkets.push(eventMarket)
                }
              }
            }
          } catch (error) {
            console.log(`Failed to fetch event details for ${event.id}:`, error)
          }
        }
      }
    } else {
      console.log('Failed to fetch events:', eventsData.status === 'rejected' ? eventsData.reason : 'No data')
    }

    // Process individual markets
    if (marketsData.status === 'fulfilled' && Array.isArray(marketsData.value)) {
      console.log(`Processing ${marketsData.value.length} individual markets`)
      apiCallsSucceeded = true
      
      const individualMarkets = marketsData.value
        .filter((market: PolymarketMarket) => !market.closed && market.active !== false)
        .map(transformMarket)
        .filter((market: Market) => market && market.totalVolume >= 0)

      allMarkets = [...allMarkets, ...individualMarkets]
    } else {
      console.log('Failed to fetch markets:', marketsData.status === 'rejected' ? marketsData.reason : 'No data')
    }

    // Check if we actually got any markets from the API
    if (!apiCallsSucceeded || allMarkets.length === 0) {
      // Only use fallback if API completely failed
      console.log('API calls failed or returned no data, using fallback markets')
      
      const fallbackMarkets = generateFallbackMarkets()
      const markets = type === 'featured'
        ? fallbackMarkets.filter(m => m.featured).slice(0, 6)
        : type === 'trending'
        ? fallbackMarkets.filter(m => m.trending).slice(0, 8)
        : fallbackMarkets.slice(0, limit)

      return NextResponse.json({
        success: true,
        data: markets,
        count: markets.length,
        timestamp: new Date().toISOString(),
        source: 'fallback',
        warning: 'Using fallback data due to API failure'
      })
    }

    // Remove duplicates and sort by total volume (events + markets combined)
    const uniqueMarkets = Array.from(
      new Map(allMarkets.map(market => [market.id, market])).values()
    ).sort((a, b) => b.totalVolume - a.totalVolume)

    console.log(`Successfully processed ${uniqueMarkets.length} total markets from API`)

    // Filter and limit based on request type
    let markets: Market[] = []

    switch (type) {
      case 'featured':
        markets = uniqueMarkets
          .filter((m) => m.totalVolume > 5000 && m.liquidity > 1000)
          .slice(0, 6)
          .map((m) => ({ ...m, featured: true }))
        break
      case 'trending':
        markets = uniqueMarkets
          .filter((m) => m.totalVolume > 1000)
          .slice(0, 8)
          .map((m) => ({ ...m, trending: true }))
        break
      default:
        markets = uniqueMarkets.slice(0, limit)
    }

    console.log(`Returning ${markets.length} ${type || 'total'} markets from API`)
    console.log('Top 3 markets by volume:', markets.slice(0, 3).map(m => ({ 
      question: m.question, 
      volume: m.totalVolume,
      isEvent: m.id.startsWith('event-')
    })))

    return NextResponse.json({
      success: true,
      data: markets,
      count: markets.length,
      timestamp: new Date().toISOString(),
      source: 'polymarket-gamma-api',
    })
  } catch (error) {
    console.error('Critical API error:', error)

    // Generate fallback data only on complete failure
    const fallbackMarkets = generateFallbackMarkets()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const markets = type === 'featured'
      ? fallbackMarkets.filter(m => m.featured).slice(0, 6)
      : type === 'trending'
      ? fallbackMarkets.filter(m => m.trending).slice(0, 8)
      : fallbackMarkets.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: markets,
      count: markets.length,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
