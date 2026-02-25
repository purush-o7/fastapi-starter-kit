"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CorsSimulator } from "../_components/cors-simulator";

export default function CorsPage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">CORS</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Cross-Origin Resource Sharing controls which frontend domains can call your API. Without it, browsers block requests from any origin other than your API&apos;s own domain.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is CORS?</h2>
          <p className="text-muted-foreground mb-4">
            When your React app at <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localhost:3000</code> tries to call your FastAPI backend at <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localhost:8000</code>, the browser blocks it — different ports count as different origins. CORS is the mechanism that tells the browser which cross-origin requests are allowed.
          </p>
          <CodeBlock code={`# Without CORS configured, the browser blocks this:
# fetch("http://localhost:8000/api/items")
#   → ❌ CORS error: No 'Access-Control-Allow-Origin' header

# The server must explicitly allow the frontend's origin
# by including the right headers in its response.`} filename="browser-console.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">CORSMiddleware Setup</h2>
          <p className="text-muted-foreground mb-4">FastAPI includes CORSMiddleware from Starlette. Add it to your app with the origins you want to allow.</p>
          <CodeBlock code={`from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/items")
async def list_items():
    return [{"id": 1, "name": "Item 1"}]`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
          <p className="text-muted-foreground mb-4">Each parameter controls a different aspect of cross-origin access.</p>
          <CodeBlock code={`app.add_middleware(
    CORSMiddleware,

    # Which origins can make requests
    allow_origins=[
        "http://localhost:3000",       # Local dev
        "https://myapp.com",           # Production
        "https://staging.myapp.com",   # Staging
    ],

    # Allow cookies and auth headers
    allow_credentials=True,

    # Which HTTP methods are allowed
    allow_methods=["GET", "POST", "PUT", "DELETE"],

    # Which headers the client can send
    allow_headers=["Authorization", "Content-Type"],

    # Which headers the client can read from the response
    expose_headers=["X-Total-Count", "X-Request-ID"],

    # How long the browser caches preflight results (seconds)
    max_age=600,
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Wildcard vs Specific Origins</h2>
          <p className="text-muted-foreground mb-4">
            Using <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">allow_origins=[&quot;*&quot;]</code> allows any origin, but it cannot be combined with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">allow_credentials=True</code>. If you need cookies or auth headers, you must list specific origins.
          </p>
          <CodeBlock code={`# ✅ Public API — no credentials needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Any origin
    allow_credentials=False,      # No cookies/auth
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ✅ Private API — specific origins with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com"],
    allow_credentials=True,       # Cookies work
    allow_methods=["*"],
    allow_headers=["*"],
)

# ❌ This does NOT work — browser ignores it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,       # Can't use * with credentials!
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Preflight Requests</h2>
          <p className="text-muted-foreground mb-4">
            For non-simple requests (like POST with JSON or custom headers), the browser sends an OPTIONS request first to check if the server allows it. This is called a &quot;preflight&quot; request. CORSMiddleware handles this automatically.
          </p>
          <CodeBlock code={`# The browser automatically sends this before your actual request:
# OPTIONS /api/items HTTP/1.1
# Origin: http://localhost:3000
# Access-Control-Request-Method: POST
# Access-Control-Request-Headers: Content-Type

# CORSMiddleware responds with:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: POST
# Access-Control-Allow-Headers: Content-Type
# Access-Control-Max-Age: 600

# Only then does the browser send the actual POST request.
# You don't need to handle OPTIONS yourself — the middleware does it.`} filename="preflight.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: CORS Simulator */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: CORS Simulator</h2>
          <p className="text-muted-foreground mb-4">
            Select a scenario to see how the browser handles cross-origin requests. Watch the request flow, header check, and whether the browser allows or blocks the response.
          </p>
          <CorsSimulator />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">CORSMiddleware</p>
              <p className="text-xs text-muted-foreground">Built-in middleware that handles cross-origin requests and preflight</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">allow_origins</p>
              <p className="text-xs text-muted-foreground">List specific origins or use [&quot;*&quot;] for public APIs without credentials</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Credentials</p>
              <p className="text-xs text-muted-foreground">Cannot use wildcard origins when allow_credentials is True</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Preflight</p>
              <p className="text-xs text-muted-foreground">OPTIONS requests are handled automatically by the middleware</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
