/**
 * Supabase server client (App Router). Use inside Server Components, Route
 * Handlers and Server Actions. Returns null when env vars are missing.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // No-op: writing cookies happens in middleware / route handlers.
      },
      remove() {
        // No-op
      },
    },
  });
}
