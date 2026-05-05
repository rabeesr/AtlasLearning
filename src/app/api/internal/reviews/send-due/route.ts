import { NextResponse } from "next/server";

import { sendDueReviewEmails } from "@/lib/reviews/review-service";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.INTERNAL_CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await sendDueReviewEmails();
  return NextResponse.json({ ok: true, ...result });
}
