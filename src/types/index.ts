// Market Types
export interface Market {
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  outcomes: MarketOutcome[];
  liquidity: number;
  totalVolume: number;
  createdAt: string;
  closingTime: string;
  resolutionTime?: string;
  resolved: boolean;
  resolutionValue?: string;
  featured: boolean;
  trending: boolean;
  tags: string[];
  creator: string;
  source?: string;
  rules: string;
  minPrice: number;
  maxPrice: number;
  currentPrices: Record<string, number>;
}

export interface MarketOutcome {
  id: string;
  name: string;
  price: number;
  probability: number;
  volume24h: number;
  priceChange24h: number;
}

export interface MarketCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

// Trading Types
export interface Trade {
  id: string;
  marketId: string;
  outcomeId: string;
  userId: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Position {
  id: string;
  marketId: string;
  outcomeId: string;
  shares: number;
  avgPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

// Chart Types
export interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  date: string;
}

export interface MarketChartData {
  marketId: string;
  outcomeId: string;
  data: ChartDataPoint[];
  timeframe: ChartTimeframe;
}

export type ChartTimeframe = '1H' | '4H' | '1D' | '1W' | '1M' | 'ALL';

// Filter and Search Types
export interface MarketFilters {
  categories: string[];
  status: MarketStatus[];
  liquidity: {
    min: number;
    max: number;
  };
  closingTime: {
    start: string;
    end: string;
  };
  featured: boolean;
  trending: boolean;
  search: string;
}

export type MarketStatus = 'open' | 'closing_soon' | 'resolved' | 'all';
export type SortOption = 'trending' | 'liquidity' | 'volume' | 'closing_time' | 'created_at' | 'alphabetical';
export type SortDirection = 'asc' | 'desc';

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  totalPnl: number;
  totalVolume: number;
  accuracy: number;
  marketsTraded: number;
  joinedAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketUpdates: boolean;
    priceAlerts: boolean;
    resolutions: boolean;
  };
  privacy: {
    showProfile: boolean;
    showPositions: boolean;
    showTrades: boolean;
  };
}

// Alert Types
export interface PriceAlert {
  id: string;
  marketId: string;
  outcomeId: string;
  condition: 'above' | 'below';
  targetPrice: number;
  active: boolean;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}

// Portfolio Types
export interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  positions: Position[];
  recentTrades: Trade[];
  performanceHistory: PerformanceDataPoint[];
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
  pnl: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

// Component Props Types
export interface MarketCardProps {
  market: Market;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
}

export interface ChartProps {
  data: ChartDataPoint[];
  timeframe: ChartTimeframe;
  height?: number;
  interactive?: boolean;
}

// Store Types
export interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface MarketState {
  markets: Market[];
  selectedMarket: Market | null;
  filters: MarketFilters;
  sortBy: SortOption;
  sortDirection: SortDirection;
  isLoading: boolean;
  error: string | null;
}

export interface PortfolioState {
  portfolio: Portfolio | null;
  positions: Position[];
  trades: Trade[];
  alerts: PriceAlert[];
  isLoading: boolean;
  error: string | null;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// Constants
export const MARKET_CATEGORIES: MarketCategory[] = [
  { id: 'politics', name: 'Politics', slug: 'politics', description: 'Elections and political events', color: '#3B82F6', icon: 'Vote' },
  { id: 'sports', name: 'Sports', slug: 'sports', description: 'Sports predictions and outcomes', color: '#EF4444', icon: 'Trophy' },
  { id: 'crypto', name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', color: '#F59E0B', icon: 'Coins' },
  { id: 'business', name: 'Business', slug: 'business', description: 'Corporate and economic events', color: '#10B981', icon: 'Building' },
  { id: 'technology', name: 'Technology', slug: 'technology', description: 'Tech developments and releases', color: '#8B5CF6', icon: 'Cpu' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', description: 'Movies, TV, and celebrity events', color: '#F97316', icon: 'Film' },
  { id: 'science', name: 'Science', slug: 'science', description: 'Scientific discoveries and research', color: '#06B6D4', icon: 'Microscope' },
  { id: 'other', name: 'Other', slug: 'other', description: 'Miscellaneous predictions', color: '#6B7280', icon: 'HelpCircle' },
];

export const CHART_TIMEFRAMES: { label: string; value: ChartTimeframe }[] = [
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: 'ALL', value: 'ALL' },
];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Trending', value: 'trending' },
  { label: 'Liquidity', value: 'liquidity' },
  { label: 'Volume', value: 'volume' },
  { label: 'Closing Time', value: 'closing_time' },
  { label: 'Created Date', value: 'created_at' },
  { label: 'Alphabetical', value: 'alphabetical' },
];