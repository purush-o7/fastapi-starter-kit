"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { RoughHighlight } from "@/components/rough-highlight";
import { AutoAnimateGrid } from "@/components/auto-animate-grid";
import { ProjectExplorerViz } from "../_components/project-explorer-viz";

const mistakes: Mistake[] = [
  {
    title: "Circular imports between routers and main",
    subtitle: "Importing the app instance inside router files",
    wrongCode: `# routers/users.py
from main import app  # Circular import!

@app.get("/users")
async def get_users():
    return []`,
    rightCode: `# routers/users.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_users():
    return []

# main.py
from routers import users
app.include_router(users.router, prefix="/users")`,
    filename: "routers/users.py",
    explanation: "Never import the app instance in router files — this creates circular imports. Use APIRouter() in each router file and include_router() in main.py to wire them together.",
  },
  {
    title: "Putting everything in main.py",
    subtitle: "Defining models, schemas, and dozens of endpoints in one file",
    wrongCode: `# main.py — 500+ lines with everything mixed together
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
# ... 20 more imports

app = FastAPI()

class UserDB(Base): ...
class ItemDB(Base): ...
class UserSchema(BaseModel): ...
class ItemSchema(BaseModel): ...

@app.get("/users") ...
@app.post("/users") ...
@app.get("/items") ...
# ... 30 more endpoints`,
    rightCode: `# main.py — clean and focused
from fastapi import FastAPI
from routers import users, items

app = FastAPI(title="My API")

app.include_router(users.router, prefix="/users")
app.include_router(items.router, prefix="/items")

# Models in models/, Schemas in schemas/, Endpoints in routers/`,
    filename: "main.py",
    explanation: "A 500-line main.py becomes impossible to navigate. Split by responsibility: routers for endpoints, schemas for Pydantic models, models for database tables. main.py should just wire things together.",
  },
];

export default function ProjectStructurePage() {
  return (
    <div className="max-w-4xl ambient-fundamentals">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Project Structure</h1>
          <Badge variant="outline">Fundamentals</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          How to organize your FastAPI application as it grows from a single file to a production-ready project.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Single File is Fine (At First)</h2>
          <p className="text-muted-foreground mb-4">
            When you&apos;re learning FastAPI, a single <code className="text-sm bg-muted px-1.5 py-0.5 rounded">main.py</code> file is perfectly fine. Keep things simple until <RoughHighlight type="underline" color="#f43f5e">complexity demands structure</RoughHighlight>. But as your app grows beyond a handful of endpoints, you&apos;ll need to split things up.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Recommended Structure</h2>
          <p className="text-muted-foreground mb-4">
            As your project grows, <RoughHighlight type="highlight" color="#f43f5e">organize code by responsibility</RoughHighlight>. Routers handle endpoints, schemas define data shapes, models map to <RoughHighlight type="box" color="#f43f5e">database tables</RoughHighlight>, and config manages settings.
          </p>
          <CodeBlock
            code={`my_api/
├── main.py              # App entry point
├── config.py            # Settings & env vars
├── requirements.txt     # Dependencies
├── .env                 # Secrets (gitignored)
├── routers/
│   ├── __init__.py
│   ├── users.py         # /users endpoints
│   └── items.py         # /items endpoints
├── schemas/
│   ├── __init__.py
│   ├── user.py          # User Pydantic models
│   └── item.py          # Item Pydantic models
├── models/
│   ├── __init__.py
│   └── database.py      # SQLAlchemy models
└── dependencies.py      # Shared dependencies`}
            filename="project-layout"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Explore: Interactive Project Tree</h2>
          <p className="text-muted-foreground mb-4">Click any file or folder to see what belongs inside and why it lives there.</p>
          <ProjectExplorerViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What Goes Where</h2>
          <p className="text-muted-foreground mb-2">
            Each directory has a clear responsibility:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>routers/</strong> — Endpoint definitions grouped by domain (users, items, auth)</li>
            <li><strong>schemas/</strong> — Pydantic models for request/response validation</li>
            <li><strong>models/</strong> — Database table definitions (SQLAlchemy, Tortoise, etc.)</li>
            <li><strong>config.py</strong> — Settings and environment variable loading</li>
            <li><strong>dependencies.py</strong> — Shared dependency injection functions</li>
          </ul>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Wiring It Together</h2>
          <p className="text-muted-foreground mb-4">
            Your <code className="text-sm bg-muted px-1.5 py-0.5 rounded">main.py</code> becomes the central hub that imports and mounts all routers onto the main FastAPI app instance.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI
from routers import users, items

app = FastAPI(title="My API", version="1.0.0")

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(items.router, prefix="/items", tags=["Items"])`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <AutoAnimateGrid className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Start Simple</p>
              <p className="text-xs text-muted-foreground">A single main.py is fine for learning and small projects</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Split When It Grows</p>
              <p className="text-xs text-muted-foreground">Organize by responsibility once you have more than a few endpoints</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Routers Organize Endpoints</p>
              <p className="text-xs text-muted-foreground">Group related endpoints into separate router files by domain</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Schemas Validate Data</p>
              <p className="text-xs text-muted-foreground">Pydantic models in the schemas/ folder define your data contracts</p>
            </div>
          </AutoAnimateGrid>
        </section>
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
