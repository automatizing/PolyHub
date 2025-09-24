// src/components/market/market-skeleton.tsx
'use client'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type WrapProps = { count?: number; className?: string }

function MarketSkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={cn('h-full bg-card/40 animate-pulse')}>
      <CardHeader className={cn(compact ? 'space-y-2' : 'space-y-3')}>
        <div className={cn('rounded bg-muted/30', compact ? 'h-5 w-2/3' : 'h-5 w-3/4')} />
        <div className="h-5 w-20 rounded-full bg-muted/20" />
        <div className="h-4 w-40 rounded bg-muted/20" />
      </CardHeader>

      <CardContent className={cn(compact ? 'space-y-3' : 'space-y-4')}>
        <div className="h-px w-full bg-border/60" />
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted/20" />
            <div className="h-5 w-14 rounded bg-muted/30" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted/20" />
            <div className="h-5 w-14 rounded bg-muted/30" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-muted/20" />
            <div className="h-5 w-14 rounded bg-muted/30" />
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn('flex flex-col', compact ? 'gap-2' : 'gap-3')}>
        <div className="h-11 w-full rounded-md bg-muted/30" />
        <div className="h-11 w-full rounded-md border border-muted/30" />
      </CardFooter>
    </Card>
  )
}

/** Grid version used in most sections */
export function MarketGridSkeleton({ count = 6, className }: WrapProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <MarketSkeletonCard key={i} />
      ))}
    </div>
  )
}

/** List version used when viewMode === 'list' */
export function MarketListSkeleton({ count = 6, className }: WrapProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <MarketSkeletonCard key={i} compact />
      ))}
    </div>
  )
}

/** Default to grid so `import MarketSkeleton from ...` also works */
export default MarketGridSkeleton
