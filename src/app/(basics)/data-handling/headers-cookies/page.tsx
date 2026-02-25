"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const StorageComparison = dynamic(
  () => import("../_components/storage-comparison").then(m => m.StorageComparison),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

export default function HeadersCookiesPage() {
  return (
    <div className="max-w-4xl ambient-data">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Headers & Cookies</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Beyond path and query parameters, FastAPI gives you typed access to request headers and cookies using Header() and Cookie() — with the same validation and auto-documentation you already know.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You set a cookie in your response, but the frontend JavaScript can't read it. document.cookie returns empty. The cookie is there in DevTools, so where did it go?`}
        error={`# FastAPI backend
response.set_cookie(key="session", value="abc123", httponly=True)

# Frontend JavaScript
console.log(document.cookie)  // → "" (empty!)

# But Chrome DevTools → Application → Cookies shows:
# session = abc123  ✓ HttpOnly`}
        errorType="Cookie Mystery"
        accentColor="blue"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          The cookie is there — you can see it in DevTools. But JavaScript can&apos;t read it. That&apos;s not a bug.
          You set <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">httponly=True</code>, which
          deliberately hides the cookie from JavaScript. It&apos;s a security feature that protects against XSS attacks.
          The browser still sends it with every request — your backend just made it invisible to scripts.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Headers vs. Cookies: When to Use Which</h2>
          <p className="text-muted-foreground mb-4">
            Both headers and cookies carry data between client and server. But they serve different purposes
            and have different security characteristics.
          </p>
          <SimpleFlow
            steps={[
              { label: "Headers", detail: "Per-request metadata (auth tokens, content type)", status: "neutral" },
              { label: "Cookies", detail: "Persistent state (sessions, preferences)", status: "neutral" },
            ]}
            direction="vertical"
            accentColor="blue"
            className="mb-4"
          />
          <p className="text-sm text-muted-foreground">
            Headers are set explicitly by your code on every request. Cookies are set once by the server and
            automatically sent by the browser on every subsequent request. That&apos;s the key difference.
          </p>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Headers vs cookies"
        points={[
          "Headers carry per-request metadata — the client sets them explicitly",
          "Cookies persist across requests — the browser sends them automatically",
          "httponly=True hides cookies from JavaScript (security feature, not a bug)",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough: Reading headers */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Reading Request Headers</h2>
          <p className="text-muted-foreground mb-4">
            Declare a parameter with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Header()</code> to
            extract values from request headers. It works just like Query() and Path() — same validation, same docs.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Header

app = FastAPI()

@app.get("/items")
async def read_items(user_agent: str = Header()):
    return {"User-Agent": user_agent}

# Optional header with a default
@app.get("/protected")
async def protected_route(x_token: str | None = Header(default=None)):
    if x_token is None:
        return {"message": "No token provided"}
    return {"token": x_token}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Underscore-to-Hyphen Magic</h2>
          <ConversationalCallout type="insight" className="mb-4">
            <p>
              Here&apos;s a small thing that trips people up. HTTP headers use hyphens (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">X-Token</code>),
              but Python variables can&apos;t have hyphens. FastAPI automatically converts underscores to hyphens,
              so <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">x_token</code> in your code maps to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">X-Token</code> header.
            </p>
          </ConversationalCallout>
          <CodeBlock code={`from fastapi import FastAPI, Header

app = FastAPI()

# x_custom_header → X-Custom-Header  (auto-converted)
@app.get("/info")
async def get_info(
    x_custom_header: str = Header(),
    accept_language: str = Header(default="en"),
):
    return {
        "custom_header": x_custom_header,
        "language": accept_language,
    }

# Disable auto-conversion if needed
@app.get("/raw")
async def raw_header(
    strange_header: str = Header(convert_underscores=False),
):
    # Expects literally "strange_header" as the header name
    return {"header": strange_header}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Request headers"
        points={[
          "Header() extracts typed values from request headers",
          "Python underscores auto-convert to HTTP hyphens (x_token → X-Token)",
          "Optional headers use Header(default=None) or Header(default='value')",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Reading Cookies from Requests</h2>
          <p className="text-muted-foreground mb-4">
            Reading cookies follows the exact same pattern as headers. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Cookie()</code> instead
            of <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Header()</code> — that&apos;s the only difference.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Cookie

app = FastAPI()

@app.get("/me")
async def read_user(
    session_id: str | None = Cookie(default=None),
):
    if session_id is None:
        return {"message": "No session"}
    return {"session_id": session_id}

# Multiple cookies
@app.get("/preferences")
async def get_preferences(
    theme: str = Cookie(default="light"),
    language: str = Cookie(default="en"),
):
    return {"theme": theme, "language": language}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Setting Response Headers</h2>
          <p className="text-muted-foreground mb-4">
            Need to send custom headers back to the client? Inject the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Response</code> object
            and set whatever headers you need.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Response

app = FastAPI()

@app.get("/items")
async def read_items(response: Response):
    response.headers["X-Custom-Header"] = "my-value"
    response.headers["X-Request-ID"] = "abc-123"
    return {"message": "Check the response headers"}

# Or return a Response directly
from fastapi.responses import JSONResponse

@app.get("/custom")
async def custom_response():
    content = {"message": "Hello"}
    headers = {
        "X-Custom-Header": "my-value",
        "X-Process-Time": "0.042",
    }
    return JSONResponse(content=content, headers=headers)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Cookies and response headers"
        points={[
          "Cookie() reads cookies with the same pattern as Header()",
          "Inject Response to set custom headers on outgoing responses",
          "JSONResponse gives you full control over status, headers, and body",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* The cookie security deep-dive */}
      <FailureDeepDive
        title="The HttpOnly Cookie Mystery"
        scenario="You set a session cookie but your frontend JavaScript can't read it. The cookie exists in DevTools but document.cookie is empty."
        code={`from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/login")
async def login(response: Response):
    response.set_cookie(
        key="session",
        value="abc123",
        httponly=True,  # ← This is the cause
    )
    return {"message": "Logged in"}`}
        error={`// Frontend JavaScript
console.log(document.cookie)  // → "" (empty!)

// But the cookie IS there — the browser sends it
// with every request. JavaScript just can't see it.`}
        explanation={`httponly=True tells the browser: "Send this cookie with HTTP requests, but don't let JavaScript access it." This is intentional — it protects the session token from XSS attacks. If an attacker injects malicious JavaScript into your page, they can't steal the cookie because document.cookie won't return it.`}
        fix="This isn't a bug to fix — it's working as designed. If you need JavaScript access, remove httponly. But for auth tokens, always keep httponly=True."
        fixCode={`# For auth tokens — KEEP httponly=True (secure)
response.set_cookie(
    key="session_id",
    value="abc123",
    httponly=True,       # JS can't read it (good!)
    secure=True,         # HTTPS only
    samesite="lax",      # CSRF protection
    max_age=3600,        # expires in 1 hour
)

# For non-sensitive data JS needs to read:
response.set_cookie(
    key="theme",
    value="dark",
    httponly=False,  # JS CAN read this one
)`}
        filename="main.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Cookie Security Flags</h2>
          <p className="text-muted-foreground mb-4">
            Each flag in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">set_cookie()</code> protects
            against a specific attack. Understanding what each does is critical for secure auth.
          </p>
          <CodeBlock code={`response.set_cookie(
    key="session_id",
    value="abc123",

    # httponly=True → JavaScript CANNOT read this cookie
    # Protects against XSS (cross-site scripting)
    # An attacker injecting JS can't steal the token
    httponly=True,

    # secure=True → Cookie only sent over HTTPS
    # Prevents interception on insecure networks
    # Always use in production!
    secure=True,

    # samesite="lax" → Cookie not sent on cross-site requests
    # Protects against CSRF (cross-site request forgery)
    # "strict" = never cross-site, "lax" = safe navigation only
    samesite="lax",

    # max_age=3600 → Cookie expires in 1 hour
    # Without this, cookie dies when browser closes (session cookie)
    # Short expiry = less damage if stolen
    max_age=3600,

    # domain → which domains receive this cookie
    # path → which URL paths receive this cookie
    # Omit both for maximum restriction (current domain + path only)
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why not always set all security flags to their strictest values?"
        reveal={`Because strictness comes with tradeoffs. samesite="strict" breaks OAuth login flows (the redirect from Google won't include your cookies). secure=True means no cookies in local development over HTTP. httponly=True means your frontend can't read the cookie for UI purposes. Choose the right flags for each cookie's purpose — auth tokens need max security, theme preferences don't.`}
        className="mb-8"
      />

      <WhatYouJustLearned
        section="Cookie security"
        points={[
          "httponly=True prevents XSS attacks from stealing session tokens",
          "secure=True ensures cookies only travel over HTTPS",
          "samesite prevents CSRF — use 'lax' for most cases, 'strict' for sensitive actions",
          "max_age controls cookie lifetime — shorter is safer for auth tokens",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Storage Comparison Interactive */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Where Should You Store Tokens?</h2>
          <p className="text-muted-foreground mb-4">
            Not all storage is created equal. Compare HttpOnly cookies, localStorage, sessionStorage, and in-memory storage — see what&apos;s vulnerable to XSS, what survives a refresh, and what&apos;s actually safe.
          </p>
          <StorageComparison />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="What's the difference between a Header() parameter and reading request.headers directly?"
        options={[
          {
            label: "They're identical — Header() is just syntactic sugar",
            correct: false,
            explanation: "Header() does a lot more than just read the value. It adds validation, conversion, and documentation."
          },
          {
            label: "Header() gives you auto-conversion, validation, and OpenAPI docs; request.headers is raw access",
            correct: true,
            explanation: "Header() converts underscores to hyphens, validates types, and adds the parameter to your API docs automatically."
          },
          {
            label: "request.headers is faster because it skips validation",
            correct: false,
            explanation: "The performance difference is negligible. Header() gives you much better developer experience."
          },
          {
            label: "You can only use Header() for standard HTTP headers",
            correct: false,
            explanation: "Header() works with any header, standard or custom. Just name your parameter to match."
          },
        ]}
        hint="Think about what happens to header names with hyphens, and how the parameter shows up in /docs."
        answer={`Header() gives you automatic conversion (HTTP_X_TOKEN becomes x_token), type validation, and documentation in OpenAPI. request.headers is raw access with no validation — you get the exact header name as-is. Use Header() for declared parameters, request.headers for dynamic or unknown headers.`}
        className="mb-8"
      />

      <AhaMoment
        setup="When would you use request.headers instead of Header()?"
        reveal={`When you don't know the header names in advance. For example, a proxy that forwards all headers, or a logging middleware that captures every header. Header() is great when you know exactly which headers you expect. request.headers is for when you need to inspect headers dynamically — iterate over them, check for unknown ones, or handle headers that don't map to Python variable names.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Header()</p>
              <p className="text-xs text-muted-foreground">Declare typed header parameters with validation and defaults</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Cookie()</p>
              <p className="text-xs text-muted-foreground">Read cookies from requests with the same pattern as headers</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto-Conversion</p>
              <p className="text-xs text-muted-foreground">Python underscores become HTTP hyphens automatically</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">httponly=True</p>
              <p className="text-xs text-muted-foreground">Hides cookie from JavaScript — the #1 defense against XSS token theft</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">secure + samesite</p>
              <p className="text-xs text-muted-foreground">HTTPS-only transport and CSRF protection in two flags</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Storage Matters</p>
              <p className="text-xs text-muted-foreground">HttpOnly cookies &gt; memory &gt; sessionStorage &gt; localStorage for auth tokens</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
