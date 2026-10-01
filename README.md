# Octa Byte AI - Dynamic Portfolio Dashboard

A real-time, responsive **Dynamic Portfolio Dashboard** built for the Octa Byte AI Technical Assignment using **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Node.js**.

---

## 🌟 Key Features

1. **Excel-Based Portfolio Data**:
   - Accurately extracted from `F9001561_ADDBA737E8_B72562937A.xlsx`.
   - **26 Active Holdings** across **6 Sectors** (`Financial Sector`, `Tech Sector`, `Consumer`, `Power`, `Pipe Sector`, `Others`).
   - Exact initial investment total: **₹15,43,060.00** matching cell `E35` of the Excel sheet.
   - Separate view for **3 Closed / Sold Positions** (`Infy`, `Happiest Minds`, `EaseMyTrip`).

2. **Live External Market Data**:
   - **CMP (Current Market Price)**: Fetched from **Yahoo Finance** in real-time.
   - **P/E Ratio & Latest Earnings**: Fetched from **Google Finance** with fundamental data parsing.
   - **Graceful Error Handling & Fallbacks**: If external APIs fail or throttle, the dashboard transparently falls back to cached data or the Excel baseline without crashing or showing blank states.

3. **Required Financial Calculations**:
   - $\text{Investment} = \text{Purchase Price} \times \text{Quantity}$
   - $\text{Portfolio \%} = \frac{\text{Investment}}{\text{Total Investment}} \times 100$
   - $\text{Present Value} = \text{CMP} \times \text{Quantity}$
   - $\text{Gain/Loss} = \text{Present Value} - \text{Investment}$
   - $\text{Gain/Loss \%} = \frac{\text{Gain/Loss}}{\text{Investment}} \times 100$

4. **Sector-Level Aggregations**:
   - Stocks grouped by Sector with collapsible/expandable accordions.
   - Sector summaries show **Total Investment**, **Total Present Value**, **Gain/Loss**, **Gain/Loss %**, and **Portfolio Weight %**.

5. **15-Second Auto-Refresh Cycle**:
   - Visual countdown badge (`Next refresh: 15s...`) automatically triggers background polling.
   - Manual **"Refresh Now"** button with loading animation.
   - Green (gains) and Red (losses) color styling with directional indicators.

6. **Interactive Search & Filtering**:
   - Real-time search across stock names and NSE/BSE tickers.
   - Quick sector filter pills.
   - P&L filter: "All", "Gainers", "Losers".
   - Sortable columns (click column headers to sort ascending/descending).

---

## 🏗️ Project Architecture

```
8-byte-portfolio-dashboard/
├── app/
│   ├── api/
│   │   └── portfolio/
│   │       └── route.ts         # Server-side API endpoint for enriched portfolio data
│   ├── globals.css              # Custom styling & scrollbar
│   ├── layout.tsx               # Root layout & page metadata
│   └── page.tsx                 # Main dashboard page with state & auto-refresh loop
├── components/
│   ├── Header.tsx               # Top branding, status indicator, and countdown timer
│   ├── SummaryCards.tsx         # KPI cards (Portfolio Value, P&L, Market Breadth, Outliers)
│   ├── SectorBreakdown.tsx      # Sector performance cards & allocation bars
│   ├── FilterBar.tsx            # Search input, sector filter, P&L toggle, active/closed tabs
│   └── PortfolioTable.tsx       # Grouped table with sorting, expandable sectors, & calculations
├── data/
│   └── portfolioData.json       # Structured holdings extracted from the Excel spreadsheet
├── lib/
│   ├── calculations.ts          # Core math formulas, sector aggregation, & INR currency formatting
│   ├── financeService.ts        # Server-side Yahoo/Google Finance fetchers, cache & rate-limiting
│   └── types.ts                 # Full TypeScript interfaces
├── scripts/
│   └── testApi.js               # Node.js automated test script for API verification
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## ⚡ Server-Side Caching & Rate Limiting

To comply with the assignment's external request requirements and avoid rate limits:
- **CMP Caching**: 14–15 second in-memory cache TTL for rapid polling.
- **Fundamentals Caching**: 5-minute TTL for Google Finance P/E and EPS data (quarterly metrics do not change sub-minute).
- **Concurrency Control**: External requests are dispatched in controlled parallel batches of 6.
- **Security**: No external finance API calls are made from the client browser; all logic resides securely on the Node.js server.

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation & Execution
```bash
# 1. Install dependencies (already installed in this directory)
npm install

# 2. Run development server
npm run dev

# OR Build and run production server
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing

To test the backend API endpoint and calculations independently:
```bash
node scripts/testApi.js
```

**Verified Output:**
- HTTP Status: `200 OK`
- Active Holdings: `26`
- Total Portfolio Investment: `₹15,43,060.00` (100.00% matching Excel cell `E35`)
- Sectors verified: `Financial Sector`, `Tech Sector`, `Consumer`, `Power`, `Pipe Sector`, `Others`
