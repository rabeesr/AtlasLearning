import { NextResponse } from "next/server";

import { handleInboundReviewWebhook } from "@/lib/reviews/review-service";

export async function POST(request: Request) {
  try {
    const result = await handleInboundReviewWebhook(request);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("[email-inbound] webhook failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
