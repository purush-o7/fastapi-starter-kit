"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bolt, ListTodo, Lightbulb, Globe, RefreshCw, Pause, Play, ArrowRight } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { AsyncHeroViz } from "./_components/async-hero-viz";
import { EventLoopSim } from "./_components/event-loop-sim";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/background-async/async-endpoints",
    label: "Async Endpoints",
    icon: Bolt,
    description: "Use async/await for non-blocking I/O in your path operations.",
  },
  {
    href: "/background-async/background-tasks",
    label: "Background Tasks",
    icon: ListTodo,
    description: "Run tasks after returning a response — emails, cleanup, notifications.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "request", label: "Request Arrives", description: "An HTTP request hits your async def endpoint.", icon: Globe, color: "indigo-500" },
  { id: "eventloop", label: "Event Loop", description: "FastAPI's event loop picks up the coroutine — no thread needed.", icon: RefreshCw, color: "indigo-500" },
  { id: "await", label: "Await I/O", description: "When you hit 'await db.fetch()', the event loop suspends this task and serves other requests.", icon: Pause, color: "blue-500" },
  { id: "resume", label: "I/O Complete", description: "The database responds, the event loop resumes your function exactly where it left off.", icon: Play, color: "blue-500" },
  { id: "response", label: "Send Response", description: "Your function returns the result, FastAPI sends the JSON response.", icon: ArrowRight, color: "indigo-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Blocking the event loop",
    subtitle: "Running CPU-heavy or synchronous I/O in async endpoints",
    wrongCode: `@app.get("/report")
async def generate_report():
    # Blocks the entire event loop!
    data = requests.get("https://api.example.com/data")
    result = heavy_computation(data.json())
    return result`,
    rightCode: `import httpx

@app.get("/report")
async def generate_report():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
    result = await run_in_threadpool(heavy_computation, response.json())
    return result`,
    filename: "main.py",
    explanation: "In async endpoints, never use blocking libraries like requests or time.sleep(). Use async-compatible libraries (httpx, aiohttp) for I/O and run_in_threadpool for CPU-bound work.",
  },
];

export default function BackgroundAsyncPage() {
  return (
    <div className="max-w-4xl ambient-async">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Background & Async</h1>
          <Badge variant="secondary">2 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Master async/await for high-performance endpoints and background
          tasks for deferred work like sending emails or processing files.
        </p>
      </div>

      {/* Hero Visualization: Sync vs Async */}
      <ScrollReveal className="mb-8">
        <AsyncHeroViz />
      </ScrollReveal>

      <div className="rounded-lg border bg-indigo-500/5 border-indigo-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI runs async def endpoints on the event loop and plain def
              endpoints in a thread pool. Choose async def when doing I/O-heavy
              work with async libraries, and plain def for CPU-bound tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Request Lifecycle */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How Async Requests Flow</h2>
        <AnimatedFlow steps={flowSteps} accentColor="indigo" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-indigo-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: Event Loop Simulator */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: Event Loop Simulator</h2>
        <EventLoopSim />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
