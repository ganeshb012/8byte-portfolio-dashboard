"use client";

import React, { useState } from "react";
import { StockHolding, SectorSummary } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/calculations";
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from "lucide-react";

interface PortfolioTableProps {
  sectors: SectorSummary[];
  viewMode: "active" | "closed";
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  overallReturnPercentage: number;
  selectedSector: string | null;
  onSelectSector: (sector: string | null) => void;
  onBackToDashboard?: () => void;
}

type SortField =
  | "name"
  | "purchasePrice"
  | "quantity"
  | "investment"
  | "portfolioPercentage"
  | "cmp"
  | "presentValue"
  | "gainLoss"
  | "gainLossPercentage"
  | "peRatio"
  | "latestEarnings";

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  sectors,
  viewMode,
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  overallReturnPercentage,
  selectedSector,
  onSelectSector,
  onBackToDashboard,
}) => {
  const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>("portfolioPercentage");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSector = (sector: string) => {
    setCollapsedSectors((prev) => ({
      ...prev,
      [sector]: !prev[sector],
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortStocks = (stocks: StockHolding[]) => {
    return [...stocks].sort((a, b) => {
      let valA = a[sortField] ?? 0;
      let valB = b[sortField] ?? 0;

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity ml-1.5 inline" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-1.5 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-1.5 inline" />
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Table Top Header for Filtered Views */}
      {selectedSector && (
        <div className="bg-slate-50/80 dark:bg-slate-950/80 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Filtered Sector:</span>
            <span className="font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 px-2.5 py-0.5 rounded-md">
              {selectedSector}
            </span>
          </div>
          <button
            onClick={() => {
              onSelectSector(null);
              if (onBackToDashboard) onBackToDashboard();
            }}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Full Dashboard</span>
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1150px]">
          {/* Table Header: 13px-14px font size */}
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs sm:text-[13px] tracking-wide select-none">
              <th
                onClick={() => handleSort("name")}
                className="py-4 px-5 cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[210px]"
              >
                <div className="flex items-center">
                  <span>Particulars / Stock Name</span>
                  {renderSortIcon("name")}
                </div>
              </th>
              <th className="py-4 px-3.5 min-w-[100px]">NSE/BSE</th>
              <th
                onClick={() => handleSort("purchasePrice")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[125px]"
              >
                <div className="flex items-center justify-end">
                  <span>Purchase Price</span>
                  {renderSortIcon("purchasePrice")}
                </div>
              </th>
              <th
                onClick={() => handleSort("quantity")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[85px]"
              >
                <div className="flex items-center justify-end">
                  <span>Qty</span>
                  {renderSortIcon("quantity")}
                </div>
              </th>
              <th
                onClick={() => handleSort("investment")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[130px]"
              >
                <div className="flex items-center justify-end">
                  <span>Investment</span>
                  {renderSortIcon("investment")}
                </div>
              </th>
              <th
                onClick={() => handleSort("portfolioPercentage")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[110px]"
              >
                <div className="flex items-center justify-end">
                  <span>Portfolio %</span>
                  {renderSortIcon("portfolioPercentage")}
                </div>
              </th>
              <th
                onClick={() => handleSort("cmp")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[130px]"
              >
                <div className="flex items-center justify-end">
                  <span>CMP (Yahoo)</span>
                  {renderSortIcon("cmp")}
                </div>
              </th>
              <th
                onClick={() => handleSort("presentValue")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[130px]"
              >
                <div className="flex items-center justify-end">
                  <span>Present Value</span>
                  {renderSortIcon("presentValue")}
                </div>
              </th>
              <th
                onClick={() => handleSort("gainLoss")}
                className="py-4 px-4 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[140px]"
              >
                <div className="flex items-center justify-end">
                  <span>Gain / Loss</span>
                  {renderSortIcon("gainLoss")}
                </div>
              </th>
              <th
                onClick={() => handleSort("peRatio")}
                className="py-4 px-3.5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[100px]"
              >
                <div className="flex items-center justify-end">
                  <span>P/E Ratio</span>
                  {renderSortIcon("peRatio")}
                </div>
              </th>
              <th
                onClick={() => handleSort("latestEarnings")}
                className="py-4 px-5 text-right cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors min-w-[130px]"
              >
                <div className="flex items-center justify-end">
                  <span>Latest Earnings</span>
                  {renderSortIcon("latestEarnings")}
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body Grouped by Sector */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
            {sectors.map((sec) => {
              const isCollapsed = !!collapsedSectors[sec.sector];
              const isProfit = sec.totalGainLoss >= 0;
              const sortedItems = sortStocks(sec.stocks);

              return (
                <React.Fragment key={sec.sector}>
                  {/* Distinct Sector Summary Row */}
                  <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-t border-b border-slate-200 dark:border-slate-800">
                    <td colSpan={2} className="py-3.5 px-5">
                      <div className="flex items-center space-x-2.5">
                        <button
                          onClick={() => toggleSector(sec.sector)}
                          className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                          title={isCollapsed ? "Expand Sector" : "Collapse Sector"}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                        <span
                          onClick={() => toggleSector(sec.sector)}
                          className="font-bold text-slate-900 dark:text-white text-sm sm:text-[15px] cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {sec.sector}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-850 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {sec.stockCount} {sec.stockCount === 1 ? "holding" : "holdings"}
                        </span>
                        {!selectedSector && (
                          <button
                            onClick={() => onSelectSector(sec.sector)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline ml-2"
                            title="Filter this sector only"
                          >
                            Focus
                          </button>
                        )}
                      </div>
                    </td>
                    <td colSpan={2} className="py-3.5 px-3.5 text-right text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Sector Totals:
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 dark:text-white font-mono text-sm sm:text-[15px]">
                      {formatINR(sec.totalInvestment)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-bold text-slate-700 dark:text-slate-300 font-mono text-sm sm:text-[15px]">
                      {sec.portfolioPercentage.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3.5 text-right text-slate-400 dark:text-slate-500 font-mono text-sm">—</td>
                    <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 dark:text-white font-mono text-sm sm:text-[15px]">
                      {formatINR(sec.totalPresentValue)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-bold font-mono text-sm sm:text-[15px] flex items-center space-x-1 ${
                            isProfit ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {isProfit ? (
                            <TrendingUp className="w-4 h-4 inline mr-1 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 inline mr-1 text-rose-600 dark:text-rose-400" />
                          )}
                          {formatINR(sec.totalGainLoss)}
                        </span>
                        <span
                          className={`text-xs font-mono font-semibold ${
                            isProfit ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          ({formatPercent(sec.gainLossPercentage)})
                        </span>
                      </div>
                    </td>
                    <td colSpan={2} className="py-3.5 px-5 text-right text-slate-400 dark:text-slate-500 text-xs">
                      —
                    </td>
                  </tr>

                  {/* Stock Rows inside Sector: Comfortable 15-16px name, 14-15px values, py-4 row height */}
                  {!isCollapsed &&
                    sortedItems.map((stock) => {
                      const stockProfit = stock.gainLoss >= 0;

                      return (
                        <tr
                          key={stock.id + stock.name}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Stock Name: 15px-16px, readable and clear */}
                          <td className="py-4 px-5">
                            <div className="flex items-center space-x-2 pl-3">
                              <span className="font-semibold text-slate-900 dark:text-white text-[15px] sm:text-base">
                                {stock.name}
                              </span>
                              {stock.isClosed && (
                                <span className="text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                                  Sold
                                </span>
                              )}
                            </div>
                          </td>

                          {/* NSE/BSE Code: 12px-13px */}
                          <td className="py-4 px-3.5">
                            <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                              {stock.ticker}
                            </span>
                          </td>

                          {/* Purchase Price: 14px-15px */}
                          <td className="py-4 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 text-sm sm:text-[15px]">
                            {formatINR(stock.purchasePrice)}
                          </td>

                          {/* Quantity: 14px-15px */}
                          <td className="py-4 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 text-sm sm:text-[15px]">
                            {stock.quantity.toLocaleString("en-IN")}
                          </td>

                          {/* Investment: 14px-15px font-semibold */}
                          <td className="py-4 px-3.5 text-right font-semibold text-slate-900 dark:text-white font-mono text-sm sm:text-[15px]">
                            {formatINR(stock.investment)}
                          </td>

                          {/* Portfolio %: 14px-15px */}
                          <td className="py-4 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400 text-sm sm:text-[15px]">
                            {stock.portfolioPercentage.toFixed(2)}%
                          </td>

                          {/* CMP (Live from Yahoo Finance): 14px-15px bold */}
                          <td className="py-4 px-3.5 text-right font-mono">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-[15px]">
                                {formatINR(stock.cmp)}
                              </span>
                              <span
                                className={`text-[11px] uppercase px-1.5 py-0.5 rounded font-mono font-medium mt-0.5 ${
                                  stock.cmpSource === "yahoo"
                                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60"
                                    : stock.cmpSource === "cache"
                                    ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60"
                                    : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60"
                                }`}
                              >
                                {stock.cmpSource}
                              </span>
                            </div>
                          </td>

                          {/* Present Value: 14px-15px font-semibold */}
                          <td className="py-4 px-3.5 text-right font-semibold text-slate-900 dark:text-white font-mono text-sm sm:text-[15px]">
                            {formatINR(stock.presentValue)}
                          </td>

                          {/* Gain / Loss (Amount + %) with Green / Red */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end">
                              <span
                                className={`font-bold font-mono text-sm sm:text-[15px] flex items-center gap-0.5 ${
                                  stockProfit ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                                }`}
                              >
                                {stockProfit ? "+" : ""}
                                {formatINR(stock.gainLoss)}
                              </span>
                              <span
                                className={`text-xs font-mono font-bold px-2 py-0.5 rounded mt-0.5 ${
                                  stockProfit
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50"
                                    : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50"
                                }`}
                              >
                                {formatPercent(stock.gainLossPercentage)}
                              </span>
                            </div>
                          </td>

                          {/* P/E Ratio (Google Finance): 14px-15px */}
                          <td className="py-4 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 text-sm sm:text-[15px]">
                            {stock.peRatio !== null ? (
                              <span title={`Source: ${stock.peSource}`}>
                                {stock.peRatio.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">N/A</span>
                            )}
                          </td>

                          {/* Latest Earnings (Google Finance): 14px-15px */}
                          <td className="py-4 px-5 text-right font-mono text-slate-700 dark:text-slate-300 text-sm sm:text-[15px]">
                            {stock.latestEarnings !== null ? (
                              <span>₹{stock.latestEarnings.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Grand Total Footer Row: 15px-16px font size */}
          <tfoot>
            <tr className="bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              <td colSpan={4} className="py-5 px-5 uppercase tracking-wide text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400 mr-2 text-base">●</span> Total Portfolio Holdings
              </td>
              <td className="py-5 px-3.5 text-right font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {formatINR(totalInvestment)}
              </td>
              <td className="py-5 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                100.00%
              </td>
              <td className="py-5 px-3.5 text-right text-slate-400 dark:text-slate-500">—</td>
              <td className="py-5 px-3.5 text-right font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {formatINR(totalPresentValue)}
              </td>
              <td className="py-5 px-4 text-right">
                <div className="flex flex-col items-end">
                  <span
                    className={`text-base sm:text-lg font-mono font-bold ${
                      totalGainLoss >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {totalGainLoss >= 0 ? "+" : ""}
                    {formatINR(totalGainLoss)}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-mono font-semibold px-2 py-0.5 rounded mt-1 ${
                      totalGainLoss >= 0
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {formatPercent(overallReturnPercentage)}
                  </span>
                </div>
              </td>
              <td colSpan={2} className="py-5 px-5 text-right text-slate-400 dark:text-slate-500">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
