"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { BackgroundTaskTimeline } from "../_components/background-task-timeline";

export default function BackgroundTasksPage() {
  return (
    <div className="max-w-4xl ambient-async">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Background Tasks</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Background tasks run after the response is sent to the client. Perfect for sending emails, writing logs, or triggering notifications without slowing down the response.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Background Tasks</h2>
          <p className="text-muted-foreground mb-4">Inject BackgroundTasks and add functions to run after the response.</p>
          <CodeBlock code={`from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def send_email(email: str, message: str):
    # Simulate sending email
    print(f"Sending email to {email}: {message}")

@app.post("/signup")
async def signup(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email, email, "Welcome!")
    return {"message": "User created, email will be sent"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Multiple Tasks</h2>
          <p className="text-muted-foreground mb-4">Add multiple background tasks that run sequentially after the response.</p>
          <CodeBlock code={`def write_log(message: str):
    with open("log.txt", "a") as f:
        f.write(f"{message}\\n")

def notify_admin(user_email: str):
    send_email("admin@example.com", f"New signup: {user_email}")

@app.post("/signup")
async def signup(email: str, background_tasks: BackgroundTasks):
    # Tasks run in order after response is sent
    background_tasks.add_task(send_email, email, "Welcome!")
    background_tasks.add_task(write_log, f"New user: {email}")
    background_tasks.add_task(notify_admin, email)
    return {"message": "Signup complete"}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Background Tasks in Dependencies</h2>
          <p className="text-muted-foreground mb-4">Dependencies can also add background tasks using the same BackgroundTasks injection.</p>
          <CodeBlock code={`async def log_request(
    background_tasks: BackgroundTasks,
    q: str | None = None,
):
    if q:
        background_tasks.add_task(write_log, f"Query: {q}")

@app.get("/items")
async def list_items(
    background_tasks: BackgroundTasks,
    q: str | None = Depends(log_request),
):
    background_tasks.add_task(write_log, "Items listed")
    return items`} filename="main.py" />
        </section>
      </ScrollReveal>

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
