"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { ResponseFilterSim } from "../_components/response-filter-sim";

export default function ResponseModelPage() {
  return (
    <div className="max-w-4xl ambient-data">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Response Model</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Response models control what data your API returns. They filter out sensitive fields, validate output, and generate accurate OpenAPI documentation.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Response Model</h2>
          <p className="text-muted-foreground mb-4">
            Use the response_model parameter to declare the shape of your API response. Fields not in the model are automatically excluded.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI
from pydantic import BaseModel

class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    username: str
    email: str

app = FastAPI()

@app.post("/users", response_model=UserOut)
async def create_user(user: UserIn):
    # password is automatically filtered from response
    return user`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See the Filter in Action</h2>
          <p className="text-muted-foreground mb-4">Watch how response_model strips sensitive fields from your API response. Raw data goes in, only safe fields come out.</p>
          <ResponseFilterSim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Response Model Exclude</h2>
          <p className="text-muted-foreground mb-4">
            Fine-tune which fields to include or exclude from the response.
          </p>
          <CodeBlock
            code={`@app.get(
    "/items/{item_id}",
    response_model=Item,
    response_model_exclude_unset=True,
)
async def read_item(item_id: int):
    # Only returns fields that were explicitly set
    return items[item_id]

@app.get(
    "/items/{item_id}/public",
    response_model=Item,
    response_model_exclude={"internal_notes", "cost_price"},
)
async def read_item_public(item_id: int):
    return items[item_id]`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Return Type Annotation</h2>
          <p className="text-muted-foreground mb-4">
            In modern FastAPI, you can use the return type annotation instead of response_model.
          </p>
          <CodeBlock
            code={`@app.get("/users/{user_id}")
async def read_user(user_id: int) -> UserOut:
    user = get_user(user_id)
    return user

# Equivalent to:
# @app.get("/users/{user_id}", response_model=UserOut)`}
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
              <p className="text-sm font-medium mb-1">Data Filtering</p>
              <p className="text-xs text-muted-foreground">response_model automatically strips fields not in the model</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Security</p>
              <p className="text-xs text-muted-foreground">Prevent leaking passwords, internal IDs, and sensitive data</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Return Type</p>
              <p className="text-xs text-muted-foreground">Modern FastAPI supports {'->'} ReturnType as response_model</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Exclude Options</p>
              <p className="text-xs text-muted-foreground">Fine-tune with exclude_unset, exclude_defaults, exclude</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
