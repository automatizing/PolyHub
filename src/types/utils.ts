import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatting utilities
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(num)
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return formatNumber(num / 1e9, { maximumFractionDigits: 1 }) + 'B'
  } else if (num >= 1e6) {
    return formatNumber(num / 1e6, { maximumFractionDigits: 1 }) + 'M'
  } else if (num >= 1e3) {
    return formatNumber(num / 1e3, { maximumFractionDigits: 1 }) + 'K'
  }
  return formatNumber(num)
}

export function formatPercentage(value: number, showSign = true): string {
  const formatted = formatNumber(Math.abs(value), { maximumFractionDigits: 1 }) + '%'
  if (!showSign) return formatted
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted
}

export function formatProbability(probability: number): string {
  return formatPercentage(probability * 100, false)
}

// Date utilities
export function formatDate(date: string | Date, formatString = 'MMM d, yyyy'): string {
  return format(new Date(date), formatString)
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatTimeUntilClose(closingTime: string): string {
  const now = new Date()
  const closing = new Date(closingTime)
  
  if (isBefore(closing, now)) {
    return 'Closed'
  }
  
  const distance = formatDistanceToNow(closing)
  return `Closes in ${distance}`
}

// Market utilities
export function getMarketStatus(market: { resolved: boolean; closingTime: string }): 'open' | 'closing_soon' | 'closed' | 'resolved' {
  if (market.resolved) return 'resolved'
  
  const now = new Date()
  const closingTime = new Date(market.closingTime)
  const oneDayFromNow = addDays(now, 1)
  
  if (isBefore(closingTime, now)) return 'closed'
  if (isBefore(closingTime, oneDayFromNow)) return 'closing_soon'
  return 'open'
}

export function getMarketStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
    case 'closing_soon':
      return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800'
    case 'closed':
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800'
    case 'resolved':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800'
  }
}

export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400'
  if (change < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Search utilities
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
}

export function fuzzySearch(query: string, items: string[]): string[] {
  if (!query.trim()) return items
  
  const lowerQuery = query.toLowerCase()
  return items.filter(item => 
    item.toLowerCase().includes(lowerQuery)
  )
}

// Local storage utilities
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Analytics utilities
export function trackEvent(event: string, properties?: Record<string, any>): void {
  // Placeholder for analytics tracking
  if (process.env.NODE_ENV === 'development') {
    console.log('Track event:', event, properties)
  }
  
  // TODO: Implement actual analytics tracking (e.g., Google Analytics, Mixpanel)
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

// URL utilities
export function createSearchParams(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  
  return searchParams.toString()
}

// Accessibility utilities
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}