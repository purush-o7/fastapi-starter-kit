"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { RoughHighlight } from "@/components/rough-highlight";
import { EventLoopAnimation } from "../_components/event-loop-animation";

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
    <div className="max-w-4xl ambient-under-the-hood">
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
          The single-threaded engine that makes async work. It juggles thousands of requests by switching between tasks whenever one waits for I/O.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is the Event Loop?</h2>
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
          <p className="text-muted-foreground">
            Python&apos;s <code className="text-sm bg-muted px-1.5 py-0.5 rounded">asyncio</code> event
            loop does exactly this with your FastAPI requests. It&apos;s a{" "}
            <RoughHighlight type="underline" color="rgb(132, 204, 22)">single thread</RoughHighlight>{" "}
            that runs a loop: check for ready tasks, execute them until
            they <RoughHighlight type="circle" color="rgb(132, 204, 22)"><code className="text-sm bg-muted px-1.5 py-0.5 rounded">await</code></RoughHighlight> something, then
            move on to the next task.
          </p>
        </section>
      </ScrollReveal>

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sync vs Async — The Key Difference</h2>
          <p className="text-muted-foreground mb-4">
            With <code className="text-sm bg-muted px-1.5 py-0.5 rounded">def</code>, FastAPI runs
            your handler in a thread pool — it works, but threads are expensive. With{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">async def</code>, FastAPI runs
            your handler directly on the event loop — lightweight and fast.
          </p>
          <CodeBlock
            code={`# Synchronous — runs in a thread pool
@app.get("/sync")
def get_users():
    users = db.fetch_all()  # Blocks this thread
    return users
    # FastAPI wraps this in a thread so it doesn't
    # block the event loop, but threads are heavier

# Asynchronous — runs on the event loop
@app.get("/async")
async def get_users():
    users = await db.fetch_all()  # Yields to event loop
    return users
    # While waiting for the DB, the event loop
    # handles other requests — no extra threads needed`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What Happens During await</h2>
          <p className="text-muted-foreground mb-4">
            When your code hits <code className="text-sm bg-muted px-1.5 py-0.5 rounded">await</code>,
            the event loop suspends that coroutine and is free to run other tasks. When the
            I/O operation completes, the loop resumes your code right where it left off.
          </p>
          <CodeBlock
            code={`@app.get("/dashboard")
async def get_dashboard():
    # 1. Event loop starts running this function

    user = await get_current_user()
    # 2. Suspends here → event loop runs other requests
    # 3. User data arrives → resumes here

    posts = await db.fetch_posts(user.id)
    # 4. Suspends again → event loop runs other requests
    # 5. Posts arrive → resumes here

    return {"user": user, "posts": posts}
    # 6. Response sent, event loop moves to next task`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Common Pitfalls</h2>
          <p className="text-muted-foreground mb-4">
            The event loop is single-threaded. If you block it with CPU-heavy work
            or synchronous I/O, every other request has to wait.
          </p>
          <CodeBlock
            code={`# BAD: CPU-bound work blocks the event loop
@app.get("/process")
async def process_image():
    result = heavy_computation()  # No await — blocks everything!
    return result

# GOOD: Run CPU work in a thread pool
from fastapi.concurrency import run_in_threadpool

@app.get("/process")
async def process_image():
    result = await run_in_threadpool(heavy_computation)
    return result  # Event loop stayed free the whole time`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

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
