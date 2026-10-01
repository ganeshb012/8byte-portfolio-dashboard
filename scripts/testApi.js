async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/portfolio");
    const data = await res.json();
    console.log("=== PORTFOLIO API RESPONSE ===");
    console.log("Status:", res.status);
    console.log("Summary:", JSON.stringify(data.summary, null, 2));
    console.log("\n=== SECTOR SUMMARIES ===");
    data.sectors.forEach((sec) => {
      console.log(
        `${sec.sector.padEnd(18)} | Count: ${sec.stockCount} | Investment: ${sec.totalInvestment} | PV: ${sec.totalPresentValue} | P&L: ${sec.totalGainLoss} (${sec.gainLossPercentage}%)`
      );
    });
    console.log("\n=== ACTIVE STOCKS SAMPLE ===");
    data.allStocks.slice(0, 5).forEach((stock) => {
      console.log(
        `${stock.name.padEnd(18)} (${stock.ticker.padEnd(10)}) | Buy: ${stock.purchasePrice} | Qty: ${stock.quantity} | Inv: ${stock.investment} | Port%: ${stock.portfolioPercentage}% | CMP: ${stock.cmp} [${stock.cmpSource}] | PV: ${stock.presentValue} | P&L: ${stock.gainLoss} (${stock.gainLossPercentage}%) | PE: ${stock.peRatio} | Earnings: ${stock.latestEarnings}`
      );
    });
  } catch (err) {
    console.error("Test failed:", err);
  }
}
test();
