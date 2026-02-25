"use client";
import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { RoughHighlight } from "@/components/rough-highlight";
import { DependencyTree } from "../_components/dependency-tree";
import autoAnimate from "@formkit/auto-animate";

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

      {/* 1. Basic Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            A dependency is just a <RoughHighlight type="underline" color="rgba(168, 85, 247, 0.6)" strokeWidth={2}>callable that FastAPI runs before your endpoint</RoughHighlight>. You declare what you need using{" "}
            <RoughHighlight type="box" color="rgba(168, 85, 247, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Depends()</code>
            </RoughHighlight>{" "}
            and FastAPI handles the rest.
          </p>
          <CodeBlock code={`from fastapi import Depends, FastAPI

app = FastAPI()

async def common_parameters(
    skip: int = 0,
    limit: int = 100,
):
    return {"skip": skip, "limit": limit}

@app.get("/items")
async def list_items(params: dict = Depends(common_parameters)):
    return {"params": params}

@app.get("/users")
async def list_users(params: dict = Depends(common_parameters)):
    return {"params": params}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 2. Annotated Pattern */}
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
            Instead of default values, you embed the injection metadata in the type itself — making it{" "}
            <RoughHighlight type="circle" color="rgba(168, 85, 247, 0.4)" strokeWidth={1.5} padding={4}>reusable as a type alias</RoughHighlight>.
          </p>
          <CodeBlock code={`from typing import Annotated
from fastapi import Depends, FastAPI

app = FastAPI()

async def common_parameters(
    skip: int = 0,
    limit: int = 100,
):
    return {"skip": skip, "limit": limit}

# Create a reusable type alias
CommonParams = Annotated[dict, Depends(common_parameters)]

@app.get("/items")
async def list_items(params: CommonParams):
    return {"params": params}

@app.get("/users")
async def list_users(params: CommonParams):
    return {"params": params}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 3. Sub-Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sub-Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Dependencies can{" "}
            <RoughHighlight type="underline" color="rgba(168, 85, 247, 0.5)" strokeWidth={2}>depend on other dependencies</RoughHighlight>,
            forming a chain. FastAPI resolves the entire tree automatically.
          </p>
          <CodeBlock code={`async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    token: str = Header(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter_by(token=token).first()
    if not user:
        raise HTTPException(401)
    return user

@app.get("/me")
async def read_me(user: User = Depends(get_current_user)):
    return user`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 4. Class-Based Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Class-Based Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            When you need a{" "}
            <RoughHighlight type="highlight" color="rgba(168, 85, 247, 0.12)" animationDuration={1000}>configurable dependency</RoughHighlight>,
            use a class with{" "}
            <RoughHighlight type="box" color="rgba(168, 85, 247, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">__call__</code>
            </RoughHighlight>.
            The constructor takes configuration, and FastAPI calls the instance like a function on each request.
          </p>
          <CodeBlock code={`from fastapi import Depends, Query

class Paginator:
    def __init__(self, max_limit: int = 100):
        self.max_limit = max_limit

    def __call__(
        self,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1),
    ) -> dict:
        return {
            "skip": skip,
            "limit": min(limit, self.max_limit),
        }

# Configure once, inject everywhere
paginate = Paginator(max_limit=50)

@app.get("/items")
async def list_items(pagination: dict = Depends(paginate)):
    return pagination

@app.get("/logs")
async def list_logs(pagination: dict = Depends(paginate)):
    return pagination`} filename="dependencies.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 5. Yield Dependencies */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Yield Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Use{" "}
            <RoughHighlight type="box" color="rgba(52, 211, 153, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code>
            </RoughHighlight>{" "}
            for dependencies that need{" "}
            <RoughHighlight type="underline" color="rgba(245, 158, 11, 0.6)" strokeWidth={2}>cleanup after the response</RoughHighlight>{" "}
            — database sessions, file handles, temporary resources.
          </p>
          <CodeBlock code={`async def get_db():
    db = SessionLocal()
    try:
        yield db  # Injected into endpoint
    finally:
        db.close()  # Cleanup after response

@app.get("/items")
async def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 6. Router-Level Dependencies */}
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
    dependencies=[Depends(verify_admin_token)],
)

@router.get("/stats")
async def admin_stats():
    # verify_admin_token runs automatically
    return {"users": 142, "active": 89}

@router.delete("/cache")
async def clear_cache():
    # verify_admin_token runs here too
    return {"status": "cleared"}`} filename="routers/admin.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 7. Dependency Overrides for Testing */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Dependency Overrides for Testing</h2>
          <p className="text-muted-foreground mb-4">
            One of DI&apos;s biggest benefits:{" "}
            <RoughHighlight type="highlight" color="rgba(52, 211, 153, 0.15)" animationDuration={1200}>swap out real dependencies for fakes in tests</RoughHighlight>.
            No monkey-patching, no mocking frameworks needed — just{" "}
            <RoughHighlight type="box" color="rgba(52, 211, 153, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">dependency_overrides</code>
            </RoughHighlight>.
          </p>
          <CodeBlock code={`from fastapi.testclient import TestClient
from main import app, get_db

def get_test_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Swap the real DB for a test DB
app.dependency_overrides[get_db] = get_test_db

client = TestClient(app)

def test_list_items():
    response = client.get("/items")
    assert response.status_code == 200

# Clean up after tests
app.dependency_overrides.clear()`} filename="test_main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 8. Interactive Visualization */}
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

      {/* 9. Key Points */}
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
