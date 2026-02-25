"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { ConnectionPoolViz } from "../_components/connection-pool-viz";

export default function SessionsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Database Sessions</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          The database session is your window into the database. FastAPI uses dependency injection with yield to create sessions per-request and guarantee cleanup — even when errors occur.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Engine &amp; SessionLocal</h2>
          <p className="text-muted-foreground mb-4">
            The engine manages the connection pool. SessionLocal is a factory that produces new Session instances. You create both once at startup.
          </p>
          <CodeBlock code={`from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# SQLite (development)
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite only
)

# PostgreSQL (production)
# SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@localhost/dbname"
# engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass`} filename="database.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The get_db() Dependency</h2>
          <p className="text-muted-foreground mb-4">
            This is the canonical pattern every FastAPI + SQLAlchemy project uses. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">yield</code> keyword ensures the session is always closed, even if the endpoint raises an exception.
          </p>
          <CodeBlock code={`from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

app = FastAPI()

def get_db():
    db = SessionLocal()  # Create a new session
    try:
        yield db           # Inject it into the endpoint
    finally:
        db.close()         # Always close — even on error

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    # db is a live session — use it freely
    return db.query(User).all()
    # After this returns (or raises), db.close() runs automatically`} filename="database.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Connection Pool</h2>
          <p className="text-muted-foreground mb-4">
            SQLAlchemy maintains a pool of database connections. Tune these settings based on your concurrency needs.
          </p>
          <CodeBlock code={`engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,         # Connections kept open in the pool
    max_overflow=10,     # Extra connections allowed beyond pool_size
    pool_timeout=30,     # Seconds to wait for a connection before error
    pool_recycle=1800,   # Recycle connections after 30 minutes
    echo=False,          # Set True to log all SQL statements
)

# pool_size=5 + max_overflow=10 = up to 15 concurrent connections
# If all 15 are in use, new requests wait up to pool_timeout seconds`} filename="database.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Connection Pool Monitor</h2>
          <p className="text-muted-foreground mb-4">
            Click &quot;New Request&quot; to simulate requests claiming connections from the pool. See what happens when the pool is exhausted.
          </p>
          <ConnectionPoolViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Async Sessions</h2>
          <p className="text-muted-foreground mb-4">
            If your endpoints use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code>, you need an async engine and async sessions to avoid blocking the event loop.
          </p>
          <CodeBlock code={`from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Note: asyncpg driver for PostgreSQL, aiosqlite for SQLite
ASYNC_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/dbname"

async_engine = create_async_engine(ASYNC_DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()`} filename="database.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

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
