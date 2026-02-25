"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const ParamAnatomy = dynamic(
  () => import("../_components/param-anatomy").then(m => m.ParamAnatomy),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

const HttpMethodExplorer = dynamic(
  () => import("../_components/http-method-explorer").then(m => m.HttpMethodExplorer),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";

export default function PathOperationsPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Path Operations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Path operations are the core building blocks of FastAPI. Each one maps an HTTP method and URL path to a Python function.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You define two endpoints: @app.get("/users") and @app.post("/users"). You curl POST /users with a JSON body. Back comes 405 Method Not Allowed. But you defined POST... right?`}
        error={`$ curl -X POST http://localhost:8000/users -H "Content-Type: application/json" -d '{"name": "Alice"}'

{"detail":"Method Not Allowed"}`}
        errorType="405 Method Not Allowed"
        accentColor="teal"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Why would FastAPI reject a POST request to an endpoint you clearly defined with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@app.post()</code>?
          The answer usually comes down to a typo, a missing import, or running stale code. But here&apos;s the deeper lesson: FastAPI is
          strict about matching the <em>exact</em> HTTP method to the <em>exact</em> path. That strictness is actually a feature.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How FastAPI Routes a Request</h2>
          <p className="text-muted-foreground mb-4">
            Every incoming request has two pieces of identity: the HTTP method (GET, POST, PUT, DELETE) and the URL path.
            FastAPI checks both. If either one doesn&apos;t match a registered operation, you get an error.
          </p>
          <SimpleFlow
            steps={[
              { label: "Request arrives", detail: "POST /users", status: "neutral" },
              { label: "Match path", detail: "/users found?", status: "neutral" },
              { label: "Match method", detail: "POST registered?", status: "neutral" },
              { label: "Run handler", detail: "create_user()", status: "success" },
            ]}
            accentColor="teal"
            className="mb-4"
          />
          <p className="text-sm text-muted-foreground">
            If the path exists but the method doesn&apos;t? That&apos;s your 405. If neither matches? 404. FastAPI won&apos;t guess what you meant.
          </p>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Routing basics"
        points={[
          "Every request has two identifiers: HTTP method + URL path",
          "FastAPI matches both — wrong method on a valid path gives 405, not 404",
          "This strictness helps clients understand what went wrong",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code section: What is a path operation */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Your First Path Operation</h2>
          <p className="text-muted-foreground mb-4">
            In FastAPI, a &quot;path operation&quot; is just a Python function with a decorator that says &quot;handle this
            HTTP method at this URL.&quot; That&apos;s it. No config files, no routing tables.
          </p>
          <CodeBlock code={`from fastapi import FastAPI

app = FastAPI()

# This handles GET requests to "/"
@app.get("/")
async def root():
    return {"message": "Hello World"}

# This handles POST requests to "/items"
@app.post("/items")
async def create_item():
    return {"item": "created"}`} filename="main.py" />
          <p className="text-sm text-muted-foreground mt-3">
            Notice: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@app.get</code> and
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> @app.post</code> on the same path (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/items</code>) are
            two completely separate operations. The method makes them different.
          </p>
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
          <h2 className="text-2xl font-semibold mb-4">The Full CRUD Toolkit</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI gives you a decorator for every standard HTTP method. Each one maps to a CRUD operation
            that your API consumers will expect.
          </p>
          <CodeBlock code={`@app.get("/items")        # Read (list all)
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

      <AhaMoment
        setup="Why does FastAPI have both PUT and PATCH? They both update, right?"
        reveal="PUT means 'replace the entire resource with this new version.' PATCH means 'only change these specific fields.' It's the difference between rewriting an entire document vs. editing one paragraph. Most CRUD APIs use PUT for full updates and PATCH for partial ones — and your clients will thank you for supporting both."
        className="mb-8"
      />

      <WhatYouJustLearned
        section="HTTP methods"
        points={[
          "GET reads, POST creates, PUT replaces, PATCH partially updates, DELETE removes",
          "Same path + different methods = different operations",
          "FastAPI auto-rejects methods you haven't explicitly defined",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Tags, Summary & Description</h2>
          <p className="text-muted-foreground mb-4">
            Your future self (and your team) will thank you for adding metadata. Tags group
            related endpoints in Swagger UI, and descriptions explain what each does. It&apos;s free documentation.
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
            Ever wonder why a POST returns 200 by default instead of 201? You can fix that.
            Use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">status</code> module for readable constants
            so you don&apos;t have to memorize numbers.
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

      {/* Go Deeper: Combining parameters */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Combining Path + Query + Body</h2>
          <ConversationalCallout type="insight" className="mb-4">
            <p>
              A single endpoint can receive data from three places at once: the URL path, the query string,
              and the request body. FastAPI figures out which is which automatically. Here&apos;s the rule it follows:
            </p>
          </ConversationalCallout>
          <SimpleFlow
            steps={[
              { label: "In the path string?", detail: "→ path parameter", status: "neutral" },
              { label: "Scalar type?", detail: "int, str, bool → query", status: "neutral" },
              { label: "Pydantic model?", detail: "→ request body", status: "neutral" },
            ]}
            accentColor="teal"
            className="mb-4"
          />
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
# Body: {"name": "Widget", "price": 9.99}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Parameter sources"
        points={[
          "FastAPI auto-detects where each parameter comes from based on type",
          "Path params come from the URL, scalars become query params, Pydantic models become the body",
          "You can mix all three in a single endpoint function",
        ]}
        className="mb-8"
      />

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

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question={`You have @app.get("/items") and @app.post("/items"). What happens if someone sends a PUT request to /items?`}
        options={[
          {
            label: "404 Not Found — the path doesn't exist for PUT",
            correct: false,
            explanation: "Close, but the path does exist — it's just not registered for PUT. FastAPI distinguishes between 'path not found' and 'method not allowed'."
          },
          {
            label: "405 Method Not Allowed — path exists but PUT isn't registered",
            correct: true,
            explanation: "Exactly. FastAPI knows /items exists (for GET and POST) but PUT was never defined. The 405 tells the client to try a different method."
          },
          {
            label: "It falls through to the GET handler",
            correct: false,
            explanation: "FastAPI never guesses. It won't route a PUT to a GET handler just because the path matches."
          },
          {
            label: "500 Internal Server Error",
            correct: false,
            explanation: "No crash here. FastAPI handles this gracefully with a proper 405 status code."
          },
        ]}
        hint="Think about what the 405 status code specifically means."
        answer="You'll get a 405 Method Not Allowed. FastAPI only allows the exact HTTP methods you've decorated. If you need PUT, you need @app.put('/items'). The 405 is actually helpful — it tells the client 'this endpoint exists, but not for that method.'"
        className="mb-8"
      />

      <AhaMoment
        setup="Why doesn't FastAPI just return 404 when the method doesn't match?"
        reveal="Because 404 and 405 mean different things to the client. A 404 says 'nothing here, you might have the wrong URL.' A 405 says 'this URL is real, but you're using the wrong HTTP method.' That distinction helps developers debug faster — and it follows the HTTP spec correctly."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
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
              <p className="text-xs text-muted-foreground">Group endpoints in Swagger UI with tags=[&quot;category&quot;]</p>
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
