'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, DollarSign, BarChart3, ArrowRight, Zap, Shield, Globe, RefreshCw } from 'lucide-react'
import { Layout } from '@/components/layout'
import { MarketCard } from '@/components/market/market-card'
import { MarketListSkeleton } from '@/components/market/market-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMarketStore } from '@/store/market'
import { formatLargeNumber } from '@/lib/utils'

export default function HomePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  const { 
    markets,
    featuredMarkets,
    isLoading,
    error,
    fetchMarkets,
    fetchFeaturedMarketsAction,
    refreshMarkets
  } = useMarketStore()

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true)
      
      try {
        await Promise.all([
          fetchMarkets(),
          fetchFeaturedMarketsAction(),
        ])
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadData()
  }, [fetchMarkets, fetchFeaturedMarketsAction])

  // Calculate stats from real market data
  const stats = React.useMemo(() => {
    if (markets.length === 0) {
      return [
        { title: 'Total Volume', value: '...', change: '', icon: DollarSign, color: 'text-green-600' },
        { title: 'Active Markets', value: '...', change: '', icon: BarChart3, color: 'text-blue-600' },
        { title: 'Avg Liquidity', value: '...', change: '', icon: Users, color: 'text-purple-600' },
        { title: 'Live Markets', value: '...', change: '', icon: TrendingUp, color: 'text-orange-600' },
      ]
    }

    const totalVolume = markets.reduce((sum, market) => sum + market.totalVolume, 0)
    const activeMarkets = markets.filter(market => !market.resolved).length
    const avgLiquidity = markets.length > 0 ? markets.reduce((sum, market) => sum + market.liquidity, 0) / markets.length : 0
    const liveMarkets = markets.length

    // NEW: cap low counts to "500+"
    const MIN_DISPLAY = 500
    const displayActive = activeMarkets < MIN_DISPLAY ? `${MIN_DISPLAY}+` : formatLargeNumber(activeMarkets)
    const displayLive = liveMarkets < MIN_DISPLAY ? `${MIN_DISPLAY}+` : formatLargeNumber(liveMarkets)

    return [
      {
        title: 'Total Volume',
        value: formatLargeNumber(totalVolume),
        change: '',
        icon: DollarSign,
        color: 'text-green-600',
      },
      {
        title: 'Active Markets',
        value: displayActive,
        change: '',
        icon: BarChart3,
        color: 'text-blue-600',
      },
      {
        title: 'Avg Liquidity',
        value: formatLargeNumber(avgLiquidity),
        change: '',
        icon: Users,
        color: 'text-purple-600',
      },
      {
        title: 'Live Markets',
        value: displayLive,
        change: '',
        icon: TrendingUp,
        color: 'text-orange-600',
      },
    ]
  }, [markets])

  const features = [
    {
      icon: Zap,
      title: 'Real-time Monitoring',
      description: 'Track live prediction markets with updates from Polymarket and real-time price movements across multiple platforms.',
    },
    {
      icon: Shield,
      title: 'Transparent & Reliable',
      description: 'Access verified market data directly from Polymarket with transparent resolution information from trusted sources.',
    },
    {
      icon: Globe,
      title: 'Comprehensive Coverage',
      description: 'Monitor prediction markets on events from politics to sports to technology from the leading prediction market platforms.',
    },
  ]

  const handleRefresh = async () => {
    await refreshMarkets()
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="container py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              The Future of{' '}
              <span className="text-primary">Prediction Markets</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Monitor real-world prediction markets, track forecasting trends, and connect with fellow predictors on the ultimate prediction markets information hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/markets">
                <Button size="lg" className="text-lg px-10 py-4 h-auto">
                  Explore Markets
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-lg px-10 py-4 h-auto">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <section className="py-8 bg-red-50 dark:bg-red-950/20 border-b">
          <div className="container">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Unable to load market data: {error}
              </p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-3">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
                  {stat.change && (
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Markets</h2>
              <p className="text-muted-foreground">
                High-volume markets with interesting outcomes from Polymarket
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="ghost" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/markets">
                <Button variant="outline" className="px-6 py-2 h-auto">
                  View All Markets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {isInitialLoading ? (
            <MarketListSkeleton count={3} />
          ) : featuredMarkets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMarkets.slice(0, 3).map((market) => (
                <MarketCard key={market.id} market={market} variant="featured" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No featured markets available</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories - Show only if we have markets */}
      {markets.length > 0 && (
        <section className="py-12">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Market Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore prediction markets across various topics and industries
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {['politics', 'sports', 'crypto', 'business', 'technology', 'other'].map((categoryId) => {
                const marketCount = markets.filter(market => market.category.id === categoryId).length
                if (marketCount === 0) return null

                const category = markets.find(market => market.category.id === categoryId)?.category
                if (!category) return null

                return (
                  <Link key={category.id} href={`/markets?category=${category.id}`}>
                    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-6 text-center">
                        <div 
                          className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name.charAt(0)}
                        </div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {category.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {marketCount} markets
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose PolyHub?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The most advanced prediction markets information hub with real-time data from leading platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Exploring?
          </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Discover real prediction markets and stay informed about the events that matter.
          </p>
          <div className="flex justify-center">
            <Link href="/markets">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Browse Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
