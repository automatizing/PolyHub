// src/components/market/market-filters.tsx
import React from 'react'
import { Filter, X, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketStore } from '@/store/market'
import { MARKET_CATEGORIES, MarketStatus } from '@/types'
import { cn } from '@/lib/utils'

interface MarketFiltersProps {
  className?: string
  mobile?: boolean
}

export function MarketFilters({ className, mobile }: MarketFiltersProps) {
  const {
    filters,
    setFilters,
    resetFilters,        // ✅ use resetFilters from the store
    searchQuery,
    setSearchQuery,
  } = useMarketStore()

  // Remove "Science" from the category chips
  const CATEGORY_PILLS = React.useMemo(
    () =>
      MARKET_CATEGORIES.filter(
        (c: any) =>
          c?.id !== 'science' &&
          String(c?.name || '').toLowerCase() !== 'science'
      ),
    []
  )

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.status.length > 0 && !filters.status.includes('open') && !filters.status.includes('all'),
    (filters.liquidity?.min ?? 0) > 0 || (filters.liquidity?.max ?? Infinity) < Infinity,
    !!filters.closingTime?.start || !!filters.closingTime?.end,
    (searchQuery || '').length > 0,
  ].filter(Boolean).length

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id: string) => id !== categoryId)
      : [...filters.categories, categoryId]
    setFilters({ categories: newCategories })
  }

  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      setFilters({ status: ['all'] })
    } else {
      const newStatus = filters.status.includes('all')
        ? [status as MarketStatus]
        : filters.status.includes(status as MarketStatus)
        ? filters.status.filter((s: string) => s !== status)
        : [...filters.status.filter((s: string) => s !== 'all'), status as MarketStatus]

      setFilters({ status: newStatus.length === 0 ? ['all'] : newStatus })
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            {mobile ? (
              <Button variant="ghost" size="icon" onClick={() => resetFilters()}>
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => resetFilters()}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search markets"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories (Science removed) */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_PILLS.map((category: any) => (
              <Badge
                key={category.id}
                variant={filters.categories.includes(category.id) ? 'default' : 'outline'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleCategoryToggle(category.id)}
                style={{
                  backgroundColor: filters.categories.includes(category.id)
                    ? category.color
                    : 'transparent',
                  borderColor: category.color,
                  color: filters.categories.includes(category.id)
                    ? 'white'
                    : category.color,
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'all', label: 'All Markets' },
              { value: 'open', label: 'Open' },
              { value: 'closing_soon', label: 'Closing Soon' },
              { value: 'resolved', label: 'Resolved' },
            ].map((status) => (
              <Badge
                key={status.value}
                variant={
                  filters.status.includes(status.value as any) ? 'default' : 'outline'
                }
                className="cursor-pointer hover:opacity-80 transition-opacity justify-center py-2"
                onClick={() => handleStatusChange(status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Minimum Liquidity */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Minimum Liquidity
          </label>
          <Select
            value={String(filters.liquidity?.min ?? 0)}
            onValueChange={(value) =>
              setFilters({
                liquidity: { ...filters.liquidity, min: Number(value) },
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No minimum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No minimum</SelectItem>
              <SelectItem value="1000">$1,000+</SelectItem>
              <SelectItem value="5000">$5,000+</SelectItem>
              <SelectItem value="10000">$10,000+</SelectItem>
              <SelectItem value="25000">$25,000+</SelectItem>
              <SelectItem value="50000">$50,000+</SelectItem>
              <SelectItem value="100000">$100,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Closing Time */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Closing Time
          </label>
          <div className="grid grid-cols-1 gap-2">
            <Input
              type="date"
              value={filters.closingTime?.start || ''}
              onChange={(e) =>
                setFilters({
                  closingTime: { ...filters.closingTime, start: e.target.value },
                })
              }
            />
            <Input
              type="date"
              value={filters.closingTime?.end || ''}
              onChange={(e) =>
                setFilters({
                  closingTime: { ...filters.closingTime, end: e.target.value },
                })
              }
            />
          </div>
        </div>

        {/* Active filter summary */}
        {activeFilterCount > 0 && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((catId: string) => {
                const cat = CATEGORY_PILLS.find((c: any) => c.id === catId)
                if (!cat) return null
                return (
                  <Badge key={catId} variant="secondary" className="text-xs">
                    {cat.name}
                  </Badge>
                )
              })}
              {!filters.status.includes('open') &&
                filters.status.map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s.replace('_', ' ')}
                  </Badge>
                ))}
              {filters.liquidity?.min > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Min Liquidity: ${filters.liquidity.min.toLocaleString()}
                </Badge>
              )}
              {(filters.closingTime?.start || filters.closingTime?.end) && (
                <Badge variant="secondary" className="text-xs">
                  Closing: {filters.closingTime.start || '…'} → {filters.closingTime.end || '…'}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
