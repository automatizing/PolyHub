import React from 'react'
import Link from 'next/link'
import { Clock, TrendingUp, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Market } from '@/types'
import { cn, formatCurrency, formatLargeNumber, formatTimeUntilClose, getMarketStatus, getMarketStatusColor, getPriceChangeColor } from '@/lib/utils'

interface MarketCardProps {
  market: Market
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  className?: string
}

export function MarketCard({ 
  market, 
  variant = 'default', 
  showActions = true,
  className 
}: MarketCardProps) {
  const status = getMarketStatus(market)
  const statusColor = getMarketStatusColor(status)
  
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <Card className={cn(
      'market-card group relative overflow-hidden',
      isFeatured && 'border-primary/20 bg-gradient-to-br from-primary/5 to-background',
      className
    )}>
      {/* Trending indicator - only badge we keep */}
      {market.trending && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <TrendingUp className="h-3 w-3" />
            {!isCompact && <span className="font-medium">Trending</span>}
          </div>
        </div>
      )}

      <CardHeader className={cn(
        'pb-3',
        isCompact ? 'p-4' : 'p-6',
        // Reduced top padding since we removed the right badges
        market.trending && !isCompact ? 'pt-10' : 'pt-6'
      )}>
        {/* Question title */}
        <Link href={`/markets/${market.id}`} className="group">
          <h3 className={cn(
            'font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-0.5',
            isCompact ? 'text-sm' : 'text-base'
          )}>
            {market.question}
          </h3>
        </Link>

        {/* Category badge - closer to title and aligned left */}
        <div className="mb-5 -ml-1">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              borderColor: market.category.color + '40',
              color: market.category.color 
            }}
          >
            {market.category.name}
          </Badge>
        </div>

        {/* Time until close */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTimeUntilClose(market.closingTime)}</span>
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-4', isCompact ? 'p-4 pt-0' : 'p-6 pt-0')}>
        {/* Outcomes */}
        <div className="space-y-2">
          {market.outcomes.slice(0, isCompact ? 2 : market.outcomes.length).map((outcome) => (
            <div key={outcome.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={cn(
                  'font-medium truncate',
                  isCompact ? 'text-sm' : 'text-base'
                )}>
                  {outcome.name}
                </span>
                <span className={cn(
                  'text-xs',
                  getPriceChangeColor(outcome.priceChange24h)
                )}>
                  {outcome.priceChange24h > 0 ? '+' : ''}{(outcome.priceChange24h * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-right">
                <div className={cn(
                  'font-bold',
                  isCompact ? 'text-sm' : 'text-base'
                )}>
                  {formatCurrency(outcome.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(outcome.probability * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market stats */}
        <div className={cn(
          'grid gap-4 pt-3 border-t',
          isCompact ? 'grid-cols-2' : 'grid-cols-3'
        )}>
          <div className="text-center">
            <div className={cn(
              'font-semibold',
              isCompact ? 'text-sm' : 'text-base'
            )}>
              {formatLargeNumber(market.liquidity)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              Liquidity
            </div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              'font-semibold',
              isCompact ? 'text-sm' : 'text-base'
            )}>
              {formatLargeNumber(market.totalVolume)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Volume
            </div>
          </div>

          {!isCompact && (
            <div className="text-center">
              <div className="text-sm font-semibold">
                {market.outcomes.reduce((sum, outcome) => sum + outcome.volume24h, 0) > 1000 
                  ? formatLargeNumber(market.outcomes.reduce((sum, outcome) => sum + outcome.volume24h, 0))
                  : formatCurrency(market.outcomes.reduce((sum, outcome) => sum + outcome.volume24h, 0))
                }
              </div>
              <div className="text-xs text-muted-foreground">
                24h Volume
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && !isCompact && (
          <div className="flex gap-2 pt-3">
            <Link href={`/markets/${market.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            <Button size="sm" className="flex-1">
              Trade Now
            </Button>
          </div>
        )}

        {/* Compact action */}
        {showActions && isCompact && (
          <Link href={`/markets/${market.id}`} className="w-full">
            <Button size="sm" className="w-full">
              Trade
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
