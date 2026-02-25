"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const AlembicMigrationViz = dynamic(
  () => import("../_components/alembic-migration-viz").then(m => m.AlembicMigrationViz),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function AlembicMigrationsPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Alembic Migrations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Your database doesn&apos;t update itself. Change the Python model without a migration, and your app crashes at runtime.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You add a new 'phone' column to your User model and restart the app. The column doesn't exist in the database. Your app crashes because you changed the Python model but forgot the database doesn't update itself."
        error={`# You added this to your model:
class User(Base):
    phone: Mapped[str | None]  # New column!

# You restart the app and hit the endpoint:
GET /users/1

sqlalchemy.exc.OperationalError:
(sqlite3.OperationalError) no such column: users.phone

# The model says "phone exists"
# The database says "phone? never heard of it"
# SQLAlchemy models DON'T auto-migrate the database.`}
        errorType="Schema Mismatch"
        accentColor="cyan"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Ever added a field to your model, restarted, and gotten a &quot;no such column&quot; error?
          That&apos;s the fundamental disconnect: your Python model describes what the schema
          <em> should</em> look like. The database is what it <em>actually</em> looks like.
          Alembic bridges that gap by generating migration scripts that transform the
          database to match your models.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">The migration workflow</h2>
          <p className="text-muted-foreground mb-4">
            Every time you change a model, you run this same cycle. Alembic compares
            what your models say vs. what the database actually has, and generates the SQL to fix the difference.
          </p>
          <SimpleFlow
            steps={[
              { label: "Edit Model", detail: "Add/change columns", status: "neutral" },
              { label: "Autogenerate", detail: "alembic revision --autogenerate", status: "neutral" },
              { label: "Review Script", detail: "Check the generated migration", status: "neutral" },
              { label: "Apply", detail: "alembic upgrade head", status: "success" },
            ]}
            accentColor="cyan"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Models describe the desired schema. The database has the actual schema. They can drift apart.",
          "Alembic detects the drift and generates migration scripts to reconcile them.",
          "You always review before applying — Alembic isn't perfect, especially with renames.",
        ]}
        section="Core Concept"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Initializing Alembic */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Setting up Alembic</h2>
          <p className="text-muted-foreground mb-4">
            You only do this once per project. It creates the folder structure that
            holds your migration scripts. Think of it like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">git init</code> but for your database schema.
          </p>
          <CodeBlock code={`# Install
pip install alembic

# Initialize in your project root
alembic init alembic

# This creates:
# alembic/
#   env.py          <- connects Alembic to your models
#   script.py.mako  <- template for migration files
#   versions/       <- migration scripts live here
# alembic.ini       <- database URL configuration`} filename="terminal" />
          <div className="mt-4">
            <CodeBlock code={`# alembic.ini — set your database URL
sqlalchemy.url = sqlite:///./app.db

# For PostgreSQL:
# sqlalchemy.url = postgresql://user:pass@localhost/dbname`} filename="alembic.ini" />
          </div>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Configuring env.py */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The critical step: configuring env.py</h2>
          <p className="text-muted-foreground mb-4">
            This is where most people get stuck. You MUST import your Base and all your
            models so Alembic can see them. If you skip this, autogenerate will produce
            empty migrations because it doesn&apos;t know your tables exist.
          </p>
          <CodeBlock code={`# alembic/env.py

# Import your Base so Alembic can see all registered models
from app.database import Base
from app.models import User, Post, Tag  # Import ALL models!

# This is the line that matters — it tells Alembic your desired schema
target_metadata = Base.metadata

# Everything else in env.py can stay as the default.
# Alembic compares target_metadata against the actual database
# to figure out what changed.`} filename="alembic/env.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          The most common gotcha: you create a new model file but forget to import it in env.py.
          Alembic only sees models that are imported into the same Python process. If the
          import is missing, the model is invisible, and autogenerate skips it entirely.
          You run the migration and wonder why the table wasn&apos;t created.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        points={[
          "env.py connects Alembic to your models via Base.metadata",
          "Every model must be imported in env.py, or Alembic can't see it",
          "target_metadata is the 'desired state' that Alembic compares against the database",
        ]}
        section="Configuration"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Generating & Applying */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Generating &amp; applying migrations</h2>
          <p className="text-muted-foreground mb-4">
            Alembic compares your models against the current database schema and generates
            a migration script with the differences. Always review the generated file &mdash;
            Alembic is smart but not perfect.
          </p>
          <CodeBlock code={`# Generate a migration from model changes
alembic revision --autogenerate -m "add is_active column to users"

# This creates a file like: alembic/versions/a3f2b1c9_add_is_active.py`} filename="terminal" />
          <div className="mt-4">
            <CodeBlock code={`# Generated migration file
"""add is_active column to users"""

revision = "a3f2b1c9"
down_revision = "8b4e2d1f"

from alembic import op
import sqlalchemy as sa

def upgrade():
    # This runs when you apply the migration
    op.add_column("users", sa.Column(
        "is_active", sa.Boolean(),
        server_default=sa.text("true"),
        nullable=False,
    ))

def downgrade():
    # This runs when you rollback
    op.drop_column("users", "is_active")`} filename="alembic/versions/a3f2b1c9_add_is_active.py" />
          </div>
          <div className="mt-4">
            <CodeBlock code={`# Apply pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current revision
alembic current

# Show migration history
alembic history`} filename="terminal" />
          </div>
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why does every migration have both upgrade() and downgrade()?"
        reveal="Because migrations are a chain. Each link can go forward (upgrade) or backward (downgrade). If a deployment goes wrong, you need to roll back. If downgrade() is empty or broken, you're stuck with a half-migrated database and no way back. Always write both directions."
        className="mb-8"
      />

      <WhatYouJustLearned
        points={[
          "alembic revision --autogenerate compares models to the DB and generates a script",
          "Always review autogenerated migrations — Alembic can miss renames and data moves",
          "upgrade() goes forward, downgrade() rolls back. Always write both.",
          "alembic upgrade head applies all pending migrations in order",
        ]}
        section="Generating Migrations"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive Viz (KEPT) */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It: Migration Workflow</h2>
          <p className="text-muted-foreground mb-4">
            Watch the complete migration workflow &mdash; from editing a model to seeing
            the schema update in the database.
          </p>
          <AlembicMigrationViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Best Practices / Go Deeper */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Tricky migrations</h2>
          <p className="text-muted-foreground mb-4">
            Alembic handles simple column adds automatically. But adding a NOT NULL column
            to an existing table? Renaming columns? Moving data? You need to handle these yourself.
          </p>
          <CodeBlock code={`# 1. New NOT NULL column on existing table?
# You MUST provide server_default, or existing rows violate the constraint
op.add_column("users", sa.Column(
    "role", sa.String(20),
    server_default="user",   # <- database fills existing rows with this
    nullable=False,
))

# 2. Data migration — when you need to move data, not just schema
def upgrade():
    # Add column first
    op.add_column("users", sa.Column("full_name", sa.String(200)))

    # Then populate it from existing data
    op.execute("UPDATE users SET full_name = name")

    # Then drop the old column
    op.drop_column("users", "name")

# 3. Never use Base.metadata.create_all() in production
# It doesn't track changes, can't rollback, and skips migrations
# It's fine for tests. That's it.`} filename="alembic/versions/migration.py" />
        </section>
      </ScrollReveal>

      <FailureDeepDive
        title="Adding NOT NULL without a default"
        scenario="You add a required 'role' column to Users with 500 existing rows. The migration fails because existing rows have no value for 'role'."
        code={`def upgrade():
    op.add_column("users", sa.Column(
        "role", sa.String(20),
        nullable=False,  # Required! But existing rows have no value...
    ))`}
        error={`sqlalchemy.exc.IntegrityError:
(sqlite3.IntegrityError) NOT NULL constraint failed: users.role

# 500 existing rows don't have a 'role' value.
# The database can't add a NOT NULL column without knowing
# what to put in those 500 rows.`}
        explanation="When you add a NOT NULL column, the database needs a value for every existing row. Without server_default, the database has to put NULL in those rows — but you just said NULL isn't allowed. Contradiction. Crash."
        fix="Add server_default to provide a value for existing rows."
        fixCode={`def upgrade():
    op.add_column("users", sa.Column(
        "role", sa.String(20),
        server_default="user",  # Existing rows get "user" as their role
        nullable=False,
    ))`}
        filename="alembic/versions/migration.py"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="You run alembic upgrade head but the migration fails halfway through. Is your database in the old state, the new state, or something in between?"
        options={[
          {
            label: "Always rolls back to the old state — migrations are transactional",
            correct: false,
            explanation: "This is true for PostgreSQL, but NOT for all databases. Don't assume."
          },
          {
            label: "Always stuck in between — you have to fix it manually",
            correct: false,
            explanation: "Some databases do roll back. It depends entirely on the database engine."
          },
          {
            label: "It depends on your database engine's DDL transaction support",
            correct: true,
            explanation: "PostgreSQL wraps DDL in transactions. SQLite has limited support. MySQL commits each ALTER TABLE immediately."
          },
        ]}
        hint="Different databases handle DDL (CREATE, ALTER, DROP) transactions differently."
        answer="It depends on your database. PostgreSQL wraps migrations in a transaction by default — if it fails, everything rolls back to the old state. SQLite has limited DDL transaction support, so you might end up in a half-migrated state. MySQL doesn't support transactional DDL at all — each ALTER TABLE commits immediately. Always test migrations on a copy of production first."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEPT) */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Autogenerate</p>
              <p className="text-xs text-muted-foreground">Alembic detects model changes and generates migration scripts automatically</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Version Chain</p>
              <p className="text-xs text-muted-foreground">Migrations form a linked chain with upgrade() and downgrade() functions</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Never create_all</p>
              <p className="text-xs text-muted-foreground">Use create_all only for tests — production needs Alembic migrations</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Review First</p>
              <p className="text-xs text-muted-foreground">Always review generated migrations — Alembic can miss renames and data moves</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
