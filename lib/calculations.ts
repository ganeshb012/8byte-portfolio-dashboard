import { RawHolding, StockHolding, SectorSummary, PortfolioResponse } from "./types";

/**
 * Calculates stock-level metrics based on purchase price, quantity, and live CMP.
 * Investment = Purchase Price × Quantity
 * Portfolio % = Investment / Total Investment × 100
 * Present Value = CMP × Quantity
 * Gain/Loss = Present Value - Investment
 */
export function calculateStockMetrics(
  raw: RawHolding,
  cmp: number,
  peRatio: number | null,
  latestEarnings: number | null,
  totalPortfolioInvestment: number,
  cmpSource: "yahoo" | "fallback" | "cache" = "yahoo",
  peSource: "google" | "fallback" | "cache" = "google",
  isClosed = false
): StockHolding {
  const investment = raw.purchasePrice * raw.quantity;
  const portfolioPercentage = totalPortfolioInvestment > 0 ? (investment / totalPortfolioInvestment) * 100 : 0;
  
  // For closed positions, present value is based on sold price
  const activeCmp = isClosed && raw.soldPrice ? raw.soldPrice : cmp;
  const presentValue = activeCmp * raw.quantity;
  const gainLoss = presentValue - investment;
  const gainLossPercentage = investment > 0 ? (gainLoss / investment) * 100 : 0;

  return {
    id: raw.id,
    name: raw.name,
    sector: raw.sector,
    purchasePrice: raw.purchasePrice,
    quantity: raw.quantity,
    investment: Number(investment.toFixed(2)),
    portfolioPercentage: Number(portfolioPercentage.toFixed(2)),
    ticker: raw.ticker,
    yahooSymbol: raw.yahooSymbol,
    googleSymbol: raw.googleSymbol,
    cmp: Number(activeCmp.toFixed(2)),
    presentValue: Number(presentValue.toFixed(2)),
    gainLoss: Number(gainLoss.toFixed(2)),
    gainLossPercentage: Number(gainLossPercentage.toFixed(2)),
    peRatio: peRatio !== null ? Number(peRatio.toFixed(2)) : null,
    latestEarnings: latestEarnings !== null ? Number(latestEarnings.toFixed(2)) : null,
    soldPrice: raw.soldPrice,
    isClosed,
    cmpSource,
    peSource,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Aggregates stocks into sector groups and computes sector totals.
 */
export function aggregateSectors(
  stocks: StockHolding[],
  totalPortfolioInvestment: number
): SectorSummary[] {
  const sectorMap = new Map<string, StockHolding[]>();

  for (const stock of stocks) {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, []);
    }
    sectorMap.get(stock.sector)!.push(stock);
  }

  const sectors: SectorSummary[] = [];

  for (const [sector, items] of sectorMap.entries()) {
    const totalInvestment = items.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = items.reduce((sum, s) => sum + s.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const gainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
    const portfolioPercentage = totalPortfolioInvestment > 0 ? (totalInvestment / totalPortfolioInvestment) * 100 : 0;

    sectors.push({
      sector,
      totalInvestment: Number(totalInvestment.toFixed(2)),
      totalPresentValue: Number(totalPresentValue.toFixed(2)),
      totalGainLoss: Number(totalGainLoss.toFixed(2)),
      gainLossPercentage: Number(gainLossPercentage.toFixed(2)),
      portfolioPercentage: Number(portfolioPercentage.toFixed(2)),
      stockCount: items.length,
      stocks: items,
    });
  }

  return sectors;
}

/**
 * Builds complete portfolio response with summary KPIs
 */
export function buildPortfolioSummary(
  stocks: StockHolding[],
  closedStocks: StockHolding[] = []
): PortfolioResponse {
  const totalInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
  const totalPresentValue = stocks.reduce((sum, s) => sum + s.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const overallReturnPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  const sectors = aggregateSectors(stocks, totalInvestment);

  const profitableStocksCount = stocks.filter((s) => s.gainLoss >= 0).length;
  const lossStocksCount = stocks.filter((s) => s.gainLoss < 0).length;

  const sortedByGain = [...stocks].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage);
  const topGainer = sortedByGain.length > 0 ? {
    name: sortedByGain[0].name,
    gainLossPercentage: sortedByGain[0].gainLossPercentage,
    gainLoss: sortedByGain[0].gainLoss,
  } : null;

  const topLoser = sortedByGain.length > 0 ? {
    name: sortedByGain[sortedByGain.length - 1].name,
    gainLossPercentage: sortedByGain[sortedByGain.length - 1].gainLossPercentage,
    gainLoss: sortedByGain[sortedByGain.length - 1].gainLoss,
  } : null;

  return {
    summary: {
      totalInvestment: Number(totalInvestment.toFixed(2)),
      totalPresentValue: Number(totalPresentValue.toFixed(2)),
      totalGainLoss: Number(totalGainLoss.toFixed(2)),
      overallReturnPercentage: Number(overallReturnPercentage.toFixed(2)),
      totalStocks: stocks.length,
      profitableStocksCount,
      lossStocksCount,
      topGainer,
      topLoser,
      lastRefreshedAt: new Date().toISOString(),
      refreshIntervalSeconds: 15,
    },
    sectors,
    allStocks: stocks,
    closedPositions: closedStocks,
  };
}

/**
 * Format Indian Rupee currency format (e.g., ₹1,54,306.00)
 */
export function formatINR(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Format percentage (e.g., +12.34%)
 */
export function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}
