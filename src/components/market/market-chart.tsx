'use client'

import React, { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartDataPoint, ChartTimeframe, Market } from '@/types'
import { formatCurrency, formatDate, formatPercentage, cn } from '@/lib/utils'

interface MarketChartProps {
  market: Market
  data: ChartDataPoint[]
  selectedOutcome?: string
  height?: number
  interactive?: boolean
  className?: string
}

const timeframes: { label: string; value: ChartTimeframe }[] = [
  { label: '1H', value: '1H' },
  { label: '4H', value: '4H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: 'ALL', value: 'ALL' },
]

const chartTypes = [
  { label: 'Price', value: 'price', icon: Activity },
  { label: 'Volume', value: 'volume', icon: BarChart3 },
]

export function MarketChart({ 
  market, 
  data, 
  selectedOutcome,
  height = 400,
  interactive = true,
  className 
}: MarketChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartTimeframe>('1D')
  const [chartType, setChartType] = useState<'price' | 'volume'>('price')

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (!data.length) return []
    
    const now = new Date()
    let startDate: Date

    switch (selectedTimeframe) {
      case '1H':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '4H':
        startDate = new Date(now.getTime() - 4 * 60 * 60 * 1000)
        break
      case '1D':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        return data
    }

    return data.filter(point => new Date(point.timestamp) >= startDate)
  }, [data, selectedTimeframe])

  // Calculate price change
  const priceChange = useMemo(() => {
    if (filteredData.length < 2) return { value: 0, percentage: 0 }
    
    const firstPrice = filteredData[0].price
    const lastPrice = filteredData[filteredData.length - 1].price
    const change = lastPrice - firstPrice
    const percentage = (change / firstPrice) * 100

    return { value: change, percentage }
  }, [filteredData])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">
            {formatDate(label, 'MMM d, yyyy HH:mm')}
          </p>
          {chartType === 'price' ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Price: </span>
              <span className="font-medium">{formatCurrency(data.price)}</span>
            </p>
          ) : (
            <p className="text-sm">
              <span className="text-muted-foreground">Volume: </span>
              <span className="font-medium">{formatCurrency(data.volume)}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Determine chart color based on price trend
  const chartColor = priceChange.value >= 0 ? '#10B981' : '#EF4444'

  if (!filteredData.length) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No chart data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Price Chart</CardTitle>
            {selectedOutcome && (
              <p className="text-sm text-muted-foreground mt-1">
                Outcome: {market.outcomes.find(o => o.id === selectedOutcome)?.name || 'Unknown'}
              </p>
            )}
          </div>
          
          {interactive && (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Chart type selector */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                {chartTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setChartType(type.value as any)}
                  >
                    <type.icon className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
              
              {/* Timeframe selector */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                {timeframes.map((timeframe) => (
                  <Button
                    key={timeframe.value}
                    variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setSelectedTimeframe(timeframe.value)}
                  >
                    {timeframe.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price change indicator */}
        {chartType === 'price' && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {priceChange.value >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                priceChange.value >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {priceChange.value >= 0 ? '+' : ''}{formatCurrency(priceChange.value)}
              </span>
            </div>
            <Badge 
              variant={priceChange.value >= 0 ? "success" : "destructive"}
              className="text-xs"
            >
              {formatPercentage(priceChange.percentage)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {selectedTimeframe}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'price' ? (
              <AreaChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => formatDate(value, selectedTimeframe === '1H' || selectedTimeframe === '4H' ? 'HH:mm' : 'MMM d')}
                  className="text-xs text-muted-foreground"
                />
                <YAxis 
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-xs text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: chartColor }}
                />
              </AreaChart>
            ) : (
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => formatDate(value, selectedTimeframe === '1H' || selectedTimeframe === '4H' ? 'HH:mm' : 'MMM d')}
                  className="text-xs text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-xs text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="volume"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm font-medium">
              {chartType === 'price' ? 'Current Price' : 'Total Volume'}
            </div>
            <div className="text-lg font-bold">
              {chartType === 'price' 
                ? formatCurrency(filteredData[filteredData.length - 1]?.price || 0)
                : formatCurrency(filteredData.reduce((sum, d) => sum + d.volume, 0))
              }
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">
              {chartType === 'price' ? 'High' : 'Avg Volume'}
            </div>
            <div className="text-lg font-bold">
              {chartType === 'price'
                ? formatCurrency(Math.max(...filteredData.map(d => d.price)))
                : formatCurrency(filteredData.reduce((sum, d) => sum + d.volume, 0) / filteredData.length)
              }
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">
              {chartType === 'price' ? 'Low' : 'Peak Volume'}
            </div>
            <div className="text-lg font-bold">
              {chartType === 'price'
                ? formatCurrency(Math.min(...filteredData.map(d => d.price)))
                : formatCurrency(Math.max(...filteredData.map(d => d.volume)))
              }
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">Data Points</div>
            <div className="text-lg font-bold">{filteredData.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}