import portfolioData from "../data/portfolioData.json";
import { RawHolding, StockHolding, PortfolioResponse } from "./types";
import { calculateStockMetrics, buildPortfolioSummary } from "./calculations";

// In-memory cache structures
interface CmpCacheEntry {
  cmp: number;
  timestamp: number;
}

interface FundamentalCacheEntry {
  pe: number | null;
  earnings: number | null;
  timestamp: number;
}

const cmpCache = new Map<string, CmpCacheEntry>();
const fundamentalCache = new Map<string, FundamentalCacheEntry>();

// Cache TTL configuration
const CMP_CACHE_TTL_MS = 14000; // ~14-15 seconds for CMP
const FUNDAMENTAL_CACHE_TTL_MS = 300000; // 5 minutes for P/E & Latest Earnings

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/**
 * Fetch Current Market Price (CMP) from Yahoo Finance
 */
export async function fetchCmpFromYahoo(
  symbol: string,
  fallbackCmp: number
): Promise<{ cmp: number; source: "yahoo" | "fallback" | "cache" }> {
  const cached = cmpCache.get(symbol);
  const now = Date.now();

  if (cached && now - cached.timestamp < CMP_CACHE_TTL_MS) {
    return { cmp: cached.cmp, source: "cache" };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned status ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;

    if (typeof price === "number" && !isNaN(price) && price > 0) {
      cmpCache.set(symbol, { cmp: price, timestamp: now });
      return { cmp: price, source: "yahoo" };
    }
  } catch (error) {
    // Graceful error handling: log and proceed to fallback/cached value
    console.warn(`[FinanceService] Yahoo fetch failed for ${symbol}:`, (error as Error).message);
  }

  // Fallback to previous cached value if available, else initial Excel CMP
  if (cached) {
    return { cmp: cached.cmp, source: "cache" };
  }

  return { cmp: fallbackCmp, source: "fallback" };
}

/**
 * Fetch P/E Ratio and Latest Earnings from Google Finance
 */
export async function fetchFundamentalsFromGoogle(
  symbol: string,
  fallbackPe: number | null,
  fallbackEarnings: number | null
): Promise<{
  pe: number | null;
  earnings: number | null;
  source: "google" | "fallback" | "cache";
}> {
  const cached = fundamentalCache.get(symbol);
  const now = Date.now();

  if (cached && now - cached.timestamp < FUNDAMENTAL_CACHE_TTL_MS) {
    return { pe: cached.pe, earnings: cached.earnings, source: "cache" };
  }

  try {
    const url = `https://www.google.com/finance/quote/${encodeURIComponent(symbol)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Google Finance returned status ${response.status}`);
    }

    const html = await response.text();

    // Parse P/E ratio: Look for P/E ratio followed by numeric value or '-'
    let pe: number | null = null;
    const peMatch = html.match(/P\/E ratio<\/div><div[^>]*>([0-9,.]+)/i);
    if (peMatch && peMatch[1]) {
      const parsed = parseFloat(peMatch[1].replace(/,/g, ""));
      if (!isNaN(parsed)) pe = parsed;
    }

    // Parse Latest Earnings (EPS): Look for Earnings per share or EPS table cell
    let earnings: number | null = null;
    const epsMatch =
      html.match(/Earnings per share<\/div><\/div><\/td><td[^>]*><div[^>]*><div[^>]*>([0-9,.]+)/i) ||
      html.match(/EPS[\s\S]{1,60}?([0-9,.]+)/i);
    if (epsMatch && epsMatch[1]) {
      const parsed = parseFloat(epsMatch[1].replace(/,/g, ""));
      if (!isNaN(parsed)) earnings = parsed;
    }

    // If Google returned at least one fundamental, cache and return
    if (pe !== null || earnings !== null) {
      const finalPe = pe ?? fallbackPe;
      const finalEarnings = earnings ?? fallbackEarnings;
      fundamentalCache.set(symbol, { pe: finalPe, earnings: finalEarnings, timestamp: now });
      return { pe: finalPe, earnings: finalEarnings, source: "google" };
    }
  } catch (error) {
    console.warn(`[FinanceService] Google Finance fetch failed for ${symbol}:`, (error as Error).message);
  }

  if (cached) {
    return { pe: cached.pe, earnings: cached.earnings, source: "cache" };
  }

  return { pe: fallbackPe, earnings: fallbackEarnings, source: "fallback" };
}

/**
 * Execute tasks in small batches to respect rate limits
 */
async function runInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Main service function to get the enriched, up-to-date portfolio
 */
export async function getEnrichedPortfolio(): Promise<PortfolioResponse> {
  const rawActive = portfolioData.activeHoldings as RawHolding[];
  const rawClosed = (portfolioData.closedPositions || []) as RawHolding[];

  // Calculate total initial investment to derive portfolio percentages correctly
  const totalInvestment = rawActive.reduce(
    (sum, item) => sum + item.purchasePrice * item.quantity,
    0
  );

  // Process active holdings in parallel batches of 6
  const activeStocks: StockHolding[] = await runInBatches(rawActive, 6, async (raw) => {
    // Concurrently fetch CMP from Yahoo and Fundamentals from Google
    const [cmpResult, fundamentalResult] = await Promise.all([
      fetchCmpFromYahoo(raw.yahooSymbol, raw.initialCmp),
      fetchFundamentalsFromGoogle(raw.googleSymbol, raw.initialPe, raw.initialEarnings),
    ]);

    return calculateStockMetrics(
      raw,
      cmpResult.cmp,
      fundamentalResult.pe,
      fundamentalResult.earnings,
      totalInvestment,
      cmpResult.source,
      fundamentalResult.source,
      false
    );
  });

  // Process closed/sold holdings (using initial/sold prices and cached/fallback CMP)
  const closedStocks: StockHolding[] = await runInBatches(rawClosed, 6, async (raw) => {
    const [cmpResult, fundamentalResult] = await Promise.all([
      fetchCmpFromYahoo(raw.yahooSymbol, raw.initialCmp),
      fetchFundamentalsFromGoogle(raw.googleSymbol, raw.initialPe, raw.initialEarnings),
    ]);

    return calculateStockMetrics(
      raw,
      cmpResult.cmp,
      fundamentalResult.pe,
      fundamentalResult.earnings,
      totalInvestment,
      cmpResult.source,
      fundamentalResult.source,
      true
    );
  });

  return buildPortfolioSummary(activeStocks, closedStocks);
}
