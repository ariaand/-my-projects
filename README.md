# Henry

> Your AI coworker for business owners and service providers.

Henry is a production-ready MVP web app where you chat with an AI coworker,
delegate tasks, generate deliverables, and run your weekly business operations
from one polished dashboard.

It's not a Viktor clone — it's an original take on the "AI coworker" category,
built with Next.js 14, TypeScript, Tailwind, shadcn-style primitives,
Supabase, and your choice of Anthropic or OpenAI.

---

## ✨ Features

- **AI Coworker Chat** — streaming chat backed by OpenAI or Anthropic, with the
  workspace memory injected into every system prompt. Falls back to a canned
  demo provider so the app runs out of the box.
- **Task Execution Dashboard** — board + list view, statuses
  (`pending` / `in_progress` / `completed`), priorities, due dates, notes.
- **Workspace Memory** — pinnable facts about the business, brand, services,
  pricing, clients and links.
- **Deliverables Library** — searchable, categorized: reports, social posts,
  emails, SOPs, client notes, marketing plans, financial summaries.
- **Integrations** scaffolded (Gmail, Google Drive, Canva, QuickBooks, Xero) —
  UI + adapter registry, OAuth flows ready to fill in.
- **Polished UI** — sidebar nav, glassmorphism accents, framer-motion
  animations, dark/light/system theme, mobile-first responsive layout.
- **Realistic demo data** preloaded so investor demos work in 10 seconds.

## 🧱 Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Styling**: Tailwind CSS + shadcn-style components + framer-motion
- **State**: Zustand (client) + TanStack Query (server)
- **Auth + DB + Storage**: Supabase
- **AI**: Anthropic Claude or OpenAI GPT (BYO key)
- **Notifications**: Sonner

## 🚀 Quickstart

```bash
git clone <this-repo> henry
cd henry
cp .env.example .env.local      # leave keys blank to run in demo mode
npm install
npm run dev
```

Open <http://localhost:3000>. The app boots into demo mode (mock data + canned
AI replies) so you can navigate every page without configuring anything.

## 🔑 Going live

### 1. Supabase

1. Create a project at <https://supabase.com>.
2. SQL Editor → run [`supabase/schema.sql`](supabase/schema.sql).
3. Project Settings → API → copy the URL + anon key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...      # for server-only admin writes
   ```
4. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to seed a workspace
   for the logged-in user.

### 2. AI provider

Pick **one**:

```env
# Anthropic
HENRY_AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6

# or OpenAI
HENRY_AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Provider selection lives in [`src/lib/ai/provider.ts`](src/lib/ai/provider.ts).
When no key is set, Henry returns deterministic demo replies for the chat
suggestions.

### 3. Integrations (optional)

The [`integrations` table](supabase/schema.sql) and the registry in
[`src/lib/integrations/index.ts`](src/lib/integrations/index.ts) are ready for
adapters. To add one:

1. Drop an adapter at `src/lib/integrations/<provider>/index.ts`.
2. Add OAuth env vars (already stubbed in `.env.example`).
3. Register the adapter and build `/api/integrations/<provider>/start` and
   `/callback` routes.
4. Persist tokens via the `integrations` table.

## 🗂️ Project layout

```
src/
├── app/
│   ├── (app)/                  # authenticated app shell
│   │   ├── layout.tsx          # sidebar + topbar
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── tasks/
│   │   ├── deliverables/
│   │   ├── memory/
│   │   ├── integrations/
│   │   └── settings/
│   ├── (auth)/                 # marketing/auth shell
│   │   ├── login/
│   │   └── signup/
│   ├── api/chat/route.ts       # streaming chat endpoint
│   ├── layout.tsx
│   ├── page.tsx                # landing page
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn-style primitives
│   ├── app/                    # sidebar, topbar, mobile nav
│   ├── auth/                   # auth form
│   ├── chat/                   # streaming chat UI
│   ├── dashboard/              # widget grid
│   ├── deliverables/
│   ├── memory/
│   ├── settings/
│   ├── tasks/
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── providers.tsx
└── lib/
    ├── ai/
    │   ├── provider.ts         # OpenAI / Anthropic / demo streamer
    │   └── system-prompt.ts    # injects workspace memory
    ├── integrations/index.ts   # adapter registry (placeholders)
    ├── supabase/
    │   ├── client.ts
    │   └── server.ts
    ├── demo-data.ts
    ├── store.ts                # Zustand store, mirrors DB schema
    ├── types.ts
    └── utils.ts
supabase/
├── schema.sql
└── seed.sql
```

## 🎨 Design system

- **Type**: Inter (sans) + Manrope (display)
- **Color**: violet → sky → fuchsia gradients on a soft neutral base; full
  dark-mode palette
- **Accents**: glassmorphism cards, mesh-gradient backgrounds, fluid Framer
  Motion entrances, gentle skeleton loaders
- **Inspiration**: Linear, Notion Calendar, Arc, Vercel, Superhuman, Claude AI

## 🚢 Deployment

### Vercel + Supabase (recommended)

1. Push this repo to GitHub.
2. Import to Vercel; framework preset is auto-detected.
3. Add the env vars from `.env.example` to **Project → Settings → Environment
   Variables**. The Supabase keys also need to be set in **Production**.
4. Deploy. Henry runs serverless on Vercel's Node.js runtime; the chat endpoint
   uses streaming responses out of the box.

### Self-hosting

```bash
npm run build && npm start
```

Or wrap in a Dockerfile (multi-stage `node:22-alpine`).

## 🛣️ Future scaling

- **Realtime**: replace TanStack Query polling with Supabase Realtime channels
  for tasks + deliverables.
- **Background jobs**: add a worker queue (Trigger.dev / Inngest) for
  scheduled deliverables (e.g. weekly newsletter, monthly P&L).
- **Vector memory**: store memory embeddings (`pgvector`) and retrieve
  top-k chunks instead of dumping the full memory into the system prompt.
- **Multi-workspace + collaborators**: extend `workspaces` with a
  `workspace_members` join table; RLS policies are already factored through a
  single `is_workspace_member` helper.
- **Audit log**: append to `usage_logs` on every AI call and integration
  action; expose in a Settings → Audit tab.
- **Tool use**: let Henry call typed tools (create task, file deliverable, send
  email) via Claude tool use / OpenAI function calling — the system prompt
  contract today is parsed in `src/components/chat/chat-client.tsx`.
- **Billing**: drop in Stripe + Polar for the pricing tiers shown on the
  landing page.

## 📝 License

MIT — make it your own.
