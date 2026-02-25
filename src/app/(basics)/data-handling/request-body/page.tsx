"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { RequestBodySim } from "../_components/request-body-sim";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";

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

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`Your mobile app sends a POST to create a user. The JSON has {"name": "Alice", "age": "twenty-five"}. FastAPI rejects it. The mobile developer says "It works in Postman!" — what's different?`}
        error={`POST /users
Content-Type: application/json
{"name": "Alice", "age": "twenty-five"}

→ 422 Unprocessable Entity
{
  "detail": [{"type": "int_parsing", "loc": ["body", "age"], "msg": "Input should be a valid integer"}]
}`}
        errorType="422 Validation Error"
        accentColor="blue"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          &quot;It works in Postman&quot; is the classic debugging red herring. Postman might be sending <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&quot;25&quot;</code> (a string
          that Pydantic coerces to an int), while the mobile app sends <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&quot;twenty-five&quot;</code> (which can&apos;t be coerced).
          FastAPI isn&apos;t being picky — it&apos;s catching data that would crash your database insert later.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How Request Body Validation Works</h2>
          <p className="text-muted-foreground mb-4">
            When JSON arrives, FastAPI reads it, tries to fit it into your Pydantic model, and either gives you
            a validated Python object or returns a detailed 422 error. Your code never touches invalid data.
          </p>
          <SimpleFlow
            steps={[
              { label: "JSON arrives", detail: '{"name": "Alice", "age": "twenty-five"}', status: "neutral" },
              { label: "Parse JSON", detail: "Valid JSON syntax? Yes", status: "success" },
              { label: "Validate model", detail: '"twenty-five" → int? Fails!', status: "error" },
              { label: "422 Response", detail: "Detailed error returned", status: "error" },
            ]}
            accentColor="blue"
            className="mb-4"
          />
          <SimpleFlow
            steps={[
              { label: "JSON arrives", detail: '{"name": "Alice", "age": 25}', status: "neutral" },
              { label: "Parse JSON", detail: "Valid JSON syntax? Yes", status: "success" },
              { label: "Validate model", detail: "All fields valid", status: "success" },
              { label: "Run handler", detail: "create_user(user)", status: "success" },
            ]}
            accentColor="blue"
          />
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Request body basics"
        points={[
          "FastAPI reads JSON and validates it against your Pydantic model before your code runs",
          "Invalid data returns a 422 with a detailed error — never reaches your function",
          "Pydantic can coerce compatible types (string '25' to int 25) but not impossible ones",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Declaring a Request Body</h2>
          <p className="text-muted-foreground mb-4">
            Create a Pydantic model with the fields you expect. Use it as a type hint in your function, and
            FastAPI handles the rest — parsing, validation, error messages, and OpenAPI docs. All from one class.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    description: str | None = None  # optional field
    tax: float | None = None        # optional field

app = FastAPI()

@app.post("/items")
async def create_item(item: Item):
    # item is already validated — safe to use
    total = item.price + (item.tax or 0)
    return {**item.model_dump(), "total": total}`}
            filename="main.py"
          />
          <p className="text-sm text-muted-foreground mt-3">
            Notice: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">description</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">tax</code> have
            defaults, so they&apos;re optional in the JSON. Only <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">name</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">price</code> are required.
          </p>
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why use a Pydantic model instead of just reading the JSON dict directly?"
        reveal="A raw dict gives you no guarantees. You'd need to manually check if 'name' exists, if 'price' is a number, if optional fields are the right type... Pydantic does all of that in one line. Plus, you get autocomplete in your IDE, automatic API docs, and type safety. The model IS your documentation, validation, and type system all in one."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive simulation */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Watch Validation Happen</h2>
          <p className="text-muted-foreground mb-4">
            See how FastAPI validates incoming JSON against your Pydantic model — valid data gets parsed, bad data returns 422 errors.
          </p>
          <RequestBodySim />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Pydantic models"
        points={[
          "Pydantic models define the shape of your request body",
          "Fields without defaults are required; fields with defaults are optional",
          "model_dump() converts your validated model back to a dictionary",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Mixing Body + Path + Query</h2>
          <ConversationalCallout type="insight" className="mb-4">
            <p>
              You don&apos;t have to choose between body, path, and query parameters. FastAPI lets you
              combine all three in a single endpoint. It figures out which is which based on the same rules
              you already know.
            </p>
          </ConversationalCallout>
          <CodeBlock
            code={`@app.put("/items/{item_id}")
async def update_item(
    item_id: int,           # Path parameter (in the URL)
    item: Item,             # Request body (JSON)
    q: str | None = None,   # Query parameter (after ?)
):
    result = {"item_id": item_id, **item.model_dump()}
    if q:
        result["q"] = q
    return result

# PUT /items/42?q=search
# Body: {"name": "Widget", "price": 9.99}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Go Deeper */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Multiple Body Parameters</h2>
          <p className="text-muted-foreground mb-4">
            What if your endpoint needs two different models — say an Item and a User? FastAPI expects
            a nested JSON object where each key matches the parameter name.
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

# Expected body — note the nested structure:
# {
#   "item": {"name": "Foo", "price": 42.0},
#   "user": {"username": "john", "email": "john@example.com"}
# }`}
            filename="main.py"
          />
          <ConversationalCallout type="warning" className="mt-4">
            <p>
              This catches people off guard. With a single body parameter, you send the fields directly.
              With multiple body parameters, FastAPI wraps them in an object keyed by parameter name.
              If your frontend sends a flat object and you expect two models, you&apos;ll get a 422.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Body parameters"
        points={[
          "Body, path, and query parameters can all coexist in one function",
          "Multiple body parameters create a nested JSON structure",
          "FastAPI auto-generates schema docs for all body parameters",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question={`If your Pydantic model has price: float and someone sends {"price": "9.99"} (a string), does FastAPI accept it? Why or why not?`}
        options={[
          {
            label: 'Rejected — "9.99" is a string, not a float',
            correct: false,
            explanation: "Pydantic is smarter than that. It tries to coerce compatible types before rejecting them."
          },
          {
            label: "Accepted — Pydantic coerces the string to a float",
            correct: true,
            explanation: "Pydantic sees that '9.99' can be converted to 9.99 and does it automatically."
          },
          {
            label: "It depends on the Pydantic version",
            correct: false,
            explanation: "Both Pydantic v1 and v2 perform type coercion by default."
          },
          {
            label: "Accepted but stored as a string internally",
            correct: false,
            explanation: "No — Pydantic actually converts it. After validation, price is a real Python float."
          },
        ]}
        hint="Think about what Pydantic does with values that are 'close enough' to the declared type."
        answer={`Yes! Pydantic performs type coercion. It'll convert the string "9.99" to the float 9.99 automatically. This is intentional — Pydantic is smart about parsing common representations. But "nine dollars"? That would fail because it can't be coerced to a float.`}
        className="mb-8"
      />

      <AhaMoment
        setup="Is Pydantic's type coercion a good thing? Doesn't it hide bugs?"
        reveal={`It's a pragmatic choice. APIs receive data from many sources — form submissions send everything as strings, JavaScript might serialize numbers differently, CSV imports are all strings. Coercion handles these real-world cases gracefully. If you want strict mode (no coercion), Pydantic v2 supports model_config = ConfigDict(strict=True). But for most APIs, coercion is exactly what you want.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
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
