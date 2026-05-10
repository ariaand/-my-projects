/**
 * Domain types shared across server and client.
 * These map 1:1 to the Supabase schema in supabase/schema.sql.
 */

export type UUID = string;

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export type DeliverableKind =
  | "report"
  | "social_post"
  | "email"
  | "sop"
  | "client_note"
  | "marketing_plan"
  | "financial_summary"
  | "other";

export type IntegrationProvider =
  | "gmail"
  | "google_drive"
  | "canva"
  | "quickbooks"
  | "xero";

export type IntegrationStatus = "not_connected" | "coming_soon" | "connected";

export interface Workspace {
  id: UUID;
  name: string;
  industry: string | null;
  brand_voice: string | null;
  created_at: string;
}

export interface MemoryItem {
  id: UUID;
  workspace_id: UUID;
  title: string;
  content: string;
  category:
    | "business"
    | "brand"
    | "services"
    | "pricing"
    | "client"
    | "links"
    | "other";
  pinned: boolean;
  updated_at: string;
}

export interface Task {
  id: UUID;
  workspace_id: UUID;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: UUID;
  workspace_id: UUID;
  title: string;
  kind: DeliverableKind;
  body: string;
  tags: string[];
  created_at: string;
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: UUID;
  workspace_id: UUID;
  thread_id: UUID;
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface UsageLog {
  id: UUID;
  workspace_id: UUID;
  kind: "chat" | "deliverable" | "task_suggestion";
  tokens_in: number;
  tokens_out: number;
  created_at: string;
}

export interface IntegrationCard {
  provider: IntegrationProvider;
  name: string;
  description: string;
  status: IntegrationStatus;
  category: "communication" | "storage" | "design" | "finance";
}
