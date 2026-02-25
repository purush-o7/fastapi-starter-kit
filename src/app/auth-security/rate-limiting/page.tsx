"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const RateLimitSim = dynamic(
  () => import("../_components/rate-limit-sim").then(m => m.RateLimitSim),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";
import { Gauge } from "lucide-react";

export default function RateLimitingPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Rate Limiting</h1>
          <Badge variant="outline">Security</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Rate limiting protects your API from abuse by capping how many requests a client can make in a given time window. Without it, a single client can overwhelm your server.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="Your API goes viral on Hacker News. 10,000 requests per second. Your database connection pool is exhausted in seconds. Every legitimate user gets 503 Service Unavailable. One bot can bring down your entire service."
        error={`# 2:15 PM — Hacker News front page
# Traffic spikes from 50 req/s to 10,000 req/s

sqlalchemy.exc.TimeoutError: QueuePool limit of 5 overflow 10
reached, connection timed out, timeout 30.00

# All endpoints return:
HTTP 503 Service Unavailable
{"detail": "Service temporarily unavailable"}

# 100% of real users affected. Revenue loss: $2,400/hour.`}
        errorType="503 Overload"
        accentColor="amber"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          How do you keep your API alive when 10,000 requests per second hit it?
          You can&apos;t just scale infinitely — that&apos;s expensive and slow to react.
          What you need is a bouncer at the door: rate limiting.
        </p>
        <p>
          It caps how many requests each client can make, so one runaway bot
          can&apos;t ruin the experience for everyone else.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model: What rate limiting does */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How Rate Limiting Works</h2>
          <p className="text-muted-foreground mb-4">
            Every request gets checked against a counter. If you&apos;re under the limit, the request goes through.
            If you&apos;re over, you get a 429 and have to wait.
          </p>
          <SimpleFlow
            steps={[
              { label: "Request arrives", detail: "From IP 192.168.1.1", status: "neutral" },
              { label: "Check counter", detail: "This IP: 4 of 5 allowed", status: "neutral" },
              { label: "Under limit?", detail: "4 < 5 → YES", status: "success" },
              { label: "Process request", detail: "Increment counter to 5", status: "success" },
            ]}
            accentColor="amber"
            className="mb-4"
          />
          <SimpleFlow
            steps={[
              { label: "Next request", detail: "Same IP, same minute", status: "neutral" },
              { label: "Check counter", detail: "This IP: 5 of 5 allowed", status: "neutral" },
              { label: "Under limit?", detail: "5 < 5 → NO", status: "error" },
              { label: "429 Too Many Requests", detail: "Retry-After: 60", status: "error" },
            ]}
            accentColor="amber"
            className="mb-6"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Concept"
        points={[
          "Rate limiting counts requests per client within a time window",
          "When the limit is hit, the server returns 429 Too Many Requests",
          "The Retry-After header tells clients when they can try again",
          "Different endpoints can have different limits based on sensitivity",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Code section: Setting up slowapi */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Setting Up slowapi</h2>
          <p className="text-muted-foreground mb-4">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">slowapi</code> is the go-to rate limiting
            library for FastAPI. It wraps the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">limits</code> library
            and plugs into Starlette middleware. Three lines to set up, one decorator per route.
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
# This handler returns a proper 429 response
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">get_remote_address</code> extracts the client&apos;s
          IP from the request. That&apos;s fine for most cases, but if your app is behind a
          load balancer or reverse proxy, you&apos;ll need to read the{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">X-Forwarded-For</code> header instead.
          Otherwise, ALL your users look like they&apos;re coming from the same IP (the proxy&apos;s).
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Code section: Per-route limits */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Per-Route Limits</h2>
          <p className="text-muted-foreground mb-4">
            Not all endpoints are equal. Your login endpoint should be locked down tight (brute-force prevention),
            while read-heavy endpoints can be more generous. Here&apos;s how you set different limits per route.
          </p>
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

      <AhaMoment
        setup="Why does the login endpoint need a much stricter rate limit than other endpoints?"
        reveal="A login endpoint is the front door for brute-force attacks. An attacker tries thousands of password combinations per minute. With 5 requests/minute, they can only try 5 passwords per minute — that's 7,200 per day instead of millions. For a strong password, cracking it at 5/min would take centuries. Meanwhile, your legitimate users rarely need more than 2-3 login attempts."
        className="mb-8"
      />

      <WhatYouJustLearned
        section="Per-Route Configuration"
        points={[
          "Use @limiter.limit() decorator to set per-route limits",
          "Login/auth endpoints should be the most restrictive (5-10/minute)",
          "Write endpoints need moderate limits (20-50/minute)",
          "Read endpoints can be generous (100+/minute)",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Code section: Global rate limiting */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Global Rate Limiting</h2>
          <p className="text-muted-foreground mb-4">
            Don&apos;t want to decorate every single route? Set a default limit for all routes,
            then override specific ones. And yes — you can exempt endpoints like health checks entirely.
          </p>
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

      {/* 7. Code section: Custom 429 responses */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Rate Limit Responses</h2>
          <p className="text-muted-foreground mb-4">
            The default 429 response is bare-bones. Your frontend team will appreciate a
            structured error with a clear <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">retry_after</code> field
            and a human-readable message.
          </p>
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
        headers={"Retry-After": "60"},  # Clients can read this header
    )`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Production Setup"
        points={[
          "default_limits sets a baseline for all routes",
          "@limiter.exempt removes limits from health check and status endpoints",
          "Custom 429 handlers give clients actionable information",
          "The Retry-After header is an HTTP standard — well-behaved clients respect it",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 8. Interactive sim — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Rate Limit Simulator</h2>
          <p className="text-muted-foreground mb-4">
            Click &quot;Send Request&quot; repeatedly and watch what happens when you exceed the limit.
            The gauge fills up, and once you hit the cap, requests get rejected with 429.
            Frustrating, right? Now imagine that&apos;s what your users see when a bot hammers your API without limits.
          </p>
          <RateLimitSim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 9. Go Deeper: IP-based limits pitfalls */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: The NAT Problem</h2>
          <p className="text-muted-foreground mb-4">
            IP-based rate limiting has a blind spot. What happens when hundreds of users share one IP?
          </p>
          <FailureDeepDive
            title="Corporate NAT Blocks Legitimate Users"
            scenario="A corporate office with 500 employees shares one public IP address. Your rate limit of 100 requests/minute per IP means ALL 500 employees share one bucket."
            code={`# Your rate limit config:
limiter = Limiter(key_func=get_remote_address)

@app.get("/api/data")
@limiter.limit("100/minute")  # Per IP
async def get_data(request: Request):
    return {"data": "..."}`}
            error={`# 9:05 AM — 500 employees open the company dashboard
# All traffic comes from 203.0.113.50 (corporate NAT)

# Employee 1-20: 5 requests each = 100 total → OK
# Employee 21-500: "429 Too Many Requests"
# The entire office is locked out after 20 people load the page.`}
            explanation="IP-based rate limiting treats all traffic from one IP as one user. Behind corporate NAT, VPNs, or shared WiFi, hundreds of real users look like one abusive client."
            fix="Combine IP-based limits with user-based limits (via auth tokens). Use higher IP limits for known corporate ranges, or add API key identification to your rate limit key function."
            fixCode={`# Better: rate limit by authenticated user, not just IP
def get_rate_limit_key(request: Request):
    # If authenticated, use user ID (each user gets their own bucket)
    auth = request.headers.get("Authorization")
    if auth:
        return f"user:{auth}"
    # Fall back to IP for unauthenticated requests
    return get_remote_address(request)

limiter = Limiter(key_func=get_rate_limit_key)`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 10. Mental Model Challenge */}
      <MentalModelChallenge
        question="You set a rate limit of 100 requests/minute per IP. A corporate office has 500 employees behind one NAT IP. What happens?"
        options={[
          { label: "Each employee gets 100 requests/minute", correct: false, explanation: "No — the rate limiter sees one IP, so all 500 employees share one 100-request bucket." },
          { label: "All 500 employees share the 100-request bucket", correct: true, explanation: "Correct. If 5 people make 20 requests each, the remaining 480 employees are locked out." },
          { label: "The rate limiter automatically detects NAT and adjusts", correct: false, explanation: "Rate limiters can't detect NAT. They only see the public IP address." },
          { label: "The corporate firewall handles the rate distribution", correct: false, explanation: "Corporate firewalls don't interact with your application's rate limiter." },
        ]}
        hint="Think about what the server sees — one IP address for all 500 employees."
        answer="All 500 employees share the same rate limit bucket because they share one public IP. If 5 people make 20 requests each in a minute, the rest of the office is locked out. This is why IP-based rate limiting is a starting point, not a complete solution. In practice, you combine it with user-based limits (via auth tokens) and use higher limits for known corporate ranges."
        className="mb-8"
      />

      {/* 11. Aha Moment */}
      <AhaMoment
        setup="If rate limiting just rejects requests, doesn't that hurt the user experience? Won't legitimate users get annoyed?"
        reveal="Good rate limits are invisible to legitimate users. If your normal user makes 10 requests per minute and your limit is 100/minute, they'll never notice it. Rate limits are set above normal usage but below abusive thresholds. The key is monitoring your actual traffic patterns first, then setting limits at 2-5x the normal peak. You protect the system without impacting real users."
        icon={<Gauge className="size-5 text-amber-500" />}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 12. Key Points grid — KEPT */}
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
