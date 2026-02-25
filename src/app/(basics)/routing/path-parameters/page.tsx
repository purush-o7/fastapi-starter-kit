"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const TypeValidator = dynamic(
  () => import("../_components/type-validator").then(m => m.TypeValidator),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

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

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You define @app.get("/items/{item_id}") with item_id: int. A user hits /items/abc. Instead of a nice error page, they get a raw 422 JSON dump.`}
        error={`GET /items/abc → 422 Unprocessable Entity

{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "abc"
    }
  ]
}`}
        errorType="422 Validation Error"
        accentColor="teal"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Ever seen a 422 and had no idea why? Here&apos;s the thing: FastAPI didn&apos;t crash. It actually <em>protected</em> you.
          You said <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">item_id: int</code>, and someone
          sent &quot;abc.&quot; FastAPI caught that before your code ever ran. The 422 is a feature, not a bug.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How Path Parameter Validation Works</h2>
          <p className="text-muted-foreground mb-4">
            When a request comes in, FastAPI extracts the dynamic segment from the URL, tries to convert it to
            your declared type, and either hands it to your function or rejects the request. Your code never sees bad data.
          </p>
          <SimpleFlow
            steps={[
              { label: "URL arrives", detail: "/items/abc", status: "neutral" },
              { label: "Extract segment", detail: '"abc"', status: "neutral" },
              { label: "Convert to int", detail: "int('abc') fails!", status: "error" },
              { label: "422 Response", detail: "Request rejected", status: "error" },
            ]}
            accentColor="teal"
            className="mb-4"
          />
          <SimpleFlow
            steps={[
              { label: "URL arrives", detail: "/items/42", status: "neutral" },
              { label: "Extract segment", detail: '"42"', status: "neutral" },
              { label: "Convert to int", detail: "int('42') = 42", status: "success" },
              { label: "Run handler", detail: "read_item(42)", status: "success" },
            ]}
            accentColor="teal"
          />
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Path parameter basics"
        points={[
          "Path parameters are extracted from URL segments and validated automatically",
          "Type hints drive the validation — int rejects non-numeric strings",
          "Your function only runs if all validations pass",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Path Parameters</h2>
          <p className="text-muted-foreground mb-4">
            Declare path parameters using curly braces in the path string. The function parameter name
            must match exactly, and the type hint tells FastAPI how to validate.
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
            You can have as many path parameters as you need. Each one maps to a function parameter by name.
            And you can mix them with query parameters too — FastAPI figures out which is which.
          </p>
          <CodeBlock code={`@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(
    user_id: int,           # ← from path
    item_id: int,           # ← from path
    q: str | None = None,   # ← from query string
    short: bool = False,    # ← from query string
):
    return {"user_id": user_id, "item_id": item_id, "q": q}

# GET /users/5/items/42?q=search
# → {"user_id": 5, "item_id": 42, "q": "search"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Parameter declaration"
        points={[
          "Curly braces in the path string define parameter slots",
          "Function parameter names must match the path parameter names",
          "Path params and query params can coexist in the same function",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Type Validation Beyond int and str</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI doesn&apos;t stop at basic types. UUID, date, and other complex types are validated automatically.
            This means you can reject malformed IDs at the routing level, before your database ever sees them.
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

      <AhaMoment
        setup="Why would you use UUID instead of int for IDs?"
        reveal="Sequential integers leak information — if your user ID is 42, an attacker knows there are at least 41 other users, and can enumerate them. UUIDs are random and non-sequential, making them much harder to guess. Plus, FastAPI validates the UUID format for free."
        className="mb-8"
      />

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

      {/* Go Deeper: Path() validation */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Path() Validation with Annotated</h2>
          <p className="text-muted-foreground mb-4">
            Want to say &quot;item_id must be a positive integer under 10,000&quot;? That&apos;s what
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> Path()</code> is for. Pair it with
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> Annotated</code> for the cleanest syntax.
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
            Sometimes you don&apos;t want any string — you want one of three specific values. Python Enums
            let you lock down the allowed options, and Swagger UI will show a dropdown.
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

      {/* Failure Deep Dive: Route order */}
      <FailureDeepDive
        title="The Route Order Trap"
        scenario={`You define /items/{item_id} before /items/latest. Someone visits /items/latest and gets a 422 error. The "latest" endpoint never runs.`}
        code={`# ❌ Wrong order — "latest" gets captured as item_id
@app.get("/items/{item_id}")    # This catches everything!
async def read_item(item_id: int):
    return {"item_id": item_id}

@app.get("/items/latest")       # Never reached
async def read_latest():
    return {"item": "latest one"}`}
        error={`GET /items/latest → 422 Unprocessable Entity

FastAPI tries to parse "latest" as an integer for item_id.
It fails because "latest" is not a number.
The /items/latest route is never even checked.`}
        explanation={`FastAPI evaluates routes in the order you define them. When /items/{item_id} comes first, it matches ANY path that looks like /items/something — including /items/latest. Since item_id: int can't parse "latest", you get a 422 instead of reaching your actual /items/latest handler.`}
        fix="Put fixed (literal) paths before dynamic (parameterized) paths. FastAPI checks them top to bottom."
        fixCode={`# ✅ Correct order — fixed path first
@app.get("/items/latest")
async def read_latest():
    return {"item": "latest one"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# GET /items/latest → ✓ matches first route
# GET /items/42     → ✓ matches second route`}
        filename="main.py"
        className="mb-8"
      />

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          This is one of the most common FastAPI gotchas. If you ever get a 422 on a route that shouldn&apos;t
          have parameters, check your route order first. Fixed paths always need to come before dynamic ones.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Path Parameters with Slashes</h2>
          <p className="text-muted-foreground mb-4">
            Need to capture a file path like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">home/user/data.csv</code>?
            Normally slashes split the URL into segments. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">:path</code> converter
            tells FastAPI to capture everything, slashes included.
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

      <WhatYouJustLearned
        section="Advanced path parameters"
        points={[
          "Path() adds constraints like ge, le, min_length to path parameters",
          "Enums restrict parameters to a fixed set of allowed values",
          "Route order matters — fixed paths must come before dynamic ones",
          "The :path converter captures values that contain slashes",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question={`You have /items/latest and /items/{item_id}. You defined {item_id} first. What happens when someone visits /items/latest?`}
        options={[
          {
            label: "The /items/latest handler runs correctly",
            correct: false,
            explanation: "It would, but only if /items/latest was defined BEFORE /items/{item_id}. Order matters."
          },
          {
            label: 'FastAPI tries to parse "latest" as item_id',
            correct: true,
            explanation: "Because {item_id} was defined first, it catches all /items/something requests — including /items/latest."
          },
          {
            label: "FastAPI automatically picks the best match",
            correct: false,
            explanation: "FastAPI doesn't do 'best match' — it uses first match. The order you define routes is the order they're checked."
          },
          {
            label: "You get a 404 Not Found",
            correct: false,
            explanation: "The path does match /items/{item_id}. The question is whether 'latest' can be parsed as the expected type."
          },
        ]}
        hint="FastAPI checks routes in definition order, not by specificity."
        answer={`FastAPI tries to parse "latest" as the item_id parameter. If item_id: int, you get a 422 because "latest" isn't an integer. If item_id: str, it matches and your endpoint receives "latest" as the ID. Route order matters — fixed routes must come before dynamic ones.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
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
