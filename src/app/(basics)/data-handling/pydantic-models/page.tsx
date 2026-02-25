"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const PydanticPlayground = dynamic(
  () => import("../_components/pydantic-playground").then(m => m.PydanticPlayground),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";

export default function PydanticModelsPage() {
  return (
    <div className="max-w-4xl ambient-data">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Pydantic Models</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Pydantic is the data validation library that powers FastAPI. Models define the shape of your data with Python type annotations, giving you validation, serialization, and documentation for free.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You add email: str to your User model. Someone signs up with email: "not-an-email". It passes validation. Your database now has garbage data. Why didn't Pydantic catch this?`}
        error={`POST /users {"name": "Bob", "email": "not-an-email"}
→ 200 OK  ✓ Created!

# Wait... "not-an-email" is not a valid email!
# But str accepts ANY string. Pydantic did exactly what you asked.`}
        errorType="Silent Data Issue"
        accentColor="blue"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Frustrating, right? You expected Pydantic to validate emails, but you told it the type was <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">str</code>.
          And <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&quot;not-an-email&quot;</code> <em>is</em> a valid string. Pydantic
          did exactly what you asked — the problem is you didn&apos;t ask for enough. This is where
          custom validators and specialized types come in.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Validation Pipeline</h2>
          <p className="text-muted-foreground mb-4">
            When data hits a Pydantic model, every field goes through a validation pipeline. The type hint is
            just the first check. You can add more layers with Field(), validators, and specialized types.
          </p>
          <SimpleFlow
            steps={[
              { label: "Raw data arrives", detail: '{"email": "not-an-email"}', status: "neutral" },
              { label: "Type check", detail: "Is it a str? Yes", status: "success" },
              { label: "Field constraints", detail: "min_length? pattern?", status: "neutral" },
              { label: "Custom validators", detail: "@field_validator?", status: "neutral" },
              { label: "Model accepted", detail: "All checks passed", status: "success" },
            ]}
            accentColor="blue"
            className="mb-4"
          />
          <p className="text-sm text-muted-foreground">
            If you only declare <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">email: str</code>,
            only the type check runs. The more constraints you add, the more Pydantic validates for you.
          </p>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        section="Validation pipeline"
        points={[
          "Type hints are just the first layer of validation",
          "Field() adds constraints like min_length, regex patterns, and more",
          "Custom validators run after type checking for business-logic validation",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough: Defining Models */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Defining Models</h2>
          <p className="text-muted-foreground mb-4">
            Create models by subclassing <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">BaseModel</code>. Each field
            uses standard Python type annotations. Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Field()</code> when
            you need constraints beyond the basic type.
          </p>
          <CodeBlock
            code={`from pydantic import BaseModel, Field
from datetime import datetime

class User(BaseModel):
    id: int
    name: str = Field(min_length=1, max_length=100)
    email: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    tags: list[str] = []`}
            filename="schemas.py"
          />
          <p className="text-sm text-muted-foreground mt-3">
            Default values make fields optional. <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">is_active</code> defaults
            to True, <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">tags</code> defaults to an empty list.
            Fields without defaults (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">id</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">name</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">email</code>) are required.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Nested Models</h2>
          <p className="text-muted-foreground mb-4">
            Real-world data is rarely flat. Models can reference other models, and Pydantic validates
            at every level. If the nested address has a bad zip code, you&apos;ll know exactly where.
          </p>
          <CodeBlock
            code={`class Address(BaseModel):
    street: str
    city: str
    country: str
    zip_code: str

class User(BaseModel):
    name: str
    address: Address                     # nested model
    shipping_addresses: list[Address] = []  # list of models`}
            filename="schemas.py"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="What happens if someone sends a user with a malformed address?"
        reveal={`Pydantic validates the nested Address model too. The error message will include the exact path to the problem — like ["body", "address", "zip_code"] — so the client knows exactly which field in which nested object failed. No digging through stack traces needed.`}
        className="mb-8"
      />

      <WhatYouJustLearned
        section="Model structure"
        points={[
          "BaseModel subclasses define your data shape",
          "Field() adds min/max length, patterns, and metadata",
          "Nested models validate at every level with precise error paths",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Fixing the email problem */}
      <FailureDeepDive
        title="Fixing the Email Problem"
        scenario={`Your User model has email: str and someone signs up with "not-an-email". How do you actually validate emails?`}
        code={`class User(BaseModel):
    name: str
    email: str  # Accepts ANY string!

# POST {"name": "Bob", "email": "not-an-email"}
# → 200 OK ← This shouldn't pass!`}
        error={`No error — that's the problem!

"not-an-email" is a valid str, so Pydantic
accepts it. Your database now has garbage data.`}
        explanation={`Pydantic validates against the type you declare. str means "any string." If you want email validation, you need to tell Pydantic what an email looks like — either with a custom validator or with Pydantic's built-in EmailStr type.`}
        fix="Use @field_validator to add custom validation logic. Check for @ sign, validate the format, normalize to lowercase."
        fixCode={`from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Invalid email address")
        return v.lower()  # normalize to lowercase

# POST {"name": "Bob", "email": "not-an-email"}
# → 422 Unprocessable Entity
# "Invalid email address"

# POST {"name": "Bob", "email": "Bob@Example.com"}
# → 200 OK, email stored as "bob@example.com"`}
        filename="schemas.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Field Validators</h2>
          <p className="text-muted-foreground mb-4">
            The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">@field_validator</code> decorator is your
            tool for business logic that goes beyond type checking. Want to ensure ages are reasonable?
            That passwords meet complexity requirements? Validators are the answer.
          </p>
          <CodeBlock
            code={`from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    email: str
    age: int

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        if v < 0 or v > 150:
            raise ValueError("Age must be between 0 and 150")
        return v`}
            filename="schemas.py"
          />
          <ConversationalCallout type="insight" className="mt-4">
            <p>
              Validators can do two things: reject bad data (raise ValueError) and transform good data
              (return a modified value). The email validator does both — it rejects strings without @ and
              lowercases valid emails.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Custom validation"
        points={[
          "@field_validator adds business logic validation beyond type checking",
          "Validators can reject (raise ValueError) and transform (return modified value)",
          "Validators run after type coercion, so you get the correct type",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive Playground */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
          <p className="text-muted-foreground mb-4">
            Edit the JSON below and hit Validate to see how Pydantic checks each field. Switch between models or click &quot;break it&quot; to see validation errors in action.
          </p>
          <PydanticPlayground />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="What's the difference between a Pydantic model and a Python dataclass for API validation?"
        options={[
          {
            label: "They're essentially the same thing with different syntax",
            correct: false,
            explanation: "They look similar but behave very differently when it comes to data validation."
          },
          {
            label: "Pydantic validates and coerces at runtime; dataclasses just store data",
            correct: true,
            explanation: "This is the key difference. Pydantic actively validates every value that enters the model."
          },
          {
            label: "Dataclasses are faster because they skip validation",
            correct: false,
            explanation: "Dataclasses are indeed simpler, but skipping validation isn't a performance benefit — it's a missing feature for APIs."
          },
          {
            label: "You can use either one with FastAPI interchangeably",
            correct: false,
            explanation: "FastAPI's validation is built specifically around Pydantic models. Dataclasses won't give you automatic validation or documentation."
          },
        ]}
        hint="Think about what happens when you pass the string '25' to a field declared as int."
        answer={`Pydantic validates and coerces data at runtime — if you say age: int and someone passes "25", Pydantic converts it. Dataclasses just store data with no validation. Pass "25" to an int field in a dataclass and it stays a string. For APIs, you need Pydantic's runtime validation.`}
        className="mb-8"
      />

      <AhaMoment
        setup="If Pydantic validates everything, why not use it for ALL your Python classes?"
        reveal={`You could, but there's a cost: validation takes CPU time. For internal data structures that you control completely (not user input), plain dataclasses or regular classes are faster. Save Pydantic for the boundaries of your system — where external data enters (API requests, config files, database results). That's where validation matters most.`}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Type-Driven</p>
              <p className="text-xs text-muted-foreground">Python type hints define validation, serialization, and docs</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Nested Validation</p>
              <p className="text-xs text-muted-foreground">Deeply nested structures are validated at every level</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Custom Validators</p>
              <p className="text-xs text-muted-foreground">Add business logic with @field_validator and @model_validator</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">model_dump()</p>
              <p className="text-xs text-muted-foreground">Convert models to dicts with .model_dump() for serialization</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
