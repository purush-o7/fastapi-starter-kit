"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function CustomHandlersPage() {
  return (
    <div className="max-w-4xl ambient-errors">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Custom Handlers</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Custom exception handlers let you define exactly how your API responds to specific error types. Create consistent error formats across your entire application.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Exception Classes</h2>
          <p className="text-muted-foreground mb-4">Define your own exception types and register handlers for them.</p>
          <CodeBlock code={`from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class ItemNotFoundException(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

app = FastAPI()

@app.exception_handler(ItemNotFoundException)
async def item_not_found_handler(
    request: Request,
    exc: ItemNotFoundException,
):
    return JSONResponse(
        status_code=404,
        content={
            "error": "item_not_found",
            "message": f"Item {exc.item_id} does not exist",
        },
    )

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in database:
        raise ItemNotFoundException(item_id)
    return database[item_id]`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Override Default Handlers</h2>
          <p className="text-muted-foreground mb-4">Override FastAPI&apos;s built-in handlers for validation errors and HTTP exceptions.</p>
          <CodeBlock code={`from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status": exc.status_code,
            "message": exc.detail,
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Validation failed",
            "details": exc.errors(),
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
              <p className="text-sm font-medium mb-1">Custom Exceptions</p>
              <p className="text-xs text-muted-foreground">Define domain-specific exception types for clarity</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Consistent Format</p>
              <p className="text-xs text-muted-foreground">All errors follow the same JSON structure across your API</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Override Defaults</p>
              <p className="text-xs text-muted-foreground">Replace built-in validation and HTTP error handlers</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Logging</p>
              <p className="text-xs text-muted-foreground">Add logging and monitoring inside exception handlers</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
