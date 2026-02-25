"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const HandlerChainSim = dynamic(
  () => import("../_components/handler-chain-sim").then(m => m.HandlerChainSim),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";
import { Layers } from "lucide-react";

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

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="Your API returns validation errors in Pydantic's default format. Your mobile app expects errors in a different shape. Every error response needs to be translated between two formats. Your frontend team is frustrated."
        error={`# Pydantic returns this:
{
  "detail": [
    {"type": "missing", "loc": ["body", "email"], "msg": "Field required"}
  ]
}

# Mobile app expects this:
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "message": "email is required",
  "fields": {"email": "This field is required"}
}

# Frontend team: "Why can't the API just return OUR format?"`}
        errorType="Format Mismatch"
        accentColor="orange"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Sound familiar? Your backend speaks Pydantic, your frontend speaks a different dialect,
          and every error response needs manual translation. What if you could intercept every error
          before it leaves your API and reshape it into whatever format your clients expect?
        </p>
        <p>
          That&apos;s exactly what custom exception handlers do. You register a function that says
          &quot;when THIS type of error happens, return THAT response format.&quot;
        </p>
      </ConversationalCallout>

      {/* 3. Mental model: How handlers work */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How Exception Handlers Work</h2>
          <p className="text-muted-foreground mb-4">
            When an exception is raised, FastAPI checks its list of registered handlers.
            It finds the most specific match and calls that handler to create the response.
          </p>
          <SimpleFlow
            steps={[
              { label: "Exception raised", detail: "raise ItemNotFoundException(42)", status: "error" },
              { label: "FastAPI checks handlers", detail: "Most specific match wins", status: "neutral" },
              { label: "Handler runs", detail: "Your function creates the response", status: "neutral" },
              { label: "Custom JSON response", detail: "Your format, your rules", status: "success" },
            ]}
            accentColor="orange"
            className="mb-6"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Pattern"
        points={[
          "Exception handlers intercept errors BEFORE they become responses",
          "You register handlers with @app.exception_handler(ExceptionType)",
          "The most specific handler wins — ItemNotFound before generic Exception",
          "Every error in your API goes through these handlers, so your format is consistent",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Code section: Custom exception classes */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Exception Classes</h2>
          <p className="text-muted-foreground mb-4">
            Step one: define your own exception types. These carry domain-specific data —
            like which item wasn&apos;t found, or which permission was denied.
            Then register a handler that turns them into your API&apos;s error format.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Step 1: Define your exception
class ItemNotFoundException(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

app = FastAPI()

# Step 2: Register a handler for it
@app.exception_handler(ItemNotFoundException)
async def item_not_found_handler(
    request: Request,
    exc: ItemNotFoundException,
):
    # Step 3: Return YOUR format
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error_code": "ITEM_NOT_FOUND",
            "message": f"Item {exc.item_id} does not exist",
        },
    )

# Step 4: Just raise it — the handler does the rest
@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in database:
        raise ItemNotFoundException(item_id)  # Clean and readable
    return database[item_id]`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          Notice how clean the endpoint code is? No JSONResponse, no status codes in the route function.
          You just <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">raise ItemNotFoundException(item_id)</code> and
          let the handler deal with formatting. Your route functions stay focused on business logic.
        </p>
      </ConversationalCallout>

      <AhaMoment
        setup="Why create custom exception classes instead of using HTTPException for everything?"
        reveal="HTTPException is generic — it just carries a status code and a message. Custom exceptions carry domain data: which item wasn't found, which field failed validation, which permission was denied. They also let different parts of your code raise specific errors without knowing about HTTP status codes or response formats. Your database layer can raise ItemNotFoundException without importing FastAPI at all."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Interactive sim — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Handler Chain in Action</h2>
          <p className="text-muted-foreground mb-4">
            See how FastAPI checks each registered handler in order until one matches the exception type.
            The most specific handler always wins.
          </p>
          <HandlerChainSim />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Handler Registration"
        points={[
          "Register handlers with @app.exception_handler(YourException)",
          "Handlers receive the request and the exception instance",
          "They must return a Response object (usually JSONResponse)",
          "The handler chain checks most-specific to least-specific",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Code section: Override default handlers */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Overriding FastAPI&apos;s Default Handlers</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s where it gets really powerful. FastAPI has built-in handlers for validation errors
            and HTTP exceptions. You can replace them with your own, so <em>every</em> error
            in your API follows the same format — even Pydantic validation errors.
          </p>
          <CodeBlock code={`from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Override the default HTTP exception handler
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_code": f"HTTP_{exc.status_code}",
            "message": exc.detail,
        },
    )

