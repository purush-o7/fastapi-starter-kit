"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { AlembicMigrationViz } from "../_components/alembic-migration-viz";

export default function AlembicMigrationsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Alembic Migrations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Alembic tracks every change to your database schema as versioned migration scripts. Never manually ALTER TABLE again — let Alembic generate and apply migrations from your model changes.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Initializing Alembic</h2>
          <p className="text-muted-foreground mb-4">
            Install Alembic and initialize the migration environment. This creates the directory structure that holds your migration scripts.
          </p>
          <CodeBlock code={`# Install
pip install alembic

# Initialize in your project root
alembic init alembic

# This creates:
# alembic/
#   env.py          ← connects Alembic to your models
#   script.py.mako  ← template for migration files
#   versions/       ← migration scripts live here
# alembic.ini       ← database URL configuration`} filename="terminal" />
          <div className="mt-4">
            <CodeBlock code={`# alembic.ini — set your database URL
sqlalchemy.url = sqlite:///./app.db

# For PostgreSQL:
# sqlalchemy.url = postgresql://user:pass@localhost/dbname`} filename="alembic.ini" />
          </div>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Configuring env.py</h2>
          <p className="text-muted-foreground mb-4">
            The critical step: tell Alembic where your models live by importing <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Base.metadata</code>. Without this, autogenerate won&apos;t detect your tables.
          </p>
          <CodeBlock code={`# alembic/env.py

# Import your Base so Alembic can see all registered models
from app.database import Base
from app.models import User, Post, Tag  # Import all models!

# This line tells Alembic what your models look like
target_metadata = Base.metadata

# Everything else in env.py can stay as the default.
# Alembic compares target_metadata against the actual database
# to figure out what changed.`} filename="alembic/env.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Generating &amp; Applying Migrations</h2>
          <p className="text-muted-foreground mb-4">
            Alembic compares your models against the current database schema and generates a migration script with the differences.
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
    op.add_column("users", sa.Column(
        "is_active", sa.Boolean(),
        server_default=sa.text("true"),
        nullable=False,
    ))

def downgrade():
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

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It: Migration Workflow</h2>
          <p className="text-muted-foreground mb-4">
            Watch the complete migration workflow — from editing a model to seeing the schema update in the database.
          </p>
          <AlembicMigrationViz />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <p className="text-muted-foreground mb-4">
            Always review autogenerated migrations before applying. Alembic gets most changes right but can miss renames, data migrations, and edge cases.
          </p>
          <CodeBlock code={`# 1. Always use server_default for new NOT NULL columns
# Otherwise existing rows will violate the constraint
op.add_column("users", sa.Column(
    "role", sa.String(20),
    server_default="user",   # ← database fills existing rows
    nullable=False,
))

# 2. Data migrations — move data, not just schema
def upgrade():
    # Add column first
    op.add_column("users", sa.Column("full_name", sa.String(200)))

    # Then populate it from existing data
    op.execute("UPDATE users SET full_name = name")

    # Then drop the old column
    op.drop_column("users", "name")

# 3. Never use Base.metadata.create_all() in production
# It doesn't track changes, can't rollback, and skips migrations`} filename="alembic/versions/migration.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

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
