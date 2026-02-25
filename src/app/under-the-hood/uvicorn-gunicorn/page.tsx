"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { WorkerArchitectureViz } from "../_components/worker-architecture-viz";

const mistakes: Mistake[] = [
  {
    title: "Using --reload in production",
    subtitle: "The dev reload flag adds overhead and is unstable for prod",
    wrongCode: `# WRONG: --reload watches files and restarts on changes
# This adds overhead and can cause downtime
uvicorn main:app --reload --host 0.0.0.0 --port 8000`,
    rightCode: `# Development (with reload)
uvicorn main:app --reload

# Production (no reload, proper host/port)
uvicorn main:app --host 0.0.0.0 --port 8000

# Production multi-core
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4`,
    filename: "terminal",
    explanation: "The --reload flag watches your file system for changes and restarts the server. In production, this wastes resources and can cause unexpected restarts. Only use --reload during development.",
  },
  {
    title: "Not setting worker count based on CPU cores",
    subtitle: "Using arbitrary worker counts instead of a formula",
    wrongCode: `# Arbitrary number — might be too many or too few
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 20`,
    rightCode: `# Rule of thumb: (2 x CPU cores) + 1
# For a 4-core machine:
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 9

# Or calculate dynamically:
import multiprocessing
workers = multiprocessing.cpu_count() * 2 + 1`,
    filename: "terminal",
    explanation: "Too many workers waste memory and cause context-switching overhead. Too few waste CPU cores. The formula (2 x cores) + 1 is a good starting point. For async FastAPI apps, you can often use fewer workers since each handles many concurrent requests.",
  },
];

export default function UvicornGunicornPage() {
  return (
    <div className="max-w-4xl ambient-under-the-hood">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Uvicorn & Gunicorn</h1>
          <Badge variant="outline">Under the Hood</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Uvicorn runs your app. Gunicorn manages multiple copies of it. Together, they make FastAPI production-ready across all your CPU cores.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is Uvicorn?</h2>
          <p className="text-muted-foreground mb-4">
            Uvicorn is a lightning-fast ASGI server. It&apos;s the process that
            actually runs your FastAPI application — listening for connections,
            parsing HTTP, and feeding requests into your async handlers.
          </p>
          <p className="text-muted-foreground mb-4">
            Think of Uvicorn as the engine of a car. It does the actual work of
            processing requests using Python&apos;s event loop. One Uvicorn process
            can handle thousands of concurrent connections.
          </p>
          <CodeBlock
            code={`# Run your FastAPI app with Uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# What this means:
# main   → the file "main.py"
# app    → the FastAPI() instance in that file
# --reload  → restart on code changes (dev only!)
# --host    → listen on all interfaces
# --port    → listen on port 8000`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is Gunicorn?</h2>
          <p className="text-muted-foreground mb-4">
            Gunicorn (Green Unicorn) is a process manager. It doesn&apos;t run your
            app directly — it spawns and manages multiple worker processes, each
            running their own copy of your application.
          </p>
          <p className="text-muted-foreground mb-4">
            Think of Gunicorn as a fleet manager. It doesn&apos;t drive any cars
            itself, but it manages a fleet of drivers (workers), handling
            recruitment, health checks, and replacement if one crashes.
          </p>
          <CodeBlock
            code={`# Gunicorn with Uvicorn workers
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4

# What this means:
# main:app → your FastAPI application
# -k uvicorn.workers.UvicornWorker → each worker runs Uvicorn
# -w 4     → spawn 4 worker processes

# Each worker is a separate process with its own event loop
# 4 workers on 4 cores = full CPU utilization`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">When to Use Which</h2>
          <p className="text-muted-foreground mb-4">
            The right choice depends on your deployment context.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px]">Development</Badge>
                <p className="text-sm font-medium">Uvicorn with --reload</p>
              </div>
              <CodeBlock
                code={`uvicorn main:app --reload`}
                filename="terminal"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Auto-restarts on code changes. Single process, easy to debug.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px]">Production (single core)</Badge>
                <p className="text-sm font-medium">Uvicorn alone</p>
              </div>
              <CodeBlock
                code={`uvicorn main:app --host 0.0.0.0 --port 8000`}
                filename="terminal"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Single process, no reload overhead. Good for containers (one process per container).
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px]">Production (multi-core)</Badge>
                <p className="text-sm font-medium">Gunicorn + Uvicorn workers</p>
              </div>
              <CodeBlock
                code={`gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4`}
                filename="terminal"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Multiple worker processes utilize all CPU cores. Gunicorn handles process management.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px]">Docker</Badge>
                <p className="text-sm font-medium">Uvicorn directly</p>
              </div>
              <CodeBlock
                code={`# Dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# Scale by running multiple containers instead of multiple workers`}
                filename="Dockerfile"
              />
              <p className="text-xs text-muted-foreground mt-2">
                One process per container. Scale horizontally with Kubernetes or Docker Compose replicas.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Gunicorn + Uvicorn Pattern</h2>
          <p className="text-muted-foreground mb-4">
            This is the classic production setup: Gunicorn as the process manager,
            Uvicorn as the ASGI worker. Gunicorn handles worker lifecycle (spawning,
            health checks, graceful restarts) while each Uvicorn worker handles
            actual request processing.
          </p>
          <CodeBlock
            code={`# Full production command with all options
gunicorn main:app \\
    -k uvicorn.workers.UvicornWorker \\  # Use Uvicorn as worker
    -w 4 \\                              # 4 worker processes
    --bind 0.0.0.0:8000 \\              # Listen on all interfaces
    --timeout 120 \\                     # Worker timeout (seconds)
    --graceful-timeout 30 \\             # Graceful shutdown time
    --access-logfile - \\                # Log to stdout
    --error-logfile -                    # Errors to stdout

# Architecture:
# ┌─────────────────────────────────┐
# │  Gunicorn (Master Process)      │
# │  - Manages worker lifecycle     │
# │  - Handles signals (SIGTERM)    │
# │  - Restarts crashed workers     │
# ├─────────┬──────────┬────────────┤
# │ Worker 1│ Worker 2 │ Worker 3   │  (Uvicorn)
# │ (loop)  │ (loop)   │ (loop)     │
# │ ~1000   │ ~1000    │ ~1000      │  concurrent
# │ conns   │ conns    │ conns      │  connections
# └─────────┴──────────┴────────────┘`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive: Worker Architecture Visualizer */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Process Architecture</h2>
          <p className="text-muted-foreground mb-4">
            Toggle between Uvicorn solo and Gunicorn + Uvicorn to see how requests flow through each architecture.
            Hit &quot;Simulate Traffic&quot; to watch requests get distributed across workers in real time.
          </p>
          <WorkerArchitectureViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Uvicorn = ASGI Server</p>
              <p className="text-xs text-muted-foreground">Runs your app, handles HTTP/WebSocket, manages the event loop</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Gunicorn = Process Manager</p>
              <p className="text-xs text-muted-foreground">Spawns worker processes, monitors health, handles restarts</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Dev = Uvicorn Only</p>
              <p className="text-xs text-muted-foreground">Use --reload for auto-restart during development</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Prod = Gunicorn + Uvicorn</p>
              <p className="text-xs text-muted-foreground">Or scale with Docker containers running single Uvicorn processes</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
