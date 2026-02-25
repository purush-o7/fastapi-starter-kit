"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function SQLAlchemyModelsPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">SQLAlchemy Models</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Your Python classes become database tables. Get them wrong, and your data has holes you won&apos;t notice until production.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You define a User model with an email column but forget unique=True. Two users sign up with the same email. Your login system breaks because the query returns two rows instead of one."
        error={`# Two users with the same email:
db.query(User).filter(User.email == "alice@example.com").one()

sqlalchemy.exc.MultipleResultsFound:
Multiple rows were returned for one()

# Your login endpoint returns 500 Internal Server Error
# because it expected exactly ONE user for that email.
# The database allowed the duplicate — you never told it not to.`}
        errorType="Data Integrity"
        accentColor="cyan"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Why didn&apos;t SQLAlchemy stop you? Because it only knows what you tell it.
          If you don&apos;t add <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">unique=True</code>,
          the database happily accepts duplicates. Your model IS your schema contract &mdash;
          every constraint you forget is a bug waiting to happen.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">How Python classes become database tables</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s the big picture. Your Python class doesn&apos;t just describe data &mdash; it
            generates actual SQL DDL that creates tables, columns, and constraints.
          </p>
          <SimpleFlow
            steps={[
              { label: "Python Class", detail: "class User(Base)", status: "neutral" },
              { label: "Mapped Columns", detail: "Mapped[str], mapped_column()", status: "neutral" },
              { label: "SQL DDL", detail: "CREATE TABLE users (...)", status: "neutral" },
              { label: "Database Table", detail: "Columns + constraints", status: "success" },
            ]}
            accentColor="cyan"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 4. Basic model with conversational walkthrough */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Your first model</h2>
          <p className="text-muted-foreground mb-4">
            SQLAlchemy 2.0 uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Mapped[]</code> type
            annotations and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">mapped_column()</code> for
            type-safe column definitions. The type hint isn&apos;t just for your editor &mdash; it
            tells the database what type of column to create.
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

