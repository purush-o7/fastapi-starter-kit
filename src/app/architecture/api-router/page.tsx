"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const RouterAssembly = dynamic(
  () => import("../_components/router-assembly").then(m => m.RouterAssembly),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function ApiRouterPage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">APIRouter</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          APIRouter lets you split your endpoints into separate modules. Think of it as a mini FastAPI app that gets mounted on the main app.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario="Your main.py has 47 endpoints. You need to add rate limiting to all admin routes. That means finding every admin endpoint scattered across 1500 lines and wrapping each one individually. There has to be a better way."
        error={`# main.py — 1,500 lines and growing...\n\n@app.get("/admin/users")      # line 234\n@app.get("/admin/settings")   # line 567\n@app.post("/admin/ban")       # line 891\n@app.get("/items")            # line 1023\n@app.post("/items")           # line 1156\n# ... 42 more endpoints ...\n\n# "Wait, which ones are admin routes again?"`}
        errorType="Maintenance Nightmare"
        accentColor="purple"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>What if you could group all your admin routes in one file, slap a single prefix and auth dependency on them, and include them in your main app with one line? That&apos;s exactly what APIRouter does.</p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Big Picture</h2>
          <p className="text-muted-foreground mb-4">
            Instead of one massive file, you split your API into focused modules. Each module owns its routes, its prefix, and its dependencies. Then your main app just assembles the pieces.
          </p>
          <SimpleFlow
            steps={[
              { label: "items.py", detail: "/items/*", status: "neutral" },
              { label: "users.py", detail: "/users/*", status: "neutral" },
              { label: "admin.py", detail: "/admin/*", status: "neutral" },
              { label: "main.py", detail: "Assembles all routers", status: "success" },
            ]}
            accentColor="purple"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      {/* 4. First checkpoint */}
      <WhatYouJustLearned
        section="The Problem"
        points={[
          "A single file with dozens of endpoints becomes impossible to navigate",
          "Applying shared logic (auth, rate limiting) requires touching every endpoint",
          "APIRouter lets you group related endpoints into separate modules",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Creating a Router — conversational walkthrough */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Creating a Router</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the key insight: a router works exactly like a mini FastAPI app. You define endpoints on it the same way you would on <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">app</code> — with decorators like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@router.get()</code>.
          </p>
          <CodeBlock code={`# routers/items.py
from fastapi import APIRouter

# Create a router — it's like a mini FastAPI app
router = APIRouter(
    prefix="/items",    # All routes here start with /items
    tags=["items"],     # Groups them in the docs
)

@router.get("/")
async def list_items():
    # This becomes GET /items/
    return [{"name": "Foo"}, {"name": "Bar"}]

@router.get("/{item_id}")
async def get_item(item_id: int):
    # This becomes GET /items/{item_id}
    return {"item_id": item_id}`} filename="routers/items.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>Notice how the router defines <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">prefix=&quot;/items&quot;</code> once, and every route automatically gets that prefix. No more repeating <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/items</code> in every decorator.</p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 6. Including Routers */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Including Routers</h2>
          <p className="text-muted-foreground mb-4">
            Your <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">main.py</code> stays clean. It just mounts the routers — one line each.
          </p>
          <CodeBlock code={`# main.py
from fastapi import FastAPI
from routers import items, users

app = FastAPI()

# One line per module — that's it
app.include_router(items.router)
app.include_router(users.router)

# items endpoints: /items/, /items/{item_id}
# users endpoints: /users/, /users/{user_id}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Router Basics"
        points={[
          "APIRouter works just like a mini FastAPI app — same decorators, same patterns",
          "prefix sets the URL prefix for all routes in the router",
          "include_router() mounts a router onto your main app with one line",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Interactive Visualization — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It Assemble</h2>
          <p className="text-muted-foreground mb-4">Watch routers mount onto the app and see how prefixes resolve into final URLs.</p>
          <RouterAssembly />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 8. Router-Level Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Router-Level Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Remember that 1,500-line nightmare from the top of this page? Here&apos;s how you&apos;d actually solve it. Instead of adding <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Depends(verify_admin_token)</code> to every single admin endpoint, you set it once on the router.
          </p>
          <CodeBlock code={`from fastapi import APIRouter, Depends

# Every endpoint in this router gets auth automatically
router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_admin_token)],  # Applied to ALL routes
)

@router.get("/stats")
async def admin_stats():
    # verify_admin_token runs automatically — you didn't have to add it
    return {"users": 100}

@router.get("/settings")
async def admin_settings():
    # Same here — auth is handled by the router
    return {"theme": "dark"}

