'use client'

import React from 'react'
import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Layout } from '@/components/layout'

export default function NotFound() {
  return (
    <Layout showFooter={false}>
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">404</h1>
            <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link href="/markets" className="w-full">
                <Button variant="ghost" className="w-full">
                  Browse Markets
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}