# Mapped[int] tells both Python AND the database the column type
# mapped_column() adds constraints — unique, index, default
# Notice unique=True on email? That's what prevents the bug above.`} filename="models.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Every model needs a Base class (DeclarativeBase) — it registers your tables",
          "__tablename__ sets the actual SQL table name. Always set it explicitly.",
          "Mapped[str] = NOT NULL column. Mapped[str | None] = nullable column.",
          "mapped_column() is where you add constraints like unique, index, and default",
        ]}
        section="Basic Model"
        className="mb-8"
      />

      <AhaMoment
        setup="Wait — if Mapped[str] means NOT NULL, what happens when I use Mapped[str | None]?"
        reveal="Mapped[str | None] generates a nullable column (NULL is allowed in SQL). This is how SQLAlchemy maps Python type hints directly to SQL constraints. If your type says Optional, your data can have holes. Choose deliberately — every None you allow is a None you'll have to handle everywhere."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. One-to-Many */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">One-to-Many: Users and Posts</h2>
          <p className="text-muted-foreground mb-4">
            A User can have many Posts. The foreign key always lives on the &quot;many&quot; side
            (Post), and <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">relationship()</code> creates
            the Python-level link so you can do <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">user.posts</code> without
            writing SQL.
          </p>
          <CodeBlock code={`from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    # One user has many posts — this is just a Python convenience
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)

    # The foreign key lives HERE — on the "many" side
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped["User"] = relationship(back_populates="posts")`} filename="models.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          A common mistake: forgetting <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">back_populates</code> on
          both sides. If you only set it on one model, the relationship works in one direction
          but not the other. You&apos;ll add a post to a user, but <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">post.author</code> will
          be None. Always connect both ends.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        points={[
          "Foreign keys go on the 'many' side — Post has author_id, not User",
          "relationship() is a Python-level convenience, not a database column",
          "back_populates must match on both sides — it's a two-way street",
        ]}
        section="Relationships"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 6. Many-to-Many */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Many-to-Many: Posts and Tags</h2>
          <p className="text-muted-foreground mb-4">
            Posts can have multiple Tags, and Tags can belong to multiple Posts. You can&apos;t
            put a foreign key on either side &mdash; you need a separate &quot;association table&quot; in between.
            Think of it as a lookup table that just holds pairs of IDs.
          </p>
          <CodeBlock code={`from sqlalchemy import Table, Column, ForeignKey

# Association table — no ORM model needed, just raw columns
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

    # secondary= points to the association table
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

      <WhatYouJustLearned
        points={[
          "Many-to-many needs an association table with two foreign keys",
          "The association table is a plain Table, not an ORM model",
          "secondary= on relationship() tells SQLAlchemy to use the association table",
        ]}
        section="Many-to-Many"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Pydantic Schemas */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Pydantic Schemas: Your API boundary</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s something that trips up almost everyone: SQLAlchemy models and Pydantic
            schemas look similar, but they serve completely different purposes. Models
            talk to the database. Schemas talk to the client. Never expose your ORM
            model directly &mdash; that&apos;s how you accidentally leak internal fields.
          </p>
          <CodeBlock code={`from pydantic import BaseModel, ConfigDict

# What the client SENDS to create a user
class UserCreate(BaseModel):
    name: str
    email: str

# What the API RETURNS — notice: no password, no internal fields
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool

    # This is the magic part — converts ORM objects to Pydantic automatically
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

      <AhaMoment
        setup="Why do I need separate schemas for Create and Read? Can't I just use one?"
        reveal="UserCreate has no id (the database generates it). UserOut includes id but might exclude sensitive fields like password_hash. Different operations need different shapes. Create = what the client sends. Read = what you send back. Update = what fields can change. Mixing them leads to either validation errors or data leaks."
        className="mb-8"
      />

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">from_attributes=True</code> config is what
          lets you return an ORM object directly from an endpoint and have FastAPI convert it
          to JSON using the Pydantic schema. Without it, you&apos;d get a serialization error because
          Pydantic doesn&apos;t know how to read SQLAlchemy attributes by default.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        points={[
          "SQLAlchemy models = database layer. Pydantic schemas = API layer. Keep them separate.",
          "from_attributes=True lets Pydantic read ORM object attributes",
          "Use different schemas for Create, Read, and Update operations",
          "model_dump() converts Pydantic → dict, model_validate() converts ORM → Pydantic",
        ]}
        section="Pydantic Schemas"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Go Deeper: FailureDeepDive */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Missing back_populates</h2>
          <FailureDeepDive
            title="One-sided relationship trap"
            scenario="You set up a User-Post relationship but only add back_populates on one side. Creating a post with an author works, but accessing post.author returns None."
            code={`class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    posts: Mapped[list["Post"]] = relationship()  # No back_populates!

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # No relationship defined here at all`}
            error={`user.posts  # Works! Returns [<Post 1>, <Post 2>]
post.author  # AttributeError: 'Post' has no attribute 'author'

# You can go from User → Posts, but not Post → User
# The relationship is one-way because you only defined one side.`}
            explanation="relationship() without back_populates creates a one-directional link. SQLAlchemy won't automatically create the reverse side. You need to explicitly define both sides and connect them with matching back_populates strings."
            fix="Add relationship() on both models with back_populates pointing to each other."
            fixCode={`class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped["User"] = relationship(back_populates="posts")`}
            filename="models.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="What's the difference between Mapped[str] and Mapped[str | None] in terms of the generated SQL column?"
        options={[
          {
            label: "No difference — both create a TEXT column",
            correct: false,
            explanation: "The column type is the same, but the NULL constraint is different. That's a critical distinction."
          },
          {
            label: "Mapped[str] creates NOT NULL, Mapped[str | None] allows NULL",
            correct: true,
            explanation: "Exactly right. SQLAlchemy reads the Python type hint to decide the NULL constraint."
          },
          {
            label: "Mapped[str | None] creates a column with a default value of None",
            correct: false,
            explanation: "It allows NULL but doesn't set a default. If you want a default, use mapped_column(default=None) explicitly."
          },
        ]}
        hint="Think about what happens at the SQL level when you try to INSERT a row without providing a value for that column."
        answer="Mapped[str] generates a NOT NULL column — the database will reject any row without a value. Mapped[str | None] generates a nullable column (NULL is allowed). This matters because SQLAlchemy maps Python type hints directly to SQL constraints. If your model says Optional, your data can have holes."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEPT) */}
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
