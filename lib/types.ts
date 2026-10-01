export interface RawHolding {
  id: string;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  ticker: string;
  yahooSymbol: string;
  googleSymbol: string;
  initialCmp: number;
  initialPe: number | null;
  initialEarnings: number | null;
  soldPrice?: number;
}

export interface StockHolding {
  id: string;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  ticker: string;
  yahooSymbol: string;
  googleSymbol: string;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  peRatio: number | null;
  latestEarnings: number | null;
  soldPrice?: number;
  isClosed?: boolean;
  cmpSource: "yahoo" | "fallback" | "cache";
  peSource: "google" | "fallback" | "cache";
  lastUpdated: string;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  portfolioPercentage: number;
  stockCount: number;
  stocks: StockHolding[];
}

export interface PortfolioResponse {
  summary: {
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
    overallReturnPercentage: number;
    totalStocks: number;
    profitableStocksCount: number;
    lossStocksCount: number;
    topGainer: {
      name: string;
      gainLossPercentage: number;
      gainLoss: number;
    } | null;
    topLoser: {
      name: string;
      gainLossPercentage: number;
      gainLoss: number;
    } | null;
    lastRefreshedAt: string;
    refreshIntervalSeconds: number;
  };
  sectors: SectorSummary[];
  allStocks: StockHolding[];
  closedPositions: StockHolding[];
}
