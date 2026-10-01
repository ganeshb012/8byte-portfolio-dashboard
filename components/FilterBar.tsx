"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSector: string | null;
  onSectorChange: (sector: string | null) => void;
  sectors: string[];
  filterType: "all" | "profit" | "loss";
  onFilterTypeChange: (filter: "all" | "profit" | "loss") => void;
  viewMode: "active" | "closed";
  onViewModeChange: (mode: "active" | "closed") => void;
  activeCount: number;
  closedCount: number;
  totalFiltered: number;
  onBackToDashboard?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSector,
  onSectorChange,
  sectors,
  filterType,
  onFilterTypeChange,
  viewMode,
  onViewModeChange,
  activeCount,
  closedCount,
  totalFiltered,
  onBackToDashboard,
}) => {
  const hasActiveFilters = Boolean(searchQuery || selectedSector || filterType !== "all");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 mb-8 shadow-xs space-y-3.5">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Active vs Closed Portfolio Tabs */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => onViewModeChange("active")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === "active"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Active Holdings ({activeCount})
            </button>
            <button
              onClick={() => onViewModeChange("closed")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === "closed"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Closed Positions ({closedCount})
            </button>
          </div>
        </div>

        {/* Right: Search & Filters - visible only when viewing Active Holdings */}
        {viewMode === "active" && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[260px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stock or ticker..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sector select dropdown */}
            <div className="relative">
              <select
                value={selectedSector || ""}
                onChange={(e) => onSectorChange(e.target.value || null)}
                className="px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-9 cursor-pointer transition-colors"
              >
                <option value="">All Sectors ({sectors.length})</option>
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* P&L Filter Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-sm">
              <button
                onClick={() => onFilterTypeChange("all")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  filterType === "all"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => onFilterTypeChange("profit")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  filterType === "profit"
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => onFilterTypeChange("loss")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  filterType === "loss"
                    ? "bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400"
                }`}
              >
                Losers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter status row */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-bold">{totalFiltered}</strong> positions
          </span>
          {viewMode === "active" && selectedSector && (
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 px-2.5 py-0.5 rounded-md font-medium text-xs">
              Sector: {selectedSector}
            </span>
          )}
        </div>

        {viewMode === "active" && hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange("");
              onSectorChange(null);
              onFilterTypeChange("all");
              if (onBackToDashboard) onBackToDashboard();
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors hover:underline text-sm"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
