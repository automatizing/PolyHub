import { create } from 'zustand'
import { Market, MarketFilters, SortOption, SortDirection, MarketCategory } from '@/types'
import { fetchPolymarketMarkets, fetchFeaturedMarkets, fetchTrendingMarkets } from '@/lib/polymarket-api'

interface MarketState {
  // Market data
  markets: Market[]
  selectedMarket: Market | null
  featuredMarkets: Market[]
  trendingMarkets: Market[]
  categories: MarketCategory[]
  
  // Filtering and sorting
  filters: MarketFilters
  sortBy: SortOption
  sortDirection: SortDirection
  searchQuery: string
  
  // UI state
  isLoading: boolean
  error: string | null
  viewMode: 'grid' | 'list'
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  totalItems: number
  
  // Cache management
  lastFetchTime: number
  cacheExpiry: number // 5 minutes for active data
  
  // Actions
  setMarkets: (markets: Market[]) => void
  setSelectedMarket: (market: Market | null) => void
  setFeaturedMarkets: (markets: Market[]) => void
  setTrendingMarkets: (markets: Market[]) => void
  setCategories: (categories: MarketCategory[]) => void
  updateMarket: (marketId: string, updates: Partial<Market>) => void
  
  // API actions
  fetchMarkets: () => Promise<void>
  fetchFeaturedMarketsAction: () => Promise<void>
  fetchTrendingMarketsAction: () => Promise<void>
  refreshMarkets: () => Promise<void>
  
  // Filter actions
  setFilters: (filters: Partial<MarketFilters>) => void
  resetFilters: () => void
  setSortBy: (sortBy: SortOption) => void
  setSortDirection: (direction: SortDirection) => void
  setSearchQuery: (query: string) => void
  
  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setViewMode: (mode: 'grid' | 'list') => void
  
  // Pagination actions
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  
  // Computed getters
  getFilteredMarkets: () => Market[]
  getMarketById: (id: string) => Market | undefined
  getMarketsByCategory: (categoryId: string) => Market[]
  getTotalPages: () => number
  
  // Cache helpers
  shouldRefreshCache: () => boolean
  invalidateCache: () => void
}

const defaultFilters: MarketFilters = {
  categories: [],
  status: ['open'],
  liquidity: {
    min: 0,
    max: Infinity,
  },
  closingTime: {
    start: '',
    end: '',
  },
  featured: false,
  trending: false,
  search: '',
}

