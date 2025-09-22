'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Share2, 
  BookOpen, 
  AlertTriangle,
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react'
import { Layout } from '@/components/layout'
import { MarketChart } from '@/components/market/market-chart'
import { MarketDetailSkeleton } from '@/components/market/market-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketStore } from '@/store/market'
import { useAppStore } from '@/store/app'
import { Market, Trade, ChartDataPoint } from '@/types'
import { mockMarkets, mockChartData, mockTrades } from '@/lib/mock-data'
import { 
  formatCurrency, 
  formatLargeNumber, 
  formatTimeUntilClose, 
  formatDate,
  formatDateTime,
  formatPercentage,
  getMarketStatus, 
  getMarketStatusColor,
  getPriceChangeColor,
  cn 
} from '@/lib/utils'

export default function MarketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addNotification } = useAppStore()
  const [market, setMarket] = useState<Market | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOutcome, setSelectedOutcome] = useState<string>('')

  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const marketId = params.id as string
      const foundMarket = mockMarkets.find(m => m.id === marketId)
      
      if (!foundMarket) {
        addNotification({
          type: 'error',
          title: 'Market not found',
          message: 'The requested market could not be found.',
        })
        router.push('/markets')
        return
      }
      
      setMarket(foundMarket)
      setChartData(mockChartData[marketId] || [])
      setRecentTrades(mockTrades.filter(t => t.marketId === marketId))
      setSelectedOutcome(foundMarket.outcomes[0]?.id || '')
      setIsLoading(false)
    }

    loadMarketData()
  }, [params.id, router, addNotification])

  const handleShare = () => {
    if (navigator.share && market) {
      navigator.share({
        title: market.question,
        text: market.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      addNotification({
        type: 'success',
        title: 'Link copied',
        message: 'Market link copied to clipboard',
      })
    }
  }

  const handleTrade = (outcomeId: string, type: 'buy' | 'sell') => {
    addNotification({
      type: 'info',
      title: 'Trading not available',
      message: 'Trading functionality will be available in the next version.',
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <MarketDetailSkeleton />
        </div>
      </Layout>
    )
  }

  if (!market) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Market not found</h1>
          <Button onClick={() => router.push('/markets')}>
            Back to Markets
          </Button>
        </div>
      </Layout>
    )
  }

  const status = getMarketStatus(market)
  const statusColor = getMarketStatusColor(status)

  return (
    <Layout>
      <div className="container py-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Markets
        </Button>

        {/* Market Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              {/* Category and status */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: market.category.color + '40',
                    color: market.category.color 
                  }}
                >
                  {market.category.name}
                </Badge>
                <Badge variant={status as any} className={statusColor}>
                  {status.replace('_', ' ')}
                </Badge>
                {market.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {market.trending && (
                  <Badge variant="secondary" className="text-orange-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>

              {/* Question */}
              <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                {market.question}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-lg mb-6">
                {market.description}
              </p>

              {/* Key info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTimeUntilClose(market.closingTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatLargeNumber(market.liquidity)} liquidity</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{formatLargeNumber(market.totalVolume)} volume</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created {formatDate(market.createdAt)}</span>
                </div>
              </div>

              {/* Tags */}
              {market.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {market.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 min-w-0 lg:min-w-48">
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Market
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on External Platform
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Outcomes Trading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {market.outcomes.map((outcome) => (
            <Card key={outcome.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{outcome.name}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(outcome.price)}</div>
                    <div className={cn(
                      "text-sm",
                      getPriceChangeColor(outcome.priceChange24h)
                    )}>
                      {outcome.priceChange24h > 0 ? '+' : ''}{formatPercentage(outcome.priceChange24h)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Probability</div>
                    <div className="font-medium">{formatPercentage(outcome.probability)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">24h Volume</div>
                    <div className="font-medium">{formatLargeNumber(outcome.volume24h)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleTrade(outcome.id, 'buy')}
                  >
                    Buy Yes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => handleTrade(outcome.id, 'sell')}
                  >
                    Buy No
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-8">
          <MarketChart 
            market={market}
            data={chartData}
            selectedOutcome={selectedOutcome}
            height={400}
          />
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="trades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trades">Recent Trades</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="info">Market Info</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          {/* Recent Trades */}
          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTrades.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent trades</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrades.slice(0, 10).map((trade) => {
                      const outcome = market.outcomes.find(o => o.id === trade.outcomeId)
                      return (
                        <div key={trade.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <Badge variant={trade.type === 'buy' ? 'success' : 'destructive'}>
                              {trade.type.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{outcome?.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {trade.shares} shares
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(trade.price)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(trade.timestamp)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules */}
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Resolution Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground mb-4">
                    This market will be resolved based on the following criteria:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p>{market.rules}</p>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          Important Notice
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Market resolution is final and cannot be changed once determined. 
                          Please read the rules carefully before trading.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Info */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Market ID</span>
                          <span className="font-mono">{market.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Creator</span>
                          <span>{market.creator}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{formatDateTime(market.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Closes</span>
                          <span>{formatDateTime(market.closingTime)}</span>
                        </div>
                        {market.resolutionTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Resolution</span>
                            <span>{formatDateTime(market.resolutionTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Trading Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Volume</span>
                          <span className="font-medium">{formatCurrency(market.totalVolume)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liquidity</span>
                          <span className="font-medium">{formatCurrency(market.liquidity)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price Range</span>
                          <span className="font-medium">
                            {formatCurrency(market.minPrice)} - {formatCurrency(market.maxPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Outcomes</span>
                          <span className="font-medium">{market.outcomes.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussion */}
          <TabsContent value="discussion">
            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Discussion features will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}