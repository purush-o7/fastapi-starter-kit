"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function SQLAlchemyModelsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">SQLAlchemy Models</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          SQLAlchemy models define your database tables as Python classes. Each class maps to a table, each attribute to a column, and relationships connect tables together.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Basic Model Definition</h2>
          <p className="text-muted-foreground mb-4">
            SQLAlchemy 2.0 uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Mapped[]</code> type annotations and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">mapped_column()</code> for type-safe column definitions.
          </p>
          <CodeBlock code={`from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(default=True)

# Mapped[int] tells both Python and SQLAlchemy the column type
# mapped_column() adds database-level constraints`} filename="models.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">One-to-Many Relationship</h2>
          <p className="text-muted-foreground mb-4">
            A User can have many Posts. The foreign key lives on the &quot;many&quot; side, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">relationship()</code> creates the Python-level link.
          </p>
          <CodeBlock code={`from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    # One user has many posts
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)

    # Many posts belong to one user
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped["User"] = relationship(back_populates="posts")`} filename="models.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Many-to-Many Relationship</h2>
          <p className="text-muted-foreground mb-4">
            Posts can have multiple Tags, and Tags can belong to multiple Posts. This requires an association table in between.
          </p>
          <CodeBlock code={`from sqlalchemy import Table, Column, ForeignKey

# Association table — no ORM model needed
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))

    tags: Mapped[list["Tag"]] = relationship(
        secondary=post_tags, back_populates="posts"
    )

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    posts: Mapped[list["Post"]] = relationship(
        secondary=post_tags, back_populates="tags"
    )`} filename="models.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Pydantic Schemas</h2>
          <p className="text-muted-foreground mb-4">
            Pydantic schemas define the API layer — what clients send and receive. Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">from_attributes=True</code> to convert ORM objects to Pydantic models automatically.
          </p>
          <CodeBlock code={`from pydantic import BaseModel, ConfigDict

# What the client sends to create a user
class UserCreate(BaseModel):
    name: str
    email: str

# What the API returns
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool

    # Enables: UserOut.model_validate(orm_user)
    model_config = ConfigDict(from_attributes=True)

# Usage in an endpoint:
@app.post("/users", response_model=UserOut)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user  # Automatically converted to UserOut`} filename="schemas.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Mapped Columns</p>
              <p className="text-xs text-muted-foreground">Use Mapped[type] and mapped_column() for type-safe definitions</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Relationships</p>
              <p className="text-xs text-muted-foreground">Connect models with relationship() and ForeignKey for joins</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">__tablename__</p>
              <p className="text-xs text-muted-foreground">Always set the table name explicitly for clear database naming</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">from_attributes</p>
              <p className="text-xs text-muted-foreground">Use ConfigDict(from_attributes=True) to convert ORM → Pydantic</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
