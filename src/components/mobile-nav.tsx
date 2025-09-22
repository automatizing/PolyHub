'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, TrendingUp, BarChart3, User, Settings, Info, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: TrendingUp },
  { name: 'Markets', href: '/markets', icon: BarChart3 },
  { name: 'Portfolio', href: '/portfolio', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'About', href: '/about', icon: Info },
]

export function MobileNav() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, user, isAuthenticated, logout } = useAppStore()

  const closeSidebar = () => setSidebarOpen(false)

  if (!sidebarOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 md:hidden"
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-64 bg-background border-r shadow-lg md:hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                P
              </div>
              <span className="font-bold text-xl">PolyHub</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          {/* User info */}
          {isAuthenticated && user && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href))
                
                return (
                  <Link key={item.name} href={item.href} onClick={closeSidebar}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Auth actions */}
          <div className="p-4 border-t">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                onClick={() => {
                  logout()
                  closeSidebar()
                }}
              >
                <X className="h-4 w-4" />
                Log out
              </Button>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" onClick={closeSidebar}>
                  Sign up
                </Button>
                <Button variant="outline" className="w-full" onClick={closeSidebar}>
                  Log in
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}