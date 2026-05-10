/**
 * Integration registry — placeholders.
 *
 * Each integration adapter implements the same shape (oauth start/callback +
 * a typed client) so we can swap providers in/out without touching the UI.
 *
 * To wire a real integration:
 *   1. Drop the adapter in src/lib/integrations/<provider>/index.ts
 *   2. Add OAuth env vars in .env.example (already stubbed)
 *   3. Register the adapter below
 *   4. Build a /api/integrations/<provider>/start + /callback route
 *   5. Persist tokens to the `integrations` table (see supabase/schema.sql)
 */

import type { IntegrationProvider } from "@/lib/types";

export interface IntegrationAdapter {
  provider: IntegrationProvider;
  // OAuth — not yet implemented.
  startOAuth: () => Promise<{ url: string }>;
  handleCallback: (code: string) => Promise<{ access_token: string }>;
  // Capabilities the adapter exposes to Henry.
  capabilities: string[];
}

export const integrationRegistry: Partial<
  Record<IntegrationProvider, IntegrationAdapter>
> = {
  // gmail: gmailAdapter,
  // google_drive: googleDriveAdapter,
  // canva: canvaAdapter,
  // quickbooks: quickbooksAdapter,
  // xero: xeroAdapter,
};
