'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, TrendingUp, BarChart3, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAppStore } from '@/store/app'
import { useMarketStore } from '@/store/market'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: TrendingUp },
  { name: 'Markets', href: '/markets', icon: BarChart3 },
  { name: 'About', href: '/about', icon: Info },
]

export function Header() {
  const pathname = usePathname()
  const { setSidebarOpen } = useAppStore()
  const { searchQuery, setSearchQuery } = useMarketStore()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Search functionality will be handled by the market store
    // Navigation to markets page with search query
    if (searchQuery.trim()) {
      window.location.href = `/markets?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              P
            </div>
            <span className="font-bold text-xl">PolyHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </form>
        </div>

        {/* Right side - CA button and Theme toggle */}
        <div className="flex items-center gap-2">
          {/* CA Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('about:blank', '_blank')}
            className="px-3 py-1.5 text-sm"
          >
            CA
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}