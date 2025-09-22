import { Market, MarketCategory, ChartDataPoint, Trade, Position, User } from '@/types'
import { addDays, subDays, addHours } from 'date-fns'

// Mock categories
export const mockCategories: MarketCategory[] = [
  { id: 'politics', name: 'Politics', slug: 'politics', description: 'Elections and political events', color: '#3B82F6', icon: 'Vote' },
  { id: 'sports', name: 'Sports', slug: 'sports', description: 'Sports predictions and outcomes', color: '#EF4444', icon: 'Trophy' },
  { id: 'crypto', name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', color: '#F59E0B', icon: 'Coins' },
  { id: 'business', name: 'Business', slug: 'business', description: 'Corporate and economic events', color: '#10B981', icon: 'Building' },
  { id: 'technology', name: 'Technology', slug: 'technology', description: 'Tech developments and releases', color: '#8B5CF6', icon: 'Cpu' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Movies, TV, and celebrity events', color: '#F97316', icon: 'Film' },
]

// Generate mock chart data
function generateChartData(days: number = 30): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const basePrice = 0.45 + Math.random() * 0.3 // Between 0.45 and 0.75
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const price = Math.max(0.01, Math.min(0.99, 
      basePrice + (Math.random() - 0.5) * 0.1 + Math.sin(i / 5) * 0.05
    ))
    const volume = Math.floor(Math.random() * 10000) + 1000
    
    data.push({
      timestamp: date.toISOString(),
      price: Math.round(price * 100) / 100,
      volume,
      date: date.toISOString().split('T')[0],
    })
  }
  
  return data
}

// Mock markets
export const mockMarkets: Market[] = [
  {
    id: '1',
    question: 'Will Bitcoin reach $100,000 by end of 2025?',
    description: 'This market resolves to "Yes" if Bitcoin (BTC) reaches or exceeds $100,000 USD at any point before January 1, 2026, according to CoinGecko pricing data.',
    category: mockCategories[2], // crypto
    outcomes: [
      { id: 'yes', name: 'Yes', price: 0.67, probability: 0.67, volume24h: 15420, priceChange24h: 0.03 },
      { id: 'no', name: 'No', price: 0.33, probability: 0.33, volume24h: 8230, priceChange24h: -0.03 },
    ],
    liquidity: 89500,
    totalVolume: 234750,
    createdAt: subDays(new Date(), 45).toISOString(),
    closingTime: new Date('2025-12-31T23:59:59Z').toISOString(),
    resolved: false,
    featured: true,
    trending: true,
    tags: ['bitcoin', 'cryptocurrency', 'price prediction'],
    creator: 'CryptoOracle',
    rules: 'Market resolves based on CoinGecko USD price data. Temporary spikes above $100k count for resolution.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: { yes: 0.67, no: 0.33 },
  },
  {
    id: '2',
    question: 'Will the Lakers make the NBA playoffs this season?',
    description: 'This market resolves to "Yes" if the Los Angeles Lakers qualify for the 2025 NBA playoffs.',
    category: mockCategories[1], // sports
    outcomes: [
      { id: 'yes', name: 'Yes', price: 0.78, probability: 0.78, volume24h: 9850, priceChange24h: 0.05 },
      { id: 'no', name: 'No', price: 0.22, probability: 0.22, volume24h: 2340, priceChange24h: -0.05 },
    ],
    liquidity: 45600,
    totalVolume: 127800,
    createdAt: subDays(new Date(), 120).toISOString(),
    closingTime: new Date('2025-04-15T23:59:59Z').toISOString(),
    resolved: false,
    featured: false,
    trending: true,
    tags: ['nba', 'lakers', 'playoffs', 'basketball'],
    creator: 'SportsAnalyst',
    rules: 'Market resolves based on official NBA playoff qualification.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: { yes: 0.78, no: 0.22 },
  },
  {
    id: '3',
    question: 'Will Apple announce a new iPhone model in 2025?',
    description: 'This market resolves to "Yes" if Apple officially announces a new iPhone model during 2025.',
    category: mockCategories[4], // technology
    outcomes: [
      { id: 'yes', name: 'Yes', price: 0.92, probability: 0.92, volume24h: 5670, priceChange24h: 0.01 },
      { id: 'no', name: 'No', price: 0.08, probability: 0.08, volume24h: 450, priceChange24h: -0.01 },
    ],
    liquidity: 23400,
    totalVolume: 67890,
    createdAt: subDays(new Date(), 30).toISOString(),
    closingTime: new Date('2025-12-31T23:59:59Z').toISOString(),
    resolved: false,
    featured: true,
    trending: false,
    tags: ['apple', 'iphone', 'technology', 'announcement'],
    creator: 'TechWatcher',
    rules: 'Market resolves based on official Apple announcements or press releases.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: { yes: 0.92, no: 0.08 },
  },
  {
    id: '4',
    question: 'Will Tesla stock close above $300 by end of Q1 2025?',
    description: 'This market resolves to "Yes" if Tesla (TSLA) stock closes above $300 on the last trading day of Q1 2025.',
    category: mockCategories[3], // business
    outcomes: [
      { id: 'yes', name: 'Yes', price: 0.54, probability: 0.54, volume24h: 12340, priceChange24h: -0.02 },
      { id: 'no', name: 'No', price: 0.46, probability: 0.46, volume24h: 8760, priceChange24h: 0.02 },
    ],
    liquidity: 76800,
    totalVolume: 198400,
    createdAt: subDays(new Date(), 15).toISOString(),
    closingTime: new Date('2025-03-31T20:00:00Z').toISOString(),
    resolved: false,
    featured: false,
    trending: true,
    tags: ['tesla', 'stock', 'tsla', 'q1'],
    creator: 'MarketMaker',
    rules: 'Market resolves based on official NASDAQ closing price.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: { yes: 0.54, no: 0.46 },
  },
  {
    id: '5',
    question: 'Will "Dune: Part Three" be released in 2026?',
    description: 'This market resolves to "Yes" if the third Dune movie is officially released in theaters during 2026.',
    category: mockCategories[5], // entertainment
    outcomes: [
      { id: 'yes', name: 'Yes', price: 0.73, probability: 0.73, volume24h: 3420, priceChange24h: 0.04 },
      { id: 'no', name: 'No', price: 0.27, probability: 0.27, volume24h: 1280, priceChange24h: -0.04 },
    ],
    liquidity: 18900,
    totalVolume: 45600,
    createdAt: subDays(new Date(), 60).toISOString(),
    closingTime: new Date('2026-12-31T23:59:59Z').toISOString(),
    resolved: false,
    featured: false,
    trending: false,
    tags: ['dune', 'movie', 'release', 'sequel'],
    creator: 'MovieBuff',
    rules: 'Market resolves based on official theatrical release in the United States.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: { yes: 0.73, no: 0.27 },
  },
  {
    id: '6',
    question: 'Will there be a major AI breakthrough announced in 2025?',
    description: 'This market resolves to "Yes" if a significant AI breakthrough is announced by a major tech company or research institution in 2025.',
    category: mockCategories[4], // technology
    outcomes: [
      { id: 'yes', name: 'Yes', price: 0.81, probability: 0.81, volume24h: 7890, priceChange24h: 0.02 },
      { id: 'no', name: 'No', price: 0.19, probability: 0.19, volume24h: 1870, priceChange24h: -0.02 },
    ],
    liquidity: 34500,
    totalVolume: 89200,
    createdAt: subDays(new Date(), 20).toISOString(),
    closingTime: new Date('2025-12-31T23:59:59Z').toISOString(),
    resolved: false,
    featured: true,
    trending: true,
    tags: ['ai', 'artificial intelligence', 'breakthrough', 'technology'],
    creator: 'AIResearcher',
    rules: 'Resolution criteria include AGI achievements, major model capabilities, or revolutionary applications.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: { yes: 0.81, no: 0.19 },
  },
]

