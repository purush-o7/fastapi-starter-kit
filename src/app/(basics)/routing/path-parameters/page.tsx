"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { TypeValidator } from "../_components/type-validator";

export default function PathParametersPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Path Parameters</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Path parameters let you capture dynamic values from URL segments. FastAPI validates and converts them automatically using Python type hints.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Path Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Declare path parameters using curly braces in the path string and matching function parameters with type hints.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# GET /items/42  → {"item_id": 42}     ✓ valid int
# GET /items/foo → 422 Validation Error  ✗ not an int`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Multiple Path Parameters</h2>
          <p className="text-muted-foreground mb-4">
            An endpoint can have multiple path parameters. Each one maps to a function parameter by name.
          </p>
          <CodeBlock code={`@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(user_id: int, item_id: int):
    return {"user_id": user_id, "item_id": item_id}

# GET /users/5/items/42
# → {"user_id": 5, "item_id": 42}

# Combine with query params too:
@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(
    user_id: int,           # ← from path
    item_id: int,           # ← from path
    q: str | None = None,   # ← from query string
    short: bool = False,    # ← from query string
):
    return {"user_id": user_id, "item_id": item_id, "q": q}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Type Validation</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI supports many types beyond int and str. UUID, datetime, and more are validated automatically.
          </p>
          <CodeBlock code={`from uuid import UUID
from datetime import date

@app.get("/users/{user_id}")
async def read_user(user_id: UUID):
    return {"user_id": user_id}
# GET /users/550e8400-e29b-41d4-a716-446655440000 → ✓
# GET /users/not-a-uuid → 422 Validation Error

@app.get("/reports/{report_date}")
async def read_report(report_date: date):
    return {"date": report_date}
# GET /reports/2024-01-15 → ✓
# GET /reports/yesterday → 422 Validation Error`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: Type Validator */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Type Validation</h2>
          <p className="text-muted-foreground mb-4">
            Type a value and pick a type to see if FastAPI would accept it or return a 422 validation error.
          </p>
          <TypeValidator />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Path() Validation with Annotated</h2>
          <p className="text-muted-foreground mb-4">
            Like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Query()</code> for query params, <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Path()</code> adds validation and metadata to path parameters. Use with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Annotated</code> for the cleanest syntax.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Path
from typing import Annotated

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(
    item_id: Annotated[int, Path(
        title="Item ID",
        description="The unique identifier for the item",
        ge=1,          # greater than or equal to 1
        le=10000,      # less than or equal to 10000
    )],
):
    return {"item_id": item_id}

# GET /items/0     → 422 (ge=1 violated)
# GET /items/5     → ✓
# GET /items/99999 → 422 (le=10000 violated)

# Path + Query together with Annotated:
@app.get("/items/{item_id}")
async def read_item(
    item_id: Annotated[int, Path(ge=1)],
    q: Annotated[str | None, Query(max_length=50)] = None,
):
    return {"item_id": item_id, "q": q}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Enum Path Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Use Python Enum classes to restrict path parameters to a fixed set of values.
          </p>
          <CodeBlock code={`from enum import Enum
from fastapi import FastAPI

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

app = FastAPI()

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model": model_name, "message": "Deep Learning FTW!"}
    return {"model": model_name}

# GET /models/alexnet → ✓
# GET /models/vgg     → 422 (not in enum)
# Swagger UI shows a dropdown with the valid options`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Path Parameters with Paths</h2>
          <p className="text-muted-foreground mb-4">
            Use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">:path</code> converter to capture values containing forward slashes — useful for file paths.
          </p>
          <CodeBlock code={`@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}

# GET /files/home/user/data.csv
# → {"file_path": "home/user/data.csv"}

# Without :path, slashes would be treated as URL separators
# and you'd get a 404`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Order Matters</h2>
          <p className="text-muted-foreground mb-4">
            Fixed paths must be declared before parameterized paths, or FastAPI will match the parameter first.
          </p>
          <CodeBlock code={`# ✅ Correct order — fixed path first
@app.get("/items/latest")
async def read_latest():
    return {"item": "latest one"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# ❌ Wrong order — "latest" gets captured as item_id
@app.get("/items/{item_id}")    # This catches everything!
async def read_item(item_id: int):
    return {"item_id": item_id}

@app.get("/items/latest")       # Never reached
async def read_latest():
    return {"item": "latest one"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Validation</p>
              <p className="text-xs text-muted-foreground">Type hints drive automatic validation — int, str, UUID, date</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Path()</p>
              <p className="text-xs text-muted-foreground">Add ge, le, title, description for richer validation</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Annotated</p>
              <p className="text-xs text-muted-foreground">Annotated[int, Path(ge=1)] — the recommended pattern</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Enum Constraints</p>
              <p className="text-xs text-muted-foreground">Python Enums restrict to predefined values with dropdown in docs</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Order Matters</p>
              <p className="text-xs text-muted-foreground">Fixed paths (/items/latest) before dynamic (/items/&#123;id&#125;)</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">:path Converter</p>
              <p className="text-xs text-muted-foreground">Capture values with slashes using &#123;file_path:path&#125;</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
