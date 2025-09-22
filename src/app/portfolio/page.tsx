'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Clock, 
  Eye,
  ExternalLink,
  AlertCircle,
  Plus,
  Filter
} from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app'
import { Position, Trade, Market } from '@/types'
import { mockUser, mockPositions, mockTrades, mockMarkets } from '@/lib/mock-data'
import { 
  formatCurrency, 
  formatPercentage, 
  formatDateTime,
  formatTimeUntilClose,
  getMarketStatus,
  getPriceChangeColor,
  cn 
} from '@/lib/utils'

export default function PortfolioPage() {
  const { user, isAuthenticated } = useAppStore()
  const [positions, setPositions] = useState<Position[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'closed'>('all')

  // Use mock user if not authenticated
  const currentUser = user || mockUser

  useEffect(() => {
    const loadPortfolioData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setPositions(mockPositions)
      setTrades(mockTrades)
      setMarkets(mockMarkets)
      setIsLoading(false)
    }

    loadPortfolioData()
  }, [])

  // Calculate portfolio stats
  const portfolioStats = {
    totalValue: positions.reduce((sum, pos) => sum + pos.currentValue, 0),
    totalPnl: positions.reduce((sum, pos) => sum + pos.pnl, 0),
    totalPnlPercentage: positions.length > 0 
      ? (positions.reduce((sum, pos) => sum + pos.pnl, 0) / positions.reduce((sum, pos) => sum + (pos.currentValue - pos.pnl), 0)) * 100
      : 0,
    activePositions: positions.length,
    marketsTraded: new Set(trades.map(t => t.marketId)).size,
  }

  // Filter positions based on market status
  const filteredPositions = positions.filter(position => {
    const market = markets.find(m => m.id === position.marketId)
    if (!market) return false
    
    const status = getMarketStatus(market)
    
    switch (selectedFilter) {
      case 'active':
        return status === 'open' || status === 'closing_soon'
      case 'closed':
        return status === 'closed' || status === 'resolved'
      default:
        return true
    }
  })

  // Recent trades (last 10)
  const recentTrades = trades
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to view your portfolio.
              </p>
              <div className="flex flex-col gap-2">
                <Button className="w-full">Sign In</Button>
                <Button variant="outline" className="w-full">Create Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">
              Track your positions and trading performance
            </p>
          </div>
          <Button asChild>
            <Link href="/markets">
              <Plus className="h-4 w-4 mr-2" />
              Find Markets
            </Link>
          </Button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioStats.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    getPriceChangeColor(portfolioStats.totalPnl)
                  )}>
                    {portfolioStats.totalPnl >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalPnl)}
                  </p>
                  <p className={cn(
                    "text-sm",
                    getPriceChangeColor(portfolioStats.totalPnl)
                  )}>
                    {formatPercentage(portfolioStats.totalPnlPercentage)}
                  </p>
                </div>
                {portfolioStats.totalPnl >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold">{portfolioStats.activePositions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Markets Traded</p>
                  <p className="text-2xl font-bold">{portfolioStats.marketsTraded}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Positions */}
          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Positions</CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPositions.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No positions found</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedFilter === 'all' 
                        ? "You don't have any positions yet."
                        : `No ${selectedFilter} positions found.`
                      }
                    </p>
                    <Button asChild>
                      <Link href="/markets">Browse Markets</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPositions.map((position) => {
                      const market = markets.find(m => m.id === position.marketId)
                      const outcome = market?.outcomes.find(o => o.id === position.outcomeId)
                      
                      if (!market || !outcome) return null

                      const status = getMarketStatus(market)
                      
                      return (
                        <div key={position.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" style={{ color: market.category.color }}>
                                  {market.category.name}
                                </Badge>
                                <Badge variant={status === 'open' || status === 'closing_soon' ? 'default' : 'secondary'}>
                                  {status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <Link 
                                href={`/markets/${market.id}`}
                                className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
                              >
                                {market.question}
                              </Link>
                              
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>Outcome: <strong>{outcome.name}</strong></span>
                                <span>Shares: <strong>{position.shares}</strong></span>
                                <span>Avg Price: <strong>{formatCurrency(position.avgPrice)}</strong></span>
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeUntilClose(market.closingTime)}</span>
                              </div>
                            </div>

                            <div className="text-right space-y-1">
                              <div className="text-lg font-bold">
                                {formatCurrency(position.currentValue)}
                              </div>
                              <div className={cn(
                                "text-sm font-medium",
                                getPriceChangeColor(position.pnl)
                              )}>
                                {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                                <span className="ml-1">
                                  ({formatPercentage(position.pnlPercentage)})
                                </span>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/markets/${market.id}`}>
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Market
                                </Link>
                              </Button>
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

          {/* Trade History */}
          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTrades.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start trading to see your transaction history here.
                    </p>
                    <Button asChild>
                      <Link href="/markets">Start Trading</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrades.map((trade) => {
                      const market = markets.find(m => m.id === trade.marketId)
                      const outcome = market?.outcomes.find(o => o.id === trade.outcomeId)
                      
                      if (!market || !outcome) return null

                      return (
                        <div key={trade.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <Badge variant={trade.type === 'buy' ? 'success' : 'destructive'}>
                              {trade.type.toUpperCase()}
                            </Badge>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{market.question}</p>
                              <p className="text-sm text-muted-foreground">
                                {outcome.name} • {trade.shares} shares @ {formatCurrency(trade.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(trade.totalAmount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(trade.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    
                    {trades.length > 10 && (
                      <div className="text-center pt-4">
                        <Button variant="outline">Load More Trades</Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-medium">Trading Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Trades</span>
                        <span className="font-medium">{trades.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="font-medium">{(currentUser.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Trade Size</span>
                        <span className="font-medium">
                          {formatCurrency(trades.length > 0 ? trades.reduce((sum, t) => sum + t.totalAmount, 0) / trades.length : 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Volume</span>
                        <span className="font-medium">{formatCurrency(currentUser.totalVolume)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Account Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">{formatDateTime(currentUser.joinedAt).split(' at')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Markets Traded</span>
                        <span className="font-medium">{currentUser.marketsTraded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Positions</span>
                        <span className="font-medium">{positions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lifetime P&L</span>
                        <span className={cn(
                          "font-medium",
                          getPriceChangeColor(currentUser.totalPnl)
                        )}>
                          {currentUser.totalPnl >= 0 ? '+' : ''}{formatCurrency(currentUser.totalPnl)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Chart</h4>
                  <p className="text-sm text-muted-foreground">
                    Interactive performance charts will be available in a future update.
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