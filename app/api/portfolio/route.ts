import { NextResponse } from "next/server";
import { getEnrichedPortfolio } from "@/lib/financeService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portfolio = await getEnrichedPortfolio();
    return NextResponse.json(portfolio, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[API /api/portfolio] Internal error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate enriched portfolio",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
