// src/components/market/market-card.tsx
'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Clock } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Market } from '@/types'

// -------- helpers --------
function formatCompact(n: number | undefined | null) {
  const v = Number(n ?? 0)
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return `${Math.round(v)}`
}

function hexToRgb(hex?: string) {
  if (!hex) return { r: 107, g: 114, b: 128 } // gray-500 fallback
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function rgba(hex: string | undefined, a: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// -------- component --------
type Props = {
  market: Market
  className?: string
  /** Optional layout hint used by pages: 'default' (grid card), 'compact' (list), or 'featured' (same as default). */
  variant?: 'default' | 'compact' | 'featured'
}

function MarketCardComponent({ market, className, variant = 'default' }: Props) {
  const href = `/markets/${market.id}`
  const isCompact = variant === 'compact'
  // 'featured' currently renders like 'default' intentionally

  const closesIn =
    market.closingTime
      ? formatDistanceToNow(new Date(market.closingTime), { addSuffix: false })
      : null

  // 24h volume (sum of outcome volume24h if present)
  const vol24h =
    Array.isArray(market.outcomes)
      ? market.outcomes.reduce((s, o) => s + (o.volume24h ?? 0), 0)
      : (market as any).volume24hr ?? 0

  const categoryColor = market.category?.color
  const categoryStyles: CSSProperties = {
    color: categoryColor || '#6B7280',
    backgroundColor: rgba(categoryColor, 0.12),
    borderColor: rgba(categoryColor, 0.35),
  }

  return (
    <Card className={cn('h-full bg-card/40', className)}>
      <CardHeader className={cn('space-y-2', isCompact && 'space-y-1')}>
        {/* Title first */}
        <h3
          className={cn(
            'font-semibold leading-snug line-clamp-2',
            isCompact ? 'text-base' : 'text-lg'
          )}
        >
          {market.question}
        </h3>

        {/* Colored category pill under the title */}
        {market.category?.name && (
          <span
            className="inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={categoryStyles}
            title={market.category.name}
          >
            {market.category.name}
          </span>
        )}

        {closesIn && (
          <div
            className={cn(
              'mt-1 flex items-center gap-2 text-muted-foreground',
              isCompact ? 'text-[13px]' : 'text-sm'
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Closes in {closesIn}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className={cn('space-y-4', isCompact && 'space-y-3')}>
        {/* Outcomes block intentionally removed to declutter */}

        <div className="h-px w-full bg-border/60" />

        <div className={cn('grid gap-3 text-sm', isCompact ? 'grid-cols-2' : 'grid-cols-3')}>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Liquidity</span>
            <span className="font-semibold">${formatCompact(market.liquidity)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Volume</span>
            <span className="font-semibold">{formatCompact(market.totalVolume)}</span>
          </div>
          {!isCompact && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-semibold">{formatCompact(vol24h)}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Buttons stacked: Trade on top, View Details below */}
      <CardFooter className={cn('flex flex-col gap-3', isCompact && 'gap-2')}>
        <Link
          href={href}
          className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
        >
          Trade Now
        </Link>
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'w-full'
          )}
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}

// Export BOTH ways to satisfy all imports
export { MarketCardComponent as MarketCard }
export default MarketCardComponent
