import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Server-side Supabase client that forwards Clerk's session token.
 * Used inside server components and server-side data loaders.
 *
 * - Signed in: getToken() returns Clerk's JWT, RLS resolves auth.jwt() ->> 'sub'
 *   to the Clerk user ID, and queries scope to the user's rows + seed.
 * - Signed out: getToken() returns null, the client is anonymous, and RLS
 *   only returns rows where user_id IS NULL (seed/demo data).
 */
export async function getServerSupabaseClient(): Promise<SupabaseClient> {
  const { getToken } = await auth();
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => (await getToken()) ?? null,
  });
}
