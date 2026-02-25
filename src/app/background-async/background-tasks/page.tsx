"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const BackgroundTaskTimeline = dynamic(
  () => import("../_components/background-task-timeline").then(m => m.BackgroundTaskTimeline),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";

export default function BackgroundTasksPage() {
  return (
    <div className="max-w-4xl ambient-async">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Background Tasks</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Your user waited 5 seconds for a signup that should have taken 200ms. Let&apos;s fix that.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`A user signs up. Your endpoint sends a welcome email synchronously. The SMTP server takes 5 seconds to respond. The user stares at a loading spinner for 5 seconds just to see "Registration successful".`}
        error={`POST /signup {"email": "alice@example.com", "name": "Alice"}\n\n# Server timeline:\n# 0.0s — Receive request\n# 0.1s — Create user in DB ✓\n# 0.2s — Start sending welcome email...\n# 5.2s — Email sent ✓\n# 5.2s — Return response\n\n# User waited 5.2 seconds for a 0.1-second operation.\n# Response time: 5,200ms (should be ~200ms)`}
        errorType="Slow Response"
        accentColor="indigo"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Think about it: the user&apos;s account was created in 100ms. Everything after that
          — the email, the logging, the admin notification — the user doesn&apos;t need to
          wait for any of it. So why are you making them?
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Idea: Respond First, Work Later</h2>
          <p className="text-muted-foreground mb-4">
            Background tasks let you send the response immediately and do the slow
            stuff after the user has already moved on. Here&apos;s the flow:
          </p>
          <SimpleFlow
            steps={[
              { label: "Request arrives", detail: "POST /signup" },
              { label: "Create user", detail: "~100ms", status: "success" },
              { label: "Queue tasks", detail: "Email, logging...", status: "neutral" },
              { label: "Send response", detail: "User sees success!", status: "success" },
              { label: "Run tasks", detail: "After response sent", status: "neutral" },
            ]}
            accentColor="indigo"
          />
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        points={[
          "Background tasks run AFTER the response is sent — the user never waits",
          "You queue tasks during request handling, but they execute after the response",
          "Perfect for emails, logging, notifications — anything the user doesn't need to see immediately",
        ]}
        section="the core concept"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. Code walkthrough — basic usage */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Your First Background Task</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI has this built in. Just inject{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">BackgroundTasks</code> and
            add functions to it. They&apos;ll run after the response is sent.
          </p>
          <CodeBlock code={`from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def send_email(email: str, message: str):
    # This could take 5 seconds — doesn't matter!
    # The user already got their response.
    print(f"Sending email to {email}: {message}")

@app.post("/signup")
async def signup(email: str, background_tasks: BackgroundTasks):
    # Step 1: Do the fast stuff
    # create_user(email)  # ~100ms

    # Step 2: Queue the slow stuff
    background_tasks.add_task(send_email, email, "Welcome!")

    # Step 3: Respond immediately
    return {"message": "User created, email will be sent"}
    # ← Response goes out NOW. Email sends AFTER.`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          Notice the function signature:{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">background_tasks: BackgroundTasks</code>.
          FastAPI sees that type hint and automatically injects the background task
          manager. You don&apos;t create it yourself. Just declare it and use it.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* Multiple tasks */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Queuing Multiple Tasks</h2>
          <p className="text-muted-foreground mb-4">
            You can queue as many tasks as you want. They run sequentially in the order
            you added them — one finishes, the next starts.
          </p>
          <CodeBlock code={`def write_log(message: str):
    with open("log.txt", "a") as f:
        f.write(f"{message}\\n")

def notify_admin(user_email: str):
    send_email("admin@example.com", f"New signup: {user_email}")

@app.post("/signup")
async def signup(email: str, background_tasks: BackgroundTasks):
    # Queue them up — they run in this order AFTER response
    background_tasks.add_task(send_email, email, "Welcome!")
    background_tasks.add_task(write_log, f"New user: {email}")
    background_tasks.add_task(notify_admin, email)

    return {"message": "Signup complete"}
    # User gets this instantly. Three tasks run behind the scenes.`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "add_task() takes a function and its arguments — the function runs after the response",
          "Multiple tasks run sequentially in the order they were added",
          "The response time is now independent of how many background tasks you queue",
        ]}
        section="basic background tasks"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Go Deeper: Background tasks in dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Tasks in Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s something neat: your dependencies can also queue background tasks.
            FastAPI uses the same{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">BackgroundTasks</code> instance
            across your endpoint and all its dependencies.
          </p>
          <CodeBlock code={`async def log_request(
    background_tasks: BackgroundTasks,
    q: str | None = None,
):
    if q:
        # This dependency queues a background task
        background_tasks.add_task(write_log, f"Query: {q}")

@app.get("/items")
async def list_items(
    background_tasks: BackgroundTasks,
    q: str | None = Depends(log_request),
):
    # Your endpoint adds its own task too
    background_tasks.add_task(write_log, "Items listed")
    return items
    # Both tasks run after the response — dep's task first`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          Background tasks run <strong>in the same process</strong> as your API. If a
          background task hogs the CPU or crashes, it can affect your API&apos;s performance.
          For heavy workloads (processing videos, sending thousands of emails), use a
          proper task queue like Celery or Dramatiq instead.
        </p>
      </ConversationalCallout>

      <AhaMoment
        setup="If background tasks run in the same process, aren't they basically just 'deferred' work?"
        reveal="Exactly. Background tasks aren't magic parallelism — they're just work that happens after the response. Think of them as a 'to-do list' that FastAPI processes when the response is already on its way to the client. For lightweight tasks (emails, logging, webhooks), this is perfect. For anything that could take minutes or needs reliability (retries, persistence), you need a real task queue."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive: Background Task Timeline */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It: Background Task Flow</h2>
          <p className="text-muted-foreground mb-4">
            Watch how FastAPI sends the response immediately, then runs email, logging, and notification tasks in the background — the client never waits.
          </p>
          <BackgroundTaskTimeline />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If a background task raises an exception after the response was already sent, does the user see a 500 error?"
        options={[
          {
            label: "Yes — the server sends an error to the client",
            correct: false,
            explanation: "The response is already gone. The server can't take it back.",
          },
          {
            label: "No — the exception only appears in server logs",
            correct: true,
            explanation: "The response was sent before the task even started. The client is long gone.",
          },
          {
            label: "It depends on whether the task is sync or async",
            correct: false,
            explanation: "Doesn't matter — the response is already sent either way.",
          },
        ]}
        hint="Think about the timeline: when does the response leave vs when does the task run?"
        answer="No. The response is already gone — the user got their 200 OK. The background task exception shows up only in your server logs. This means background task failures are silent from the user's perspective. Always add try/except with logging in background tasks, or you'll have invisible failures."
        className="mb-8"
      />

      <AhaMoment
        setup="So background task errors are invisible to users... that sounds dangerous."
        reveal="It is! This is one of the most common production bugs: a background task fails silently for weeks, and nobody notices until someone asks 'why aren't welcome emails being sent?' Always wrap your background tasks in try/except blocks and log the errors. Better yet, add monitoring alerts for background task failures."
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">After Response</p>
              <p className="text-xs text-muted-foreground">Tasks run after the response is sent — no client waiting</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Sequential</p>
              <p className="text-xs text-muted-foreground">Multiple tasks run in the order they were added</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">In-Process</p>
              <p className="text-xs text-muted-foreground">Runs in the same process — use Celery for heavy workloads</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Use Cases</p>
              <p className="text-xs text-muted-foreground">Email, logging, cache invalidation, webhook notifications</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
