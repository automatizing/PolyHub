// app/api/markets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { Market, MarketCategory } from '@/types'

// --------------- Tunables ---------------
// Cache
const CACHE_DURATION_MS = 60 * 1000

// Fetch sizing (balanced to get >= limit without hammering API)
const EVENTS_PAGE_SIZE = 100               // one page is usually enough
const EVENT_DETAIL_LIMIT = 40              // at most this many event-detail fetches
const MARKETS_PAGE_SIZE = 100              // page size for markets
const MARKETS_MAX_PAGES = 5                // safety cap (100 * 5 = 500)
// Delay between batches to be polite to upstream
const REQUEST_DELAY_MS = 150

// --------------- Cache ---------------
let marketCache:
  | {
      data: Market[]
      timestamp: number
      key: string
    }
  | null = null

// --------------- Upstream payload shapes (subset) ---------------
type MarketOutcome = {
  id: string
  name: string
  price: number
  probability: number
  volume24h: number
  priceChange24h: number
}

type PolymarketMarket = {
  id: string
  question: string
  description?: string
  outcomes: string // JSON string array
  outcomePrices: string // JSON string array of numbers
  volume?: string
  volumeNum?: number
  liquidity?: string
  liquidityNum?: number
  volume24hr?: number
  endDate?: string
  startDate?: string
  active?: boolean
  closed?: boolean
  featured?: boolean
  new?: boolean
  tags?: Array<{ label: string; slug: string }>
  categories?: Array<{ label: string; slug: string }>
  createdAt?: string
  // present on /markets items, helps skip duplicates with events
  events?: Array<{ id: string; title: string; slug: string }>
}

type PolymarketEvent = {
  id: string
  title: string
  slug?: string
  description?: string
  active?: boolean
  closed?: boolean
  volume?: number
  volume24hr?: number
  liquidity?: number
  createdAt?: string
  endDate?: string
  // only on event detail:
  markets?: Array<
    Pick<
      PolymarketMarket,
      | 'id'
      | 'question'
      | 'description'
      | 'outcomes'
      | 'outcomePrices'
      | 'volume'
      | 'volumeNum'
      | 'liquidity'
      | 'liquidityNum'
      | 'volume24hr'
      | 'endDate'
      | 'startDate'
      | 'active'
      | 'closed'
      | 'createdAt'
    >
  >
  tags?: Array<{ label: string; slug: string }>
  categories?: Array<{ label: string; slug: string }>
}

// --------------- Helpers ---------------
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

