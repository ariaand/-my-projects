/**
 * Provider-agnostic streaming chat. Returns a ReadableStream<Uint8Array>
 * that yields plain UTF-8 text chunks (no SSE framing) so the client can
 * just read and append them.
 *
 * Picks the provider via HENRY_AI_PROVIDER:
 *   - "anthropic" → Claude via @anthropic-ai/sdk
 *   - "openai"    → OpenAI via openai
 *   - "demo"      → canned, deterministic stream so the app runs without keys
 *
 * AI key locations: see .env.example.
 */

import type { ChatRole } from "@/lib/types";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export type Provider = "anthropic" | "openai" | "demo";

export function resolveProvider(): Provider {
  const explicit = (process.env.HENRY_AI_PROVIDER ?? "").toLowerCase();
  if (explicit === "anthropic" || explicit === "openai" || explicit === "demo") {
    return explicit;
  }
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "demo";
}

export async function streamChat({
  system,
  messages,
}: {
  system: string;
  messages: ChatTurn[];
}): Promise<ReadableStream<Uint8Array>> {
  const provider = resolveProvider();

  if (provider === "anthropic") return streamAnthropic({ system, messages });
  if (provider === "openai") return streamOpenAI({ system, messages });
  return streamDemo({ messages });
}

// ── Anthropic ────────────────────────────────────────────────────────────────

async function streamAnthropic({
  system,
  messages,
}: {
  system: string;
  messages: ChatTurn[];
}): Promise<ReadableStream<Uint8Array>> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model,
          max_tokens: 1024,
          system,
          messages: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n[Henry: ${(err as Error).message}]`),
        );
        controller.close();
      }
    },
  });
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

async function streamOpenAI({
  system,
  messages,
}: {
  system: string;
  messages: ChatTurn[];
}): Promise<ReadableStream<Uint8Array>> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model,
          stream: true,
          messages: [
            { role: "system", content: system },
            ...messages.map((m) => ({
              role:
                m.role === "assistant"
                  ? ("assistant" as const)
                  : ("user" as const),
              content: m.content,
            })),
          ],
        });
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n[Henry: ${(err as Error).message}]`),
        );
        controller.close();
      }
    },
  });
}

// ── Demo ─────────────────────────────────────────────────────────────────────

function pickDemoReply(prompt: string): string {
  const p = prompt.toLowerCase();

  if (/(newsletter|email|caption|post)/.test(p)) {
    return [
      "Here's a draft you can ship today.",
      "",
      "**Subject:** Two new case studies + a workshop you'll actually want to attend",
      "",
      "Hi {{first_name}},",
      "",
      "It's been a busy quarter at Northwind. We just shipped two rebrands we're proud of — one for a Series B fintech that was being mistaken for a bank, and one for a solo healthcare practice that needed to look like a real brand without losing its warmth. Both case studies are live on the site.",
      "",
      "We're also running a small workshop on April 30: *How to brief a brand designer in one page.* It's free, capped at 25 founders, and almost full.",
      "",
      "[Save my seat →](https://northwind.studio/workshop)",
      "",
      "— Northwind Studio",
      "",
      "Filed as: Q2 client newsletter — draft 2 in Deliverables",
      "New task: Schedule the newsletter send · priority medium · due flexible",
    ].join("\n");
  }

  if (/(sop|onboarding|process|workflow)/.test(p)) {
    return [
      "Here's an SOP you can drop into Notion and tweak.",
      "",
      "## Purpose",
      "A repeatable, friendly onboarding that gets new clients to value in 7 days.",
      "",
      "## Steps",
      "1. **Day 0** — Send welcome email + brand questionnaire (20 min).",
      "2. **Day 1** — Kickoff call (45 min). Walk through scope, milestones, and access.",
      "3. **Day 2** — Collect deposit (50%) and grant tooling access (Drive, Slack channel).",
      "4. **Day 3–6** — Discovery work + competitive landscape audit.",
      "5. **Day 7** — Strategy readout + sign-off on direction.",
      "",
      "## Owners",
      "- Account lead drives Days 0–2.",
      "- Senior designer drives Days 3–7.",
      "",
      "Filed as: SOP — New client onboarding (v2) in Deliverables",
      "New task: Review SOP with the team Friday · priority medium · due flexible",
    ].join("\n");
  }

  if (/(reconcile|bookkeeping|finance|p&l|stripe|quickbooks|cash)/.test(p)) {
    return [
      "Walking through April. Here's the summary I'd send to your accountant.",
      "",
      "**April financial summary**",
      "- Revenue: $48,200 (+12% MoM)",
      "- New MRR: $9,500 from 3 retainers",
      "- Top revenue driver: identity-system retainers",
      "- Outstanding A/R: $14,300 (2 invoices > 30 days)",
      "- Stripe → QuickBooks reconciliation: 2 mismatches flagged (line items below)",
      "",
      "Once the QuickBooks integration is live, I'll fix the mismatches automatically and post a tidy P&L each month.",
      "",
      "Filed as: April financial summary in Deliverables",
      "New task: Chase 2 overdue invoices · priority high · due flexible",
    ].join("\n");
  }

  if (/(plan|week|priorit|task|todo)/.test(p)) {
    return [
      "Here's how I'd run your week. Three buckets, in priority order.",
      "",
      "**Ship**",
      "1. Q2 client newsletter — draft is filed; needs your final pass and send.",
      "2. Acme proposal follow-up — call is Thursday; I'll prep talking points.",
      "",
      "**Operate**",
      "3. April reconciliation — 2 mismatches; I'll resolve once QuickBooks is connected.",
      "4. Onboarding SOP — ready for team review on Friday.",
      "",
      "**Grow**",
      "5. Refresh portfolio hero copy with the latest 2 case studies.",
      "",
      "New task: Send Q2 newsletter Thursday 9am · priority high · due flexible",
      "New task: Prep Acme call notes · priority high · due flexible",
    ].join("\n");
  }

  return [
    "On it. To make this useful, I'll work from your saved brand voice and services.",
    "",
    "Tell me a little more — what's the audience, the channel, and the outcome you want? If you'd rather, I can pick a sensible default and you can redirect me after.",
  ].join("\n");
}

function streamDemo({
  messages,
}: {
  messages: ChatTurn[];
}): ReadableStream<Uint8Array> {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const reply = pickDemoReply(last?.content ?? "");
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const tokens = reply.split(/(\s+)/);
      for (const tk of tokens) {
        controller.enqueue(encoder.encode(tk));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
}
