"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { BeforeAfter } from "@/components/before-after";
import { AsgiWsgiViz } from "../_components/asgi-wsgi-viz";
import { Cable, Zap } from "lucide-react";

const mistakes: Mistake[] = [
  {
    title: "Running FastAPI with a WSGI server",
    subtitle: "Using gunicorn without the Uvicorn worker class",
    wrongCode: `# WRONG: This runs FastAPI as synchronous WSGI
gunicorn main:app

# WRONG: waitress is also WSGI
from waitress import serve
serve(app, host="0.0.0.0", port=8000)`,
    rightCode: `# CORRECT: Use uvicorn (ASGI server)
uvicorn main:app --host 0.0.0.0 --port 8000

# CORRECT: Gunicorn with Uvicorn worker class
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4`,
    filename: "terminal",
    explanation: "FastAPI is an ASGI framework. Running it under a WSGI server means all your async def handlers run synchronously — await doesn't actually yield, and you lose all concurrency benefits. Always use an ASGI server.",
  },
  {
    title: "Mixing sync WSGI middleware with FastAPI",
    subtitle: "Using Flask/Django WSGI middleware in an ASGI app",
    wrongCode: `from some_wsgi_middleware import WSGIMiddleware

# This wraps your ASGI app in WSGI — breaks async!
app = WSGIMiddleware(app)`,
    rightCode: `from starlette.middleware.base import BaseHTTPMiddleware

class MyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        return response

app.add_middleware(MyMiddleware)`,
    filename: "main.py",
    explanation: "WSGI middleware is synchronous and can't handle ASGI's async lifecycle. Use Starlette-compatible ASGI middleware instead, which properly supports async request/response handling.",
  },
];

export default function AsgiVsWsgiPage() {
  return (
    <div className="max-w-4xl ambient-under-the-hood">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">ASGI vs WSGI</h1>
          <Badge variant="outline">Under the Hood</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Two standards for how Python web servers talk to your application. WSGI is synchronous and battle-tested. ASGI is its async successor — and the reason FastAPI exists.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is WSGI?</h2>
          <p className="text-muted-foreground mb-4">
            WSGI (Web Server Gateway Interface) is the original standard from 2003. It defines
            a simple contract: the server calls your application with a request, your app
            returns a response. One request, one thread, start to finish.
          </p>
          <p className="text-muted-foreground mb-4">
            Think of it like a toll booth with one lane per operator. Each operator
            handles one car at a time. To handle more cars, you add more operators (threads).
            Flask and Django use WSGI.
          </p>
          <CodeBlock
            code={`# The WSGI interface — synchronous
def application(environ, start_response):
    # environ = request data (dict)
    # start_response = callback to set status/headers
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"Hello, World!"]
    # This function BLOCKS until it returns`}
            filename="wsgi_app.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is ASGI?</h2>
          <p className="text-muted-foreground mb-4">
            ASGI (Asynchronous Server Gateway Interface) is the modern async standard.
            Instead of blocking, your app can <code className="text-sm bg-muted px-1.5 py-0.5 rounded">await</code> I/O
            operations and let the server handle other requests in the meantime.
          </p>
          <p className="text-muted-foreground mb-4">
            Think of it like a single operator managing multiple automated lanes.
            When a car pauses to find their card, the operator helps the next lane.
            One operator, many cars, no idle time. FastAPI and Starlette use ASGI.
          </p>
          <CodeBlock
            code={`# The ASGI interface — asynchronous
async def application(scope, receive, send):
    # scope = connection info (dict)
    # receive = async callable to get request body
    # send = async callable to send response
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [[b"content-type", b"text/plain"]],
    })
    await send({
        "type": "http.response.body",
        "body": b"Hello, World!",
    })
    # This function can await — never blocks the loop`}
            filename="asgi_app.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Side by Side</h2>
          <BeforeAfter
            before={{
              title: "WSGI",
              subtitle: "Synchronous standard (2003)",
              icon: Cable,
              items: [
                { label: "One request per thread", status: "bad", detail: "Threads are expensive and limited" },
                { label: "Blocks on I/O operations", status: "bad", detail: "Thread sits idle waiting for database/network" },
                { label: "No WebSocket support", status: "bad", detail: "HTTP only — no persistent connections" },
                { label: "Battle-tested ecosystem", status: "good", detail: "Flask, Django, and thousands of libraries" },
              ],
            }}
            after={{
              title: "ASGI",
              subtitle: "Async standard (2018)",
              icon: Zap,
              items: [
                { label: "Many requests per process", status: "good", detail: "Event loop handles thousands concurrently" },
                { label: "Yields during I/O with await", status: "good", detail: "Process stays productive while waiting" },
                { label: "WebSocket + HTTP/2 support", status: "good", detail: "Full duplex, streaming, server-sent events" },
                { label: "Growing ecosystem", status: "good", detail: "FastAPI, Starlette, Django 3.0+ (partial)" },
              ],
            }}
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Live Race Visualization */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See the Difference</h2>
          <p className="text-muted-foreground mb-4">
            Same 5 requests, same database latency. WSGI processes them one at a time, blocking on every I/O call. ASGI handles them all concurrently — when one request awaits the database, the event loop picks up the next.
          </p>
          <AsgiWsgiViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why FastAPI Chose ASGI</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI was designed from the ground up for async Python. ASGI enables
            high-concurrency request handling, native WebSocket support, and modern
            streaming patterns — all with a clean <code className="text-sm bg-muted px-1.5 py-0.5 rounded">async/await</code> API.
          </p>
          <CodeBlock
            code={`# FastAPI's power comes from ASGI:

# 1. Handle thousands of concurrent requests
@app.get("/users")
async def get_users():
    return await db.fetch_all()

# 2. Native WebSocket support
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    async for message in ws.iter_text():
        await ws.send_text(f"Echo: {message}")

# 3. Server-Sent Events / Streaming
@app.get("/stream")
async def stream():
    async def generate():
        for i in range(100):
            yield f"data: {i}\\n\\n"
            await asyncio.sleep(0.1)
    return StreamingResponse(generate())`}
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
              <p className="text-sm font-medium mb-1">WSGI = Sync</p>
              <p className="text-xs text-muted-foreground">One thread per request. Simple but resource-heavy under load</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">ASGI = Async</p>
              <p className="text-xs text-muted-foreground">Event loop handles many requests per process with await</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">FastAPI Needs ASGI</p>
              <p className="text-xs text-muted-foreground">Don&apos;t run FastAPI under WSGI — you lose all async benefits</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">WebSocket + Streaming</p>
              <p className="text-xs text-muted-foreground">ASGI supports persistent connections that WSGI can&apos;t handle</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
