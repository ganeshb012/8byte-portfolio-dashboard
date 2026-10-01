"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { SectorBreakdown } from "@/components/SectorBreakdown";
import { FilterBar } from "@/components/FilterBar";
import { PortfolioTable } from "@/components/PortfolioTable";
import { SectorFocusBanner } from "@/components/SectorFocusBanner";
import { PortfolioResponse, StockHolding } from "@/lib/types";
import { aggregateSectors } from "@/lib/calculations";
import { AlertCircle, RefreshCw } from "lucide-react";

const REFRESH_INTERVAL_SECONDS = 15;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);

  // Sync state with URL search params for browser back/forward history support
  const urlSector = searchParams.get("sector");
  const urlView = searchParams.get("view") === "closed" ? "closed" : "active";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string | null>(urlSector);
  const [filterType, setFilterType] = useState<"all" | "profit" | "loss">("all");
  const [viewMode, setViewMode] = useState<"active" | "closed">(urlView);

  // Keep state in sync when URL changes (e.g. browser back/forward button clicked)
  useEffect(() => {
    setSelectedSector(urlSector);
  }, [urlSector]);

  useEffect(() => {
    setViewMode(urlView);
  }, [urlView]);

  // Navigate helper to update URL and preserve browser history
  const updateNavigation = useCallback(
    (newSector: string | null, newView: "active" | "closed") => {
      const params = new URLSearchParams();
      if (newSector) params.set("sector", newSector);
      if (newView === "closed") params.set("view", "closed");

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl);
    },
    [pathname, router]
  );

  const handleSelectSector = useCallback(
    (sector: string | null) => {
      setSelectedSector(sector);
      updateNavigation(sector, viewMode);
    },
    [updateNavigation, viewMode]
  );

  const handleViewModeChange = useCallback(
    (mode: "active" | "closed") => {
      setViewMode(mode);
      updateNavigation(selectedSector, mode);
    },
    [updateNavigation, selectedSector]
  );

  const handleBackToDashboard = useCallback(() => {
    setSelectedSector(null);
    setViewMode("active");
    setSearchQuery("");
    setFilterType("all");
    router.push(pathname);
  }, [pathname, router]);

  // Fetch portfolio data from internal API
  const fetchPortfolio = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const json: PortfolioResponse = await res.json();
      setData(json);
      setCountdown(REFRESH_INTERVAL_SECONDS);
    } catch (err) {
      console.error("[Dashboard] Error fetching portfolio:", err);
      setError((err as Error).message || "Failed to load portfolio data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchPortfolio(false);
  }, [fetchPortfolio]);

  // 1-second interval timer for the 15-second countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchPortfolio(true);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchPortfolio]);

  // Available sector names
  const sectorNames = useMemo(() => {
    if (!data) return [];
    return data.sectors.map((s) => s.sector);
  }, [data]);

  // Active / Closed dataset selection
  const rawCurrentStocks = useMemo(() => {
    if (!data) return [];
    return viewMode === "active" ? data.allStocks : data.closedPositions;
  }, [data, viewMode]);

  // Filtered stocks based on search, sector, and profit/loss
  const filteredStocks = useMemo(() => {
    return rawCurrentStocks.filter((stock: StockHolding) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = stock.name.toLowerCase().includes(q);
        const matchesTicker = stock.ticker.toLowerCase().includes(q);
        if (!matchesName && !matchesTicker) return false;
      }

      // Sector match
      if (selectedSector && stock.sector !== selectedSector) {
        return false;
      }

      // Gain / Loss filter
      if (filterType === "profit" && stock.gainLoss < 0) return false;
      if (filterType === "loss" && stock.gainLoss >= 0) return false;

      return true;
    });
  }, [rawCurrentStocks, searchQuery, selectedSector, filterType]);

  // Re-aggregate sectors based on filtered stocks
  const filteredSectors = useMemo(() => {
    const totalInvestment = rawCurrentStocks.reduce((sum, s) => sum + s.investment, 0);
    return aggregateSectors(filteredStocks, totalInvestment);
  }, [filteredStocks, rawCurrentStocks]);

  // Details for currently selected sector banner
  const activeSectorSummary = useMemo(() => {
    if (!selectedSector || !data) return null;
    return data.sectors.find((s) => s.sector === selectedSector) || null;
  }, [selectedSector, data]);

  // Filtered Totals
  const filteredTotalInvestment = useMemo(
    () => filteredStocks.reduce((sum, s) => sum + s.investment, 0),
    [filteredStocks]
  );
  const filteredTotalPresentValue = useMemo(
    () => filteredStocks.reduce((sum, s) => sum + s.presentValue, 0),
    [filteredStocks]
  );
  const filteredTotalGainLoss = useMemo(
    () => filteredTotalPresentValue - filteredTotalInvestment,
    [filteredTotalPresentValue, filteredTotalInvestment]
  );
  const filteredOverallReturn = useMemo(
    () =>
      filteredTotalInvestment > 0
        ? (filteredTotalGainLoss / filteredTotalInvestment) * 100
        : 0,
    [filteredTotalGainLoss, filteredTotalInvestment]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Top Header */}
      <Header
        lastRefreshedAt={data?.summary.lastRefreshedAt || null}
        countdown={countdown}
        isRefreshing={isRefreshing}
        onManualRefresh={() => fetchPortfolio(false)}
        activeCount={data?.allStocks.length || 0}
        totalInvestment={data?.summary.totalInvestment || 0}
        selectedSector={selectedSector}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Main Container: 96%-98% viewport width on desktop, comfortable 24-32px padding */}
      <main className="flex-1 w-full max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Connection warning banner if API failed */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Note:</strong> {error}. Showing cached valuation baseline.
              </span>
            </div>
            <button
              onClick={() => fetchPortfolio(false)}
              className="px-2.5 py-1 rounded bg-white dark:bg-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 font-semibold text-amber-900 dark:text-amber-100 text-xs transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state skeleton */}
        {loading && !data ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              ))}
            </div>
            <div className="h-32 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <div className="h-16 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <div className="h-96 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          </div>
        ) : data ? (
          <>
            {/* KPI Summary Cards */}
            <SummaryCards summary={data.summary} />

            {/* Sector Allocation Breakdown Cards */}
            <SectorBreakdown
              sectors={data.sectors}
              selectedSector={selectedSector}
              onSelectSector={handleSelectSector}
            />

            {/* Sector Focus View Banner (Appears when a sector is selected) */}
            {activeSectorSummary && (
              <SectorFocusBanner
                sector={activeSectorSummary}
                onBackToDashboard={handleBackToDashboard}
              />
            )}

            {/* Search & Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSector={selectedSector}
              onSectorChange={handleSelectSector}
              sectors={sectorNames}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              activeCount={data.allStocks.length}
              closedCount={data.closedPositions.length}
              totalFiltered={filteredStocks.length}
              onBackToDashboard={handleBackToDashboard}
            />

            {/* Portfolio Holdings Table */}
            <PortfolioTable
              sectors={filteredSectors}
              viewMode={viewMode}
              totalInvestment={filteredTotalInvestment}
              totalPresentValue={filteredTotalPresentValue}
              totalGainLoss={filteredTotalGainLoss}
              overallReturnPercentage={filteredOverallReturn}
              selectedSector={selectedSector}
              onSelectSector={handleSelectSector}
              onBackToDashboard={handleBackToDashboard}
            />
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="w-full max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            8byte Financial Analytics • Dynamic Portfolio Dashboard
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            Real-time feed • Auto-refresh 15s • Institutional market data
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] flex items-center justify-center text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading Portfolio Dashboard...</span>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
