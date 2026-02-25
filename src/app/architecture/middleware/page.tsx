"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const MiddlewareFlow = dynamic(
  () => import("../_components/middleware-flow").then(m => m.MiddlewareFlow),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

const MiddlewarePeeler = dynamic(
  () => import("../_components/middleware-peeler").then(m => m.MiddlewarePeeler),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function MiddlewarePage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Middleware</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Middleware runs on every request before it reaches your endpoint, and on every response before it&apos;s sent back. Perfect for logging, timing, and authentication.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario="You add logging middleware to track request timing. It logs the request... but the response never comes back. Requests seem to vanish into thin air. Turns out you forgot await call_next(request)."
        error={`# Your middleware\n@app.middleware("http")\nasync def log_requests(request: Request, call_next):\n    start = time.time()\n    print(f"Request: {request.method} {request.url}")\n    # Oops... forgot to call call_next(request)\n    # The request stops HERE. The endpoint never runs.\n    # The client waits... and waits... and eventually times out.\n\n# Client sees:\n# curl: (52) Empty reply from server`}
        errorType="Request Swallowed"
        accentColor="purple"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>Why did the request disappear? Because middleware sits <em>between</em> the client and your endpoint. If your middleware doesn&apos;t explicitly pass the request forward, it never reaches your route handler. The request just... stops.</p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Russian Doll Model</h2>
          <p className="text-muted-foreground mb-4">
            Think of middleware as layers wrapping your endpoint — like Russian dolls. The request passes through each layer going in, hits your endpoint, and then the response travels back out through each layer in reverse.
          </p>
          <SimpleFlow
            steps={[
              { label: "Client", detail: "Sends request", status: "neutral" },
              { label: "Middleware A", detail: "First in, last out", status: "neutral" },
              { label: "Middleware B", detail: "Second in, second out", status: "neutral" },
              { label: "Middleware C", detail: "Last in, first out", status: "neutral" },
              { label: "Endpoint", detail: "Your route handler", status: "success" },
            ]}
            accentColor="purple"
            className="mb-4"
          />
          <p className="text-xs text-muted-foreground">
            The key insight: middleware added <strong>last</strong> runs <strong>first</strong> (closest to the endpoint). This LIFO order matters when middleware depends on each other.
          </p>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Mental Model"
        points={[
          "Middleware wraps your endpoint — request flows in, response flows out",
          "call_next(request) is the bridge — skip it and the request stops dead",
          "Middleware runs in reverse registration order (LIFO): last added = closest to endpoint",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Creating Middleware */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Creating Middleware</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the pattern you&apos;ll use 90% of the time. Your middleware does something before the request, calls <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">call_next</code>, then does something with the response.
          </p>
          <CodeBlock code={`import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # BEFORE: runs before your endpoint
    start_time = time.perf_counter()

    response = await call_next(request)  # <-- The magic line

    # AFTER: runs after your endpoint returns
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response  # Don't forget this either!`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>Everything before <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">await call_next(request)</code> is your &quot;request phase&quot;. Everything after is your &quot;response phase&quot;. This single function handles both directions of the request-response cycle.</p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Middleware Flow Visualized — KEPT */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Middleware Flow Visualized</h2>
          <p className="text-muted-foreground mb-4">Watch how a request flows through each middleware layer, hits the endpoint, then the response travels back in reverse order.</p>
          <MiddlewareFlow />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Creating Middleware"
        points={[
          "Use @app.middleware('http') to create request/response middleware",
          "call_next(request) passes the request to the next layer (or endpoint)",
          "Code before call_next is the request phase, code after is the response phase",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. CORS Middleware */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Built-in CORS Middleware</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI includes built-in CORS middleware so you don&apos;t have to write it yourself. You&apos;ll use this any time your frontend and backend are on different domains.
          </p>
          <CodeBlock code={`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 7. Class-Based Middleware */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Class-Based Middleware</h2>
          <p className="text-muted-foreground mb-4">
            For more complex middleware — where you need configuration or shared state — use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">BaseHTTPMiddleware</code> class. Same concept, more structure.
          </p>
          <CodeBlock code={`from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check for auth header on every request
        if not request.headers.get("Authorization"):
            # Short-circuit: return early without calling call_next
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated"},
            )
        # Auth header present — let the request through
        response = await call_next(request)
        return response

app.add_middleware(AuthMiddleware)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="When should you use middleware vs. a dependency?"
        reveal="Middleware runs on EVERY request — there's no way to opt out for specific routes. Dependencies run only on routes that declare them. Use middleware for truly global concerns (logging, timing, CORS). Use dependencies for per-route concerns (auth, pagination, DB sessions). If you put auth in middleware, even your /health endpoint needs an auth token."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Failure Deep Dive */}
      <FailureDeepDive
        title="The Missing call_next"
        scenario="You write middleware to reject requests without an API key. It works for blocked requests, but allowed requests hang forever."
        code={`@app.middleware("http")
async def check_api_key(request: Request, call_next):
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return JSONResponse(
            status_code=403,
            content={"error": "API key required"}
        )
    # Great, API key exists! But... where's call_next?
    # The request with a valid key just hangs here.
    # Nothing happens. No response. Timeout.`}
        error={`# With no API key (works fine):
$ curl -s http://localhost:8000/items
{"error": "API key required"}  ← This path works!

# With API key (hangs forever):
$ curl -s -H "X-API-Key: abc123" http://localhost:8000/items
# ... waiting ...
# ... still waiting ...
# curl: (52) Empty reply from server`}
        explanation="Your middleware handles the 'reject' path correctly — it returns a JSONResponse, which goes back to the client. But on the 'accept' path, you never call call_next(request) to pass the request to the endpoint. The middleware function ends without returning a response, so the client gets nothing."
        fix="Always call call_next(request) on the happy path. Your middleware must either return an early response (for rejection) OR call call_next and return its response (for acceptance)."
        fixCode={`@app.middleware("http")
async def check_api_key(request: Request, call_next):
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return JSONResponse(
            status_code=403,
            content={"error": "API key required"}
        )
    # Pass the request forward and return the response
    response = await call_next(request)
    return response`}
        filename="main.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Peel the Layers — KEPT */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Peel the Layers</h2>
          <p className="text-muted-foreground mb-4">Middleware wraps your endpoint like Russian dolls. Peel away each layer to see what it does.</p>
          <MiddlewarePeeler />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Go Deeper: Exception Handling */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Exception Handling in Middleware</h2>
          <p className="text-muted-foreground mb-4">
            What happens if your endpoint raises an exception? If you don&apos;t wrap <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">call_next</code> in a try/except, the exception bubbles up and your &quot;response phase&quot; code never runs.
          </p>
          <CodeBlock code={`@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as exc:
        # Catch any unhandled exception from the endpoint
        # Log it, return a clean error response
        print(f"Unhandled error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
    return response`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>Be careful with error-handling middleware. If you catch too broadly, you might swallow exceptions that should crash the app (like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">SystemExit</code>). Only catch <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Exception</code>, not <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">BaseException</code>.</p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="Advanced Middleware"
        points={[
          "Class-based middleware with BaseHTTPMiddleware gives you more structure",
          "Middleware can short-circuit — return early without calling call_next",
          "Wrap call_next in try/except to handle endpoint exceptions gracefully",
          "Use middleware for global concerns, dependencies for per-route logic",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If you have 3 middleware layers (A, B, C added in that order) and B raises an exception, does C's response code run?"
        options={[
          {
            label: "Yes — all middleware response phases always run",
            correct: false,
            explanation: "Middleware response phases only run if call_next completed successfully or was caught by try/except.",
          },
          {
            label: "No — C never runs because B failed before calling call_next()",
            correct: true,
            explanation: "Correct! B wraps C. If B raises before calling call_next(), C's code never executes.",
          },
          {
            label: "It depends on whether the exception is an HTTPException",
            correct: false,
            explanation: "The type of exception doesn't matter — what matters is whether call_next() was called.",
          },
          {
            label: "C runs but A doesn't",
            correct: false,
            explanation: "It's the opposite. A wraps B wraps C. If B fails, the exception propagates UP to A, not down to C.",
          },
        ]}
        hint="Think about the order: A wraps B wraps C. Which layer is 'inside' which?"
        answer="No. Middleware executes in LIFO order: A wraps B wraps C. When B raises, the exception propagates back up through A (if it has try/except). C never runs because B failed before calling call_next(). Think of it like Russian dolls — if the middle one breaks, the inner one never opens."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="Why does middleware run in REVERSE order of how it's added?"
        reveal="Because each app.add_middleware() call wraps the ENTIRE existing app. The last middleware added is the outermost layer — it's the first to see the request and the last to touch the response. It's like wrapping a gift: the last layer of paper you add is the first one someone unwraps."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Request → Response</p>
              <p className="text-xs text-muted-foreground">Middleware wraps the entire request-response cycle</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Execution Order</p>
              <p className="text-xs text-muted-foreground">Middleware runs in reverse order of how it was added</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Built-in CORS</p>
              <p className="text-xs text-muted-foreground">CORSMiddleware handles cross-origin requests out of the box</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">vs Dependencies</p>
              <p className="text-xs text-muted-foreground">Use middleware for global concerns, Depends for per-route logic</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
