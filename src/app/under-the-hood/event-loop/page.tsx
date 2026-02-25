"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { RoughHighlight } from "@/components/rough-highlight";
const EventLoopAnimation = dynamic(
  () => import("../_components/event-loop-animation").then(m => m.EventLoopAnimation),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";

const mistakes: Mistake[] = [
  {
    title: "Using time.sleep() in async handlers",
    subtitle: "Blocking the event loop with synchronous sleep",
    wrongCode: `import time

@app.get("/slow")
async def slow_endpoint():
    time.sleep(3)  # Blocks the entire event loop!
    # No other request can be processed for 3 seconds
    return {"status": "done"}`,
    rightCode: `import asyncio

@app.get("/slow")
async def slow_endpoint():
    await asyncio.sleep(3)  # Non-blocking!
    # Event loop handles other requests while waiting
    return {"status": "done"}`,
    filename: "main.py",
    explanation: "time.sleep() is a synchronous call that freezes the entire event loop. During those 3 seconds, no other requests can be processed. Use asyncio.sleep() instead — it yields control back to the event loop.",
  },
  {
    title: "Using requests library in async code",
    subtitle: "Synchronous HTTP client blocks the event loop",
    wrongCode: `import requests

@app.get("/fetch")
async def fetch_data():
    # This blocks the event loop!
    resp = requests.get("https://api.example.com/data")
    return resp.json()`,
    rightCode: `import httpx

@app.get("/fetch")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.example.com/data")
    return resp.json()`,
    filename: "main.py",
    explanation: "The requests library is synchronous — it blocks while waiting for the response. In an async handler, use httpx with AsyncClient instead. It uses await to yield control, letting the event loop process other requests while waiting.",
  },
];

export default function EventLoopPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-lime-500/10 via-green-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">The Event Loop</h1>
          <Badge variant="outline">Under the Hood</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          One line of code froze your entire API. Every endpoint, every user, everything. Let&apos;s understand why.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You add time.sleep(10) to an async endpoint for "testing". Not just that endpoint — your ENTIRE API freezes for 10 seconds. Every single endpoint, every connected user. One line of code took down everything.`}
        error={`@app.get("/slow")\nasync def slow_endpoint():\n    time.sleep(10)  # "Just for testing!"\n    return {"status": "done"}\n\n# Meanwhile, at the SAME time:\nGET /health → ... hanging\nGET /users → ... hanging\nGET /items → ... hanging\nGET / → ... hanging\n\n# ALL endpoints frozen. Not just /slow.\n# A single time.sleep() blocked the entire event loop.`}
        errorType="Total Freeze"
        accentColor="lime"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          How can one <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">time.sleep(10)</code> in
          one endpoint freeze <em>every other endpoint</em>? The answer is the event loop
          — the single thread that powers all of your async code. Block it, and
          everything stops.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Chef Analogy</h2>
          <p className="text-muted-foreground mb-4">
            Think of a chef in a kitchen. A synchronous chef cooks one dish
            completely before starting the next — if something needs to simmer
            for 10 minutes, they just stand there waiting.
          </p>
          <p className="text-muted-foreground mb-4">
            An async chef (the event loop) is smarter. When dish 1 goes in the
            oven, they start preparing dish 2. When dish 2 needs to marinate,
            they check on dish 1. One chef, many dishes,{" "}
            <RoughHighlight type="highlight" color="rgba(132, 204, 22, 0.15)">no idle time</RoughHighlight>.
          </p>
          <p className="text-muted-foreground mb-4">
            But here&apos;s the catch:{" "}
            <RoughHighlight type="underline" color="rgb(132, 204, 22)">there&apos;s only ONE chef</RoughHighlight>.
            If that chef gets stuck stirring a pot and <em>can&apos;t let go</em> (that&apos;s your{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">time.sleep</code>), every other dish
            burns. Every customer waits. The whole kitchen is frozen.
          </p>

          <SimpleFlow
            steps={[
              { label: "Event loop picks up task", detail: "Your request" },
              { label: "Runs until await", detail: "Does work, then yields" },
              { label: "Switches to next task", detail: "While first awaits I/O", status: "success" },
              { label: "I/O completes", detail: "Resumes original task", status: "success" },
            ]}
            accentColor="lime"
            className="mt-4"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "The event loop is a single thread that juggles all your async tasks",
          "When a task hits 'await', it pauses and the loop runs something else",
          "If anything blocks without awaiting (like time.sleep), the entire loop freezes",
        ]}
        section="the event loop model"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Event Loop Visualization */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Event Loop Visualized</h2>
          <p className="text-muted-foreground mb-4">
            Watch how the event loop handles five concurrent requests using a single thread.
            No parallelism needed — just smart task switching.
          </p>
          <EventLoopAnimation />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Sync vs Async */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">def vs async def — What Actually Happens</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI treats these two differently. With{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">def</code>, FastAPI is cautious — it
            runs your handler in a thread pool so blocking is safe. With{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">async def</code>, FastAPI trusts you — it
            runs your handler directly on the event loop. Break that trust and you
            freeze everything.
          </p>
          <CodeBlock
            code={`# Synchronous — runs in a thread pool (safe to block)
@app.get("/sync")
def get_users():
    users = db.fetch_all()  # Blocks this thread, not the event loop
    return users

# Asynchronous — runs on the event loop (NEVER block!)
@app.get("/async")
async def get_users():
    users = await db.fetch_all()  # Yields to event loop while waiting
    return users`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Wait — so plain def endpoints are 'safer' than async def?"
        reveal="In a way, yes! Plain def endpoints run in a thread pool, so even if they block, only that thread is affected. async def endpoints run directly on the event loop — block there and the ENTIRE server freezes. async def is more powerful (no thread overhead, true concurrency) but it comes with a contract: you must never block. That's why using the wrong library in an async endpoint is so devastating."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "def endpoints run in a thread pool — blocking is safe but uses more resources",
          "async def endpoints run on the event loop — lightweight but must never block",
          "The event loop trusts your async code to yield. Break that trust and everything stops.",
        ]}
        section="sync vs async execution"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* What happens during await */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What Happens at Every await</h2>
          <p className="text-muted-foreground mb-4">
            When your code hits <code className="text-sm bg-muted px-1.5 py-0.5 rounded">await</code>,
            the event loop pauses your function and is free to run other tasks. When the
            I/O completes, the loop picks up right where you left off.
          </p>
          <CodeBlock
            code={`@app.get("/dashboard")
async def get_dashboard():
    # 1. Event loop starts running this function

    user = await get_current_user()
    # 2. Pauses here → event loop handles other requests
    # 3. User data arrives → resumes right here

    posts = await db.fetch_posts(user.id)
    # 4. Pauses again → event loop handles other requests
    # 5. Posts arrive → resumes right here

    return {"user": user, "posts": posts}
    # 6. Done. Event loop moves to the next task.`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Go Deeper: CPU-bound work */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: CPU-Bound Work</h2>
          <p className="text-muted-foreground mb-4">
            Not all blocking is I/O. Heavy computation (image processing, ML inference)
            also blocks the event loop because there&apos;s no await to yield. The fix: offload
            it to a thread pool.
          </p>
          <CodeBlock
            code={`# BAD: CPU work blocks the event loop
@app.get("/process")
async def process_image():
    result = heavy_computation()  # No await — freezes everything!
    return result

# GOOD: Offload to a thread pool
from fastapi.concurrency import run_in_threadpool

@app.get("/process")
async def process_image():
    result = await run_in_threadpool(heavy_computation)
    return result  # Event loop stayed free the whole time`}
            filename="main.py"
          />

          <ConversationalCallout type="insight" className="mt-4">
            <p>
              Or just use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">def</code> for
              the endpoint! FastAPI will run it in a thread pool automatically. No need for
              the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">run_in_threadpool</code> dance
              if your entire endpoint is synchronous work.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If the event loop is single-threaded, how can FastAPI handle multiple requests concurrently?"
        options={[
          {
            label: "It can't — async is just a lie, requests are processed one at a time",
            correct: false,
            explanation: "Async isn't parallel, but it IS concurrent. There's a difference!",
          },
          {
            label: "It uses cooperative multitasking — tasks yield at every await",
            correct: true,
            explanation: "Exactly! When one task awaits I/O, the loop switches to another. It's concurrent without being parallel.",
          },
          {
            label: "It secretly uses multiple threads behind the scenes",
            correct: false,
            explanation: "The event loop itself is single-threaded. Threads are used only for def endpoints and run_in_threadpool.",
          },
        ]}
        hint="Think about what happens between the request arriving and the I/O completing."
        answer="The event loop uses cooperative multitasking. When an async function hits an 'await' (like awaiting a database query or HTTP request), it pauses and lets another request run. It's like a chef working on multiple dishes — while one is in the oven (waiting for I/O), the chef works on the next. The key word is 'cooperative' — if any task doesn't yield (like time.sleep which never awaits), it blocks the entire kitchen."
        className="mb-8"
      />

      <AhaMoment
        setup="So concurrency and parallelism aren't the same thing?"
        reveal="No! Parallelism is doing multiple things at the same time (multiple chefs). Concurrency is doing multiple things by interleaving (one chef, many dishes). The event loop gives you concurrency, not parallelism. For I/O-bound work (API calls, database queries), concurrency is actually MORE efficient than parallelism because there's no thread overhead, no context switching, and no race conditions."
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Single Thread</p>
              <p className="text-xs text-muted-foreground">The event loop runs on one thread — no race conditions, no locks</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">await = Yield</p>
              <p className="text-xs text-muted-foreground">Each await lets the event loop switch to another task while waiting</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">I/O Bound = Great</p>
              <p className="text-xs text-muted-foreground">Async shines with network calls, DB queries, file I/O</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">CPU Bound = Thread Pool</p>
              <p className="text-xs text-muted-foreground">For heavy computation, use run_in_threadpool to avoid blocking</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
