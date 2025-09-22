// lib/polymarket-api.ts
import { Market } from '@/types'

// API Response type
interface APIResponse {
  success: boolean
  data: Market[]
  count: number
  timestamp: string
  error?: string
}

// Simple API client that uses our Next.js API route
class PolymarketAPI {
  private baseURL = '/api/markets'

  private async fetchFromAPI(endpoint: string): Promise<APIResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API fetch error:', error)
      throw new Error(`Failed to fetch from API: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMarkets(limit = 50): Promise<Market[]> {
    const response = await this.fetchFromAPI(`${this.baseURL}?limit=${limit}`)
    return response.data
  }

  async getFeaturedMarkets(): Promise<Market[]> {
    const response = await this.fetchFromAPI(`${this.baseURL}?type=featured`)
    return response.data
  }

  async getTrendingMarkets(): Promise<Market[]> {
    const response = await this.fetchFromAPI(`${this.baseURL}?type=trending`)
    return response.data
  }
}

// Service functions
export async function fetchPolymarketMarkets(limit = 50): Promise<Market[]> {
  console.log('Fetching markets from internal API...')
  
  const api = new PolymarketAPI()
  
  try {
    const markets = await api.getMarkets(limit)
    console.log(`Successfully fetched ${markets.length} markets`)
    return markets
  } catch (error) {
    console.error('Error fetching markets:', error)
    throw new Error(`Failed to fetch markets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function fetchFeaturedMarkets(): Promise<Market[]> {
  console.log('Fetching featured markets...')
  
  const api = new PolymarketAPI()
  
  try {
    const markets = await api.getFeaturedMarkets()
    console.log(`Successfully fetched ${markets.length} featured markets`)
    return markets
  } catch (error) {
    console.error('Error fetching featured markets:', error)
    throw new Error(`Failed to fetch featured markets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function fetchTrendingMarkets(): Promise<Market[]> {
  console.log('Fetching trending markets...')
  
  const api = new PolymarketAPI()
  
  try {
    const markets = await api.getTrendingMarkets()
    console.log(`Successfully fetched ${markets.length} trending markets`)
    return markets
  } catch (error) {
    console.error('Error fetching trending markets:', error)
    throw new Error(`Failed to fetch trending markets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Initialize the API instance
export const polymarketAPI = new PolymarketAPI()