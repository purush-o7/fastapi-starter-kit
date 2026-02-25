"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { StorageComparison } from "../_components/storage-comparison";

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Reading Request Headers</h2>
          <p className="text-muted-foreground mb-4">Declare a parameter with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Header()</code> as its default to extract values from request headers.</p>
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
          <h2 className="text-2xl font-semibold mb-4">Auto-Conversion of Header Names</h2>
          <p className="text-muted-foreground mb-4">
            HTTP headers use hyphens (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">X-Token</code>), but Python variables can&apos;t have hyphens. FastAPI automatically converts underscores to hyphens, so <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">x_token</code> maps to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">X-Token</code> header.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Header

app = FastAPI()

# x_custom_header → X-Custom-Header
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

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Cookie Parameters</h2>
          <p className="text-muted-foreground mb-4">Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Cookie()</code> to read cookies from incoming requests — same pattern as Header().</p>
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
          <p className="text-muted-foreground mb-4">Inject the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Response</code> object to set custom headers on outgoing responses.</p>
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

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Setting Cookies on Responses</h2>
          <p className="text-muted-foreground mb-4">Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">response.set_cookie()</code> to set cookies that the browser will send back on future requests.</p>
          <CodeBlock code={`from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/login")
async def login(response: Response):
    # Set a session cookie
    response.set_cookie(
        key="session_id",
        value="abc123",
        httponly=True,       # Not accessible via JavaScript
        secure=True,         # Only sent over HTTPS
        samesite="lax",      # CSRF protection
        max_age=3600,        # Expires in 1 hour
    )
    return {"message": "Logged in"}

@app.post("/logout")
async def logout(response: Response):
    # Delete a cookie by setting max_age=0
    response.delete_cookie(key="session_id")
    return {"message": "Logged out"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Cookie Security Flags */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Cookie Security Flags Explained</h2>
          <p className="text-muted-foreground mb-4">
            Each flag in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">set_cookie()</code> controls a different attack surface. Understanding what each does is critical for secure auth.
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

      <Separator className="my-8" />

      {/* Storage Comparison */}
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
