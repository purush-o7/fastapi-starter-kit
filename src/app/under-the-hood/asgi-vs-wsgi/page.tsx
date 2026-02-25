"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { BeforeAfter } from "@/components/before-after";
const AsgiWsgiViz = dynamic(
  () => import("../_components/asgi-wsgi-viz").then(m => m.AsgiWsgiViz),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
import { Cable, Zap } from "lucide-react";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";

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
          Your FastAPI app deployed perfectly — then WebSockets failed, background tasks vanished, and async stopped working. Wrong server protocol.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You try to deploy your FastAPI app with Gunicorn using the default settings. WebSocket connections fail immediately. Background tasks never complete. Your framework expects ASGI but Gunicorn speaks WSGI.`}
        error={`$ gunicorn main:app\n\nTypeError: FastAPI application received an invalid request.\nExpected ASGI scope, got WSGI environ.\n\n# Or more subtly:\n# WebSocket: connection rejected (WSGI doesn't support WebSocket)\n# Background tasks: silently dropped\n# Async endpoints: running synchronously (no event loop!)`}
        errorType="Protocol Mismatch"
        accentColor="lime"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          What&apos;s the difference between WSGI and ASGI? And why does using the wrong
          one silently break half your app? It comes down to how your web server
          and your application talk to each other.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model — WSGI */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">WSGI: The Old Way</h2>
          <p className="text-muted-foreground mb-4">
            WSGI (Web Server Gateway Interface) has been around since 2003. It&apos;s simple:
            the server calls your app with a request, your app returns a response. One
            request, one thread, start to finish.
          </p>
          <p className="text-muted-foreground mb-4">
            Think of it like a toll booth with one lane per operator. Each operator
            handles one car at a time. To handle more traffic, you add more operators (threads).
            Flask and Django use WSGI.
          </p>

          <SimpleFlow
            steps={[
              { label: "Request arrives", detail: "One per thread" },
              { label: "Thread blocked", detail: "Waiting for DB, API...", status: "error" },
              { label: "Response sent", detail: "Thread freed" },
              { label: "Next request", detail: "Same thread, new request" },
            ]}
            accentColor="lime"
            className="mb-4"
          />

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

      {/* ASGI */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">ASGI: The Async Upgrade</h2>
          <p className="text-muted-foreground mb-4">
            ASGI (Asynchronous Server Gateway Interface) is the modern standard from 2018.
            Instead of blocking, your app can{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">await</code> I/O operations and let
            the server handle other requests in the meantime.
          </p>
          <p className="text-muted-foreground mb-4">
            Think of it like a single operator managing multiple automated lanes.
            When a car pauses to find their card, the operator helps the next lane.
            One operator, many cars, no idle time. FastAPI and Starlette use ASGI.
          </p>

          <SimpleFlow
            steps={[
              { label: "Request arrives", detail: "Event loop picks it up" },
              { label: "Hits await", detail: "Pauses, runs other tasks", status: "success" },
              { label: "I/O completes", detail: "Resumes where it left off", status: "success" },
              { label: "Many at once", detail: "Thousands concurrent!", status: "success" },
            ]}
            accentColor="lime"
            className="mb-4"
          />

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

      <WhatYouJustLearned
        points={[
          "WSGI is synchronous — one thread per request, blocks on I/O",
          "ASGI is async — event loop handles many requests concurrently with await",
          "FastAPI is built on ASGI — running it on WSGI breaks async, WebSockets, and more",
        ]}
        section="wsgi vs asgi basics"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Side by Side comparison */}
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

      {/* Why FastAPI Chose ASGI */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why FastAPI Needs ASGI</h2>
          <p className="text-muted-foreground mb-4">
            It&apos;s not just about speed. ASGI unlocks features that are fundamentally
            impossible with WSGI. Without ASGI, you lose the three superpowers that
            make FastAPI special:
          </p>
          <CodeBlock
            code={`# 1. Handle thousands of concurrent requests
@app.get("/users")
async def get_users():
    return await db.fetch_all()  # Yields — other requests keep flowing

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

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          The sneaky part? Running FastAPI under WSGI doesn&apos;t always give you an
          obvious error. Sometimes it &quot;works&quot; but all your async endpoints run
          synchronously, your WebSockets silently fail, and you have no idea why
          your performance is terrible. Always check your server protocol.
        </p>
      </ConversationalCallout>

      <AhaMoment
        setup="If ASGI is better in every way, why does anyone still use WSGI?"
        reveal="WSGI is battle-tested with a massive ecosystem. Flask, Django (before 3.0), and thousands of libraries are built for WSGI. If you don't need async, WebSockets, or high concurrency, WSGI is simpler and has more tooling. But for FastAPI? ASGI isn't optional — it's the foundation everything is built on."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "ASGI enables three things WSGI can't: high concurrency, WebSockets, and streaming",
          "Running FastAPI on WSGI silently degrades your app — async stops working",
          "Always use an ASGI server (Uvicorn) or Gunicorn with UvicornWorker",
        ]}
        section="why asgi matters"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="Flask uses WSGI. FastAPI uses ASGI. Can you run a Flask app inside a FastAPI application?"
        options={[
          {
            label: "No — WSGI and ASGI are completely incompatible",
            correct: false,
            explanation: "They're different protocols, but there IS a bridge between them.",
          },
          {
            label: "Yes — using WSGIMiddleware to mount WSGI apps inside ASGI",
            correct: true,
            explanation: "WSGIMiddleware translates between the two protocols, letting you mount Flask inside FastAPI.",
          },
          {
            label: "Only if the Flask app is rewritten to use async",
            correct: false,
            explanation: "You don't need to rewrite anything. The middleware handles the protocol translation.",
          },
        ]}
        hint="Think about whether there's a way to translate between the two protocols."
        answer="Yes! You can use WSGIMiddleware to mount a WSGI app (like Flask) inside an ASGI app. FastAPI handles the protocol translation. This is great for gradual migration — mount your existing Flask app at /legacy while building new endpoints in FastAPI. The reverse (ASGI inside WSGI) is harder because WSGI can't handle async or WebSockets."
        className="mb-8"
      />

      <AhaMoment
        setup="So I can gradually migrate from Flask to FastAPI without rewriting everything at once?"
        reveal="Exactly. Mount your Flask app at /legacy using WSGIMiddleware, then build new endpoints in FastAPI. Over time, migrate routes from Flask to FastAPI one by one. Your users never notice a thing. This is one of the most practical migration strategies — no big-bang rewrite needed."
        className="mb-8"
      />

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