// Mock user
export const mockUser: User = {
  id: 'user-1',
  username: 'predictor_pro',
  email: 'user@example.com',
  avatar: '',
  totalPnl: 2340.50,
  totalVolume: 45600,
  accuracy: 0.72,
  marketsTraded: 23,
  joinedAt: subDays(new Date(), 180).toISOString(),
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      marketUpdates: true,
      priceAlerts: true,
      resolutions: true,
    },
    privacy: {
      showProfile: true,
      showPositions: false,
      showTrades: false,
    },
  },
}

// Mock trades
export const mockTrades: Trade[] = [
  {
    id: 'trade-1',
    marketId: '1',
    outcomeId: 'yes',
    userId: 'user-1',
    type: 'buy',
    shares: 100,
    price: 0.65,
    totalAmount: 65,
    timestamp: subDays(new Date(), 2).toISOString(),
    status: 'completed',
  },
  {
    id: 'trade-2',
    marketId: '2',
    outcomeId: 'yes',
    userId: 'user-1',
    type: 'buy',
    shares: 50,
    price: 0.76,
    totalAmount: 38,
    timestamp: subDays(new Date(), 5).toISOString(),
    status: 'completed',
  },
  {
    id: 'trade-3',
    marketId: '3',
    outcomeId: 'no',
    userId: 'user-1',
    type: 'sell',
    shares: 25,
    price: 0.09,
    totalAmount: 2.25,
    timestamp: subDays(new Date(), 1).toISOString(),
    status: 'completed',
  },
]

// Mock positions
export const mockPositions: Position[] = [
  {
    id: 'pos-1',
    marketId: '1',
    outcomeId: 'yes',
    shares: 100,
    avgPrice: 0.65,
    currentValue: 67,
    pnl: 2,
    pnlPercentage: 3.08,
  },
  {
    id: 'pos-2',
    marketId: '2',
    outcomeId: 'yes',
    shares: 50,
    avgPrice: 0.76,
    currentValue: 39,
    pnl: 1,
    pnlPercentage: 2.63,
  },
]

// Generate mock chart data for each market
export const mockChartData: Record<string, ChartDataPoint[]> = {
  '1': generateChartData(30),
  '2': generateChartData(30),
  '3': generateChartData(30),
  '4': generateChartData(30),
  '5': generateChartData(30),
  '6': generateChartData(30),
}

// Function to get random subset of markets
export function getRandomMarkets(count: number): Market[] {
  const shuffled = [...mockMarkets].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Function to get featured markets
export function getFeaturedMarkets(): Market[] {
  return mockMarkets.filter(market => market.featured)
}

// Function to get trending markets
export function getTrendingMarkets(): Market[] {
  return mockMarkets.filter(market => market.trending)
}

// Function to simulate real-time price updates
export function generatePriceUpdate(market: Market): Market {
  const updatedOutcomes = market.outcomes.map(outcome => {
    const priceChange = (Math.random() - 0.5) * 0.02 // ±1% change
    const newPrice = Math.max(0.01, Math.min(0.99, outcome.price + priceChange))
    
    return {
      ...outcome,
      price: Math.round(newPrice * 100) / 100,
      probability: Math.round(newPrice * 100) / 100,
      priceChange24h: Math.round(priceChange * 100) / 100,
    }
  })
  
  return {
    ...market,
    outcomes: updatedOutcomes,
    currentPrices: updatedOutcomes.reduce((acc, outcome) => {
      acc[outcome.id] = outcome.price
      return acc
    }, {} as Record<string, number>),
  }
}