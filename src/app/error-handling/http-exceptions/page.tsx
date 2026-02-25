"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const ExceptionFlowSim = dynamic(
  () => import("../_components/exception-flow-sim").then(m => m.ExceptionFlowSim),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";
import { Zap } from "lucide-react";

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

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="Your endpoint hits an error, but instead of raising an exception, you return {'error': 'Not found'} with status 200. The frontend's error handling never triggers because the status code says 'success'. Users see broken UI and think everything is fine."
        error={`# Your endpoint:
@app.get("/items/{id}")
def get_item(id: int):
    item = db.get(id)
    if not item:
        return {"error": "Not found"}  # ← Status 200!

# Frontend:
const res = await fetch("/items/999");
if (res.ok) {  // true! status is 200
    const data = await res.json();
    showItem(data);  // Shows: {"error": "Not found"} as if it's an item
}`}
        errorType="Silent Failure"
        accentColor="orange"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Ever returned an error message but forgot to set the right status code?
          Your API says &quot;Not found&quot; but the HTTP response says &quot;200 OK.&quot;
          The frontend trusts the status code, not your message body. Broken UI, zero error handling triggered.
        </p>
        <p>
          This is exactly why <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">raise HTTPException</code> exists.
          It sets the correct status code AND stops your code immediately. Let&apos;s see how.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model: raise vs return */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">raise vs return: Why It Matters</h2>
          <p className="text-muted-foreground mb-4">
            There are two ways to send an error response. One is correct, one leads to the bug we just saw.
          </p>
          <SimpleFlow
            steps={[
              { label: "return {\"error\": ...}", detail: "Status 200 (wrong!)", status: "error" },
              { label: "Frontend sees res.ok = true", detail: "Skips error handling", status: "error" },
              { label: "Broken UI", detail: "Error data shown as content", status: "error" },
            ]}
            accentColor="orange"
            className="mb-4"
          />
          <SimpleFlow
            steps={[
              { label: "raise HTTPException(404)", detail: "Status 404 (correct!)", status: "success" },
              { label: "Frontend sees res.ok = false", detail: "Error handler runs", status: "success" },
              { label: "Clean error message", detail: "User sees helpful feedback", status: "success" },
            ]}
            accentColor="orange"
            className="mb-6"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Core Rule"
        points={[
          "raise HTTPException sets the correct status code AND stops execution",
          "return with error data still sends status 200 — frontends won't catch it",
          "raise is an exception — nothing after it runs in the same function",
          "HTTP status codes are how clients decide if a request succeeded or failed",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Code section: Basic HTTP Exceptions */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic HTTP Exceptions</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the correct way to handle a &quot;not found&quot; case.
            Import <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">HTTPException</code>,
            and <strong>raise</strong> it with a status code and detail message.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, HTTPException

app = FastAPI()

items = {"foo": "The Foo item"}

@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        # This stops execution and returns a proper 404
        raise HTTPException(
            status_code=404,
            detail="Item not found",
        )
    # This only runs if the item exists
    return {"item": items[item_id]}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          Notice the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">raise</code> keyword.
          It&apos;s not <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">return</code>.
          When you <strong>raise</strong> an exception, Python immediately exits the function.
          The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">return {`{"item": items[item_id]}`}</code> line
          at the bottom? It never runs. That&apos;s the safety net — you can&apos;t accidentally return data after an error.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Interactive sim — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See the Exception Flow</h2>
          <p className="text-muted-foreground mb-4">
            Watch what happens step by step when an endpoint raises HTTPException.
            Follow the request from arrival to JSON error response.
          </p>
          <ExceptionFlowSim />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Exception Flow"
        points={[
          "HTTPException is caught by FastAPI's internal error handler",
          "The status code and detail are turned into a JSON response automatically",
          "No try/except needed in your endpoint — FastAPI handles it",
          "The response body is always {\"detail\": \"your message\"}",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Code section: Custom Headers */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Custom Headers on Errors</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes the status code and message aren&apos;t enough. You might need to tell the client
            <em> when</em> to retry, or pass a machine-readable error code in a header.
          </p>
          <CodeBlock code={`@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={
                "X-Error-Code": "ITEM_NOT_FOUND",  # Machine-readable
                "X-Retry-After": "30",  # Hint for the client
            },
        )
    return {"item": items[item_id]}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 7. Code section: Structured Error Details */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Structured Error Details</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s something most people don&apos;t realize: the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">detail</code> field
            isn&apos;t limited to strings. You can pass any JSON-serializable value — dicts, lists, nested objects.
            This is powerful when your frontend needs structured error information.
          </p>
          <CodeBlock code={`# detail can be a dict — not just a string!
raise HTTPException(
    status_code=422,
    detail={
        "error": "validation_failed",
        "fields": [
            {"field": "email", "message": "Invalid format"},
            {"field": "age", "message": "Must be positive"},
        ],
    },
)

# Response body:
# {
#   "detail": {
#     "error": "validation_failed",
#     "fields": [
#       {"field": "email", "message": "Invalid format"},
#       {"field": "age", "message": "Must be positive"}
#     ]
#   }
# }`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="If detail can be any JSON-serializable value, why do most tutorials only show strings?"
        reveal="Most tutorials keep it simple, but in production you'll almost always use structured errors. Your frontend needs to know WHICH field failed validation and WHY, not just 'validation error.' Structured details let the frontend highlight the exact form field that's wrong — like turning the email input red with 'Invalid format' underneath."
        className="mb-8"
      />

      <WhatYouJustLearned
        section="Error Customization"
        points={[
          "Custom headers add machine-readable context to error responses",
          "The detail field accepts dicts, lists, and nested structures — not just strings",
          "Structured errors let frontends show field-level validation messages",
          "Use X-Error-Code headers for error codes that frontends can switch on",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 8. Go Deeper: raise vs return deep dive */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: The Silent Failure Pattern</h2>
          <p className="text-muted-foreground mb-4">
            Let&apos;s look at the exact bug from our opening scenario and its fix side by side.
          </p>
          <FailureDeepDive
            title="Returning Errors with Status 200"
            scenario="You return an error message as a dict, but forget to set the status code. The frontend's fetch API sees 200 OK and treats it as success."
            code={`@app.get("/items/{id}")
def get_item(id: int):
    item = db.get(id)
    if not item:
        # Looks right, but status is 200!
        return {"error": "Not found"}
    return {"item": item}`}
            error={`# Client-side:
fetch("/items/999")
  .then(res => {
    console.log(res.status);  // 200
    console.log(res.ok);      // true
    return res.json();
  })
  .then(data => {
    // data = {"error": "Not found"}
    // Frontend renders this as if it's a valid item!
    renderItem(data);  // 💥 Broken UI
  });`}
            explanation="HTTP clients (browsers, mobile apps, other services) use the status code to decide what happened. A 200 means 'everything is fine.' Your error message in the body is invisible to standard error handling — the client has to manually check for an 'error' key, which is fragile and non-standard."
            fix="Use raise HTTPException to set the correct status code. The frontend's error handling triggers automatically."
            fixCode={`from fastapi import HTTPException

@app.get("/items/{id}")
def get_item(id: int):
    item = db.get(id)
    if not item:
        # Correct: status 404, stops execution
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": item}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 9. Mental Model Challenge */}
      <MentalModelChallenge
        question="What's the difference between raise HTTPException(404) and return JSONResponse(status_code=404, content={...})?"
        options={[
          { label: "They're exactly the same thing", correct: false, explanation: "They produce similar responses, but they behave differently in your code." },
          { label: "raise stops execution and triggers exception handlers; return doesn't", correct: true, explanation: "That's the key difference. raise is an exception, return is a normal control flow." },
          { label: "JSONResponse is faster because it skips error handling", correct: false, explanation: "Performance is nearly identical. The difference is about control flow, not speed." },
          { label: "HTTPException only works in async functions", correct: false, explanation: "HTTPException works in both sync and async endpoint functions." },
        ]}
        hint="Think about what 'raise' does in Python vs what 'return' does."
        answer="raise HTTPException stops execution immediately — no code after it runs. It also triggers exception handlers if you've registered any. return JSONResponse is a normal return — code after it still conceptually exists, and it bypasses exception handlers. Use raise for errors (you want to bail out), use JSONResponse for custom response shapes where you're in control."
        className="mb-8"
      />

      {/* 10. Aha Moment */}
      <AhaMoment
        setup="Why does FastAPI use 'raise' for errors instead of just 'return' with a status code?"
        reveal="It's a design pattern called 'fail fast.' When you raise an exception, you're saying 'something is wrong, stop everything.' This guarantees no code runs after the error — you can't accidentally process data for a user that doesn't exist. With return, you'd need to carefully structure every function to never do anything after returning an error. raise makes the correct behavior automatic."
        icon={<Zap className="size-5 text-orange-500" />}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 11. Key Points grid — KEPT */}
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
