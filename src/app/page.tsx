import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  Cpu,
  FileText,
  MessageSquare,
  Plug,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HenryMark } from "@/components/henry-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[800px] bg-henry-mesh" />

      {/* Top bar */}
      <header className="container flex h-16 items-center justify-between">
        <Link href="/">
          <HenryMark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#workflow" className="hover:text-foreground">Workflow</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="glow" asChild>
            <Link href="/signup">Get Henry</Link>
          </Button>
        </div>
      </header>

      <Hero />
      <LogosStrip />
      <Features />
      <WorkflowShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="container relative pt-16 pb-24 text-center sm:pt-24">
      <Badge className="mx-auto mb-6">
        <Sparkles className="mr-1 h-3 w-3" /> Now in private beta
      </Badge>
      <h1 className="mx-auto max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
        The AI coworker that actually
        <span className="henry-gradient-text"> ships your work.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Henry plans projects, drafts deliverables, runs your weekly admin, and
        keeps your workspace memory in one calm place — so you stop juggling
        ten tools and start operating like a 50-person team.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" variant="glow" asChild>
          <Link href="/signup">
            Hire Henry — free to try <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">See live demo</Link>
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        No credit card. Demo data preloaded.
      </p>

      {/* Hero preview */}
      <div className="relative mx-auto mt-16 max-w-5xl">
        <div className="absolute -inset-x-12 -inset-y-8 -z-10 bg-henry-glow blur-2xl" />
        <Card className="overflow-hidden border-white/40 bg-card/80 shadow-2xl backdrop-blur-xl dark:border-white/5">
          <CardContent className="p-0">
            <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
              <div className="hidden border-r p-4 sm:block">
                <HenryMark />
                <div className="mt-6 space-y-1.5 text-sm">
                  {[
                    ["Dashboard", LayoutPreviewIcon],
                    ["AI Chat", MessageSquare],
                    ["Tasks", ClipboardList],
                    ["Deliverables", FileText],
                    ["Memory", Workflow],
                    ["Integrations", Plug],
                  ].map(([label, Icon]) => {
                    const I = Icon as React.ComponentType<{ className?: string }>;
                    return (
                      <div
                        key={label as string}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground"
                      >
                        <I className="h-3.5 w-3.5" />
                        <span className="text-xs">{label as string}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3 p-5 text-left">
                <div className="flex items-start gap-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                    Morning. You have 3 tasks due today and a client newsletter
                    waiting on a draft. Want me to draft it now using your Q2
                    case studies?
                  </div>
                </div>
                <div className="flex items-start justify-end gap-3">
                  <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Yes — keep it under 200 words and end with a workshop CTA.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                      Drafted. Saved to <b>Deliverables → Q2 newsletter</b> and
                      added a follow-up task to schedule it Thursday 9am.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Deliverable saved
                      </Badge>
                      <Badge variant="warning">
                        <ClipboardList className="mr-1 h-3 w-3" /> Task created
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function LayoutPreviewIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BarChart3 {...props} />;
}

function LogosStrip() {
  return (
    <section className="border-y bg-muted/30 py-8">
      <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">
          Built for teams using
        </span>
        {["Notion", "Linear", "Slack", "Stripe", "QuickBooks", "Google Workspace"].map(
          (l) => (
            <span key={l} className="font-medium">
              {l}
            </span>
          ),
        )}
      </div>
    </section>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: "AI coworker chat",
    body: "Ask Henry to draft, plan, summarize, or reconcile. Streaming replies, full memory, and the tone of a senior teammate.",
  },
  {
    icon: ClipboardList,
    title: "Task execution",
    body: "Henry creates tasks alongside its replies, tracks priority and due dates, and nudges you on what's next.",
  },
  {
    icon: FileText,
    title: "Deliverables library",
    body: "Every report, post, SOP, and email is saved, tagged, and re-usable. Your work compounds.",
  },
  {
    icon: Workflow,
    title: "Workspace memory",
    body: "Save your brand voice, services, pricing, and client notes once. Henry uses them in every reply.",
  },
  {
    icon: Plug,
    title: "Integrations",
    body: "Gmail, Drive, Canva, QuickBooks, Xero — coming online one provider at a time.",
  },
  {
    icon: Cpu,
    title: "Built for trust",
    body: "Your data lives in your Supabase project. Bring your own AI key. Audit every action.",
  },
];

function Features() {
  return (
    <section id="features" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline">Capabilities</Badge>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          One coworker. Every part of the job.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Henry isn't a chatbot bolted onto your sidebar. It's a system that
          plans, drafts, files, and follows up.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="group transition hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function WorkflowShowcase() {
  const steps = [
    { n: "01", t: "Tell Henry the goal", b: "“Write a Q2 client newsletter and schedule it.”" },
    { n: "02", t: "Henry drafts + plans", b: "Pulls your brand voice, generates copy, creates a task." },
    { n: "03", t: "You approve", b: "One-click save to Deliverables. Edit inline or send back for revisions." },
    { n: "04", t: "Henry files & follows up", b: "Logs the work, tracks the deadline, nudges you next week." },
  ];
  return (
    <section id="workflow" className="border-t bg-muted/30 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline">How it works</Badge>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From prompt to filed work in under a minute.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.n}>
              <CardContent className="p-6">
                <div className="text-xs font-mono text-primary">{s.n}</div>
                <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.b}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote:
        "Henry replaced three of my SOPs and a virtual assistant. I run client ops in 30 minutes a day now.",
      name: "Amelia R.",
      role: "Founder, brand studio",
    },
    {
      quote:
        "It's the first AI tool that feels like a coworker, not a search box. The memory is the killer feature.",
      name: "Daniel O.",
      role: "Solo bookkeeper",
    },
    {
      quote:
        "We onboarded Henry in an afternoon and shipped 12 client reports the same week.",
      name: "Priya K.",
      role: "Agency operator",
    },
  ];
  return (
    <section className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline">Loved by operators</Badge>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          The team you wish you'd hired six months ago.
        </h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {items.map((t) => (
          <Card key={t.name}>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed">“{t.quote}”</p>
              <div className="mt-5 text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Testimonials shown are illustrative placeholders for the demo.
      </p>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Solo",
      price: "$29",
      tagline: "For founders running the show.",
      features: [
        "1 workspace",
        "Unlimited chat with Henry",
        "10 deliverables/day",
        "Workspace memory",
      ],
    },
    {
      name: "Studio",
      price: "$79",
      tagline: "For small teams shipping client work.",
      features: [
        "5 workspaces",
        "Unlimited deliverables",
        "Integrations (Gmail, Drive, Canva)",
        "Priority models",
      ],
      featured: true,
    },
    {
      name: "Operator",
      price: "Custom",
      tagline: "For ops-heavy businesses with finance integrations.",
      features: [
        "QuickBooks + Xero integrations",
        "Custom workflows",
        "SSO + audit logs",
        "Dedicated success",
      ],
    },
  ];
  return (
    <section id="pricing" className="border-t bg-muted/30 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline">Pricing</Badge>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Pay for an outcome, not a seat.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={
                t.featured
                  ? "border-primary/40 shadow-lg shadow-primary/10"
                  : ""
              }
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  {t.featured && <Badge>Most popular</Badge>}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{t.price}</span>
                  {t.price.startsWith("$") && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={t.featured ? "glow" : "outline"}
                  asChild
                >
                  <Link href="/signup">Start free</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    {
      q: "Is Henry a wrapper around ChatGPT?",
      a: "No. Henry is a workspace operating system — chat is one surface. It plans, drafts, files, and follows up using your saved memory and deliverables.",
    },
    {
      q: "Where does my data live?",
      a: "In your own Supabase project. You can self-host, export, or delete at any time.",
    },
    {
      q: "Which AI model does Henry use?",
      a: "You bring your own key. Henry supports Anthropic Claude and OpenAI GPT models out of the box.",
    },
    {
      q: "Are integrations live yet?",
      a: "Gmail, Drive, Canva, QuickBooks and Xero are scaffolded for early access — request access from Settings.",
    },
  ];
  return (
    <section id="faq" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline">FAQ</Badge>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions, answered plainly.
        </h2>
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl gap-3">
        {qs.map((f) => (
          <Card key={f.q}>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container pb-24">
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-fuchsia-500/5 to-sky-500/10">
        <CardContent className="grid items-center gap-6 p-10 text-center md:grid-cols-[1fr_auto] md:text-left">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Hire Henry. Ship more this week.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Free to try, demo data preloaded. You'll know in 10 minutes.
            </p>
          </div>
          <Button size="lg" variant="glow" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <HenryMark />
        <p>© {new Date().getFullYear()} Henry. Made for operators.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
