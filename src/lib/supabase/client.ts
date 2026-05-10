/**
 * Supabase browser client.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Returns null when the env vars are missing so the demo experience keeps
 * working — callers should handle the null and fall back to the local
 * Zustand store (see src/lib/store.ts).
 */

import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
