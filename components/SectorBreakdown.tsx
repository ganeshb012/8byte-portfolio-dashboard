"use client";

import React from "react";
import { SectorSummary } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/calculations";
import { Layers, ArrowUpRight, ArrowDownRight, ArrowLeft } from "lucide-react";

interface SectorBreakdownProps {
  sectors: SectorSummary[];
  selectedSector: string | null;
  onSelectSector: (sector: string | null) => void;
}

export const SectorBreakdown: React.FC<SectorBreakdownProps> = ({
  sectors,
  selectedSector,
  onSelectSector,
}) => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Sector Allocation
          </h2>
        </div>

        {selectedSector && (
          <button
            onClick={() => onSelectSector(null)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-medium shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>← Show All Sectors</span>
          </button>
        )}
      </div>

      {/* Grid of Sector Cards: 6 aligned in one row on desktop, 3 on tablet, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
        {sectors.map((sec) => {
          const isProfit = sec.totalGainLoss >= 0;
          const isSelected = selectedSector === sec.sector;

          return (
            <div
              key={sec.sector}
              onClick={() => onSelectSector(isSelected ? null : sec.sector)}
              className={`cursor-pointer rounded-xl p-4 border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/30 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              }`}
            >
              {/* Sector Name & Count */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`font-semibold text-[15px] sm:text-base truncate ${
                      isSelected
                        ? "text-blue-700 dark:text-blue-400 font-bold"
                        : "text-slate-900 dark:text-white"
                    }`}
                    title={sec.sector}
                  >
                    {sec.sector}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                    {sec.stockCount}
                  </span>
                </div>

                {/* Main Present Value */}
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                  {formatINR(sec.totalPresentValue)}
                </div>

                {/* Supporting Values: Investment & Weight */}
                <div className="flex items-center justify-between text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>Inv: {formatINR(sec.totalInvestment)}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {sec.portfolioPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* P&L & Mini Progress bar */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">P&L Return</span>
                  <span
                    className={`font-mono font-bold text-[13px] sm:text-sm flex items-center ${
                      isProfit
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isProfit ? (
                      <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 inline mr-0.5" />
                    )}
                    {formatPercent(sec.gainLossPercentage)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      isProfit ? "bg-emerald-500" : "bg-rose-400 dark:bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, sec.portfolioPercentage))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
