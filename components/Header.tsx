"use client";

import React from "react";
import { RefreshCw, Clock, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  lastRefreshedAt: string | null;
  countdown: number;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  activeCount: number;
  totalInvestment: number;
  selectedSector: string | null;
  onBackToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastRefreshedAt,
  countdown,
  isRefreshing,
  onManualRefresh,
  activeCount,
  selectedSector,
  onBackToDashboard,
}) => {
  const formattedTime = lastRefreshedAt
    ? new Date(lastRefreshedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Syncing...";

  return (
    <header className="border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 w-full shadow-xs transition-colors duration-150">
      <div className="w-full max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: 8byte Brand Treatment & Scope Navigation */}
        <div className="flex items-center space-x-4">
          {selectedSector ? (
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-sm font-semibold shadow-xs transition-colors group"
              title="Return to full portfolio dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Dashboard</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base tracking-tight shadow-xs shadow-blue-500/20 shrink-0">
              8b
            </div>
          )}

          <div>
            <div className="flex items-center space-x-3">
              <span className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-2xl tracking-tight">
                8byte
              </span>
              <span className="text-slate-300 dark:text-slate-600 font-light text-lg">/</span>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-base sm:text-lg tracking-tight">
                Portfolio Dashboard
              </h1>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Market Feeds
              </span>
            </div>
            <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              {activeCount} Active Holdings • Real-time valuation via Yahoo & Google Finance
            </p>
          </div>
        </div>

        {/* Right: Refresh Controls, Theme Toggle & Timestamp */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* 15-second countdown timer badge */}
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400">Auto Refresh:</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800/60 px-2 py-0.5 rounded text-xs">
              {countdown}s
            </span>
          </div>

          {/* Last sync timestamp */}
          <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 px-2 py-2">
            <span>Last Sync:</span>
            <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold ml-1.5">{formattedTime}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-xs ${
              isRefreshing
                ? "bg-blue-100 dark:bg-blue-950 text-blue-400 dark:text-blue-500 border border-blue-200 dark:border-blue-800 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 active:scale-98"
            }`}
            title="Refresh CMP & Fundamentals Now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
