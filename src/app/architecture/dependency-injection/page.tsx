"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Dependencies</h2>
          <p className="text-muted-foreground mb-4">A dependency is just a callable that FastAPI runs before your endpoint.</p>
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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sub-Dependencies</h2>
          <p className="text-muted-foreground mb-4">Dependencies can depend on other dependencies, forming a chain.</p>
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

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Yield Dependencies</h2>
          <p className="text-muted-foreground mb-4">Use yield for dependencies that need cleanup (database sessions, file handles).</p>
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

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Depends()</p>
              <p className="text-xs text-muted-foreground">Declare dependencies as function parameters</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Composable</p>
              <p className="text-xs text-muted-foreground">Dependencies can depend on other dependencies</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Yield + Cleanup</p>
              <p className="text-xs text-muted-foreground">Use yield for resources that need cleanup after use</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Cacheable</p>
              <p className="text-xs text-muted-foreground">Same dependency called twice in one request runs only once</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
