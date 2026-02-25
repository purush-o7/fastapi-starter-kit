"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function MiddlewarePage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Middleware</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Middleware runs on every request before it reaches your endpoint, and on every response before it is sent. Perfect for logging, CORS, timing, and authentication.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Creating Middleware</h2>
          <p className="text-muted-foreground mb-4">Use the @app.middleware decorator to create middleware that wraps every request.</p>
          <CodeBlock code={`import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">CORS Middleware</h2>
          <p className="text-muted-foreground mb-4">FastAPI includes built-in CORS middleware for cross-origin requests.</p>
          <CodeBlock code={`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Class-Based Middleware</h2>
          <p className="text-muted-foreground mb-4">For complex middleware, use the BaseHTTPMiddleware class.</p>
          <CodeBlock code={`from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not request.headers.get("Authorization"):
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated"},
            )
        response = await call_next(request)
        return response

app.add_middleware(AuthMiddleware)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

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