# Override the default validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc):
    # Transform Pydantic's format into YOUR format
    fields = {}
    for error in exc.errors():
        field_name = error["loc"][-1]  # Last element is the field name
        fields[field_name] = error["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error_code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "fields": fields,  # {"email": "field required", "age": "..."}
        },
    )`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          Notice we import <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">StarletteHTTPException</code>,
          not FastAPI&apos;s HTTPException. FastAPI&apos;s built-in handler is registered against the Starlette base class.
          If you register against FastAPI&apos;s HTTPException, the built-in handler for the Starlette one still runs.
          This trips up a lot of people.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="Override Defaults"
        points={[
          "Override StarletteHTTPException to customize ALL HTTP error responses",
          "Override RequestValidationError to reshape Pydantic's validation output",
          "Now every error in your API follows the same JSON structure",
          "Import from starlette.exceptions, not fastapi — this is a common gotcha",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Go Deeper: Building a unified error system */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: A Unified Error System</h2>
          <p className="text-muted-foreground mb-4">
            Let&apos;s solve the exact problem from our opening scenario.
            Here&apos;s how to transform Pydantic&apos;s output into the format your mobile team expects.
          </p>
          <FailureDeepDive
            title="Pydantic Format vs Mobile App Format"
            scenario="Your mobile team needs a flat 'fields' object with field names as keys and messages as values. Pydantic returns a nested array with 'loc', 'type', and 'msg' keys."
            code={`# Default Pydantic validation error response:
# POST /users with body: {}
{
    "detail": [
        {
            "type": "missing",
            "loc": ["body", "email"],
            "msg": "Field required",
            "input": {},
            "url": "..."
        }
    ]
}`}
            error={`// Mobile app tries to parse the error:
if (response.error_code === "VALIDATION_ERROR") {
    // Expects: response.fields.email → "This field is required"
    // Gets: undefined — because the format is completely different
    showFieldError("email", response.fields?.email);
    // 💥 Nothing shows up. User has no idea what went wrong.
}`}
            explanation="Pydantic's validation error format is designed for debugging, not for client consumption. The nested array with 'loc' tuples is powerful for developers but confusing for frontends that just want to know which field failed and why."
            fix="Register a custom handler for RequestValidationError that transforms the output into your client's expected format."
            fixCode={`@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc):
    fields = {}
    for error in exc.errors():
        field = error["loc"][-1]
        fields[field] = error["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error_code": "VALIDATION_ERROR",
            "message": "Validation failed",
            "fields": fields,
        },
    )
# Now: {"fields": {"email": "Field required"}} ✓`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 8. Adding logging to handlers */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Logging Inside Handlers</h2>
          <p className="text-muted-foreground mb-4">
            Exception handlers are the perfect place to add logging and monitoring.
            Every error in your API flows through them, so you get a single place
            to track, alert, and debug issues.
          </p>
          <CodeBlock code={`import logging

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def catch_all_handler(request: Request, exc: Exception):
    # Log the error with request context
    logger.error(
        f"Unhandled error: {exc}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "client_ip": request.client.host,
        },
        exc_info=True,  # Include the full traceback
    )

    # Return a safe response (don't leak internal details!)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error_code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            # Never expose exc details to clients in production!
        },
    )`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          A catch-all <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Exception</code> handler is your safety net,
          but never expose the actual error message to clients. Internal errors might contain
          database connection strings, file paths, or other sensitive information.
          Log the details server-side, return a generic message to the client.
        </p>
      </ConversationalCallout>

      <AhaMoment
        setup="If you register a handler for Exception (the base class), does it catch everything?"
        reveal="Almost. It catches all Python exceptions, but FastAPI registers its own handlers for HTTPException and RequestValidationError that run first. Exception handlers follow 'most specific wins' — so your Exception handler only catches things that DON'T have a more specific handler. Think of it as a safety net at the bottom, not a replacement for specific handlers."
        icon={<Layers className="size-5 text-orange-500" />}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 9. Mental Model Challenge */}
      <MentalModelChallenge
        question="If you register a handler for Exception (the base class), does it catch HTTPException too?"
        options={[
          { label: "Yes — Exception catches everything, including HTTPException", correct: false, explanation: "HTTPException does inherit from Exception, but FastAPI's built-in handler runs first." },
          { label: "No — FastAPI's built-in HTTPException handler takes priority", correct: true, explanation: "Correct. The most specific registered handler wins, and FastAPI pre-registers one for HTTPException." },
          { label: "It depends on the order you register the handlers", correct: false, explanation: "Handler priority is based on specificity (class hierarchy), not registration order." },
          { label: "Only if HTTPException is raised directly, not from dependencies", correct: false, explanation: "The handler mechanism works the same regardless of where the exception is raised." },
        ]}
        hint="Think about handler specificity — what happens when multiple handlers could match?"
        answer="Yes — HTTPException inherits from Exception, so a catch-all Exception handler would catch it. But FastAPI has a built-in HTTPException handler that runs first. To override it, you need to explicitly register a handler for HTTPException. The precedence is: most-specific handler wins. Register handlers for both HTTPException and Exception if you want different behavior for each."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 10. Key Points grid — KEPT */}
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
