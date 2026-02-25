import dynamic from "next/dynamic";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowLeftRight, Server, Lightbulb } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";
const UnderTheHoodHeroViz = dynamic(
  () => import("./_components/under-the-hood-hero-viz").then(m => m.UnderTheHoodHeroViz),
  { loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
const ServerComparison = dynamic(
  () => import("./_components/server-comparison").then(m => m.ServerComparison),
  { loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

const topics = [
  {
    href: "/under-the-hood/event-loop",
    label: "The Event Loop",
    icon: RefreshCw,
    description: "How Python's event loop juggles multiple requests on a single thread — and why async matters.",
  },
  {
    href: "/under-the-hood/asgi-vs-wsgi",
    label: "ASGI vs WSGI",
    icon: ArrowLeftRight,
    description: "The two Python server standards. Why FastAPI chose the async one, and what that means for you.",
  },
  {
    href: "/under-the-hood/uvicorn-gunicorn",
    label: "Uvicorn & Gunicorn",
    icon: Server,
    description: "What each process does, when to use which, and how they work together in production.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "client", label: "Client Request", description: "A browser, mobile app, or another service sends an HTTP request to your server.", icon: <Server className="size-5" />, color: "lime-500" },
  { id: "uvicorn", label: "ASGI Server (Uvicorn)", description: "Uvicorn receives the raw TCP connection, parses the HTTP protocol, and translates it into an ASGI event.", icon: <Server className="size-5" />, color: "green-500" },
  { id: "eventloop", label: "Event Loop", description: "Python's asyncio event loop schedules your handler as a coroutine. If it awaits, the loop runs other tasks meanwhile.", icon: <RefreshCw className="size-5" />, color: "lime-500" },
  { id: "handler", label: "Your async Handler", description: "Your endpoint function runs — validating input, querying databases, calling APIs — all non-blocking with await.", icon: <Server className="size-5" />, color: "green-500" },
  { id: "response", label: "Response", description: "FastAPI serializes your return value to JSON, Uvicorn sends the HTTP response back to the client.", icon: <Server className="size-5" />, color: "lime-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Blocking the event loop with sync code",
    subtitle: "Using time.sleep() or requests library in async handlers",
    wrongCode: `import time
import requests

@app.get("/data")
async def get_data():
    time.sleep(5)  # Blocks the ENTIRE event loop!
    resp = requests.get("https://api.example.com")
    return resp.json()`,
    rightCode: `import asyncio
import httpx

@app.get("/data")
async def get_data():
    await asyncio.sleep(5)  # Non-blocking
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.example.com")
    return resp.json()`,
    filename: "main.py",
    explanation: "In an async handler, time.sleep() and the requests library block the entire event loop, freezing ALL concurrent requests. Use asyncio.sleep() and httpx instead — they yield control back to the event loop while waiting.",
  },
  {
    title: "Running FastAPI with a WSGI server",
    subtitle: "Using gunicorn without the Uvicorn worker class",
    wrongCode: `# This runs FastAPI as WSGI — no async!
gunicorn main:app

# Or using waitress (WSGI server)
waitress-serve main:app`,
    rightCode: `# Development
uvicorn main:app --reload

# Production (Gunicorn with Uvicorn workers)
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4`,
    filename: "terminal",
    explanation: "FastAPI is an ASGI framework. Running it with a WSGI server like raw gunicorn or waitress means async doesn't work — your await calls become blocking. Always use Uvicorn directly or Gunicorn with the UvicornWorker class.",
  },
];

export default function UnderTheHoodPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-lime-500/10 via-green-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-lime-500 to-green-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-serif italic">Under the Hood</h1>
          <Badge variant="secondary">3 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Peek behind the curtain — how FastAPI&apos;s event loop, ASGI server,
          and process managers work together to handle thousands of requests.
        </p>
      </div>

      {/* Hero Visualization */}
      <ScrollReveal className="mb-8">
        <UnderTheHoodHeroViz />
      </ScrollReveal>

      <div className="rounded-lg glass border-lime-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-lime-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI is built on ASGI (Asynchronous Server Gateway Interface),
              which is why it can handle thousands of concurrent connections with
              a single process. No threads needed.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How a Request Travels Through the Stack</h2>
        <AnimatedFlow steps={flowSteps} accentColor="lime" />
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Topic cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-lime-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Server Comparison Interactive */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: Server Architecture Comparison</h2>
        <ServerComparison />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
