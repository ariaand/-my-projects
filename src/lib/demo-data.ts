import type {
  Deliverable,
  IntegrationCard,
  MemoryItem,
  Task,
  Workspace,
} from "./types";

export const demoWorkspace: Workspace = {
  id: "ws_demo",
  name: "Northwind Studio",
  industry: "Branding & creative services",
  brand_voice:
    "Confident, warm, plainspoken. We sound like a senior designer talking to a founder over coffee.",
  created_at: "2026-01-04T12:00:00.000Z",
};

export const demoMemory: MemoryItem[] = [
  {
    id: "mem_1",
    workspace_id: demoWorkspace.id,
    title: "Brand voice",
    content:
      "Confident, warm, plainspoken. Avoid jargon and emojis. Use 'we' and 'you'. Short sentences for emphasis.",
    category: "brand",
    pinned: true,
    updated_at: "2026-04-22T09:12:00.000Z",
  },
  {
    id: "mem_2",
    workspace_id: demoWorkspace.id,
    title: "Service menu & pricing",
    content:
      "Brand sprint $6,500 (2 weeks). Identity system $12,000 (4 weeks). Website $18,000 (6 weeks). Retainer $4,500/mo.",
    category: "pricing",
    pinned: true,
    updated_at: "2026-04-30T14:00:00.000Z",
  },
  {
    id: "mem_3",
    workspace_id: demoWorkspace.id,
    title: "Ideal client profile",
    content:
      "Seed–Series B founders ($1M–$10M raised) launching in B2B SaaS or fintech. Pain: undifferentiated category, slow website, mismatched team.",
    category: "client",
    pinned: false,
    updated_at: "2026-05-02T18:30:00.000Z",
  },
  {
    id: "mem_4",
    workspace_id: demoWorkspace.id,
    title: "Key links",
    content:
      "Portfolio: northwind.studio · Calendar: cal.com/northwind · Notion case studies: notion.so/northwind/cases",
    category: "links",
    pinned: false,
    updated_at: "2026-03-19T11:20:00.000Z",
  },
];

const today = new Date();
const inDays = (n: number) =>
  new Date(today.getTime() + n * 86400000).toISOString();

export const demoTasks: Task[] = [
  {
    id: "task_1",
    workspace_id: demoWorkspace.id,
    title: "Draft Q2 client newsletter",
    description: "200-word update on new case studies + workshop invite.",
    status: "in_progress",
    priority: "high",
    due_date: inDays(2),
    notes: null,
    created_at: inDays(-3),
    updated_at: inDays(-1),
  },
  {
    id: "task_2",
    workspace_id: demoWorkspace.id,
    title: "Reconcile April Stripe payouts",
    description: "Match Stripe payouts to QuickBooks deposits, flag mismatches.",
    status: "pending",
    priority: "high",
    due_date: inDays(1),
    notes: null,
    created_at: inDays(-2),
    updated_at: inDays(-2),
  },
  {
    id: "task_3",
    workspace_id: demoWorkspace.id,
    title: "Write SOP: New client onboarding",
    description: "Cover kickoff, brand questionnaire, intake call, deposit.",
    status: "pending",
    priority: "medium",
    due_date: inDays(7),
    notes: null,
    created_at: inDays(-5),
    updated_at: inDays(-5),
  },
  {
    id: "task_4",
    workspace_id: demoWorkspace.id,
    title: "Send proposal — Acme rebrand",
    description: "Use brand sprint template, reference $12K identity tier.",
    status: "completed",
    priority: "high",
    due_date: inDays(-2),
    notes: "Sent. Acme replied — call booked Thursday.",
    created_at: inDays(-9),
    updated_at: inDays(-2),
  },
  {
    id: "task_5",
    workspace_id: demoWorkspace.id,
    title: "Refresh portfolio hero copy",
    description: "Tighten headline, add latest 2 case studies.",
    status: "pending",
    priority: "low",
    due_date: inDays(14),
    notes: null,
    created_at: inDays(-1),
    updated_at: inDays(-1),
  },
];

export const demoDeliverables: Deliverable[] = [
  {
    id: "deliv_1",
    workspace_id: demoWorkspace.id,
    title: "Q2 client newsletter — draft 1",
    kind: "email",
    body: "Subject: Two new case studies + a workshop you'll actually want to attend\n\nHi {{first_name}},\n\nIt's been a busy quarter at Northwind. We just shipped two rebrands we're proud of...",
    tags: ["newsletter", "Q2"],
    created_at: inDays(-1),
  },
  {
    id: "deliv_2",
    workspace_id: demoWorkspace.id,
    title: "SOP — New client onboarding",
    kind: "sop",
    body: "## Purpose\nA repeatable, friendly onboarding that gets new clients to value in 7 days.\n\n## Steps\n1. Send welcome email within 1 business day...",
    tags: ["operations", "onboarding"],
    created_at: inDays(-4),
  },
  {
    id: "deliv_3",
    workspace_id: demoWorkspace.id,
    title: "April financial summary",
    kind: "financial_summary",
    body: "Revenue: $48,200 (+12% MoM). New MRR: $9,500. Top driver: identity system retainers. Outstanding A/R: $14,300.",
    tags: ["finance", "monthly"],
    created_at: inDays(-7),
  },
  {
    id: "deliv_4",
    workspace_id: demoWorkspace.id,
    title: "LinkedIn post — case study launch",
    kind: "social_post",
    body: "We rebranded a fintech that was being mistaken for a bank. Here's what changed and what it cost...",
    tags: ["linkedin", "case-study"],
    created_at: inDays(-2),
  },
];

export const integrationCards: IntegrationCard[] = [
  {
    provider: "gmail",
    name: "Gmail",
    description:
      "Draft and send emails on your behalf, triage your inbox, summarize threads.",
    status: "coming_soon",
    category: "communication",
  },
  {
    provider: "google_drive",
    name: "Google Drive",
    description:
      "Save deliverables to Drive, read briefs and SOPs as living context for Henry.",
    status: "coming_soon",
    category: "storage",
  },
  {
    provider: "canva",
    name: "Canva",
    description:
      "Generate on-brand visuals from saved brand kits — covers, social posts, decks.",
    status: "coming_soon",
    category: "design",
  },
  {
    provider: "quickbooks",
    name: "QuickBooks",
    description:
      "Reconcile transactions, generate P&L, build cash-flow summaries.",
    status: "coming_soon",
    category: "finance",
  },
  {
    provider: "xero",
    name: "Xero",
    description:
      "Same powers as the QuickBooks integration, for Xero-based businesses.",
    status: "coming_soon",
    category: "finance",
  },
];

export const demoUsage = {
  messagesThisWeek: 184,
  messagesLastWeek: 142,
  deliverablesThisMonth: 27,
  tasksCompletedThisMonth: 38,
  hoursSavedEstimate: 22,
};
