"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { RequestBodySim } from "../_components/request-body-sim";

export default function RequestBodyPage() {
  return (
    <div className="max-w-4xl ambient-data">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Request Body</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Request bodies let clients send JSON data to your API. FastAPI uses Pydantic models to automatically parse, validate, and document the expected shape.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Declaring a Request Body</h2>
          <p className="text-muted-foreground mb-4">
            Create a Pydantic model and use it as a function parameter type. FastAPI will read the JSON body and validate it against the model.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    description: str | None = None
    tax: float | None = None

app = FastAPI()

@app.post("/items")
async def create_item(item: Item):
    total = item.price + (item.tax or 0)
    return {**item.model_dump(), "total": total}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Watch Validation Happen</h2>
          <p className="text-muted-foreground mb-4">See how FastAPI validates incoming JSON against your Pydantic model — valid data gets parsed, bad data returns 422 errors.</p>
          <RequestBodySim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Body + Path + Query</h2>
          <p className="text-muted-foreground mb-4">
            You can combine request body parameters with path and query parameters in the same function.
          </p>
          <CodeBlock
            code={`@app.put("/items/{item_id}")
async def update_item(
    item_id: int,           # Path parameter
    item: Item,             # Request body
    q: str | None = None,   # Query parameter
):
    result = {"item_id": item_id, **item.model_dump()}
    if q:
        result["q"] = q
    return result`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Multiple Body Parameters</h2>
          <p className="text-muted-foreground mb-4">
            When you need multiple body parameters, FastAPI expects a nested JSON object with keys matching the parameter names.
          </p>
          <CodeBlock
            code={`class Item(BaseModel):
    name: str
    price: float

class User(BaseModel):
    username: str
    email: str

@app.post("/orders")
async def create_order(item: Item, user: User):
    return {"item": item, "user": user}

# Expected body:
# {
#   "item": {"name": "Foo", "price": 42.0},
#   "user": {"username": "john", "email": "john@example.com"}
# }`}
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
              <p className="text-sm font-medium mb-1">Pydantic Models</p>
              <p className="text-xs text-muted-foreground">Define request body shape using BaseModel subclasses</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Validation</p>
              <p className="text-xs text-muted-foreground">Invalid data returns 422 with detailed error messages</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Mixed Parameters</p>
              <p className="text-xs text-muted-foreground">Combine body, path, and query params in one function</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">OpenAPI Docs</p>
              <p className="text-xs text-muted-foreground">Body schema appears automatically in Swagger UI</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
