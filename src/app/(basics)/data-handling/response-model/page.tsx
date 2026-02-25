"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const ResponseFilterSim = dynamic(
  () => import("../_components/response-filter-sim").then(m => m.ResponseFilterSim),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

export default function ResponseModelPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
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

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`Your /users/me endpoint returns the full user object — including the hashed_password field. A security audit flags it. You accidentally leaked password hashes to every frontend client.`}
        error={`GET /users/me → 200 OK

{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "hashed_password": "$2b$12$LJ3m4ys3Lk.YHxQKfJk0R...",
  "is_admin": true,
  "created_at": "2024-01-15T10:30:00"
}

# hashed_password is visible to anyone!`}
        errorType="Data Leak"
        accentColor="blue"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          How does this happen? It&apos;s usually innocent — you return your database model directly, and it
          includes everything. The fix isn&apos;t to manually delete fields from a dict. It&apos;s to tell FastAPI
          <em> what&apos;s allowed out</em>. That&apos;s what <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">response_model</code> does.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How Response Model Filtering Works</h2>
          <p className="text-muted-foreground mb-4">
            Think of <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">response_model</code> as a security filter. Your function
            can return a full database object with 10 fields, but only the fields in the response model make it to the
            client. Everything else gets stripped.
          </p>
          <SimpleFlow
            steps={[
              { label: "DB object", detail: "10 fields (incl. password)", status: "neutral" },
              { label: "Your function", detail: "return user", status: "neutral" },
              { label: "response_model filter", detail: "Only 3 fields allowed", status: "success" },
              { label: "Client receives", detail: "3 safe fields", status: "success" },
            ]}
            accentColor="blue"
            className="mb-4"
          />
          <p className="text-sm text-muted-foreground">
            The filtering happens automatically. You don&apos;t need to manually build a safe dict — just declare
            the response model and FastAPI does the rest.
          </p>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Response model concept"
        points={[
          "response_model acts as a whitelist — only declared fields reach the client",
          "You can safely return full database objects without leaking sensitive data",
          "The filtering is automatic — no manual dict construction needed",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough: Fixing the leak */}
      <FailureDeepDive
        title="Fixing the Password Leak"
        scenario="Your endpoint returns the full user object including hashed_password. How do you create a safe response?"
        code={`from fastapi import FastAPI
from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str
    email: str

app = FastAPI()

@app.post("/users")
async def create_user(user: User):
    # Returns EVERYTHING, including password!
    return user`}
        error={`POST /users → 200 OK

{
  "username": "alice",
  "password": "secret123",
  "email": "alice@example.com"
}

# Password exposed in the response!`}
        explanation="Without a response_model, FastAPI returns whatever your function returns — including sensitive fields. The fix is to create a separate model that only includes the fields you want clients to see."
        fix="Create a separate 'out' model without the sensitive fields. Use response_model to enforce it."
        fixCode={`class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    username: str
    email: str

@app.post("/users", response_model=UserOut)
async def create_user(user: UserIn):
    # FastAPI strips password from response automatically
    return user

# POST /users → 200 OK
# {"username": "alice", "email": "alice@example.com"}
# No password! UserOut doesn't include it.`}
        filename="main.py"
        className="mb-8"
      />

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          This is one of the most common security issues in APIs. It&apos;s not just passwords — think
          about internal IDs, admin flags, cost prices, or API keys. If it&apos;s in your database model,
          it can accidentally leak. Always use separate input and output models.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* Interactive filter sim */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See the Filter in Action</h2>
          <p className="text-muted-foreground mb-4">
            Watch how response_model strips sensitive fields from your API response. Raw data goes in, only safe fields come out.
          </p>
          <ResponseFilterSim />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Input/output models"
        points={[
          "Use separate models for input (UserIn) and output (UserOut)",
          "response_model=UserOut strips any fields not in UserOut",
          "You can safely return full DB objects — FastAPI filters them for you",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Fine-Tuning the Response</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes you need more control than just &quot;include these fields.&quot; What if you want to
            exclude fields that weren&apos;t explicitly set? Or hide internal fields from a public endpoint?
          </p>
          <CodeBlock
            code={`@app.get(
    "/items/{item_id}",
    response_model=Item,
    response_model_exclude_unset=True,
)
async def read_item(item_id: int):
    # Only returns fields that were explicitly set
    # If description was never set, it won't appear (even as None)
    return items[item_id]

@app.get(
    "/items/{item_id}/public",
    response_model=Item,
    response_model_exclude={"internal_notes", "cost_price"},
)
async def read_item_public(item_id: int):
    # These two fields are always stripped, even if set
    return items[item_id]`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="When would you use response_model_exclude_unset?"
        reveal={`Imagine an item with 20 optional fields. If the user only set name and price, returning all 20 fields as None is noisy. With exclude_unset=True, the response only contains name and price — much cleaner. It's especially useful for PATCH endpoints where you want to show only what was actually changed.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Modern Alternative: Return Type Annotations</h2>
          <p className="text-muted-foreground mb-4">
            In newer FastAPI versions, you can skip <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">response_model</code> and
            use Python&apos;s return type annotation instead. Same behavior, cleaner syntax.
          </p>
          <CodeBlock
            code={`# Modern syntax — return type annotation
@app.get("/users/{user_id}")
async def read_user(user_id: int) -> UserOut:
    user = get_user(user_id)
    return user

# Equivalent to the explicit response_model:
# @app.get("/users/{user_id}", response_model=UserOut)`}
            filename="main.py"
          />
          <ConversationalCallout type="insight" className="mt-4">
            <p>
              Both approaches do the same thing. The return type annotation is more Pythonic and gives you
              better IDE support. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">response_model</code> when you
              need the extra options like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">response_model_exclude</code>.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Response control"
        points={[
          "response_model_exclude_unset hides fields that were never set",
          "response_model_exclude lets you blacklist specific fields",
          "Return type annotations (-> UserOut) are the modern, cleaner alternative",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If your response_model has 3 fields but your endpoint returns a dict with 10 fields, what happens to the extra 7?"
        options={[
          {
            label: "FastAPI raises an error because the shapes don't match",
            correct: false,
            explanation: "FastAPI doesn't error on extra fields — it silently filters them out. That's the whole point."
          },
          {
            label: "All 10 fields are returned — response_model is just for docs",
            correct: false,
            explanation: "response_model actively filters the response. It's not just documentation — it's enforcement."
          },
          {
            label: "FastAPI strips the extra 7 fields — only the 3 in the model reach the client",
            correct: true,
            explanation: "response_model acts as a whitelist. Extra fields are silently removed before the response is sent."
          },
          {
            label: "The extra fields are logged as warnings but still returned",
            correct: false,
            explanation: "No warnings needed. Stripping extra fields is the expected, intentional behavior of response_model."
          },
        ]}
        hint="Think of response_model as a filter, not a validator."
        answer={`FastAPI strips them out. The response_model acts as a filter — only fields defined in the model make it to the response. This is exactly why response_model exists: you can return your full DB object and FastAPI will only include the safe fields.`}
        className="mb-8"
      />

      <AhaMoment
        setup="Do I really need separate UserIn and UserOut models? That's a lot of duplication."
        reveal={`It feels redundant, but it serves a critical purpose: your input model defines what clients CAN send, your output model defines what clients CAN see. These are often different! The input has a password, the output doesn't. The output has created_at, the input doesn't. You can reduce duplication with a shared base class that both inherit from.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
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
