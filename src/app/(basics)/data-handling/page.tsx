"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileInput, FileCheck, Code, FileOutput, Lightbulb } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { DataHeroViz } from "./_components/data-hero-viz";
import { PydanticPlayground } from "./_components/pydantic-playground";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/data-handling/request-body",
    label: "Request Body",
    icon: FileInput,
    description: "Accept and validate JSON request bodies with Pydantic models.",
  },
  {
    href: "/data-handling/pydantic-models",
    label: "Pydantic Models",
    icon: FileCheck,
    description: "Define data schemas with automatic validation, serialization, and documentation.",
  },
  {
    href: "/data-handling/response-model",
    label: "Response Model",
    icon: FileOutput,
    description: "Control API response shape and filter sensitive fields automatically.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "json-body", label: "JSON Body", description: "The client sends a JSON request body to your endpoint.", icon: FileInput, color: "blue-500" },
  { id: "parse-validate", label: "Parse & Validate", description: "FastAPI automatically parses the JSON and validates it against your Pydantic model.", icon: FileCheck, color: "blue-500" },
  { id: "business-logic", label: "Business Logic", description: "Your handler receives a fully validated, type-safe Python object to work with.", icon: Code, color: "indigo-500" },
  { id: "response-filter", label: "Response Model Filter", description: "The response_model strips out any fields not defined in the output schema before sending.", icon: FileOutput, color: "indigo-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Mutable default arguments",
    subtitle: "Using mutable defaults in Pydantic models",
    wrongCode: `from pydantic import BaseModel

class Item(BaseModel):
    tags: list[str] = []  # Shared mutable!`,
    rightCode: `from pydantic import BaseModel, Field

class Item(BaseModel):
    tags: list[str] = Field(default_factory=list)`,
    filename: "schemas.py",
    explanation: "While Pydantic v2 handles mutable defaults correctly by copying them, using Field(default_factory=list) makes the intent explicit and is the recommended pattern.",
  },
  {
    title: "Exposing internal fields",
    subtitle: "Returning database models directly without a response model",
    wrongCode: `@app.get("/users/{id}")
async def get_user(id: int):
    user = db.get(id)
    return user  # Exposes password_hash!`,
    rightCode: `class UserOut(BaseModel):
    id: int
    name: str
    email: str

@app.get("/users/{id}", response_model=UserOut)
async def get_user(id: int):
    user = db.get(id)
    return user  # password_hash filtered out`,
    filename: "main.py",
    explanation: "Always use response_model to control what fields are returned. Without it, sensitive fields like password hashes or internal IDs could leak to clients.",
  },
];

export default function DataHandlingPage() {
  return (
    <div className="max-w-4xl ambient-data">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Data Handling</h1>
          <Badge variant="secondary">3 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          How FastAPI validates incoming data, serializes responses, and
          leverages Pydantic for type-safe data handling.
        </p>
      </div>

      {/* Hero Visualization: Data Assembly Line */}
      <ScrollReveal className="mb-8">
        <DataHeroViz />
      </ScrollReveal>

      <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              Pydantic models are the backbone of FastAPI. They handle
              validation, serialization, and OpenAPI schema generation — all
              from a single class definition.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Data Pipeline */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How Data Flows Through FastAPI</h2>
        <AnimatedFlow steps={flowSteps} accentColor="blue" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-blue-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: Pydantic Playground */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: Pydantic Playground</h2>
        <PydanticPlayground />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
