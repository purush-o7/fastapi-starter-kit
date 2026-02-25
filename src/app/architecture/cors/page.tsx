"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CorsSimulator } from "../_components/cors-simulator";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

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

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario="Your React frontend deployed to myapp.com calls your FastAPI backend at api.myapp.com. Everything worked in local dev. In production: CORS error. You add allow_origins=['*'] with allow_credentials=True. Still broken."
        error={`# Browser console:\nAccess to fetch at 'https://api.myapp.com/users' from origin\n'https://myapp.com' has been blocked by CORS policy:\n\nThe value of the 'Access-Control-Allow-Origin' header in the\nresponse must not be the wildcard '*' when the request's\ncredentials mode is 'include'.\n\n# You thought '*' means "allow everything".\n# But with credentials, '*' is explicitly FORBIDDEN.`}
        errorType="CORS Blocked"
        accentColor="purple"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>Why would &quot;allow everything&quot; not actually allow everything? Because CORS isn&apos;t a server-side feature — it&apos;s a <em>browser</em> security policy. The browser enforces the rules, and it has opinions about wildcards and credentials that your server can&apos;t override.</p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What&apos;s Actually Happening</h2>
          <p className="text-muted-foreground mb-4">
            CORS isn&apos;t your server blocking requests. Your server is happy to respond to anyone. It&apos;s the <em>browser</em> that blocks the response from reaching your JavaScript. Here&apos;s the flow:
          </p>
          <SimpleFlow
            steps={[
              { label: "Your JS Code", detail: "fetch('api.myapp.com')", status: "neutral" },
              { label: "Browser Check", detail: "Different origin? Ask server first", status: "neutral" },
              { label: "Server Response", detail: "Here are my CORS headers", status: "neutral" },
              { label: "Browser Decision", detail: "Headers OK? Allow or block", status: "success" },
            ]}
            accentColor="purple"
            className="mb-4"
          />
          <p className="text-xs text-muted-foreground">
            The server always sends the response. The browser just decides whether your JavaScript gets to see it. That&apos;s why CORS errors never happen with curl or Postman — they&apos;re not browsers.
          </p>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Mental Model"
        points={[
          "CORS is enforced by the browser, not the server",
          "Different ports, subdomains, or protocols all count as different origins",
          "The server tells the browser what's allowed via response headers",
          "Non-browser tools (curl, Postman) skip CORS entirely",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. What is CORS */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What Counts as a Different Origin?</h2>
          <p className="text-muted-foreground mb-4">
            An &quot;origin&quot; is the combination of scheme + host + port. Change any one of these and the browser treats it as a different origin. This trips up a lot of people in local development.
          </p>
          <CodeBlock code={`# These are ALL different origins:
http://localhost:3000    # React dev server
http://localhost:8000    # FastAPI server
http://localhost:5173    # Vite dev server

# Even these are different:
http://myapp.com         # HTTP
https://myapp.com        # HTTPS (different scheme!)
https://api.myapp.com    # Different subdomain
https://myapp.com:8443   # Different port

# So your React app at localhost:3000 calling
# FastAPI at localhost:8000 is a cross-origin request.
# Even in local dev!`} filename="browser-rules.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>This is why &quot;it works in development but not production&quot; is the most common CORS complaint. In dev, your frontend and backend might share <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localhost</code> but use different ports. In production, they might have different subdomains. Both are cross-origin.</p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. CORSMiddleware Setup */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Setting Up CORSMiddleware</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI includes CORSMiddleware from Starlette. You tell it which origins, methods, and headers to allow. Here&apos;s the basic setup:
          </p>
          <CodeBlock code={`from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Which origins can call your API
    allow_origins=["http://localhost:3000"],
    # Allow cookies and auth headers
    allow_credentials=True,
    # Which HTTP methods are allowed
    allow_methods=["*"],
    # Which request headers the client can send
    allow_headers=["*"],
)

@app.get("/api/items")
async def list_items():
    return [{"id": 1, "name": "Item 1"}]`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 6. Configuration Options */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
          <p className="text-muted-foreground mb-4">
            Each parameter controls a different aspect of cross-origin access. Let&apos;s walk through what each one does.
          </p>
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

    # Which response headers the client can READ
    expose_headers=["X-Total-Count", "X-Request-ID"],

    # How long the browser caches preflight results (seconds)
    max_age=600,  # 10 minutes
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Configuration"
        points={[
          "allow_origins lists the exact domains that can call your API",
          "allow_credentials enables cookies and auth headers across origins",
          "expose_headers controls which response headers your JS can read",
          "max_age tells the browser how long to cache preflight results",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Wildcard vs Specific Origins */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Wildcard Trap</h2>
          <p className="text-muted-foreground mb-4">
            This is the trap from the failure hook at the top of this page. Using <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">allow_origins=[&quot;*&quot;]</code> seems like it allows everything. But the browser has a strict rule: <strong>you cannot combine wildcards with credentials</strong>.
          </p>
          <CodeBlock code={`# Public API — no auth cookies needed
# This works fine with the wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Any origin
    allow_credentials=False,      # No cookies
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Private API — needs auth cookies
# You MUST list specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com"],  # Specific!
    allow_credentials=True,                # Cookies work
    allow_methods=["*"],
    allow_headers=["*"],
)

# THIS DOES NOT WORK — browser rejects it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Wildcard...
    allow_credentials=True,        # ...with credentials = BROKEN
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <FailureDeepDive
        title="Wildcard + Credentials = Silent Failure"
        scenario="You deploy to production with allow_origins=['*'] and allow_credentials=True. The API works from Postman but every browser request fails."
        code={`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # "Allow everything!"
    allow_credentials=True,    # "Allow cookies too!"
    allow_methods=["*"],
    allow_headers=["*"],
)`}
        error={`Access to fetch at 'https://api.myapp.com/users' from origin
'https://myapp.com' has been blocked by CORS policy:

The value of the 'Access-Control-Allow-Origin' header in the
response must not be the wildcard '*' when the request's
credentials mode is 'include'.`}
        explanation="The browser spec explicitly forbids the wildcard '*' with credentials. Why? Because credentials (cookies, auth headers) are sensitive. If the server says 'any origin can send credentials to me', that's a security hole. A malicious site could send requests with your cookies. The browser protects you by requiring specific origins."
        fix="List your specific origins instead of using the wildcard. If you have many environments, you can build the list from environment variables."
        fixCode={`import os

# Build origins list from environment
origins = [
    "https://myapp.com",
    "https://staging.myapp.com",
]

# Add local dev origins if in development
if os.getenv("ENV") == "development":
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Specific origins
    allow_credentials=True,     # Now cookies work!
    allow_methods=["*"],
    allow_headers=["*"],
)`}
        filename="main.py"
        className="mb-8"
      />

      <AhaMoment
        setup="Why does CORS only affect browsers? Why can curl and Postman ignore it?"
        reveal="Because CORS is a browser security feature, not an HTTP feature. Browsers enforce it to protect users from malicious websites making requests on their behalf (using their cookies). curl and Postman aren't browsers — they don't store cookies from other sites, so there's no user to protect. The server always sends the response; only the browser decides to block your JavaScript from reading it."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 8. Preflight Requests */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Preflight Requests</h2>
          <p className="text-muted-foreground mb-4">
            For some requests, the browser sends an extra OPTIONS request <em>before</em> your actual request. This is called a &quot;preflight&quot; — the browser checks if the server will accept the real request before actually sending it.
          </p>
          <SimpleFlow
            steps={[
              { label: "Your JS", detail: "POST with JSON body", status: "neutral" },
              { label: "Browser", detail: "Non-simple request — preflight!", status: "neutral" },
              { label: "OPTIONS /api", detail: "Browser asks: 'Is this allowed?'", status: "neutral" },
              { label: "Server", detail: "Returns CORS headers", status: "success" },
              { label: "POST /api", detail: "Now the real request goes through", status: "success" },
            ]}
            accentColor="purple"
            className="mb-4"
          />
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

      <ConversationalCallout type="warning" className="mb-8">
        <p>Preflight requests can slow down your API if <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">max_age</code> is too low. Every unique combination of origin + method + headers triggers a new preflight. Set <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">max_age=600</code> (10 minutes) or higher so the browser caches the preflight result.</p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="How CORS Works"
        points={[
          "Wildcard origins ('*') cannot be used with allow_credentials=True",
          "The browser sends a preflight OPTIONS request for non-simple requests",
          "POST with Content-Type: application/json triggers a preflight",
          "max_age controls how long the browser caches preflight results",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive: CORS Simulator — KEPT */}
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

      {/* Go Deeper: Production CORS */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Production CORS Setup</h2>
          <p className="text-muted-foreground mb-4">
            In production, you&apos;ll typically have multiple environments (dev, staging, prod) each with different origins. Here&apos;s a pattern that scales:
          </p>
          <CodeBlock code={`import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Environment-aware CORS configuration
CORS_ORIGINS = {
    "development": [
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    "staging": [
        "https://staging.myapp.com",
    ],
    "production": [
        "https://myapp.com",
        "https://www.myapp.com",
    ],
}

env = os.getenv("ENV", "development")
origins = CORS_ORIGINS.get(env, CORS_ORIGINS["development"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    max_age=600,
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="A simple GET request with no custom headers does NOT trigger a preflight OPTIONS request. But a POST with Content-Type: application/json DOES. Why?"
        options={[
          {
            label: "POST requests are always preflighted",
            correct: false,
            explanation: "POST with standard content types (like text/plain or application/x-www-form-urlencoded) are NOT preflighted.",
          },
          {
            label: "application/json is not a 'simple' content type, so the browser checks first",
            correct: true,
            explanation: "Exactly! The browser classifies content types as 'simple' or 'non-simple'. JSON is non-simple.",
          },
          {
            label: "GET requests are always treated as safe by CORS",
            correct: false,
            explanation: "GET requests CAN be preflighted if they include custom headers (like X-API-Key).",
          },
          {
            label: "The server configuration determines which requests get preflighted",
            correct: false,
            explanation: "The browser decides based on the request characteristics, not the server config.",
          },
        ]}
        hint="Think about what content types HTML forms can send natively."
        answer="Browsers classify requests as 'simple' or 'preflighted'. Simple requests (GET/POST with standard headers and standard content types like text/plain) go straight through. But application/json is not a 'simple' content type — so the browser sends an OPTIONS preflight first to check if the server allows it. This catches CORS issues before the actual data transfer."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="If CORS is just browser headers, can a malicious server lie about its origin?"
        reveal="The Origin header is set by the browser and cannot be modified by JavaScript. A malicious website can't fake its origin in a browser request. But a malicious SERVER (using curl, scripts, etc.) can call your API directly — CORS doesn't protect against that. CORS only protects users from malicious websites making requests on their behalf. For server-to-server protection, you need API keys, tokens, or IP allowlists."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points — KEPT */}
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
