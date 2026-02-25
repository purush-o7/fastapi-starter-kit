"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function QueryParametersPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Query Parameters</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Query parameters are the key-value pairs after the ? in a URL. FastAPI handles them automatically through function parameters that are not part of the path.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Query Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Any function parameter not declared in the path is automatically treated as a query parameter.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# GET /items?skip=20&limit=50
# → {"skip": 20, "limit": 50}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Optional Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Use Optional or union with None to make query parameters optional.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
async def list_items(
    q: str | None = None,
    category: str = "all",
):
    results = {"category": category}
    if q:
        results["query"] = q
    return results`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Query Validation</h2>
          <p className="text-muted-foreground mb-4">
            Use the Query() function for advanced validation like min/max length, regex patterns, and descriptions.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI, Query
from typing import Annotated

app = FastAPI()

@app.get("/items")
async def list_items(
    q: Annotated[
        str | None,
        Query(
            min_length=3,
            max_length=50,
            pattern="^[a-zA-Z]+$",
            description="Search query string",
        ),
    ] = None,
):
    return {"query": q}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Detection</p>
              <p className="text-xs text-muted-foreground">Non-path function params become query params automatically</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Defaults</p>
              <p className="text-xs text-muted-foreground">Parameters with defaults are optional, without are required</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Annotated Pattern</p>
              <p className="text-xs text-muted-foreground">Use Annotated[type, Query(...)] for validation metadata</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">List Parameters</p>
              <p className="text-xs text-muted-foreground">Accept multiple values with list[str] query params</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
