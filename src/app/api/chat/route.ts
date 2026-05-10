import { NextResponse } from "next/server";
import { streamChat, type ChatTurn } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import type { MemoryItem, Workspace } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  workspace: Pick<Workspace, "name" | "industry" | "brand_voice">;
  memory: MemoryItem[];
  messages: ChatTurn[];
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const system = buildSystemPrompt({
    workspace: body.workspace,
    memory: body.memory ?? [],
  });

  const stream = await streamChat({ system, messages: body.messages });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
