import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const reviewsRpcSecret = process.env.SUPABASE_REVIEWS_RPC_SECRET!;

let client: SupabaseClient | null = null;

function getReviewAdminSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}

export function getReviewsRpcSecret(): string {
  if (!reviewsRpcSecret) {
    throw new Error("Missing SUPABASE_REVIEWS_RPC_SECRET");
  }
  return reviewsRpcSecret;
}

export function getReviewAdminRpcClient(): SupabaseClient {
  return getReviewAdminSupabaseClient();
}
