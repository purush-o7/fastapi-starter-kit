"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const SyncAsyncRace = dynamic(
  () => import("../_components/sync-async-race").then(m => m.SyncAsyncRace),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

export default function AsyncEndpointsPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Async Endpoints</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          You added async to your endpoint and made it slower. Let&apos;s figure out why.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You write async def read_items() and call requests.get() inside it. Your API handles one request at a time. 100 concurrent users? They wait in a single-file queue. You used async but got worse performance than sync.`}
        error={`# Your "async" endpoint:\n@app.get("/items")\nasync def read_items():\n    response = requests.get("https://api.example.com/data")  # ← BLOCKING!\n    return response.json()\n\n# Load test results:\n# Sync endpoint (def):     100 req in 2.1s ✓\n# Your async endpoint:     100 req in 45.3s ✗\n# Why is async SLOWER?!`}
        errorType="Performance Trap"
        accentColor="indigo"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Wait, isn&apos;t async supposed to be <em>faster</em>? Why did adding one keyword
          make your API 20x slower? The answer comes down to one thing: what
          happens inside your function when it hits that blocking call.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How FastAPI Handles Your Functions</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI treats <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code> and{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">def</code> very differently under the hood.
            Here&apos;s what happens when a request comes in:
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">With <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code>:</p>
              <SimpleFlow
                steps={[
                  { label: "Request arrives", detail: "FastAPI receives it" },
                  { label: "Runs on event loop", detail: "Single thread, shared" },
                  { label: "Hits await", detail: "Pauses, lets others run", status: "success" },
                  { label: "I/O completes", detail: "Resumes where it left off", status: "success" },
                ]}
                accentColor="indigo"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">With plain <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">def</code>:</p>
              <SimpleFlow
                steps={[
                  { label: "Request arrives", detail: "FastAPI receives it" },
                  { label: "Sent to thread pool", detail: "Gets its own thread" },
                  { label: "Blocks thread", detail: "Only this thread waits", status: "success" },
                  { label: "Returns result", detail: "Thread freed up", status: "success" },
                ]}
                accentColor="indigo"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        points={[
          "async def runs directly on the event loop — it must use await to yield control",
          "Plain def runs in a separate thread pool — blocking is safe because it only blocks that thread",
          "The disaster: async def + blocking call = blocks the entire event loop",
        ]}
        section="async vs def routing"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough — the problem */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Trap: async def + Blocking Code</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the code that ruined your load test. It <em>looks</em> async, but it&apos;s lying.
            The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">requests</code> library is
            synchronous. It doesn&apos;t know what <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">await</code> is.
            It just... blocks.
          </p>
          <CodeBlock code={`import requests  # ← This is the problem

@app.get("/items")
async def read_items():
    # This blocks the ENTIRE event loop!
    # No other request can be processed while waiting
    response = requests.get("https://api.example.com/data")
    return response.json()

# Meanwhile, 99 other users are waiting...
# The event loop is frozen on this one HTTP call.`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* The fix — proper async */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Fix: Use Async Libraries</h2>
          <p className="text-muted-foreground mb-4">
            If you&apos;re going to use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code>,
            every I/O call inside it needs to be awaitable. Replace{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">requests</code> with{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">httpx</code>.
          </p>
          <CodeBlock code={`import httpx  # ← async-ready HTTP client

@app.get("/items")
async def read_items():
    async with httpx.AsyncClient() as client:
        # This yields to the event loop while waiting
        response = await client.get("https://api.example.com/data")
        return response.json()

# Now 100 users can all be "waiting" at the same time.
# The event loop juggles them all.`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why not just use async def for everything and be done with it?"
        reveal="Because async def is only faster when you use async libraries inside it. If your code calls requests, time.sleep, or any other blocking library, a regular def endpoint is actually BETTER — FastAPI runs it in a thread pool automatically, keeping the event loop free. async def is a promise: 'I will never block.' Break that promise and you break the whole server."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "requests.get() inside async def blocks the entire event loop — all users freeze",
          "httpx.AsyncClient with await lets the event loop handle other requests while waiting",
          "If you can't use async libraries, just use plain def — it's safer",
        ]}
        section="blocking vs non-blocking"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Concurrent fetching */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Real Power: Concurrent I/O</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s where async really shines. Need data from three APIs? Don&apos;t wait for
            each one sequentially — fire them all at once with{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">asyncio.gather</code>.
          </p>
          <CodeBlock code={`import asyncio
import httpx

@app.get("/dashboard")
async def get_dashboard():
    async with httpx.AsyncClient() as client:
        # Fire all three requests at the same time
        users, orders, stats = await asyncio.gather(
            client.get("https://api.example.com/users"),
            client.get("https://api.example.com/orders"),
            client.get("https://api.example.com/stats"),
        )
    # Total time ≈ slowest request, not sum of all three!
    return {
        "users": users.json(),
        "orders": orders.json(),
        "stats": stats.json(),
    }`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Go Deeper: run_in_threadpool */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Running Blocking Code Safely</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes you&apos;re stuck with a blocking library. Maybe it&apos;s a legacy SDK, or
            CPU-intensive image processing. You can offload it to a thread pool from
            an async endpoint using <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">run_in_threadpool</code>.
          </p>
          <CodeBlock code={`from starlette.concurrency import run_in_threadpool

def cpu_intensive_task(data: list) -> dict:
    # Heavy computation — no async version available
    result = process(data)
    return result

@app.post("/process")
async def process_data(data: list[int]):
    # Offload to thread pool — event loop stays free
    result = await run_in_threadpool(cpu_intensive_task, data)
    return result`} filename="main.py" />

          <ConversationalCallout type="insight" className="mt-4">
            <p>
              This is exactly what FastAPI does automatically for plain{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">def</code> endpoints.
              So if your entire endpoint is blocking code, just use{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">def</code> instead of{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code> — less
              boilerplate, same result.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "asyncio.gather runs multiple async operations concurrently — total time equals the slowest, not the sum",
          "run_in_threadpool offloads blocking code to a thread from an async context",
          "If everything in your endpoint is blocking, just use def — FastAPI handles threading for you",
        ]}
        section="advanced patterns"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive: Sync vs Async Race */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It: Sync vs Async Race</h2>
          <p className="text-muted-foreground mb-4">
            Watch 3 identical database queries run side by side. Sync processes them one at a time. Async overlaps the I/O waits, finishing all three in the time it takes sync to do one.
          </p>
          <SyncAsyncRace />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If you define def my_endpoint() (no async), does FastAPI block the event loop when it runs?"
        options={[
          {
            label: "Yes — def endpoints always block the event loop",
            correct: false,
            explanation: "FastAPI is smarter than that! It handles def endpoints specially.",
          },
          {
            label: "No — FastAPI runs def endpoints in a thread pool automatically",
            correct: true,
            explanation: "Exactly! FastAPI detects plain def and routes it to a thread pool, keeping the event loop free.",
          },
          {
            label: "It depends on what libraries the endpoint uses",
            correct: false,
            explanation: "For def endpoints, FastAPI always uses a thread pool regardless of what's inside.",
          },
        ]}
        hint="Think about what FastAPI does differently for def vs async def."
        answer="No! FastAPI is smart about this. It runs sync (def) endpoints in a thread pool automatically, so they don't block the event loop. It's actually the async def + blocking call combo that causes problems. If you're using blocking libraries (requests, time.sleep), a regular def endpoint is often BETTER than async def."
        className="mb-8"
      />

      <AhaMoment
        setup="So async def isn't always the 'better' choice?"
        reveal="Right. async def is a contract — you're telling FastAPI 'I promise to never block the event loop.' If you break that promise by calling blocking code, you make things WORSE than plain def. The rule is simple: use async def only when every I/O call inside uses await. Otherwise, stick with def."
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">async def</p>
              <p className="text-xs text-muted-foreground">For I/O-bound work with async libraries (httpx, asyncpg)</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">plain def</p>
              <p className="text-xs text-muted-foreground">For CPU-bound work or blocking libraries — runs in thread pool</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">asyncio.gather</p>
              <p className="text-xs text-muted-foreground">Run multiple async operations concurrently for speed</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">run_in_threadpool</p>
              <p className="text-xs text-muted-foreground">Offload blocking code to a thread from an async context</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
