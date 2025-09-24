'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, Search, X, RefreshCw, ExternalLink } from 'lucide-react'
import { Layout } from '@/components/layout'
import { MarketCard } from '@/components/market/market-card'
import { MarketFilters } from '@/components/market/market-filters'
import { MarketSort } from '@/components/market/market-sort'
import { MarketListSkeleton } from '@/components/market/market-skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMarketStore } from '@/store/market'
import { cn } from '@/lib/utils'

export default function MarketsPage() {
  const searchParams = useSearchParams()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const {
    markets,
    getFilteredMarkets,
    searchQuery,
    setSearchQuery,
    setFilters,
    viewMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    getTotalPages,
    isLoading,
    error,
    fetchMarkets,
    refreshMarkets,
    shouldRefreshCache
  } = useMarketStore()

  // Initialize data and handle URL params
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true)
      
      try {
        // Check if we need to fetch data
        if (markets.length === 0 || shouldRefreshCache()) {
          await fetchMarkets()
        }
        
        // Handle URL search parameters
        const urlSearch = searchParams.get('search')
        const urlCategory = searchParams.get('category')
        const urlFeatured = searchParams.get('featured')
        const urlTrending = searchParams.get('trending')
        
        if (urlSearch) {
          setSearchQuery(urlSearch)
        }
        
        if (urlCategory || urlFeatured || urlTrending) {
          setFilters({
            categories: urlCategory ? [urlCategory] : [],
            featured: urlFeatured === 'true',
            trending: urlTrending === 'true',
          })
        }
      } catch (error) {
        console.error('Failed to load markets:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadData()
  }, [searchParams, markets.length, shouldRefreshCache, fetchMarkets, setSearchQuery, setFilters])

  const filteredMarkets = getFilteredMarkets()
  const totalPages = getTotalPages()
  
  // Paginate filtered markets
  const paginatedMarkets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredMarkets.slice(startIndex, endIndex)
  }, [filteredMarkets, currentPage, itemsPerPage])

  // Values for the toolbar summary
  const total = filteredMarkets.length
  const start = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, total)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Search is handled by the store automatically
  }

  const handleRefresh = async () => {
    await refreshMarkets()
  }

  if (isInitialLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mb-8"></div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="hidden lg:block w-80">
              <div className="animate-pulse">
                <div className="h-96 bg-muted rounded"></div>
              </div>
            </div>
            <div className="flex-1">
              <MarketListSkeleton count={6} />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Prediction Markets</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => window.open('https://polymarket.com', '_blank')}
                variant="ghost"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Polymarket
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Discover and monitor prediction markets from Polymarket in real-time
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-red-600 dark:text-red-400">
                    Error loading markets: {error}
                  </p>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mobile search and filter toggle */}
        <div className="lg:hidden mb-6">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </form>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <MarketFilters />
            </div>
          </div>

        {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <MarketFilters mobile />
              <div className="mt-6">
                <Button
                  className="w-full"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Cleaner toolbar: summary left, controls right */}
            <div className="mb-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {Intl.NumberFormat().format(start)}–{Intl.NumberFormat().format(end)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {Intl.NumberFormat().format(total)}
                  </span>{' '}
                  markets
                </div>

                {/* Right side: keep your existing MarketSort controls */}
                <div className="market-toolbar-right">
                  <MarketSort resultsCount={filteredMarkets.length} />
                </div>
              </div>

              {/* Hide any duplicate summary inside MarketSort to avoid clutter */}
              <style jsx global>{`
                .market-toolbar-right > * > :first-child {
                  display: none !important;
                }
              `}</style>
            </div>

            {/* No results state */}
            {filteredMarkets.length === 0 && !isLoading && !isInitialLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No markets found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms, or check back later for new markets
                  </p>
                  <div className="flex gap-2 justify-center">
                    {/* ADDED: View on Polymarket */}
                    <Button
                      onClick={() => {
                        const q = (searchQuery || '').trim()
                        const url = q
                          ? `https://polymarket.com/search?_q=${encodeURIComponent(q)}`
                          : 'https://polymarket.com/search'
                        window.open(url, '_blank')
                      }}
                    >
                      View on Polymarket
                    </Button>

                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Reset Filters
                    </Button>
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Markets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading state */}
            {isLoading && !isInitialLoading && (
              <div className="mb-6">
                <MarketListSkeleton count={6} />
              </div>
            )}

            {/* Markets Grid/List */}
            {filteredMarkets.length > 0 && !isLoading && (
              <>
                <div
                  className={cn(
                    'grid gap-6 mb-8',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {paginatedMarkets.map((market) => (
                    <MarketCard
                      key={market.id}
                      market={market}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number

                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="icon"
                            className="w-10 h-10"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Results summary */}
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Showing {Math.min(itemsPerPage, filteredMarkets.length)} of {filteredMarkets.length} markets
                  {totalPages > 1 && <> (Page {currentPage} of {totalPages})</>}
                </div>
              </>
            )}

            {/* Polymarket attribution */}
            <div className="mt-8 pt-8 border-t">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">Market data provided by Polymarket</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open('https://polymarket.com', '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Polymarket to trade
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
