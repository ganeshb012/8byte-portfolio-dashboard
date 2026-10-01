"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  PieChart,
} from "lucide-react";
import { formatINR, formatPercent } from "@/lib/calculations";
import { PortfolioResponse } from "@/lib/types";

interface SummaryCardsProps {
  summary: PortfolioResponse["summary"];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const isProfit = summary.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* 1. Total Portfolio Value */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Portfolio Value
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
            <Wallet className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3.5">
          <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white font-mono leading-tight">
            {formatINR(summary.totalPresentValue)}
          </div>
          <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 gap-1.5">
            <span>Invested:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
              {formatINR(summary.totalInvestment)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Investment */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Investment
          </span>
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center">
            <Coins className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3.5">
          <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white font-mono leading-tight">
            {formatINR(summary.totalInvestment)}
          </div>
          <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 gap-1.5">
            <span>Allocation Basis:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">100% Capital Deployed</span>
          </div>
        </div>
      </div>

      {/* 3. Net Gain / Loss */}
      <div
        className={`bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs transition-shadow hover:shadow-sm ${
          isProfit
            ? "border-emerald-200/80 dark:border-emerald-800/60"
            : "border-rose-200/80 dark:border-rose-800/60"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Net Return (Overall P&L)
          </span>
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
              isProfit
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-4.5 h-4.5" />
            ) : (
              <TrendingDown className="w-4.5 h-4.5" />
            )}
          </div>
        </div>
        <div className="mt-3.5">
          <div
            className={`text-2xl sm:text-[28px] font-bold tracking-tight font-mono leading-tight ${
              isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatINR(summary.totalGainLoss)}
          </div>
          <div className="mt-2 flex items-center text-sm gap-2 font-medium">
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                isProfit
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50"
              }`}
            >
              {formatPercent(summary.overallReturnPercentage)}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">on initial capital</span>
          </div>
        </div>
      </div>

      {/* 4. Holdings / Market Breadth */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Holdings & Breadth
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
            <PieChart className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3.5">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white leading-tight">
              {summary.totalStocks}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1.5">Holdings</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                {summary.profitableStocksCount} Profit
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50">
                {summary.lossStocksCount} Loss
              </span>
            </div>
          </div>
          {/* Subtle distribution bar */}
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${
                  summary.totalStocks > 0
                    ? (summary.profitableStocksCount / summary.totalStocks) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="bg-rose-400 dark:bg-rose-500 h-full transition-all duration-300"
              style={{
                width: `${
                  summary.totalStocks > 0
                    ? (summary.lossStocksCount / summary.totalStocks) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
