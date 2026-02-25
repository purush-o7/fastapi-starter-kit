"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
const WorkerArchitectureViz = dynamic(
  () => import("../_components/worker-architecture-viz").then(m => m.WorkerArchitectureViz),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";

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
          Your API crashed at 3 AM. No auto-restart. No backup process. Four hours of downtime before anyone noticed.
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario={`You deploy with "uvicorn main:app" in production. It works fine until your single process crashes after a memory leak. No auto-restart. No load distribution. Your entire API is down and nobody knows.`}
        error={`# Production server (single uvicorn process):\n$ uvicorn main:app --host 0.0.0.0 --port 8000\n\n# 3:47 AM — Process crashes due to memory leak\nMemoryError: Unable to allocate 512 MiB\n\n# No process manager → No auto-restart\n# API is DOWN. No one is alerted.\n# Users see: ERR_CONNECTION_REFUSED\n# Duration of outage: 4 hours (until someone checks manually)`}
        errorType="Single Point of Failure"
        accentColor="lime"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          One process. One point of failure. When it dies, everything dies.
          How do production apps avoid this? They use a process manager to
          keep multiple copies of the app running — and restart any that crash.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Two Tools, Two Jobs</h2>
          <p className="text-muted-foreground mb-4">
            Uvicorn and Gunicorn do completely different things. Understanding which does
            what is the key to a production-ready deployment.
          </p>

          <SimpleFlow
            steps={[
              { label: "Gunicorn", detail: "The manager. Spawns workers, monitors health, restarts crashes.", status: "neutral" },
              { label: "Uvicorn Worker 1", detail: "Runs your app. Handles requests.", status: "success" },
              { label: "Uvicorn Worker 2", detail: "Another copy. Same app.", status: "success" },
              { label: "Uvicorn Worker 3", detail: "Yet another. Load distributed.", status: "success" },
            ]}
            direction="vertical"
            accentColor="lime"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Uvicorn is the ASGI server — it runs your app, handles HTTP/WebSocket, manages the event loop",
          "Gunicorn is the process manager — it spawns workers, monitors health, restarts crashes",
          "Together they give you multi-core utilization and fault tolerance",
        ]}
        section="uvicorn vs gunicorn"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Uvicorn */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Uvicorn: The Engine</h2>
          <p className="text-muted-foreground mb-4">
            Uvicorn is the process that actually runs your FastAPI app. It listens
            for connections, parses HTTP, and feeds requests to your async handlers.
            Think of it as the engine of a car — it does the actual work.
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

          <ConversationalCallout type="warning" className="mt-4">
            <p>
              A single Uvicorn process can handle thousands of concurrent connections.
              But it&apos;s still <strong>one process</strong>. If it crashes, your API is dead.
              If you have 4 CPU cores, you&apos;re only using one of them.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Gunicorn */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Gunicorn: The Fleet Manager</h2>
          <p className="text-muted-foreground mb-4">
            Gunicorn doesn&apos;t run your app directly. It spawns multiple worker processes,
            each running their own copy of your app. It&apos;s the fleet manager — it doesn&apos;t
            drive any cars, but it manages the drivers.
          </p>
          <CodeBlock
            code={`# Gunicorn with Uvicorn workers
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4

# What this means:
# main:app → your FastAPI application
# -k uvicorn.workers.UvicornWorker → each worker runs Uvicorn
# -w 4     → spawn 4 worker processes

# Each worker is a separate process with its own event loop
# 4 workers on 4 cores = full CPU utilization
# Worker crashes? Gunicorn restarts it automatically.`}
            filename="terminal"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why not just run 4 separate uvicorn commands manually?"
        reveal="You could, but who restarts them when they crash? Who monitors their health? Who distributes incoming connections? Gunicorn does all of this automatically. It's a battle-tested process manager that handles spawning, health checks, graceful restarts, and signal handling (SIGTERM for shutdown, SIGHUP for reload). Doing this manually is error-prone and fragile."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "Uvicorn alone = great for dev, risky for production (single point of failure)",
          "Gunicorn + Uvicorn workers = multi-core utilization with automatic crash recovery",
          "Gunicorn handles the hard stuff: spawning, health checks, graceful restarts",
        ]}
        section="production deployment"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* When to use which */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">When to Use Which</h2>
          <p className="text-muted-foreground mb-4">
            The right choice depends on where you&apos;re deploying. Here&apos;s the cheat sheet:
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

      <ConversationalCallout type="story" className="mb-8">
        <p>
          The Docker approach is increasingly popular. Instead of one server running
          4 Gunicorn workers, you run 4 containers each with one Uvicorn process.
          Kubernetes handles the &quot;process management&quot; that Gunicorn would. If a container
          crashes, Kubernetes restarts it. Same concept, different level.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* Full production command */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: The Full Production Setup</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s what a production Gunicorn + Uvicorn deployment looks like with
            all the important options spelled out:
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

      <WhatYouJustLearned
        points={[
          "Development: uvicorn with --reload. Production: gunicorn + uvicorn workers.",
          "Docker changes the game: one process per container, scale with orchestration",
          "--timeout, --graceful-timeout, and logging flags are critical for production",
        ]}
        section="deployment patterns"
        className="mb-8"
      />

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

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="You have a 4-core server. Should you run 4 Uvicorn workers or 8?"
        options={[
          {
            label: "4 workers — one per core, no competition",
            correct: false,
            explanation: "For I/O-bound work, you're leaving throughput on the table.",
          },
          {
            label: "9 workers — the formula is (2 x cores) + 1",
            correct: true,
            explanation: "For I/O-bound APIs, workers spend most of their time waiting. More workers means better utilization.",
          },
          {
            label: "As many as possible — more workers = more throughput",
            correct: false,
            explanation: "Too many workers waste memory and cause context-switching overhead.",
          },
        ]}
        hint="Think about what your workers spend most of their time doing."
        answer="The classic formula is 2 * CPU_CORES + 1, so 9 workers for 4 cores. But this is for I/O-bound workloads (most APIs). For CPU-bound work (ML inference, image processing), stick closer to CPU_CORES (4). More workers than cores means they compete for CPU time. Fewer means you're leaving throughput on the table. Monitor and tune based on your actual workload."
        className="mb-8"
      />

      <AhaMoment
        setup="Why does the formula use 2x cores and not 1x for async workers that already handle concurrency?"
        reveal="Great question! Even though each async worker handles many concurrent connections, the worker process still occasionally blocks — garbage collection, CPU work, synchronous middleware, or def endpoints running in the thread pool. Having 2x workers means when one worker is briefly blocked, others pick up the slack. For a purely async app with zero blocking, fewer workers (closer to core count) might work. But 2n+1 is a safe default because real apps always have some blocking."
        className="mb-8"
      />

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
