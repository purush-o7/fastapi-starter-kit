"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function AsyncEndpointsPage() {
  return (
    <div className="max-w-4xl ambient-async">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Async Endpoints</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          FastAPI supports both async and sync endpoints. Understanding when to use each is crucial for building high-performance APIs.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">async def vs def</h2>
          <p className="text-muted-foreground mb-4">FastAPI handles async and sync functions differently under the hood.</p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

# Async — runs on the event loop
# Use for I/O-bound operations with async libraries
@app.get("/async-items")
async def read_items_async():
    data = await async_db.fetch_all("SELECT * FROM items")
    return data

# Sync — runs in a thread pool
# Use for CPU-bound or blocking I/O operations
@app.get("/sync-items")
def read_items_sync():
    data = sync_db.execute("SELECT * FROM items")
    return data`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Async HTTP Calls</h2>
          <p className="text-muted-foreground mb-4">Use httpx or aiohttp for non-blocking HTTP requests in async endpoints.</p>
          <CodeBlock code={`import httpx

@app.get("/external-data")
async def get_external_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()

# Fetch multiple APIs concurrently
import asyncio

@app.get("/dashboard")
async def get_dashboard():
    async with httpx.AsyncClient() as client:
        users, orders = await asyncio.gather(
            client.get("https://api.example.com/users"),
            client.get("https://api.example.com/orders"),
        )
    return {"users": users.json(), "orders": orders.json()}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Running Blocking Code</h2>
          <p className="text-muted-foreground mb-4">When you need to run blocking code in an async endpoint, use run_in_threadpool.</p>
          <CodeBlock code={`from starlette.concurrency import run_in_threadpool

def cpu_intensive_task(data: list) -> dict:
    # Heavy computation
    result = process(data)
    return result

@app.post("/process")
async def process_data(data: list[int]):
    result = await run_in_threadpool(cpu_intensive_task, data)
    return result`} filename="main.py" />
        </section>
      </ScrollReveal>

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
