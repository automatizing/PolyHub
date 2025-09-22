'use client'

import React from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileNav } from '@/components/mobile-nav'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
  showFooter?: boolean
}

export function Layout({ children, className, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main className={cn('flex-1', className)}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}