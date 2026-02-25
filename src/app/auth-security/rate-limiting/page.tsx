"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { RateLimitSim } from "../_components/rate-limit-sim";

export default function RateLimitingPage() {
  return (
    <div className="max-w-4xl ambient-auth">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Rate Limiting</h1>
          <Badge variant="outline">Security</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Rate limiting protects your API from abuse by capping how many requests a client can make in a given time window. Without it, a single client can overwhelm your server.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Why Rate Limiting Matters</h2>
          <p className="text-muted-foreground mb-4">
            Without rate limiting, your API is vulnerable to brute-force attacks, credential stuffing, resource exhaustion, and excessive scraping. A rate limiter caps requests per IP or per user, returning <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">429 Too Many Requests</code> when the limit is exceeded.
          </p>
          <CodeBlock code={`# Without rate limiting:
# POST /login → 1000 requests/second from one IP
# Your server is overwhelmed, real users can't log in

# With rate limiting:
# POST /login → 5 requests/minute per IP
# After 5 attempts: 429 Too Many Requests
# Your server stays healthy, brute-force attacks are blocked`} filename="concept.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Using slowapi</h2>
          <p className="text-muted-foreground mb-4">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">slowapi</code> is the most popular rate limiting library for FastAPI. It wraps <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">limits</code> and integrates with Starlette middleware.
          </p>
          <CodeBlock code={`# pip install slowapi

from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create limiter keyed by client IP
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Per-Route Limits</h2>
          <p className="text-muted-foreground mb-4">Apply different rate limits to different endpoints based on their sensitivity.</p>
          <CodeBlock code={`from fastapi import FastAPI, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

# Strict limit on login — prevent brute force
@app.post("/login")
@limiter.limit("5/minute")
async def login(request: Request):
    return {"message": "Login endpoint"}

# Moderate limit on writes
@app.post("/items")
@limiter.limit("30/minute")
async def create_item(request: Request):
    return {"message": "Item created"}

# Generous limit on reads
@app.get("/items")
@limiter.limit("100/minute")
async def list_items(request: Request):
    return {"items": []}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Global Rate Limiting</h2>
          <p className="text-muted-foreground mb-4">Apply a default rate limit to all routes, then override for specific endpoints.</p>
          <CodeBlock code={`from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"],  # All routes: 60 req/min
)

app = FastAPI()
app.state.limiter = limiter

# Uses the global default: 60/minute
@app.get("/items")
async def list_items(request: Request):
    return {"items": []}

# Override: stricter limit for sensitive endpoint
@app.post("/login")
@limiter.limit("5/minute")
async def login(request: Request):
    return {"message": "Login"}

# Override: no limit for health checks
@app.get("/health")
@limiter.exempt
async def health():
    return {"status": "ok"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Rate Limit Responses</h2>
          <p className="text-muted-foreground mb-4">Replace the default 429 response with a custom error handler that includes useful information.</p>
          <CodeBlock code={`from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": f"Too many requests. Limit: {exc.detail}",
            "retry_after": "60 seconds",
        },
        headers={"Retry-After": "60"},
    )`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: Rate Limit Simulator */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Rate Limit Simulator</h2>
          <p className="text-muted-foreground mb-4">
            Click &quot;Send Request&quot; repeatedly to see what happens when you exceed the rate limit. The gauge fills up, and once you hit the cap, requests get rejected with 429.
          </p>
          <RateLimitSim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">slowapi</p>
              <p className="text-xs text-muted-foreground">The go-to rate limiting library for FastAPI applications</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Per-Route Limits</p>
              <p className="text-xs text-muted-foreground">Apply stricter limits to sensitive endpoints like login</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">429 Status Code</p>
              <p className="text-xs text-muted-foreground">Returned when a client exceeds the rate limit with Retry-After header</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Key Function</p>
              <p className="text-xs text-muted-foreground">Rate limits keyed by IP address, user ID, or API key</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
