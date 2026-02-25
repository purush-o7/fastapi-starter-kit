"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { ExceptionFlowSim } from "../_components/exception-flow-sim";

export default function HttpExceptionsPage() {
  return (
    <div className="max-w-4xl ambient-errors">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">HTTP Exceptions</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          HTTPException is FastAPI&apos;s way of returning error responses with proper status codes. Raise it anywhere in your code to immediately stop and return an error.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic HTTP Exceptions</h2>
          <p className="text-muted-foreground mb-4">Import HTTPException and raise it with a status code and detail message.</p>
          <CodeBlock code={`from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {"foo": "The Foo item"}

@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
        )
    return {"item": items[item_id]}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See the Exception Flow</h2>
          <p className="text-muted-foreground mb-4">Watch what happens when an endpoint raises HTTPException — from request to JSON error response.</p>
          <ExceptionFlowSim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Headers</h2>
          <p className="text-muted-foreground mb-4">Add custom headers to error responses for additional context.</p>
          <CodeBlock code={`@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={
                "X-Error-Code": "ITEM_NOT_FOUND",
                "X-Retry-After": "30",
            },
        )`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Structured Error Details</h2>
          <p className="text-muted-foreground mb-4">The detail field can be any JSON-serializable value, not just a string.</p>
          <CodeBlock code={`raise HTTPException(
    status_code=422,
    detail={
        "error": "validation_failed",
        "fields": [
            {"field": "email", "message": "Invalid format"},
            {"field": "age", "message": "Must be positive"},
        ],
    },
)`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Raise, Don&apos;t Return</p>
              <p className="text-xs text-muted-foreground">Raising HTTPException sets the correct status code automatically</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Rich Details</p>
              <p className="text-xs text-muted-foreground">detail can be a string, dict, or list — any JSON-serializable value</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Custom Headers</p>
              <p className="text-xs text-muted-foreground">Add headers like Retry-After or custom error codes</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Status Codes</p>
              <p className="text-xs text-muted-foreground">Use fastapi.status for readable constants like HTTP_404_NOT_FOUND</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
