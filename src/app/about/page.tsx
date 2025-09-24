'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Zap, 
  Globe, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Mail,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Markets',
      description: 'Trade on live prediction markets with instant price updates and real-time data feeds.',
    },
    {
      icon: Shield,
      title: 'Secure Trading',
      description: 'Your funds and trades are protected by industry-leading security measures and transparent protocols.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a vibrant community of traders, researchers, and forecasters from around the world.',
    },
    // CHANGED: Fast Execution -> Live Data Feeds (view-only)
    {
      icon: Zap,
      title: 'Live Data Feeds',
      description: 'We aggregate markets from multiple platforms and update prices and events in real time—view only; no trade execution.',
    },
    {
      icon: Globe,
      title: 'Global Events',
      description: 'Predict outcomes on events across politics, sports, technology, entertainment, and more.',
    },
    {
      icon: BookOpen,
      title: 'Educational Resources',
      description: 'Learn about prediction markets with our comprehensive guides and trading tutorials.',
    },
  ]

  const riskFactors = [
    'Prediction markets involve financial risk and you may lose money',
    'Market outcomes are uncertain and past performance does not guarantee future results',
    'Liquidity may vary between markets and could affect your ability to trade',
    'Market resolution depends on external events and data sources',
    'Regulatory changes may affect market availability in your jurisdiction',
  ]

  const disclaimers = [
    {
      title: 'Not Financial Advice',
      content: 'PolyHub provides a platform for prediction markets but does not provide financial advice. All trading decisions are your own responsibility.',
    },
    {
      title: 'Market Resolution',
      content: 'Markets are resolved based on predetermined criteria and reliable data sources. Resolution decisions are final.',
    },
    // UPDATED previously per your request
    {
      title: 'Information Hub (Not a Trading Platform)',
      content:
        'PolyHub aggregates and displays prediction-market data from third-party venues in real time. We do not execute trades, hold funds, or custody assets. For any trading activity, please use the original market platform.',
    },
    {
      title: 'Service Availability',
      content: 'While we strive for 100% uptime, the platform may occasionally be unavailable due to maintenance or technical issues.',
    },
  ]

  return (
    <Layout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About PolyHub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            PolyHub is the next-generation prediction markets platform that brings together traders, 
            researchers, and forecasters to predict real-world events with unprecedented accuracy and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/markets">
              <Button size="lg">
                Start Trading
              </Button>
            </Link>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                  We believe that prediction markets are the most effective way to aggregate information 
                  and forecast future events. Our mission is to democratize access to these powerful tools, 
                  creating a transparent, efficient, and accessible platform where anyone can participate 
                  in the wisdom of crowds.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Prediction Markets Work</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prediction markets allow you to trade on the likelihood of future events, 
              creating prices that reflect collective wisdom about probable outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Choose a Market</h3>
                <p className="text-muted-foreground">
                  Browse our markets covering politics, sports, technology, and more. 
                  Each market asks a specific question about a future event.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Make Your Prediction</h3>
                <p className="text-muted-foreground">
                  Buy shares representing different outcomes. Prices reflect the market's 
                  collective belief about the likelihood of each outcome.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Earn Returns</h3>
                <p className="text-muted-foreground">
                  When the event occurs, markets are resolved and winning shares 
                  pay out based on the actual outcome.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              PolyHub offers cutting-edge features designed to provide the best prediction 
              markets experience for both novice and experienced traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Risk Disclosure */}
        <div className="mb-16">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertTriangle className="h-5 w-5" />
                Risk Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Trading on prediction markets involves risk. Please consider the following risk factors 
                before participating:
              </p>
              <ul className="space-y-2">
                {riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Only trade with funds you can afford to lose. Past performance does not guarantee future results.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimers */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Important Disclaimers</h2>
            <p className="text-muted-foreground">
              Please read these important disclaimers before using the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disclaimers.map((disclaimer, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    {disclaimer.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{disclaimer.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Explore?</h2>
              <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                Start monitoring prediction markets today. Browse our comprehensive database 
                of markets from multiple platforms and stay informed about market trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/markets">
                  <Button size="lg" variant="secondary">
                    Browse Markets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
