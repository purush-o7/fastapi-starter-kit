"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const ConnectionPoolViz = dynamic(
  () => import("../_components/connection-pool-viz").then(m => m.ConnectionPoolViz),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function SessionsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Database Sessions</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Sessions are your window into the database. Get the lifecycle wrong, and your app works in dev but dies in production under load.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="Your API works in development. In production under load, you start seeing TimeoutError: QueuePool limit reached. Database connections are leaking because sessions aren't being closed properly."
        error={`# Production under load (50 concurrent users):

sqlalchemy.exc.TimeoutError:
QueuePool limit of 5 overflow 10 reached,
connection timed out, timeout 30.00
(Background on this error at: https://sqlalche.me/e/20/3o7r)

# Your 5 connection pool slots + 10 overflow = 15 connections
# All 15 are stuck open, waiting for sessions that were never closed.
# New requests wait 30s, then timeout.`}
        errorType="Connection Leak"
        accentColor="cyan"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Why does it work locally but break in production? Because locally you have one
          user &mdash; you. In production, 50 users hit the API at once. Each request opens a
          database connection. If you don&apos;t close sessions properly, those connections pile
          up until the pool is exhausted. Then everyone waits. Then everyone times out.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">How sessions flow through a request</h2>
          <p className="text-muted-foreground mb-4">
            Every request gets its own session. That session borrows a connection from the pool,
            does work, and then returns it. The key word is &quot;returns.&quot; If you don&apos;t return it,
            the pool shrinks until it&apos;s empty.
          </p>
          <SimpleFlow
            steps={[
              { label: "Request arrives", detail: "GET /users", status: "neutral" },
              { label: "get_db() called", detail: "Session created from pool", status: "neutral" },
              { label: "yield session", detail: "Endpoint uses it", status: "neutral" },
              { label: "finally: close()", detail: "Connection returned to pool", status: "success" },
            ]}
            accentColor="cyan"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Engine & SessionLocal */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Engine &amp; SessionLocal: set up once, use forever</h2>
          <p className="text-muted-foreground mb-4">
            The engine manages the connection pool. SessionLocal is a factory that produces
            new Session instances. You create both once at startup &mdash; never inside a request handler.
          </p>
          <CodeBlock code={`from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# SQLite (development) — check_same_thread is SQLite-specific
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite only!
)

# PostgreSQL (production) — just change the URL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@localhost/dbname"
# engine = create_engine(SQLALCHEMY_DATABASE_URL)

# This factory creates sessions. You call it per-request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass`} filename="database.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          See <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">autoflush=False</code>? That&apos;s
          intentional. With autoflush on, SQLAlchemy sends SQL to the database before
          every query to sync pending changes. This can cause subtle bugs where uncommitted
          data shows up in queries. Keep it off and commit explicitly.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        points={[
          "One engine per app — it owns the connection pool",
          "SessionLocal is a factory, not a session. You call it to create sessions.",
          "autoflush=False prevents surprise SQL before your queries",
          "The database URL is the only thing that changes between SQLite and PostgreSQL",
        ]}
        section="Engine Setup"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* get_db() */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The get_db() pattern: your safety net</h2>
          <p className="text-muted-foreground mb-4">
            This is the canonical pattern every FastAPI + SQLAlchemy project uses. The
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> yield</code> keyword is what makes
            it safe &mdash; the <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">finally</code> block
            ensures the session is always closed, even when your endpoint throws an exception.
          </p>
          <CodeBlock code={`from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

app = FastAPI()

def get_db():
    db = SessionLocal()  # Grab a session from the factory
    try:
        yield db           # Hand it to the endpoint
    finally:
        db.close()         # ALWAYS close — even if the endpoint exploded

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    # db is a live session — use it freely
    return db.query(User).all()
    # After this returns (or raises), db.close() runs automatically`} filename="database.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why yield instead of return? Can't I just return the session?"
        reveal="yield turns get_db() into a generator. FastAPI's Depends() is smart enough to know that code AFTER yield runs as cleanup — like a context manager. If you used return, there's no way to run cleanup code after the endpoint finishes. yield + try/finally = guaranteed cleanup, even when exceptions happen."
        className="mb-8"
      />

      {/* FailureDeepDive: missing finally */}
      <FailureDeepDive
        title="The missing finally: block"
        scenario="You write get_db() with yield but forget the try/finally wrapper. Endpoints work fine... until one raises an exception. The session never closes, and the connection leaks."
        code={`def get_db():
    db = SessionLocal()
    yield db
    db.close()  # This line NEVER runs if the endpoint raises!`}
        error={`# After enough errors, you see:
sqlalchemy.exc.TimeoutError:
QueuePool limit of 5 overflow 10 reached,
connection timed out, timeout 30.00

# Each unhandled exception leaked one connection.
# After 15 errors, the pool is empty. App is dead.`}
        explanation="Without try/finally, the code after yield only runs on the happy path. If the endpoint raises an exception, Python abandons the generator and db.close() never executes. The connection stays open forever, slowly draining your pool."
        fix="Always wrap yield in try/finally. The finally block runs no matter what — success or failure."
        fixCode={`def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Runs ALWAYS — even after exceptions`}
        filename="database.py"
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "yield in a Depends() function creates a lifecycle: before yield = setup, after yield = cleanup",
          "try/finally is non-negotiable — without it, exceptions leak connections",
          "Every leaked connection is one less slot in your pool. Enough leaks = dead app.",
        ]}
        section="get_db() Pattern"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Connection Pool */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Connection Pool: tuning the numbers</h2>
          <p className="text-muted-foreground mb-4">
            SQLAlchemy maintains a pool of database connections so you don&apos;t open a
            new TCP connection for every request. But the defaults might not match
            your traffic. Here&apos;s what each setting does.
          </p>
          <CodeBlock code={`engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,         # Connections kept open and ready
    max_overflow=10,     # Extra connections allowed when pool is full
    pool_timeout=30,     # Seconds to wait for a connection before error
    pool_recycle=1800,   # Recycle connections after 30 minutes (avoid stale)
    echo=False,          # Set True to log ALL SQL statements (noisy but useful)
)

# pool_size=5 + max_overflow=10 = up to 15 concurrent connections
# If all 15 are busy, new requests wait up to pool_timeout seconds
# After pool_timeout, you get the TimeoutError from the hook above`} filename="database.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          A good rule of thumb: set <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">pool_size</code> to
          the number of web workers you run. If you have 4 Gunicorn workers, a pool_size
          of 5 per worker gives you 20 total connections. Check your database&apos;s max_connections
          setting to make sure you don&apos;t exceed it.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* Interactive Viz (KEPT) */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Connection Pool Monitor</h2>
          <p className="text-muted-foreground mb-4">
            Click &quot;New Request&quot; to simulate requests claiming connections from the pool.
            See what happens when the pool is exhausted &mdash; that&apos;s the TimeoutError from the hook above.
          </p>
          <ConnectionPoolViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Async Sessions */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Async Sessions: when you need them</h2>
          <p className="text-muted-foreground mb-4">
            If your endpoints use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code>,
            you need async sessions. Using synchronous sessions in an async endpoint blocks
            the event loop &mdash; one slow query can freeze your entire app.
          </p>
          <CodeBlock code={`from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Note the driver change: asyncpg for PostgreSQL, aiosqlite for SQLite
ASYNC_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/dbname"

async_engine = create_async_engine(ASYNC_DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession)

# Same pattern, but async — and "async with" handles cleanup automatically
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()`} filename="database.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Wait — async with already handles cleanup? Do I still need try/finally?"
        reveal="No! async with is a context manager — it automatically calls close() when the block exits, even on exceptions. That's why the async version of get_db() is simpler. The context manager IS your try/finally."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "async def endpoints need async sessions — sync sessions block the event loop",
          "async with handles cleanup automatically (no manual try/finally needed)",
          "The driver changes: asyncpg for PostgreSQL, aiosqlite for SQLite",
          "Everything else is await — db.execute(), not db.query()",
        ]}
        section="Async Sessions"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If your get_db dependency uses yield but you forget the finally: db.close(), what happens when an endpoint raises an exception?"
        options={[
          {
            label: "The session is automatically closed by Python's garbage collector",
            correct: false,
            explanation: "The GC will eventually clean it up, but 'eventually' could be minutes. By then your pool is drained."
          },
          {
            label: "The session stays open and the connection is never returned to the pool",
            correct: true,
            explanation: "Without finally, the cleanup code after yield never runs on exception. The connection is leaked."
          },
          {
            label: "FastAPI catches the exception and closes the session for you",
            correct: false,
            explanation: "FastAPI handles the generator lifecycle, but it can't run code that was never inside a finally block."
          },
        ]}
        hint="Think about what happens to code after yield when the generator is abandoned."
        answer="The session stays open and the connection is never returned to the pool. With yield, the code after yield only runs if there's no exception — unless you wrap it in try/finally. Without finally, every error leaks a connection. After enough errors, your pool is exhausted and the whole API hangs."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEPT) */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Engine</p>
              <p className="text-xs text-muted-foreground">One engine per app — creates and manages the connection pool</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">SessionLocal</p>
              <p className="text-xs text-muted-foreground">Factory that produces new Session instances bound to the engine</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Yield Dependency</p>
              <p className="text-xs text-muted-foreground">get_db() with yield ensures sessions are always closed, even on errors</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Pool Tuning</p>
              <p className="text-xs text-muted-foreground">Configure pool_size and max_overflow to match your concurrency needs</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
