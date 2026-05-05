import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Anonymous Supabase client. Reads only — RLS limits anon to seed rows
 * (user_id IS NULL). Used as a fallback when server-side auth is unavailable.
 */
export const publicSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
