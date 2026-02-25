"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { LifespanViz } from "../_components/lifespan-viz";

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Old Approach (Deprecated)</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI previously used <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@app.on_event()</code> decorators. These still work but are deprecated in favor of the lifespan context manager.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

# ⚠️ Deprecated — don't use in new code
@app.on_event("startup")
async def startup():
    print("Starting up...")

@app.on_event("shutdown")
async def shutdown():
    print("Shutting down...")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Modern Lifespan Function</h2>
          <p className="text-muted-foreground mb-4">
            The recommended approach uses an <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">asynccontextmanager</code> that yields once. Code before <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code> runs on startup, code after runs on shutdown.
          </p>
          <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: runs before the app starts accepting requests
    print("Starting up...")
    yield
    # Shutdown: runs when the app is stopping
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Common Use Cases</h2>
          <p className="text-muted-foreground mb-4">The most common use cases are database connection pools, ML model loading, and cache initialization.</p>
          <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI
import httpx

# Example: Database connection pool + HTTP client
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.db_pool = await create_db_pool(
        "postgresql://localhost/mydb",
        min_size=5,
        max_size=20,
    )
    app.state.http_client = httpx.AsyncClient()
    print("DB pool and HTTP client ready")

    yield

    # Shutdown
    await app.state.http_client.aclose()
    await app.state.db_pool.close()
    print("Connections closed")

app = FastAPI(lifespan=lifespan)`} filename="main.py" />
          <div className="mt-6">
            <CodeBlock code={`from contextlib import asynccontextmanager
from fastapi import FastAPI

# Example: ML model loading
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load once on startup — expensive!
    app.state.model = load_ml_model("model.pkl")
    print(f"Model loaded: {app.state.model.version}")
    yield
    # Cleanup if needed
    del app.state.model

app = FastAPI(lifespan=lifespan)

@app.post("/predict")
async def predict(data: InputData):
    result = app.state.model.predict(data.features)
    return {"prediction": result}`} filename="ml_app.py" />
          </div>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sharing State via app.state</h2>
          <p className="text-muted-foreground mb-4">
            Resources created in the lifespan function are stored on <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">app.state</code> and accessed in endpoints via the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Request</code> object.
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

      <Separator className="my-8" />

      {/* Interactive: Lifespan Visualizer */}
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

      {/* Real-world example with all services */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Full Example: AI App with Redis</h2>
          <p className="text-muted-foreground mb-4">
            A production lifespan that initializes OpenAI, Gemini, Redis, and a cache — the exact pattern from the visualization above.
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