// Default categories extracted from your types
const defaultCategories: MarketCategory[] = [
  { id: 'politics', name: 'Politics', slug: 'politics', description: 'Elections and political events', color: '#3B82F6', icon: 'Vote' },
  { id: 'sports', name: 'Sports', slug: 'sports', description: 'Sports predictions and outcomes', color: '#EF4444', icon: 'Trophy' },
  { id: 'crypto', name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', color: '#F59E0B', icon: 'Coins' },
  { id: 'business', name: 'Business', slug: 'business', description: 'Corporate and economic events', color: '#10B981', icon: 'Building' },
  { id: 'technology', name: 'Technology', slug: 'technology', description: 'Tech developments and releases', color: '#8B5CF6', icon: 'Cpu' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Movies, TV, and celebrity events', color: '#F97316', icon: 'Film' },
  { id: 'science', name: 'Science', slug: 'science', description: 'Scientific discoveries and research', color: '#06B6D4', icon: 'Microscope' },
  { id: 'other', name: 'Other', slug: 'other', description: 'Miscellaneous predictions', color: '#6B7280', icon: 'HelpCircle' },
]

export const useMarketStore = create<MarketState>((set, get) => ({
  // Initial state
  markets: [],
  selectedMarket: null,
  featuredMarkets: [],
  trendingMarkets: [],
  categories: defaultCategories,
  
  filters: defaultFilters,
  sortBy: 'trending',
  sortDirection: 'desc',
  searchQuery: '',
  
  isLoading: false,
  error: null,
  viewMode: 'grid',
  
  currentPage: 1,
  itemsPerPage: 12,
  totalItems: 0,
  
  lastFetchTime: 0,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes

  // Market data actions
  setMarkets: (markets) => set({ 
    markets,
    totalItems: markets.length,
    lastFetchTime: Date.now(),
  }),

  setSelectedMarket: (selectedMarket) => set({ selectedMarket }),

  setFeaturedMarkets: (featuredMarkets) => set({ featuredMarkets }),

  setTrendingMarkets: (trendingMarkets) => set({ trendingMarkets }),

  setCategories: (categories) => set({ categories }),

  updateMarket: (marketId, updates) => set((state) => ({
    markets: state.markets.map(market => 
      market.id === marketId ? { ...market, ...updates } : market
    ),
    selectedMarket: state.selectedMarket?.id === marketId 
      ? { ...state.selectedMarket, ...updates }
      : state.selectedMarket,
  })),

  // API actions
  fetchMarkets: async () => {
    const { shouldRefreshCache, setLoading, setError, setMarkets } = get()
    
    // Check if we should use cached data
    if (!shouldRefreshCache()) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const markets = await fetchPolymarketMarkets(100) // Fetch more markets for better variety
      setMarkets(markets)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch markets'
      setError(errorMessage)
      console.error('Error fetching markets:', error)
    } finally {
      setLoading(false)
    }
  },

  fetchFeaturedMarketsAction: async () => {
    const { setError, setFeaturedMarkets } = get()
    
    try {
      const featured = await fetchFeaturedMarkets()
      setFeaturedMarkets(featured)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch featured markets'
      setError(errorMessage)
      console.error('Error fetching featured markets:', error)
    }
  },

  fetchTrendingMarketsAction: async () => {
    const { setError, setTrendingMarkets } = get()
    
    try {
      const trending = await fetchTrendingMarkets()
      setTrendingMarkets(trending)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trending markets'
      setError(errorMessage)
      console.error('Error fetching trending markets:', error)
    }
  },

  refreshMarkets: async () => {
    const { invalidateCache, fetchMarkets, fetchFeaturedMarketsAction, fetchTrendingMarketsAction } = get()
    
    invalidateCache()
    await Promise.all([
      fetchMarkets(),
      fetchFeaturedMarketsAction(),
      fetchTrendingMarketsAction()
    ])
  },

  // Filter actions
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    currentPage: 1, // Reset to first page when filters change
  })),

  resetFilters: () => set({
    filters: defaultFilters,
    searchQuery: '',
    currentPage: 1,
  }),

  setSortBy: (sortBy) => set({ 
    sortBy,
    currentPage: 1,
  }),

  setSortDirection: (sortDirection) => set({ 
    sortDirection,
    currentPage: 1,
  }),

  setSearchQuery: (searchQuery) => set((state) => ({
    searchQuery,
    filters: { ...state.filters, search: searchQuery },
    currentPage: 1,
  })),

  // UI actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setViewMode: (viewMode) => set({ viewMode }),

  // Pagination actions
  setCurrentPage: (currentPage) => set({ currentPage }),

  setItemsPerPage: (itemsPerPage) => set({ 
    itemsPerPage,
    currentPage: 1,
  }),

  // Cache helpers
  shouldRefreshCache: () => {
    const { lastFetchTime, cacheExpiry } = get()
    return Date.now() - lastFetchTime > cacheExpiry
  },

  invalidateCache: () => set({ lastFetchTime: 0 }),

  // Computed getters
  getFilteredMarkets: () => {
    const { markets, filters, sortBy, sortDirection, searchQuery } = get()
    
    let filtered = markets.filter(market => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(market.category.id)) {
        return false
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes('all')) {
        const marketStatus = market.resolved ? 'resolved' : 'open'
        if (!filters.status.includes(marketStatus as any)) {
          return false
        }
      }
      
      // Liquidity filter
      if (market.liquidity < filters.liquidity.min || market.liquidity > filters.liquidity.max) {
        return false
      }
      
      // Closing time filter
      if (filters.closingTime.start && new Date(market.closingTime) < new Date(filters.closingTime.start)) {
        return false
      }
      if (filters.closingTime.end && new Date(market.closingTime) > new Date(filters.closingTime.end)) {
        return false
      }
      
      // Featured filter
      if (filters.featured && !market.featured) {
        return false
      }
      
      // Trending filter
      if (filters.trending && !market.trending) {
        return false
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = `${market.question} ${market.description} ${market.tags.join(' ')}`.toLowerCase()
        if (!searchText.includes(query)) {
          return false
        }
      }
      
      return true
    })
    
    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'trending':
          aValue = a.trending ? 1 : 0
          bValue = b.trending ? 1 : 0
          break
        case 'liquidity':
          aValue = a.liquidity
          bValue = b.liquidity
          break
        case 'volume':
          aValue = a.totalVolume
          bValue = b.totalVolume
          break
        case 'closing_time':
          aValue = new Date(a.closingTime).getTime()
          bValue = new Date(b.closingTime).getTime()
          break
        case 'created_at':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'alphabetical':
          aValue = a.question.toLowerCase()
          bValue = b.question.toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return filtered
  },

  getMarketById: (id) => {
    const { markets } = get()
    return markets.find(market => market.id === id)
  },

  getMarketsByCategory: (categoryId) => {
    const { markets } = get()
    return markets.filter(market => market.category.id === categoryId)
  },

  getTotalPages: () => {
    const { itemsPerPage } = get()
    const filteredMarkets = get().getFilteredMarkets()
    return Math.ceil(filteredMarkets.length / itemsPerPage)
  },
}))