function parseOutcomesAndPrices(outcomes: string, outcomePrices: string): MarketOutcome[] {
  try {
    const names: string[] = JSON.parse(outcomes || '["Yes","No"]')
    const prices: number[] = JSON.parse(outcomePrices || '[0.5,0.5]')
    return names.map((name, i) => {
      const p = Number(prices[i] ?? 0.5) || 0.5
      return {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        price: p,
        probability: p,
        volume24h: 0,
        priceChange24h: (Math.random() - 0.5) * 0.1,
      }
    })
  } catch {
    // binary fallback
    return [
      { id: 'yes', name: 'Yes', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
      { id: 'no', name: 'No', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
    ]
  }
}

function getCategoryFromLabels(title: string, labels: string[]): MarketCategory {
  const t = title.toLowerCase()
  const has = (arr: string[]) => arr.some((v) => labels.includes(v))

  if (has(['politics', 'election']) || /president|election|primary|senate|vote/.test(t)) {
    return { id: 'politics', name: 'Politics', slug: 'politics', description: 'Elections and political events', color: '#3B82F6', icon: 'Vote' } as MarketCategory
  }
  if (has(['sports', 'nfl', 'nba']) || /sport|super bowl|nfl|nba|mlb|nhl/.test(t)) {
    return { id: 'sports', name: 'Sports', slug: 'sports', description: 'Sports predictions and outcomes', color: '#EF4444', icon: 'Trophy' } as MarketCategory
  }
  if (has(['crypto', 'bitcoin', 'ethereum']) || /bitcoin|crypto|eth|btc/.test(t)) {
    return { id: 'crypto', name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency and blockchain', color: '#F59E0B', icon: 'Coins' } as MarketCategory
  }
  if (has(['business', 'economy']) || /fed|gdp|inflation|stocks|nasdaq|recession/.test(t)) {
    return { id: 'business', name: 'Business', slug: 'business', description: 'Corporate and economic events', color: '#10B981', icon: 'Building' } as MarketCategory
  }
  if (has(['technology', 'tech']) || /ai|tech|tiktok|google|microsoft|openai/.test(t)) {
    return { id: 'technology', name: 'Technology', slug: 'technology', description: 'Technology and innovation', color: '#8B5CF6', icon: 'Cpu' } as MarketCategory
  }
  return { id: 'world', name: 'World', slug: 'world', description: 'Global news and events', color: '#6B7280', icon: 'Globe' } as MarketCategory
}

function transformMarket(m: PolymarketMarket): Market {
  const labels = [
    ...(m.tags?.map((t) => t.label.toLowerCase()) ?? []),
    ...(m.categories?.map((c) => c.label.toLowerCase()) ?? []),
  ]
  const category = getCategoryFromLabels(m.question, labels)
  const outcomes = parseOutcomesAndPrices(m.outcomes, m.outcomePrices)
  const vol24 = m.volume24hr || 0
  outcomes.forEach((o) => (o.volume24h = vol24 / (outcomes.length || 1)))

  return {
    id: m.id,
    question: m.question,
    description: m.description || m.question,
    category,
    outcomes,
    liquidity: m.liquidityNum ?? Number(m.liquidity ?? 0),
    totalVolume: m.volumeNum ?? Number(m.volume ?? 0),
    createdAt: m.createdAt,
    closingTime: m.endDate,
    resolved: !!m.closed,
    featured: m.featured ?? false,
    trending: m.new ?? false,
    tags: m.tags?.map((t) => t.label) ?? [],
    creator: 'Polymarket',
    rules: 'Market resolves based on Polymarket resolution criteria.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: outcomes.reduce<Record<string, number>>((acc, o) => {
      acc[o.id] = o.price
      return acc
    }, {}),
  } as unknown as Market
}

function transformEventToMarket(e: PolymarketEvent): Market {
  const labels = [
    ...(e.tags?.map((t) => t.label.toLowerCase()) ?? []),
    ...(e.categories?.map((c) => c.label.toLowerCase()) ?? []),
  ]
  const category = getCategoryFromLabels(e.title, labels)

  // Base outcomes: try to infer from first event market if present, otherwise binary fallback
  let outcomes: MarketOutcome[] = [
    { id: 'yes', name: 'Yes', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
    { id: 'no', name: 'No', price: 0.5, probability: 0.5, volume24h: 0, priceChange24h: 0 },
  ]
  if (Array.isArray(e.markets) && e.markets.length) {
    // pick highest volume sub-market
    const primary = e.markets.reduce((hi, cur) => {
      const cv = cur.volumeNum ?? Number(cur.volume ?? 0)
      const hv = hi.volumeNum ?? Number(hi.volume ?? 0)
      return cv > hv ? cur : hi
    })
    outcomes = parseOutcomesAndPrices(primary.outcomes, primary.outcomePrices)
    const vol24 = e.volume24hr || 0
    outcomes.forEach((o) => (o.volume24h = vol24 / (outcomes.length || 1)))
  }

  const totalEventVolume =
    e.volume ??
    (Array.isArray(e.markets)
      ? e.markets.reduce((sum, m) => sum + (m.volumeNum ?? Number(m.volume ?? 0)), 0)
      : 0)

  const totalEventLiquidity =
    e.liquidity ??
    (Array.isArray(e.markets)
      ? e.markets.reduce((sum, m) => sum + (m.liquidityNum ?? Number(m.liquidity ?? 0)), 0)
      : 0)

  return {
    id: `event-${e.id}`,
    question: e.title,
    description: e.description || e.title,
    category,
    outcomes,
    liquidity: totalEventLiquidity || 0,
    totalVolume: totalEventVolume || 0,
    createdAt: e.createdAt,
    closingTime: e.endDate,
    resolved: !!e.closed,
    featured: false,
    trending: false,
    tags: e.tags?.map((t) => t.label) ?? [],
    creator: 'Polymarket',
    rules: 'Aggregated event composed of related markets on Polymarket.',
    minPrice: 0.01,
    maxPrice: 0.99,
    currentPrices: outcomes.reduce<Record<string, number>>((acc, o) => {
      acc[o.id] = o.price
      return acc
    }, {}),
  } as unknown as Market
}

// --------------- Fetchers ---------------
async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, init)
      if (res.ok) return res
      if (res.status === 429) {
        // back off politely
        await delay((i + 1) * 500)
        continue
      }
      if (i === retries) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    } catch (err) {
      if (i === retries) throw err
      await delay((i + 1) * 500)
    }
  }
  // Should never reach here
  // @ts-expect-error
  return new Response(null, { status: 500 })
}

async function fetchEventsPage(limit: number, offset: number): Promise<PolymarketEvent[]> {
  const url = `https://gamma-api.polymarket.com/events?limit=${limit}&offset=${offset}&closed=false&order=volume&ascending=false&related_tags=true`
  const res = await fetchWithRetry(
    url,
    { headers: { Accept: 'application/json', 'User-Agent': 'PolyHub/1.0' }, signal: AbortSignal.timeout(8000) },
    2,
  )
  if (!res.ok) throw new Error(`Events HTTP ${res.status}`)
  return (await res.json()) as PolymarketEvent[]
}

async function fetchEventDetail(eventId: string): Promise<PolymarketEvent | null> {
  try {
    const r = await fetchWithRetry(
      `https://gamma-api.polymarket.com/events/${eventId}`,
      { headers: { Accept: 'application/json', 'User-Agent': 'PolyHub/1.0' }, signal: AbortSignal.timeout(8000) },
      2,
    )
    if (!r.ok) return null
    return (await r.json()) as PolymarketEvent
  } catch {
    return null
  }
}

