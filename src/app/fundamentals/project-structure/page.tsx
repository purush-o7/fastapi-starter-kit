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
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { AhaMoment } from "@/components/aha-moment";
import { FailureDeepDive } from "@/components/failure-deep-dive";

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
          Your main.py is 2000 lines long. Your teammate just quit. Let&apos;s talk about how to organize a FastAPI project before it turns into a nightmare.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="Your FastAPI app is 2000 lines in a single main.py. A teammate needs to add a feature and spends 45 minutes just figuring out where anything lives."
        error={`ImportError: cannot import name 'get_db' from partially initialized module 'main'\n(most likely due to a circular import)`}
        errorType="ImportError"
        accentColor="rose"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Circular imports. The error message that makes you question your life choices. But it&apos;s actually a symptom of a bigger problem: everything is in one file, and everything depends on everything else. The fix isn&apos;t just &quot;move some imports around&quot; — it&apos;s learning how to structure your project so dependencies flow in one direction.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Transformation</h2>
          <p className="text-muted-foreground mb-4">
            Every growing FastAPI project goes through this journey. The question isn&apos;t <em>if</em> you&apos;ll need to split things up — it&apos;s <em>when</em>.
          </p>
          <SimpleFlow
            steps={[
              { label: "Single main.py", detail: "2000 lines, circular imports", status: "error" },
              { label: "Split by responsibility", detail: "routers/, models/, schemas/" },
              { label: "Modular structure", detail: "Clean, navigable, no conflicts", status: "success" },
            ]}
            accentColor="rose"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        points={[
          "A single file works fine for learning — but it doesn't scale",
          "Circular imports happen when files depend on each other in a loop",
          "The fix is organizing code so dependencies flow in one direction",
        ]}
        section="Why structure matters"
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Single File Is Fine (At First)</h2>
          <p className="text-muted-foreground mb-4">
            When you&apos;re learning FastAPI, a single <code className="text-sm bg-muted px-1.5 py-0.5 rounded">main.py</code> is perfectly fine. Don&apos;t over-engineer. Keep it simple until <RoughHighlight type="underline" color="#f43f5e">complexity demands structure</RoughHighlight>. But once you&apos;re past 5-10 endpoints, you&apos;ll start feeling the pain.
          </p>
          <CodeBlock
            code={`# This is totally fine when you're starting out!
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

# But once you have 20 endpoints, 5 models, and 3 services...
# things get messy fast.`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 5. The recommended structure */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Recommended Structure</h2>
          <p className="text-muted-foreground mb-4">
            As your project grows, <RoughHighlight type="highlight" color="#f43f5e">organize code by responsibility</RoughHighlight>. Routers handle endpoints, schemas define data shapes, models map to <RoughHighlight type="box" color="#f43f5e">database tables</RoughHighlight>, and config manages settings.
          </p>
          <CodeBlock
            code={`my_api/
├── main.py              # App entry point — just wires things together
├── config.py            # Settings & env vars
├── requirements.txt     # Dependencies
├── .env                 # Secrets (gitignored!)
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

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          Notice the pattern? Each folder has one job. <strong>routers/</strong> handles HTTP. <strong>schemas/</strong> handles data validation. <strong>models/</strong> handles the database. <strong>main.py</strong> just connects them. If someone asks &quot;where are the user endpoints?&quot; — the answer is always <code className="text-sm bg-muted px-1.5 py-0.5 rounded">routers/users.py</code>.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* Interactive visualization (KEEP as-is) */}
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
            Each directory has a clear job. Here&apos;s the rule of thumb:
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

      <WhatYouJustLearned
        points={[
          "Organize by responsibility: routers, schemas, models, config",
          "Each folder answers one question — 'where are the endpoints?' → routers/",
          "main.py becomes the hub that wires everything together",
        ]}
        section="Project layout"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Wiring it together */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Wiring It Together</h2>
          <p className="text-muted-foreground mb-4">
            Your <code className="text-sm bg-muted px-1.5 py-0.5 rounded">main.py</code> becomes a thin hub. It creates the app, imports the routers, and mounts them. That&apos;s it — no business logic, no models, no schemas.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI
from routers import users, items

app = FastAPI(title="My API", version="1.0.0")

# Each router handles its own domain
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(items.router, prefix="/items", tags=["Items"])

# That's it. main.py is done.
# All the real work happens in the router files.`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why does include_router use a prefix? Can't I just define the full path in the router?"
        reveal="You could — but then moving all user endpoints from /users to /api/v1/users means editing every single route. With a prefix on include_router, you change it in one place and every route in that router updates automatically. It's the same idea as not hardcoding values: single source of truth."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Failure deep dive — circular imports */}
      <FailureDeepDive
        title="The circular import trap"
        scenario="You create a router file and import the app instance from main.py. Main.py also imports from the router. Python can't resolve the loop."
        code={`# main.py
from fastapi import FastAPI
from routers.users import router  # imports from users.py

app = FastAPI()
app.include_router(router)

# routers/users.py
from main import app  # imports from main.py — CIRCULAR!

@app.get("/users")
async def get_users():
    return []`}
        error={`ImportError: cannot import name 'get_db' from partially initialized module 'main'
(most likely due to a circular import)`}
        explanation="main.py imports users.py, and users.py imports main.py. Python starts loading main.py, hits the import for users.py, starts loading that, hits the import for main.py (which isn't finished loading yet), and crashes."
        fix="Never import the app instance in router files. Use APIRouter() instead — it's a mini-app that gets mounted onto the main app later."
        fixCode={`# routers/users.py — use APIRouter, not the app instance
from fastapi import APIRouter

router = APIRouter()

@router.get("/")  # This becomes /users/ when mounted
async def get_users():
    return []

# main.py — import and mount
from fastapi import FastAPI
from routers.users import router

app = FastAPI()
app.include_router(router, prefix="/users")`}
        filename="routers/users.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="Your router imports from models, and models imports from database. Where should the DB engine live to avoid circular imports?"
        options={[
          { label: "In main.py alongside the app instance", correct: false, explanation: "This creates a risk of circular imports if any module imports from main.py." },
          { label: "In models/__init__.py", correct: false, explanation: "This mixes concerns — models should define tables, not manage connections." },
          { label: "In its own module like database.py or db/session.py", correct: true, explanation: "Exactly! A standalone module that doesn't import from your app code." },
          { label: "In the router file that needs it", correct: false, explanation: "Multiple routers would need it, leading to duplication or circular dependencies." },
        ]}
        hint="Dependencies should flow in one direction, never form cycles."
        answer="Put the DB engine in its own module (like database.py or db/session.py) that doesn't import from models or routers. Both models and routers can then import from it safely. The key rule: dependencies should flow one direction, never form cycles."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="How do I know when it's time to split main.py into multiple files? Is there a rule?"
        reveal="There's no magic number, but here's a practical test: if you can't find a function in under 10 seconds, it's time to split. Most teams hit this wall around 10-15 endpoints or 300-500 lines. The pain of navigating a giant file always outweighs the pain of splitting it up. And it's way easier to split early than to untangle a 2000-line mess later."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEEP existing) */}
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

      {/* CommonMistakes (KEEP existing) */}
      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
