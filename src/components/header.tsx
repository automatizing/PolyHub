'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, TrendingUp, BarChart3, Info, Coins } from 'lucide-react'
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
  // New nav item per request (opens about:blank)
  { name: 'Contact Address', href: 'about:blank', icon: Coins, external: true },
]

export function Header() {
  const pathname = usePathname()
  const { setSidebarOpen } = useAppStore()
  const { searchQuery, setSearchQuery } = useMarketStore()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/markets?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Left: Mobile menu + Brand + Desktop nav */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile menu */}
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
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              const buttonEl = (
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn('gap-2', isActive && 'bg-secondary text-secondary-foreground')}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              )

              return item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {buttonEl}
                </a>
              ) : (
                <Link key={item.name} href={item.href}>
                  {buttonEl}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Search + Theme toggle (CA button removed) */}
        <div className="flex flex-1 items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
