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
import { Switch } from '@/components/ui/switch'
import { useMarketStore } from '@/store/market'
import { MARKET_CATEGORIES, MarketStatus } from '@/types'
import { cn } from '@/lib/utils'

interface MarketFiltersProps {
  className?: string
  mobile?: boolean
}

export function MarketFilters({ className, mobile = false }: MarketFiltersProps) {
  const {
    filters,
    setFilters,
    resetFilters,
    searchQuery,
    setSearchQuery,
  } = useMarketStore()

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.status.length > 1 || !filters.status.includes('open'),
    filters.featured,
    filters.trending,
    filters.liquidity.min > 0 || filters.liquidity.max < Infinity,
    filters.closingTime.start || filters.closingTime.end,
    searchQuery.length > 0,
  ].filter(Boolean).length

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
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
        ? filters.status.filter(s => s !== status)
        : [...filters.status.filter(s => s !== 'all'), status as MarketStatus]
      
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
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        {mobile && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Categories */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Categories</label>
          <div className="flex flex-wrap gap-2">
            {MARKET_CATEGORIES.map((category) => (
              <Badge
                key={category.id}
                variant={filters.categories.includes(category.id) ? "default" : "outline"}
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
                variant={filters.status.includes(status.value as any) ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity justify-center py-2"
                onClick={() => handleStatusChange(status.value as MarketStatus)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quick Filters</label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Featured markets</span>
              <Switch
                checked={filters.featured}
                onCheckedChange={(checked) => setFilters({ featured: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Trending markets</span>
              <Switch
                checked={filters.trending}
                onCheckedChange={(checked) => setFilters({ trending: checked })}
              />
            </div>
          </div>
        </div>

        {/* Liquidity range */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Minimum Liquidity
          </label>
          <Select
            value={filters.liquidity.min.toString()}
            onValueChange={(value) => setFilters({ 
              liquidity: { ...filters.liquidity, min: parseInt(value) }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select minimum liquidity" />
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

        {/* Closing time */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Closing Time
          </label>
          <div className="grid grid-cols-1 gap-2">
            <Input
              type="date"
              placeholder="From date"
              value={filters.closingTime.start}
              onChange={(e) => setFilters({
                closingTime: { ...filters.closingTime, start: e.target.value }
              })}
            />
            <Input
              type="date"
              placeholder="To date"
              value={filters.closingTime.end}
              onChange={(e) => setFilters({
                closingTime: { ...filters.closingTime, end: e.target.value }
              })}
            />
          </div>
        </div>

        {/* Active filters summary */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">
              Active filters ({activeFilterCount}):
            </div>
            <div className="flex flex-wrap gap-1">
              {filters.categories.map((categoryId) => {
                const category = MARKET_CATEGORIES.find(c => c.id === categoryId)
                return category ? (
                  <Badge key={categoryId} variant="secondary" className="text-xs">
                    {category.name}
                  </Badge>
                ) : null
              })}
              {filters.featured && (
                <Badge variant="secondary" className="text-xs">Featured</Badge>
              )}
              {filters.trending && (
                <Badge variant="secondary" className="text-xs">Trending</Badge>
              )}
              {filters.liquidity.min > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Min Liquidity: ${filters.liquidity.min.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}