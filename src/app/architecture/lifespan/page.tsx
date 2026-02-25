"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { LifespanViz } from "../_components/lifespan-viz";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function LifespanPage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Lifespan Events</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Lifespan events let you run code when your app starts up and shuts down — perfect for connecting to databases, loading ML models, or warming caches.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario="Your ML model takes 30 seconds to load. The first user to hit your API after deployment waits 30 seconds for a response. Every subsequent request is fast. The cold start is killing your user experience."
        error={`# First request after deploy:\nGET /predict {"text": "classify this"}\n\n# Server log:\nINFO: Loading model from ./model.pkl...\nINFO: Model loaded successfully (took 31.2s)\nINFO: 200 /predict — 31,247ms  ← First user waited 31 seconds!\n\n# Second request:\nINFO: 200 /predict — 42ms  ← Everyone after is fine`}
        errorType="Cold Start"
        accentColor="purple"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>What if you could load the model <em>before</em> the first request arrives? What if your app didn&apos;t start accepting traffic until the model, database pool, and cache were all ready? That&apos;s what lifespan events give you.</p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Lifespan Timeline</h2>
          <p className="text-muted-foreground mb-4">
            Your app has three phases. Lifespan events let you run code in the startup and shutdown phases — the parts that happen before any user touches your API and after the last request is handled.
          </p>
          <SimpleFlow
            steps={[
              { label: "Startup", detail: "Load models, connect DBs, warm caches", status: "neutral" },
              { label: "Ready", detail: "App starts accepting requests", status: "success" },
              { label: "Running", detail: "Handle requests normally", status: "success" },
              { label: "Shutting Down", detail: "Close connections, cleanup", status: "neutral" },
            ]}
            accentColor="purple"
            className="mb-4"
          />
          <p className="text-xs text-muted-foreground">
            The key: your app doesn&apos;t accept any traffic during startup. Users never see that 31-second model load. By the time requests arrive, everything is ready.
          </p>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Problem"
        points={[
          "Loading resources on first request causes cold start delays",
          "Lifespan events run setup code BEFORE the app accepts traffic",
          "Shutdown events handle cleanup AFTER all requests are done",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Old vs New approach */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Old Approach (Deprecated)</h2>
          <p className="text-muted-foreground mb-4">
            You might see <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@app.on_event()</code> in older tutorials. It still works, but it&apos;s deprecated. If you&apos;re starting fresh, skip ahead to the modern approach below.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

# Don't use in new code — deprecated
@app.on_event("startup")
async def startup():
    print("Starting up...")

@app.on_event("shutdown")
async def shutdown():
    print("Shutting down...")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>The problem with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">on_event</code>? Startup and shutdown are separate functions that can&apos;t share variables. If you create a database pool in startup, how do you close it in shutdown? You need a global variable. The modern approach solves this elegantly.</p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Modern Lifespan */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Modern Lifespan Function</h2>
          <p className="text-muted-foreground mb-4">
            The recommended approach uses an <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">asynccontextmanager</code>. Code before <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code> runs on startup. Code after <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code> runs on shutdown. And they share the same scope — no globals needed.
          </p>
          <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    # Everything here runs before the first request
    print("Starting up...")

    yield  # App runs here — handles requests

    # --- SHUTDOWN ---
    # Everything here runs after the last request
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why use yield instead of two separate functions?"
        reveal="Because yield keeps the same function scope alive. Variables you create before yield are still accessible after yield. Open a database pool before yield, and you can close it after yield — no globals, no passing state around. The yield IS the entire lifetime of your running app."
        className="mb-8"
      />

      <WhatYouJustLearned
        section="Lifespan Basics"
        points={[
          "asynccontextmanager is the modern, recommended way to handle startup/shutdown",
          "Code before yield = startup, code after yield = shutdown",
          "The same function scope means startup and shutdown can share variables",
          "Pass the lifespan function to FastAPI(lifespan=lifespan)",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Common Use Cases */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Real-World Use Cases</h2>
          <p className="text-muted-foreground mb-4">
            The most common use cases are database connection pools, ML model loading, and HTTP clients. Here&apos;s what a real startup sequence looks like:
          </p>
          <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI
import httpx

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Database connection pool
    app.state.db_pool = await create_db_pool(
        "postgresql://localhost/mydb",
        min_size=5,
        max_size=20,
    )

    # 2. HTTP client for external APIs
    app.state.http_client = httpx.AsyncClient()

    print("DB pool and HTTP client ready")
    yield  # App handles requests here

    # Clean up in reverse order
    await app.state.http_client.aclose()
    await app.state.db_pool.close()
    print("Connections closed")

app = FastAPI(lifespan=lifespan)`} filename="main.py" />
          <div className="mt-6">
            <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI

# ML model loading — the exact fix for our cold start problem
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load once on startup — before any request arrives
    app.state.model = load_ml_model("model.pkl")
    print(f"Model loaded: {app.state.model.version}")

    yield  # Model is ready for all requests

    del app.state.model  # Cleanup if needed

app = FastAPI(lifespan=lifespan)

@app.post("/predict")
async def predict(data: InputData):
    # No cold start — model is already loaded!
    result = app.state.model.predict(data.features)
    return {"prediction": result}`} filename="ml_app.py" />
          </div>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 7. Sharing State via app.state */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sharing State via app.state</h2>
          <p className="text-muted-foreground mb-4">
            Resources created in the lifespan function are stored on <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">app.state</code>. In your endpoints, you access them through the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Request</code> object. Here&apos;s how:
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Request

@app.get("/items")
async def list_items(request: Request):
    # Access the DB pool created in lifespan
    async with request.app.state.db_pool.acquire() as conn:
        items = await conn.fetch("SELECT * FROM items")
    return items

@app.get("/health")
async def health(request: Request):
    # Check if resources are available
    pool = request.app.state.db_pool
    return {
        "status": "healthy",
        "db_pool_size": pool.get_size(),
        "db_pool_free": pool.get_idle_size(),
    }`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>The pattern is always <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">request.app.state.your_resource</code>. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">request.app</code> gives you the FastAPI instance, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.state</code> is a simple namespace where you can attach anything during lifespan.</p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="State Management"
        points={[
          "Store startup resources on app.state (e.g., app.state.db_pool)",
          "Access them in endpoints via request.app.state",
          "This avoids global variables — state is tied to the app instance",
          "The health endpoint pattern is great for monitoring",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Failure Deep Dive */}
      <FailureDeepDive
        title="Startup Exception Kills the App"
        scenario="Your lifespan function tries to connect to Redis on startup. But Redis isn't running. What happens to your app?"
        code={`@asynccontextmanager
async def lifespan(app: FastAPI):
    # This throws ConnectionRefusedError if Redis is down
    app.state.redis = await aioredis.from_url(
        "redis://localhost:6379"
    )
    print("Redis connected")

    yield

    await app.state.redis.close()`}
        error={`ERROR:    Traceback (most recent call last):
  File "main.py", line 8, in lifespan
    app.state.redis = await aioredis.from_url(...)
ConnectionRefusedError: [Errno 111] Connection refused

ERROR:    Application startup failed. Exiting.

# The app never starts. No requests are accepted.
# Uvicorn exits immediately.`}
        explanation="If any code before yield raises an exception, the entire application fails to start. Uvicorn exits with an error. This is actually the CORRECT behavior — it's called 'fail fast'. Better to crash loudly at startup than to silently serve requests with a broken state (like a missing Redis connection)."
        fix="If some resources are optional (like a cache), wrap them in try/except. If they're required (like a database), let the app crash — it'll be restarted by your process manager."
        fixCode={`@asynccontextmanager
async def lifespan(app: FastAPI):
    # Required: let it crash if it fails
    app.state.db = await create_db_pool(DB_URL)

    # Optional: degrade gracefully if Redis is down
    try:
        app.state.redis = await aioredis.from_url(REDIS_URL)
        print("Redis connected")
    except ConnectionRefusedError:
        app.state.redis = None
        print("Redis unavailable — running without cache")

    yield

    # Clean up what we have
    if app.state.redis:
        await app.state.redis.close()
    await app.state.db.close()`}
        filename="main.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 8. Interactive Visualization — KEPT */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It: Full Lifespan Cycle</h2>
          <p className="text-muted-foreground mb-4">
            Watch a real-world app initialize Redis, OpenAI, Gemini, and a cache on startup — serve requests using them — then clean everything up on shutdown.
          </p>
          <LifespanViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 9. Full Example */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Full Production Example</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s a production-grade lifespan that initializes multiple services — the exact pattern from the visualization above.
          </p>
          <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from openai import AsyncOpenAI
import google.generativeai as genai
import aioredis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP (before yield) ──
    # 1. Redis connection pool
    app.state.redis = await aioredis.from_url(
        "redis://localhost:6379", max_connections=20
    )

    # 2. OpenAI async client
    app.state.openai = AsyncOpenAI(api_key=settings.openai_key)

    # 3. Gemini model (loaded once, reused across requests)
    genai.configure(api_key=settings.gemini_key)
    app.state.gemini = genai.GenerativeModel("gemini-pro")

    # 4. Warm cache with popular data
    app.state.cache = {}
    async with app.state.redis.client() as conn:
        for key in ["config", "models", "limits"]:
            app.state.cache[key] = await conn.get(f"app:{key}")

    print("All services ready")
    yield  # ── APP RUNS HERE ──

    # ── SHUTDOWN (after yield) ──
    app.state.cache.clear()
    await app.state.openai.close()
    await app.state.redis.close()
    print("All services cleaned up")

app = FastAPI(lifespan=lifespan)

@app.post("/chat")
async def chat(prompt: str, request: Request):
    response = await request.app.state.openai.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": prompt}]
    )
    # Cache the response in Redis
    await request.app.state.redis.setex(
        f"chat:{prompt[:50]}", 3600, response.choices[0].message.content
    )
    return {"reply": response.choices[0].message.content}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If your lifespan startup function raises an exception, does the app still start accepting requests?"
        options={[
          {
            label: "Yes — the app starts but without the failed resource",
            correct: false,
            explanation: "FastAPI doesn't have partial startup. If the lifespan fails, nothing starts.",
          },
          {
            label: "No — the entire application fails to start",
            correct: true,
            explanation: "Correct! An exception before yield kills the entire startup process.",
          },
          {
            label: "It depends on whether you use try/except",
            correct: false,
            explanation: "If you catch the exception yourself, the app continues — but that's YOUR code handling it, not FastAPI's default.",
          },
          {
            label: "The app starts but returns 503 for all requests",
            correct: false,
            explanation: "The app never reaches the point of accepting requests at all.",
          },
        ]}
        hint="Think about what happens if code before yield raises — does yield ever execute?"
        answer="No. If the lifespan startup (the code before yield) raises an exception, the entire application fails to start. Uvicorn will exit with an error. This is actually good — it's better to fail loudly at startup than to silently serve requests with a broken state (like a missing ML model or disconnected database)."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="What happens to the shutdown code (after yield) if the app crashes during a request?"
        reveal="The shutdown code still runs! The asynccontextmanager guarantees that the code after yield executes even if the app is interrupted. It's like a try/finally — the cleanup always happens. This means your database connections get properly closed, your file handles are released, and your resources are freed. The only exception: if the process is killed with SIGKILL (kill -9), nothing can run cleanup."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">asynccontextmanager</p>
              <p className="text-xs text-muted-foreground">The modern, recommended way to handle startup and shutdown</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">on_event Deprecated</p>
              <p className="text-xs text-muted-foreground">@app.on_event() still works but should not be used in new code</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">app.state</p>
              <p className="text-xs text-muted-foreground">Share resources between lifespan and endpoints via request.app.state</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Cleanup Guarantee</p>
              <p className="text-xs text-muted-foreground">Code after yield always runs, even if the app crashes</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
