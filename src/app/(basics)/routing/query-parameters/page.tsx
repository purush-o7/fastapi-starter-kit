"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { QueryBuilder } from "../_components/query-builder";

export default function QueryParametersPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Query Parameters</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Query parameters are the key-value pairs after the ? in a URL. FastAPI handles them automatically through function parameters that are not part of the path.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Query Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Any function parameter not declared in the path is automatically treated as a query parameter.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# GET /items              → {"skip": 0, "limit": 10}  (defaults)
# GET /items?skip=20      → {"skip": 20, "limit": 10}
# GET /items?skip=20&limit=50 → {"skip": 20, "limit": 50}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Required vs Optional</h2>
          <p className="text-muted-foreground mb-4">
            Parameters with a default value are optional. Parameters without a default are required — FastAPI returns 422 if they&apos;re missing.
          </p>
          <CodeBlock code={`@app.get("/search")
async def search(
    q: str,                         # Required — no default
    category: str = "all",          # Optional — has default
    lang: str | None = None,        # Optional — explicit None
):
    return {"q": q, "category": category, "lang": lang}

# GET /search?q=fastapi           → ✓ (category="all", lang=None)
# GET /search                     → 422 "q is required"
# GET /search?q=fastapi&lang=en   → ✓`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Query() Validation with Annotated</h2>
          <p className="text-muted-foreground mb-4">
            Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Query()</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Annotated</code> to add validation constraints, descriptions, and examples to your query parameters.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Query
from typing import Annotated

app = FastAPI()

@app.get("/items")
async def list_items(
    q: Annotated[
        str | None,
        Query(
            min_length=3,
            max_length=50,
            pattern="^[a-zA-Z0-9 ]+$",
            title="Search Query",
            description="Search for items by name",
            examples=["fastapi", "python web"],
        ),
    ] = None,
    skip: Annotated[int, Query(ge=0, description="Items to skip")] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return {"q": q, "skip": skip, "limit": limit}

# GET /items?q=ab           → 422 (min_length=3 violated)
# GET /items?q=fastapi      → ✓
# GET /items?limit=200      → 422 (le=100 violated)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">List Query Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Accept multiple values for the same parameter by typing it as a list. The client repeats the key in the URL.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Query
from typing import Annotated

app = FastAPI()

@app.get("/items")
async def filter_items(
    tag: Annotated[list[str], Query()] = [],
):
    return {"tags": tag}

# GET /items?tag=python&tag=fastapi&tag=async
# → {"tags": ["python", "fastapi", "async"]}

# With validation:
@app.get("/search")
async def search(
    category: Annotated[
        list[str],
        Query(min_length=1, description="Filter categories"),
    ] = ["general"],
):
    return {"categories": category}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: Query Builder */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Query String Builder</h2>
          <p className="text-muted-foreground mb-4">
            Add, remove, and edit query parameters to see how the URL builds up and what FastAPI receives. Try repeating a key to see list detection.
          </p>
          <QueryBuilder />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Alias & Deprecated Params</h2>
          <p className="text-muted-foreground mb-4">
            Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">alias</code> when the query param name isn&apos;t a valid Python variable. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">deprecated</code> to mark params that will be removed.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Query
from typing import Annotated

app = FastAPI()

@app.get("/items")
async def list_items(
    # URL uses "item-query" but Python uses "item_query"
    item_query: Annotated[
        str | None,
        Query(alias="item-query"),
    ] = None,
    # Marked deprecated — shows warning in docs
    old_filter: Annotated[
        str | None,
        Query(
            deprecated=True,
            description="Use 'q' instead. Will be removed in v2.",
        ),
    ] = None,
):
    return {"q": item_query}

# GET /items?item-query=phone → item_query = "phone"
# The deprecated param still works but shows a warning in /docs`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Boolean Query Parameters</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI automatically converts various string values to boolean — &quot;true&quot;, &quot;1&quot;, &quot;yes&quot;, &quot;on&quot; all become <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">True</code>.
          </p>
          <CodeBlock code={`@app.get("/items")
async def list_items(
    short: bool = False,
    include_deleted: bool = False,
):
    return {"short": short, "include_deleted": include_deleted}

# All of these set short=True:
# GET /items?short=true
# GET /items?short=1
# GET /items?short=yes
# GET /items?short=on
# GET /items?short=True`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Detection</p>
              <p className="text-xs text-muted-foreground">Non-path function params become query params automatically</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Required vs Optional</p>
              <p className="text-xs text-muted-foreground">No default = required (422 if missing). Default = optional.</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Annotated + Query()</p>
              <p className="text-xs text-muted-foreground">Add min/max length, pattern, ge/le, title, description</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">List Parameters</p>
              <p className="text-xs text-muted-foreground">list[str] collects repeated keys: ?tag=a&amp;tag=b → [&quot;a&quot;, &quot;b&quot;]</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Alias</p>
              <p className="text-xs text-muted-foreground">Map URL param names to valid Python variables</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Deprecated</p>
              <p className="text-xs text-muted-foreground">Mark params for removal — still works but warns in docs</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
