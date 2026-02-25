"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Defining Models</h2>
          <p className="text-muted-foreground mb-4">
            Create models by subclassing BaseModel. Each field uses standard Python type annotations.
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
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Nested Models</h2>
          <p className="text-muted-foreground mb-4">
            Models can reference other models, creating complex nested data structures that are validated at every level.
          </p>
          <CodeBlock
            code={`class Address(BaseModel):
    street: str
    city: str
    country: str
    zip_code: str

class User(BaseModel):
    name: str
    address: Address
    shipping_addresses: list[Address] = []`}
            filename="schemas.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Field Validators</h2>
          <p className="text-muted-foreground mb-4">
            Add custom validation logic using the @field_validator decorator.
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
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

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
