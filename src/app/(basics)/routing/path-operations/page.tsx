"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { ParamAnatomy } from "../_components/param-anatomy";
import { HttpMethodExplorer } from "../_components/http-method-explorer";

export default function PathOperationsPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Path Operations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Path operations are the core building blocks of FastAPI. Each one maps an HTTP method and URL path to a Python function.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is a Path Operation?</h2>
          <p className="text-muted-foreground mb-4">
            In FastAPI, a &quot;path operation&quot; is a combination of an HTTP method (GET, POST, PUT, DELETE) and a URL path. You create them using decorator syntax on your FastAPI app instance.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/items")
async def create_item():
    return {"item": "created"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: HTTP Methods */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Explore: HTTP Methods</h2>
          <p className="text-muted-foreground mb-4">
            Each HTTP method has a specific purpose. Explore what each does, whether it&apos;s idempotent, and see example requests and responses.
          </p>
          <HttpMethodExplorer />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">HTTP Methods — Code</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI provides decorators for all standard HTTP methods. Each maps to a specific CRUD operation.
          </p>
          <CodeBlock code={`@app.get("/items")        # Read (list)
async def list_items():
    return []

@app.post("/items")       # Create
async def create_item():
    return {"created": True}

@app.put("/items/{id}")   # Update (full replacement)
async def update_item(id: int):
    return {"updated": id}

@app.patch("/items/{id}") # Update (partial)
async def patch_item(id: int):
    return {"patched": id}

@app.delete("/items/{id}") # Delete
async def delete_item(id: int):
    return {"deleted": id}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Tags, Summary & Description</h2>
          <p className="text-muted-foreground mb-4">
            Add metadata to your operations for better auto-generated documentation. Tags group related endpoints in Swagger UI.
          </p>
          <CodeBlock code={`@app.get(
    "/items",
    tags=["items"],
    summary="List all items",
    description="Returns a paginated list of items with optional filtering.",
    response_description="A list of Item objects",
)
async def list_items(skip: int = 0, limit: int = 10):
    return items[skip : skip + limit]

@app.post(
    "/items",
    tags=["items"],
    summary="Create an item",
    status_code=201,
    deprecated=False,  # Set True to mark as deprecated in docs
)
async def create_item(item: Item):
    return item`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Response Status Codes</h2>
          <p className="text-muted-foreground mb-4">
            Set the default status code for each operation. Use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">status</code> module for readable constants.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    return None  # 204 = no response body

# Common status codes:
# 200 OK           → default for GET
# 201 Created      → after POST
# 204 No Content   → after DELETE
# 404 Not Found    → raise HTTPException
# 422 Unprocessable → validation error (automatic)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Combining Path + Query + Body</h2>
          <p className="text-muted-foreground mb-4">
            A single endpoint can receive data from the URL path, query string, and request body simultaneously. FastAPI figures out where each parameter comes from based on simple rules.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Annotated

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.put("/items/{item_id}")
async def update_item(
    item_id: int,                                      # path param (in URL)
    q: Annotated[str | None, Query(max_length=50)] = None,  # query param (after ?)
    item: Item = None,                                 # body (JSON)
):
    result = {"item_id": item_id}
    if q:
        result["query"] = q
    if item:
        result["item"] = item.model_dump()
    return result

# PUT /items/42?q=search
# Body: {"name": "Widget", "price": 9.99}

# FastAPI's rule:
# → In the path string?  → path parameter
# → Scalar type (int, str, bool)?  → query parameter
# → Pydantic model?  → request body`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: Parameter Anatomy */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It: Parameter Anatomy</h2>
          <p className="text-muted-foreground mb-4">
            Explore how FastAPI extracts path params, query params, and body from a single request.
          </p>
          <ParamAnatomy />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Decorator Pattern</p>
              <p className="text-xs text-muted-foreground">@app.get(), @app.post() etc. map HTTP methods to functions</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Documentation</p>
              <p className="text-xs text-muted-foreground">Every operation auto-appears in /docs with tags and descriptions</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Status Codes</p>
              <p className="text-xs text-muted-foreground">Set defaults with status_code — 201 for create, 204 for delete</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Parameter Rules</p>
              <p className="text-xs text-muted-foreground">In path → path param, scalar → query, Pydantic model → body</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Tags</p>
              <p className="text-xs text-muted-foreground">Group endpoints in Swagger UI with tags=["category"]</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Async Support</p>
              <p className="text-xs text-muted-foreground">async def for I/O-bound, def for CPU-bound — both work</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
