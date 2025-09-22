import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MarketCardSkeletonProps {
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function MarketCardSkeleton({ variant = 'default', className }: MarketCardSkeletonProps) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <Card className={cn(
      'animate-pulse',
      isFeatured && 'border-primary/20',
      className
    )}>
      <CardHeader className={cn(
        'pb-3',
        isCompact ? 'p-4' : 'p-6'
      )}>
        {/* Category and status badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>

        {/* Question title */}
        <div className="space-y-2">
          <Skeleton className={cn(
            'w-full',
            isCompact ? 'h-4' : 'h-5'
          )} />
          <Skeleton className={cn(
            'w-3/4',
            isCompact ? 'h-4' : 'h-5'
          )} />
        </div>

        {/* Time until close */}
        <div className="flex items-center gap-1 mt-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-4', isCompact ? 'p-4 pt-0' : 'p-6 pt-0')}>
        {/* Outcomes */}
        <div className="space-y-2">
          {Array.from({ length: isCompact ? 2 : 2 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className={cn(
                  'w-16',
                  isCompact ? 'h-4' : 'h-5'
                )} />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className={cn(
                  'w-12 ml-auto',
                  isCompact ? 'h-4' : 'h-5'
                )} />
                <Skeleton className="h-3 w-8 ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Market stats */}
        <div className={cn(
          'grid gap-4 pt-3 border-t',
          isCompact ? 'grid-cols-2' : 'grid-cols-3'
        )}>
          <div className="text-center space-y-1">
            <Skeleton className={cn(
              'mx-auto',
              isCompact ? 'h-4 w-12' : 'h-5 w-16'
            )} />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
          
          <div className="text-center space-y-1">
            <Skeleton className={cn(
              'mx-auto',
              isCompact ? 'h-4 w-12' : 'h-5 w-16'
            )} />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>

          {!isCompact && (
            <div className="text-center space-y-1">
              <Skeleton className="h-5 w-16 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          )}
        </div>

        {/* Actions */}
        {!isCompact && (
          <div className="flex gap-2 pt-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        )}

        {isCompact && (
          <Skeleton className="h-9 w-full" />
        )}
      </CardContent>
    </Card>
  )
}

interface MarketListSkeletonProps {
  count?: number
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function MarketListSkeleton({ count = 6, variant = 'default', className }: MarketListSkeletonProps) {
  return (
    <div className={cn(
      'grid gap-6',
      variant === 'compact' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <MarketCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  )
}

export function MarketDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>

      {/* Tabs content */}
      <div className="space-y-4">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-20" />
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = 400, className }: { height?: number; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height }} />
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}