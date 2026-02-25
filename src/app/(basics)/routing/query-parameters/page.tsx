"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { QueryBuilder } from "../_components/query-builder";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

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

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You add limit: int as a query parameter. A user forgets to include it: GET /items. Boom — 422. Your endpoint is broken for every user who doesn't know about mandatory query params.`}
        error={`GET /items → 422 Unprocessable Entity

{
  "detail": [
    {
      "type": "missing",
      "loc": ["query", "limit"],
      "msg": "Field required",
      "input": null
    }
  ]
}`}
        errorType="422 Missing Field"
        accentColor="teal"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Why should a simple list endpoint require the caller to know about a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">limit</code> parameter?
          The answer: it shouldn&apos;t. The fix is a single <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">= 10</code> after the parameter declaration.
          That tiny default value is the difference between a friendly API and a frustrating one.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How FastAPI Decides: Required vs. Optional</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI looks at one thing to decide if a query parameter is required: does it have a default value?
          </p>
          <SimpleFlow
            steps={[
              { label: "Parameter declared", detail: "limit: int", status: "neutral" },
              { label: "Has default?", detail: "No default value", status: "error" },
              { label: "REQUIRED", detail: "422 if missing", status: "error" },
            ]}
            accentColor="teal"
            className="mb-4"
          />
          <SimpleFlow
            steps={[
              { label: "Parameter declared", detail: "limit: int = 10", status: "neutral" },
              { label: "Has default?", detail: "Default is 10", status: "success" },
              { label: "OPTIONAL", detail: "Uses 10 if missing", status: "success" },
            ]}
            accentColor="teal"
          />
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Required vs optional"
        points={[
          "No default value = required query parameter (422 if missing)",
          "With a default value = optional (uses the default if not provided)",
          "This one rule prevents most query parameter 422 errors",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Query Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Any function parameter that&apos;s not in the path string becomes a query parameter automatically.
            You don&apos;t need to declare it anywhere special — FastAPI just knows.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# GET /items              → {"skip": 0, "limit": 10}  (defaults)
# GET /items?skip=20      → {"skip": 20, "limit": 10}
# GET /items?skip=20&limit=50 → {"skip": 20, "limit": 50}`} filename="main.py" />
          <p className="text-sm text-muted-foreground mt-3">
            Both <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">skip</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">limit</code> have
            defaults, so calling <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">GET /items</code> with no params works perfectly.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Required vs Optional — In Practice</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s how the three flavors of query parameters look in real code. The search query is
            required (no default), while category and language are optional.
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

      <AhaMoment
        setup={`What's the difference between category: str = "all" and lang: str | None = None?`}
        reveal={`Both are optional, but they behave differently in your code. category always has a string value — either the user's input or "all". lang might be None, so you need to handle that case (if lang: ...). Use a string default when there's a sensible fallback. Use None when "not provided" is a meaningful state.`}
        className="mb-8"
      />

      <WhatYouJustLearned
        section="Query parameter patterns"
        points={[
          "Non-path function parameters automatically become query params",
          "Required params (no default) return 422 when missing",
          "str = 'default' always gives you a string; str | None = None might give you None",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Adding Validation with Query()</h2>
          <p className="text-muted-foreground mb-4">
            Defaults are great, but what if you need to say &quot;the search query must be at least 3 characters
            and no more than 50&quot;? That&apos;s where <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Query()</code> comes in.
            Pair it with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Annotated</code> for clean, readable code.
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
            Want to accept multiple tags in a single request? Just type your parameter as a list.
            The client repeats the key in the URL, and FastAPI collects them all.
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

      <WhatYouJustLearned
        section="Query validation"
        points={[
          "Query() adds min/max length, regex patterns, and numeric constraints",
          "Annotated[type, Query(...)] is the modern, recommended syntax",
          "list[str] collects repeated keys into a Python list",
        ]}
        className="mb-8"
      />

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

      {/* Go Deeper */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Alias & Deprecated Params</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes your URL needs a param name that isn&apos;t a valid Python variable (like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">item-query</code>).
            And sometimes you need to keep an old parameter working while nudging users to the new one.
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
          <ConversationalCallout type="insight" className="mb-4">
            <p>
              FastAPI is surprisingly flexible with booleans. &quot;true&quot;, &quot;1&quot;, &quot;yes&quot;, &quot;on&quot; — they all
              become <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">True</code>. This means your users
              don&apos;t have to remember the exact format.
            </p>
          </ConversationalCallout>
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

      <AhaMoment
        setup="Why does FastAPI accept 'yes', 'on', and '1' as True?"
        reveal={`Because APIs have many consumers — web forms, CLI tools, other services — and they all have different conventions. By accepting multiple truthy values, FastAPI makes your API more forgiving to work with. Less friction for your callers, fewer support tickets for you.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question={`What's the difference between limit: int = 10 and limit: int | None = None as query parameter declarations?`}
        options={[
          {
            label: "They're the same — both make the parameter optional",
            correct: false,
            explanation: "Both are optional, yes, but the default values and types are completely different."
          },
          {
            label: "The first always gives you an int, the second might give you None",
            correct: true,
            explanation: "Exactly! With = 10, your code always gets an integer. With = None, you need to check for None before using it."
          },
          {
            label: "The first is required, the second is optional",
            correct: false,
            explanation: "Both have defaults, so both are optional. The difference is what that default is."
          },
          {
            label: "The | None version is the only correct way to make params optional",
            correct: false,
            explanation: "Both are valid. The choice depends on whether 'not provided' should mean 'use a default value' or 'nothing was given'."
          },
        ]}
        hint="Think about what value your code receives when the parameter is missing from the URL."
        answer={`limit: int = 10 means "if they don't provide it, use 10" — the parameter is always an int. limit: int | None = None means "if they don't provide it, it's None" — you need to handle the None case in your code. The first is a default value. The second is an optional parameter.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
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
