'use client'

import React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useMarketStore } from '@/store/market'
import { SortOption, SortDirection } from '@/types'
import { cn } from '@/lib/utils'

const sortOptions: { label: string; value: SortOption; description: string }[] = [
  { label: 'Trending', value: 'trending', description: 'Most active markets' },
  { label: 'Liquidity', value: 'liquidity', description: 'Highest liquidity first' },
  { label: 'Volume', value: 'volume', description: 'Highest volume first' },
  { label: 'Closing Time', value: 'closing_time', description: 'Closing soonest first' },
  { label: 'Created Date', value: 'created_at', description: 'Newest first' },
  { label: 'Alphabetical', value: 'alphabetical', description: 'A-Z order' },
]

interface MarketSortProps {
  className?: string
  showViewMode?: boolean
  resultsCount?: number
}

export function MarketSort({ className, showViewMode = true, resultsCount }: MarketSortProps) {
  const {
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    viewMode,
    setViewMode,
    getFilteredMarkets,
    currentPage,
    itemsPerPage,
  } = useMarketStore()

  const filteredMarkets = getFilteredMarkets()
  const totalResults = filteredMarkets.length
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults)

  const handleSortChange = (newSortBy: SortOption) => {
    if (newSortBy === sortBy) {
      // Toggle direction if same sort option
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new sort option with default direction
      setSortBy(newSortBy)
      // Default directions for different sort types
      const defaultDirection: Record<SortOption, SortDirection> = {
        trending: 'desc',
        liquidity: 'desc',
        volume: 'desc',
        closing_time: 'asc',
        created_at: 'desc',
        alphabetical: 'asc',
      }
      setSortDirection(defaultDirection[newSortBy])
    }
  }

  const getSortIcon = () => {
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4" />
    } else {
      return <ArrowDown className="h-4 w-4" />
    }
  }

  const currentSortOption = sortOptions.find(option => option.value === sortBy)

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4', className)}>
      {/* Results count and sort controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
        {/* Results count */}
        {typeof resultsCount !== 'undefined' ? (
          <div className="text-sm text-muted-foreground">
            {resultsCount === 0 ? (
              'No markets found'
            ) : totalResults === 1 ? (
              '1 market'
            ) : (
              <>
                {totalResults > itemsPerPage ? (
                  <>
                    Showing {startIndex}-{endIndex} of {totalResults.toLocaleString()} markets
                  </>
                ) : (
                  <>
                    {totalResults.toLocaleString()} market{totalResults !== 1 ? 's' : ''}
                  </>
                )}
              </>
            )}
          </div>
        ) : null}

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          
          {/* Sort select */}
          <Select value={sortBy} onValueChange={(value: SortOption) => handleSortChange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort direction button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {getSortIcon()}
          </Button>

          {/* Current sort indicator */}
          <Badge variant="secondary" className="hidden md:inline-flex">
            {currentSortOption?.label} {sortDirection === 'asc' ? '↑' : '↓'}
          </Badge>
        </div>
      </div>

      {/* View mode toggle */}
      {showViewMode && (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'grid' ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}