@router.post("/ban/{user_id}")
async def ban_user(user_id: int):
    # And here too. One dependency, every route protected.
    return {"banned": user_id}`} filename="routers/admin.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why would you put dependencies on the router instead of each endpoint?"
        reveal="Because it changes how you think about security. Instead of 'did I remember to add auth to every endpoint?', it becomes 'everything in admin.py is protected by default.' You'd have to explicitly opt OUT of security rather than remember to opt IN. That's a much safer default."
        className="mb-8"
      />

      {/* 9. Go Deeper — Nested Routers */}
      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Nested Routers</h2>
          <p className="text-muted-foreground mb-4">
            Routers can include other routers. This lets you build a hierarchy — your main app includes a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">v1</code> router, which includes <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">items</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">users</code> routers underneath it.
          </p>
          <CodeBlock code={`# routers/v1/__init__.py
from fastapi import APIRouter
from .items import router as items_router
from .users import router as users_router

router = APIRouter(prefix="/v1")
router.include_router(items_router)   # /v1/items/...
router.include_router(users_router)   # /v1/users/...

# main.py
app.include_router(v1_router)
# All routes now start with /v1/`} filename="routers/v1/__init__.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>Don&apos;t go overboard with nesting. Two levels deep (like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/v1/items</code>) is usually the sweet spot. Three or more levels and you&apos;ll start losing track of where routes actually resolve to.</p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="Advanced Routing"
        points={[
          "Router-level dependencies apply auth/logic to ALL routes in the router",
          "Routers can include other routers for hierarchical URL structures",
          "This pattern makes security opt-out instead of opt-in — much safer",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Failure Deep Dive */}
      <FailureDeepDive
        title="Silent Route Shadowing"
        scenario="You add a new router for v2 items but forget to give it a unique prefix. Your v2 endpoints never get called — they're silently shadowed by v1."
        code={`# routers/items_v1.py
router = APIRouter(tags=["items-v1"])

@router.get("/items")
async def list_items_v1():
    return {"version": 1, "items": [...]}

# routers/items_v2.py
router = APIRouter(tags=["items-v2"])

@router.get("/items")  # Same path as v1!
async def list_items_v2():
    return {"version": 2, "items": [...]}

# main.py
app.include_router(items_v1.router)  # Registered first
app.include_router(items_v2.router)  # Registered second — never reached`}
        error={`GET /items → {"version": 1, "items": [...]}\n\n# v2 is NEVER called. No error, no warning.\n# FastAPI matches the first registered route.\n# The second /items endpoint is invisible.`}
        explanation="FastAPI matches routes in registration order. When two routes have the same path, the first one wins silently. There's no error or warning — the second route just becomes unreachable. This is a subtle bug that can go unnoticed for weeks."
        fix="Always use unique prefixes for your routers. If you're versioning your API, put the version in the prefix."
        fixCode={`# routers/items_v1.py
router = APIRouter(prefix="/v1", tags=["items-v1"])

@router.get("/items")
async def list_items_v1():
    return {"version": 1, "items": [...]}

# routers/items_v2.py
router = APIRouter(prefix="/v2", tags=["items-v2"])

@router.get("/items")
async def list_items_v2():
    return {"version": 2, "items": [...]}

# Now: GET /v1/items → v1, GET /v2/items → v2`}
        filename="main.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If two routers both define @router.get('/items') and you include both without prefixes, what happens?"
        options={[
          {
            label: "FastAPI raises an error at startup",
            correct: false,
            explanation: "FastAPI doesn't check for duplicate routes at startup — it silently registers both.",
          },
          {
            label: "Both handlers run and their responses are merged",
            correct: false,
            explanation: "Only one handler runs per request. FastAPI doesn't merge responses.",
          },
          {
            label: "The first registered router's handler wins silently",
            correct: true,
            explanation: "Exactly right. FastAPI matches routes in registration order. The second endpoint is unreachable.",
          },
          {
            label: "The last registered router's handler wins",
            correct: false,
            explanation: "It's actually first-registered-wins, not last. This is the opposite of how middleware ordering works, which makes it easy to confuse.",
          },
        ]}
        hint="Think about the order you call app.include_router()."
        answer="The first router's handler wins. FastAPI matches routes in the order they're registered. The second /items endpoint becomes unreachable — a silent bug. Always use unique prefixes like /v1/items and /v2/items, or /users/items and /admin/items."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="APIRouter seems like just a way to organize files. Is there more to it?"
        reveal="APIRouter isn't just about file organization — it's about ownership boundaries. When your items team owns items.py and your admin team owns admin.py, each team can add routes, dependencies, and middleware without merge conflicts. It turns your monolith API into something that scales with your team, not just your codebase."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Modular Organization</p>
              <p className="text-xs text-muted-foreground">Split endpoints into separate files by domain</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Prefix & Tags</p>
              <p className="text-xs text-muted-foreground">Set URL prefix and OpenAPI tags at the router level</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Shared Dependencies</p>
              <p className="text-xs text-muted-foreground">Apply auth and other checks to all routes in a router</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Nested Routers</p>
              <p className="text-xs text-muted-foreground">Routers can include other routers for deep nesting</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