async function fetchMarketsPage(limit: number, offset: number): Promise<PolymarketMarket[]> {
  const url = `https://gamma-api.polymarket.com/markets?limit=${limit}&offset=${offset}&closed=false&order=volumeNum&ascending=false&include_tag=true&related_tags=true`
  const res = await fetchWithRetry(
    url,
    { headers: { Accept: 'application/json', 'User-Agent': 'PolyHub/1.0' }, signal: AbortSignal.timeout(8000) },
    2,
  )
  if (!res.ok) throw new Error(`Markets HTTP ${res.status}`)
  return (await res.json()) as PolymarketMarket[]
}

// --------------- GET handler ---------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // featured | trending | null
    const target = Math.max(1, Math.min(300, parseInt(searchParams.get('limit') || '100')))
    const forceRefresh = searchParams.get('refresh') === 'true'

    const cacheKey = `${type || 'all'}:${target}`
    if (!forceRefresh && marketCache && Date.now() - marketCache.timestamp < CACHE_DURATION_MS && marketCache.key === cacheKey) {
      let data = filterByType(marketCache.data, type, target)
      return NextResponse.json({
        success: true,
        data,
        count: data.length,
        timestamp: new Date().toISOString(),
        source: 'cache',
        cached: true,
      })
    }

    // ---- 1) EVENTS (single page, then optional detail for top-N) ----
    const events = await fetchEventsPage(EVENTS_PAGE_SIZE, 0)
    const activeEvents = events.filter((e) => !e.closed && e.active !== false)

    // fetch limited details (to get embedded markets/outcomes where possible)
    const detailTargets = activeEvents.slice(0, EVENT_DETAIL_LIMIT)
    const [detailed, rest] = await Promise.all([
      Promise.all(detailTargets.map((e) => fetchEventDetail(e.id))),
      Promise.resolve(activeEvents.slice(EVENT_DETAIL_LIMIT)),
    ])

    const enrichedEvents: PolymarketEvent[] = [
      ...detailed.map((d, i) => d || detailTargets[i]),
      ...rest,
    ]

    // Build one aggregated item per event
    const eventMarkets: Market[] = []
    const includedEventIds = new Set<string>()
    for (const e of enrichedEvents) {
      const mk = transformEventToMarket(e)
      eventMarkets.push(mk)
      includedEventIds.add(e.id)
    }

    // ---- 2) MARKETS (paged until we hit target) ----
    const marketsCollected: Market[] = []
    let page = 0
    while (marketsCollected.length < target && page < MARKETS_MAX_PAGES) {
      const offset = page * MARKETS_PAGE_SIZE
      const pageItems = await fetchMarketsPage(MARKETS_PAGE_SIZE, offset)

      // filter & skip any markets that belong to events we've already included
      const filtered = pageItems
        .filter((m) => !m.closed && m.active !== false)
        .filter((m) => !(m.events || []).some((ev) => includedEventIds.has(ev.id)))

      marketsCollected.push(...filtered.map(transformMarket))
      page += 1

      if (page < MARKETS_MAX_PAGES) await delay(REQUEST_DELAY_MS)
    }

    // ---- 3) Merge + sort by volume ----
    // No global "same question" de-dupe here to maximize distinct offers;
    // we already skipped event↔market overlaps above.
    const merged = [...eventMarkets, ...marketsCollected]
      .sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0))

    // Cache the full merged set (keep more than target so filtering can reuse)
    marketCache = { data: merged, timestamp: Date.now(), key: cacheKey }

    const data = filterByType(merged, type, target)

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
      source: 'live',
      cached: false,
    })
  } catch (error: any) {
    // Serve stale cache if available
    if (marketCache) {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get('type')
      const target = Math.max(1, Math.min(300, parseInt(searchParams.get('limit') || '100')))
      const data = filterByType(marketCache.data, type, target)
      return NextResponse.json({
        success: true,
        data,
        count: data.length,
        timestamp: new Date().toISOString(),
        source: 'stale-cache',
        warning: `Upstream error: ${error?.message || 'unknown'}`,
        cached: true,
      })
    }

    // Fallback
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: error?.message || 'Unknown error occurred',
    })
  }
}

// --------------- Helpers ---------------
function filterByType(all: Market[], type: string | null, target: number): Market[] {
  if (type === 'featured') {
    return all
      .filter((m) => (m.totalVolume ?? 0) > 5_000 && (m.liquidity ?? 0) > 1_000)
      .slice(0, Math.min(6, target))
      .map((m) => ({ ...m, featured: true }))
  }
  if (type === 'trending') {
    return all
      .filter((m) => (m.totalVolume ?? 0) > 1_000)
      .slice(0, Math.min(8, target))
      .map((m) => ({ ...m, trending: true }))
  }
  return all.slice(0, target)
}
