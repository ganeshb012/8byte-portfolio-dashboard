"use client";

import React from "react";
import { ArrowLeft, Layers, TrendingUp, TrendingDown } from "lucide-react";
import { SectorSummary } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/calculations";

interface SectorFocusBannerProps {
  sector: SectorSummary;
  onBackToDashboard: () => void;
}

export const SectorFocusBanner: React.FC<SectorFocusBannerProps> = ({
  sector,
  onBackToDashboard,
}) => {
  const isProfit = sector.totalGainLoss >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-900/60 rounded-xl p-5 mb-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Back Button & Title */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-colors group shadow-xs active:scale-98"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Dashboard</span>
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Overview / Sectors / <strong className="text-slate-800 dark:text-slate-100 font-semibold">{sector.sector}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {sector.sector}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Filtered view showing all {sector.stockCount} holdings in this sector
              </p>
            </div>
          </div>
        </div>

        {/* Right: Key Sector Statistics */}
        <div className="flex flex-wrap items-center gap-5 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Holdings</div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {sector.stockCount} {sector.stockCount === 1 ? "Stock" : "Stocks"}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Invested</div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
              {formatINR(sector.totalInvestment)}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Present Value</div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatINR(sector.totalPresentValue)}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />

          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Return</div>
            <div
              className={`text-base font-bold flex items-center gap-1.5 font-mono mt-0.5 ${
                isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{formatINR(sector.totalGainLoss)}</span>
              <span className="text-sm font-semibold">({formatPercent(sector.gainLossPercentage)})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
