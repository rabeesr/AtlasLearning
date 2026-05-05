"use client";

import { useAuth } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useRef } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Client-side Supabase client that forwards Clerk's session token via the
 * `accessToken` callback. The callback is invoked per request, so token
 * refresh is automatic — never cache the token yourself.
 */
export function useSupabase() {
  const { getToken, userId, isSignedIn, isLoaded } = useAuth();

  // Keep the latest getToken in a ref so the client created on first render
  // always sees fresh auth — no need to re-create the client on auth changes.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const clientRef = useRef<SupabaseClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = createClient(supabaseUrl, supabaseAnonKey, {
      accessToken: async () => (await getTokenRef.current()) ?? null,
    });
  }

  return { supabase: clientRef.current, userId, isSignedIn, isLoaded };
}
