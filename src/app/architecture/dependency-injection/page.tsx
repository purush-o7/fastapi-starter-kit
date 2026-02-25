"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { RoughHighlight } from "@/components/rough-highlight";
const DependencyTree = dynamic(
  () => import("../_components/dependency-tree").then(m => m.DependencyTree),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import autoAnimate from "@formkit/auto-animate";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

function AutoAnimateGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current, { duration: 400, easing: "ease-out" });
    }
  }, []);
  return <div ref={parent} className={className}>{children}</div>;
}

export default function DependencyInjectionPage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Dependency Injection</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Dependency injection in FastAPI lets you declare what your endpoint needs, and the framework provides it. Database sessions, auth, pagination — all handled through Depends().
        </TextEffect>
      </div>

      {/* 1. Failure Hook */}
      <WhatCouldGoWrong
        scenario="Every endpoint needs a database session. You copy-paste the session creation code into 30 endpoints. One day you change the connection string and miss 3 endpoints. They crash at 2 AM when the night batch job hits them."
        error={`# 2:47 AM — Alert from production\n\nsqlalchemy.exc.OperationalError: (psycopg2.OperationalError)\ncould not connect to server: Connection refused\n  Is the server running on host "old-db.internal" and accepting\n  TCP/IP connections on port 5432?\n\n# Endpoint: POST /reports/generate\n# This endpoint still has the OLD connection string.\n# You updated 27 out of 30 endpoints. Missed 3.`}
        errorType="Connection Error"
        accentColor="purple"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>What if you could define your database connection <em>once</em>, and every endpoint that needs it just... gets it? No copy-pasting. No hunting through files. Change the connection string in one place and every endpoint picks it up automatically.</p>
      </ConversationalCallout>

      {/* 3. Mental model — two approaches side by side */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Two Approaches, One Winner</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the difference between copy-pasting and dependency injection. Same problem, wildly different outcomes.
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wider">The copy-paste way</p>
              <SimpleFlow
                steps={[
                  { label: "Copy-paste", detail: "30 files get the same code", status: "neutral" },
                  { label: "Change one thing", detail: "New connection string", status: "neutral" },
                  { label: "Miss 3 endpoints", detail: "Find-and-replace isn't perfect", status: "error" },
                  { label: "2 AM crash", detail: "Production down", status: "error" },
                ]}
                className="mb-2"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">The dependency injection way</p>
              <SimpleFlow
                steps={[
                  { label: "1 function", detail: "Define it once with Depends()", status: "neutral" },
                  { label: "Change once", detail: "Update the one function", status: "neutral" },
                  { label: "All updated", detail: "Every endpoint uses the new version", status: "success" },
                ]}
                accentColor="purple"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Problem"
        points={[
          "Copy-pasting setup code across endpoints creates a maintenance nightmare",
          "Missing even one endpoint during a change can cause production crashes",
          "Dependency injection means defining shared logic once and injecting it everywhere",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Basic Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            A dependency is just a{" "}
            <RoughHighlight type="underline" color="rgba(168, 85, 247, 0.6)" strokeWidth={2}>callable that FastAPI runs before your endpoint</RoughHighlight>. You declare what you need using{" "}
            <RoughHighlight type="box" color="rgba(168, 85, 247, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Depends()</code>
            </RoughHighlight>{" "}
            and FastAPI handles the rest. That&apos;s the entire mental model.
          </p>
          <CodeBlock code={`from fastapi import Depends, FastAPI

app = FastAPI()

# Step 1: Define a function that returns what you need
async def common_parameters(
    skip: int = 0,
    limit: int = 100,
):
    return {"skip": skip, "limit": limit}

# Step 2: Declare it as a dependency — FastAPI calls it for you
@app.get("/items")
async def list_items(params: dict = Depends(common_parameters)):
    return {"params": params}

# Step 3: Reuse it anywhere — same function, zero copy-paste
@app.get("/users")
async def list_users(params: dict = Depends(common_parameters)):
    return {"params": params}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>Notice how <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">common_parameters</code> takes query params <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">skip</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">limit</code>? FastAPI automatically extracts those from the request URL. Your dependency can use all the same parameter types as your endpoint — query params, headers, body, path params — everything.</p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Annotated Pattern */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Annotated Pattern</h2>
          <p className="text-muted-foreground mb-4">
            Python 3.9+ introduced{" "}
            <RoughHighlight type="highlight" color="rgba(168, 85, 247, 0.15)" animationDuration={1200}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Annotated</code>
            </RoughHighlight>
            , which FastAPI adopted as the{" "}
            <RoughHighlight type="underline" color="rgba(52, 211, 153, 0.6)" strokeWidth={2}>recommended way to declare dependencies</RoughHighlight>.
            Instead of repeating <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Depends(common_parameters)</code> everywhere, you create a reusable type alias.
          </p>
          <CodeBlock code={`from typing import Annotated
from fastapi import Depends, FastAPI

app = FastAPI()

async def common_parameters(
    skip: int = 0,
    limit: int = 100,
):
    return {"skip": skip, "limit": limit}

# Create a reusable type alias — define the injection ONCE
CommonParams = Annotated[dict, Depends(common_parameters)]

# Now it's just a type hint — clean and readable
@app.get("/items")
async def list_items(params: CommonParams):
    return {"params": params}

@app.get("/users")
async def list_users(params: CommonParams):
    return {"params": params}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="Dependency Basics"
        points={[
          "Depends() tells FastAPI to call a function and inject its return value",
          "Dependencies can use query params, headers, body — anything an endpoint can",
          "Annotated[Type, Depends()] creates reusable type aliases for cleaner code",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Sub-Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sub-Dependencies: Chains of Trust</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s where it gets powerful. Dependencies can{" "}
            <RoughHighlight type="underline" color="rgba(168, 85, 247, 0.5)" strokeWidth={2}>depend on other dependencies</RoughHighlight>.
            Your endpoint needs a user? That user comes from a token. That token needs a database session. FastAPI resolves the entire chain automatically.
          </p>
          <CodeBlock code={`# Layer 1: Database session
async def get_db():
    db = SessionLocal()
    try:
        yield db            # Injected into anything that needs it
    finally:
        db.close()          # Cleanup after the request

# Layer 2: Current user (depends on Layer 1)
async def get_current_user(
    token: str = Header(),
    db: Session = Depends(get_db),  # FastAPI resolves get_db first
):
    user = db.query(User).filter_by(token=token).first()
    if not user:
        raise HTTPException(401)
    return user

# Layer 3: Your endpoint (depends on Layer 2, which depends on Layer 1)
@app.get("/me")
async def read_me(user: User = Depends(get_current_user)):
    # FastAPI resolved: get_db → get_current_user → read_me
    return user`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="If get_current_user and get_current_admin both depend on get_db, does FastAPI create two database sessions?"
        reveal="No! FastAPI caches dependency results within a single request. If get_db is called twice in the same request chain, FastAPI reuses the first result. One request = one database session, no matter how many dependencies need it. This is called 'dependency caching' and it's on by default."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Class-Based Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Class-Based Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes you need a{" "}
            <RoughHighlight type="highlight" color="rgba(168, 85, 247, 0.12)" animationDuration={1000}>configurable dependency</RoughHighlight>.
            Maybe your items endpoint allows up to 100 results per page, but your logs endpoint caps at 50. Same pagination logic, different limits.
          </p>
          <CodeBlock code={`from fastapi import Depends, Query

class Paginator:
    def __init__(self, max_limit: int = 100):
        self.max_limit = max_limit

    # FastAPI calls this on each request
    def __call__(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1),
    ) -> dict:
        return {
            "skip": skip,
            "limit": min(limit, self.max_limit),  # Cap it
        }

# Configure once, inject everywhere
paginate_items = Paginator(max_limit=100)  # Items: up to 100
paginate_logs = Paginator(max_limit=50)    # Logs: up to 50

@app.get("/items")
async def list_items(pagination: dict = Depends(paginate_items)):
    return pagination

@app.get("/logs")
async def list_logs(pagination: dict = Depends(paginate_logs)):
    return pagination`} filename="dependencies.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 8. Yield Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Yield Dependencies: Setup + Cleanup</h2>
          <p className="text-muted-foreground mb-4">
            Use{" "}
            <RoughHighlight type="box" color="rgba(52, 211, 153, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code>
            </RoughHighlight>{" "}
            for dependencies that need{" "}
            <RoughHighlight type="underline" color="rgba(245, 158, 11, 0.6)" strokeWidth={2}>cleanup after the response</RoughHighlight>.
            Database sessions, file handles, temporary resources — anything you open must be closed.
          </p>
          <CodeBlock code={`async def get_db():
    db = SessionLocal()
    try:
        yield db  # <-- Injected into your endpoint
    finally:
        db.close()  # <-- Runs AFTER the response is sent
        # Even if the endpoint raised an exception!

@app.get("/items")
async def list_items(db: Session = Depends(get_db)):
    # db is ready to use — FastAPI opened it for you
    return db.query(Item).all()
    # After this returns, FastAPI runs db.close() automatically`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>The code after <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code> always runs — even if your endpoint throws an exception. That&apos;s why you wrap it in <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">try/finally</code>. If you forget the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">finally</code>, a failed request could leak a database connection.</p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="Advanced Patterns"
        points={[
          "Dependencies can depend on other dependencies — FastAPI resolves the full chain",
          "Class-based dependencies let you create configurable, reusable logic",
          "yield dependencies handle setup AND cleanup — perfect for DB sessions",
          "FastAPI caches dependency results per-request, so the same dep isn't called twice",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 9. Router-Level Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Router-Level Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Apply a dependency to{" "}
            <RoughHighlight type="highlight" color="rgba(168, 85, 247, 0.15)" animationDuration={1000}>every route in a router at once</RoughHighlight>.
            This is how you protect entire sections of your API — no need to add{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Depends()</code> to each endpoint.
          </p>
          <CodeBlock code={`from fastapi import APIRouter, Depends, Header, HTTPException

async def verify_admin_token(x_admin_token: str = Header()):
    if x_admin_token != "admin-secret":
        raise HTTPException(status_code=403, detail="Not an admin")

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_admin_token)],  # Applies to ALL routes
)

@router.get("/stats")
async def admin_stats():
    # verify_admin_token runs automatically
    return {"users": 142, "active": 89}

@router.delete("/cache")
async def clear_cache():
    # verify_admin_token runs here too — zero extra code
    return {"status": "cleared"}`} filename="routers/admin.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 10. Dependency Overrides for Testing */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Testing with Overrides</h2>
          <p className="text-muted-foreground mb-4">
            One of DI&apos;s biggest benefits:{" "}
            <RoughHighlight type="highlight" color="rgba(52, 211, 153, 0.15)" animationDuration={1200}>swap out real dependencies for fakes in tests</RoughHighlight>.
            No monkey-patching, no mocking frameworks — just tell FastAPI &quot;use this instead.&quot;
          </p>
          <CodeBlock code={`from fastapi.testclient import TestClient
from main import app, get_db

# Create a fake DB for testing
def get_test_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Swap the real DB for a test DB — one line!
app.dependency_overrides[get_db] = get_test_db

client = TestClient(app)

def test_list_items():
    response = client.get("/items")
    assert response.status_code == 200

# Clean up after tests
app.dependency_overrides.clear()`} filename="test_main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why is dependency injection better for testing than just mocking?"
        reveal="With mocking, you're patching internal implementation details — if you rename a module or refactor, your mocks break. With dependency overrides, you're swapping at the interface level. Your test says 'when the app needs a DB, use this fake one.' The test doesn't care how the endpoint is implemented — only what it depends on."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Failure Deep Dive */}
      <FailureDeepDive
        title="Circular Dependency Crash"
        scenario="You create two dependencies that depend on each other. Everything works fine... until someone actually hits the endpoint."
        code={`async def get_service_a(
    b = Depends(get_service_b),  # A needs B
):
    return ServiceA(b)

async def get_service_b(
    a = Depends(get_service_a),  # B needs A — circular!
):
    return ServiceB(a)

@app.get("/data")
async def get_data(a = Depends(get_service_a)):
    return a.fetch()`}
        error={`RecursionError: maximum recursion depth exceeded\n\n# FastAPI tried to resolve:\n#   get_service_a → needs get_service_b\n#   get_service_b → needs get_service_a\n#   get_service_a → needs get_service_b\n#   ... infinite loop until Python crashes`}
        explanation="FastAPI's dependency injection doesn't detect circular dependencies at startup — unlike frameworks like Spring. It discovers the cycle at request time by trying to resolve the chain, hitting Python's recursion limit, and crashing."
        fix="Design your dependencies as a DAG (directed acyclic graph). If A and B need to share logic, extract it into a third dependency C that both depend on."
        fixCode={`# Extract shared logic into a common dependency
async def get_shared_config():
    return SharedConfig()

async def get_service_a(
    config = Depends(get_shared_config),
):
    return ServiceA(config)

async def get_service_b(
    config = Depends(get_shared_config),
):
    return ServiceB(config)

# A and B share config, no circular dependency`}
        filename="main.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 11. Interactive Visualization — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It In Action</h2>
          <p className="text-muted-foreground mb-4">
            When a request arrives, FastAPI{" "}
            <RoughHighlight type="underline" color="rgba(168, 85, 247, 0.6)" strokeWidth={2}>resolves each dependency in order</RoughHighlight>
            , like stations on a pipeline. Each station produces a value and passes it to the next.
            Hit <strong>Send Request</strong> and watch the pipeline flow — try the{" "}
            <RoughHighlight type="circle" color="rgba(52, 211, 153, 0.4)" strokeWidth={1.5} padding={5}>Admin</RoughHighlight>{" "}
            preset to see a 3-deep chain.
          </p>
          <DependencyTree />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If dependency A depends on B, and B depends on A, what happens when FastAPI tries to resolve the chain?"
        options={[
          {
            label: "FastAPI detects the cycle at startup and raises an error",
            correct: false,
            explanation: "Unlike Spring or other DI frameworks, FastAPI doesn't analyze the dependency graph at startup.",
          },
          {
            label: "It resolves to None for the circular reference",
            correct: false,
            explanation: "FastAPI doesn't have a fallback for circular dependencies — it just keeps trying to resolve.",
          },
          {
            label: "It recurses until Python hits RecursionError",
            correct: true,
            explanation: "Exactly. FastAPI discovers the cycle at request time by hitting Python's recursion limit.",
          },
          {
            label: "It picks one and runs it first, breaking the cycle",
            correct: false,
            explanation: "FastAPI doesn't have cycle-breaking logic. It follows the chain blindly.",
          },
        ]}
        hint="Think about what happens when FastAPI tries to call A, which needs B, which needs A..."
        answer="FastAPI's dependency injection doesn't have circular dependency detection — it'll recurse until you hit Python's recursion limit and crash with RecursionError. Unlike frameworks like Spring that detect cycles at startup, FastAPI discovers this at request time. Always design dependencies as a DAG (directed acyclic graph)."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points — KEPT */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <AutoAnimateGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
              <p className="text-sm font-medium mb-1">Depends()</p>
              <p className="text-xs text-muted-foreground">Declare dependencies as function parameters</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
              <p className="text-sm font-medium mb-1">Composable</p>
              <p className="text-xs text-muted-foreground">Dependencies can depend on other dependencies</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
              <p className="text-sm font-medium mb-1">Yield + Cleanup</p>
              <p className="text-xs text-muted-foreground">Use yield for resources that need cleanup after use</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
              <p className="text-sm font-medium mb-1">Cacheable</p>
              <p className="text-xs text-muted-foreground">Same dependency called twice in one request runs only once</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
              <p className="text-sm font-medium mb-1">Annotated</p>
              <p className="text-xs text-muted-foreground">Use Annotated[Type, Depends()] for clean, reusable injection</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-purple-500/30 hover:bg-purple-500/5">
              <p className="text-sm font-medium mb-1">Overridable</p>
              <p className="text-xs text-muted-foreground">Swap dependencies in tests with app.dependency_overrides</p>
            </div>
          </AutoAnimateGrid>
        </section>
      </ScrollReveal>
    </div>
  );
}
