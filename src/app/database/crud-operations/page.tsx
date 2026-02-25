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

export default function CrudOperationsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">CRUD Operations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Create, Read, Update, Delete. Four operations that power every API. Get the patterns right, or one missing filter deletes your entire database.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You write a DELETE endpoint: db.query(User).delete(). No filter. You just wiped every user in your production database. The commit was automatic because autoflush was on."
        error={`# Your "delete user" endpoint:
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db.query(User).delete()  # <- WHERE IS THE FILTER?!
    db.commit()
    return {"status": "deleted"}

# What you meant: delete user #42
# What you did: DELETE FROM users (ALL of them)
# Rows deleted: 15,847
# Time to realize: 3 minutes
# Time to recover from backup: 4 hours`}
        errorType="Mass Deletion"
        accentColor="cyan"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Scary, right? The endpoint receives <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">user_id</code> as
          a parameter but never uses it. SQLAlchemy doesn&apos;t warn you about unfiltered
          deletes &mdash; it just does what you ask. That&apos;s why the safest pattern is:
          fetch first, then delete. If you can&apos;t find it, you can&apos;t accidentally delete
          everything.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">The repository pattern: keeping your routes clean</h2>
          <p className="text-muted-foreground mb-4">
            Put all database logic in a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">crud.py</code> file.
            Your route handlers should only handle HTTP concerns &mdash; status codes, response
            models, error responses. The CRUD functions handle the database.
          </p>
          <SimpleFlow
            steps={[
              { label: "Route Handler", detail: "HTTP request/response", status: "neutral" },
              { label: "CRUD Function", detail: "Database logic", status: "neutral" },
              { label: "SQLAlchemy Session", detail: "Execute SQL", status: "neutral" },
              { label: "Database", detail: "Store/retrieve data", status: "success" },
            ]}
            accentColor="cyan"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Separate database logic (crud.py) from HTTP logic (routes)",
          "CRUD functions take a Session and return data — nothing HTTP-related",
          "This makes your database logic testable without spinning up a server",
        ]}
        section="Architecture"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Create */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Create: adding new records</h2>
          <p className="text-muted-foreground mb-4">
            Convert a Pydantic schema to an ORM object, add it to the session, commit, and
            refresh. That last step is important &mdash; <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">refresh()</code> pulls
            back the database-generated fields like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">id</code>.
          </p>
          <CodeBlock code={`# crud.py
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(**user.model_dump())  # Pydantic -> dict -> ORM object
    db.add(db_user)     # Stage the object
    db.commit()         # Write to database
    db.refresh(db_user) # Pull back the generated id
    return db_user

# main.py — the route handler stays simple
@app.post("/users", response_model=UserOut)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)`} filename="crud.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          Why <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">model_dump()</code> instead of
          passing the Pydantic object directly? Because <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">User(**user.model_dump())</code> unpacks
          the dict as keyword arguments. It&apos;s like writing <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">User(name=&quot;Alice&quot;, email=&quot;alice@example.com&quot;)</code>.
          The ORM constructor expects keyword args, not a Pydantic object.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* Read */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Read: fetching records</h2>
          <p className="text-muted-foreground mb-4">
            Three patterns you&apos;ll use constantly: get by ID, get a paginated list, and
            filtered queries. Notice how every &quot;get by ID&quot; can return None &mdash; you need
            to handle that in the route handler.
          </p>
          <CodeBlock code={`# Single record by ID — returns None if not found
def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

# Paginated list — skip and limit prevent loading 10,000 rows
def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()

# Filtered query — add as many .filter() calls as you need
def get_active_users(db: Session) -> list[User]:
    return db.query(User).filter(User.is_active == True).all()

# main.py — always check for None!
@app.get("/users/{user_id}", response_model=UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`} filename="crud.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "first() returns None for empty results — it never raises an exception",
          "Always add skip/limit to list queries. Loading all rows kills performance.",
          "The 404 check lives in the route handler, not in the CRUD function",
        ]}
        section="Read Operations"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Update */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Update: partial vs. full updates</h2>
          <p className="text-muted-foreground mb-4">
            For partial updates, use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">exclude_unset=True</code>.
            This is the key &mdash; it only modifies fields the client actually sent, not every field
            in the schema. Without it, omitted fields get set to their default (usually None),
            which can wipe out existing data.
          </p>
          <CodeBlock code={`from schemas import UserUpdate  # All fields are Optional

def update_user(
    db: Session,
    user_id: int,
    updates: UserUpdate,
) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    # The important part: only update fields that were explicitly set
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

# main.py
@app.patch("/users/{user_id}", response_model=UserOut)
def update(user_id: int, updates: UserUpdate, db: Session = Depends(get_db)):
    user = update_user(db, user_id, updates)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`} filename="crud.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="What's the difference between PATCH and PUT for updates?"
        reveal="PUT means 'replace the entire resource' — the client sends ALL fields, and missing ones get their defaults. PATCH means 'update only these fields' — the client sends just what changed. That's why PATCH uses exclude_unset=True and PUT doesn't. Using PUT when you mean PATCH accidentally wipes fields the client didn't send."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Delete */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Delete: fetch first, then delete</h2>
          <p className="text-muted-foreground mb-4">
            The safe pattern: find the record first, then delete it. If it doesn&apos;t exist,
            return None (and the route handler raises 404). Never use an unfiltered
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> .delete()</code> &mdash; that&apos;s how the
            mass deletion from the hook happens.
          </p>
          <CodeBlock code={`def delete_user(db: Session, user_id: int) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    db.delete(db_user)  # Delete THIS specific object
    db.commit()
    return db_user

    # Alternative: soft delete (mark as inactive, don't actually remove)
    # db_user.is_active = False
    # db.commit()
    # return db_user

# main.py
@app.delete("/users/{user_id}", response_model=UserOut)
def delete(user_id: int, db: Session = Depends(get_db)):
    user = delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`} filename="crud.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          Consider soft deletes for anything users create. <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">is_active = False</code> is
          a lot easier to undo than <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">DELETE FROM users WHERE id = 42</code>.
          Hard deletes are permanent. Backups take hours to restore. Soft deletes take one
          UPDATE to reverse.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        points={[
          "Always fetch before delete — db.delete(object) is safer than .delete() on a query",
          "Soft deletes (is_active=False) are reversible. Hard deletes aren't.",
          "The CRUD function returns None for 'not found'. The route handler raises 404.",
        ]}
        section="Delete Operations"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Go Deeper: FailureDeepDive */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: The unfiltered delete</h2>
          <FailureDeepDive
            title="Mass deletion without a filter"
            scenario="You copy-paste a query pattern and forget to add the filter. The delete runs against the entire table."
            code={`@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    # You have user_id in the parameter...
    db.query(User).delete()  # ...but you never USE it!
    db.commit()
    return {"status": "deleted"}`}
            error={`# What SQL was actually sent:
DELETE FROM users
-- No WHERE clause!

# Result: every single row deleted
# Users table: 0 rows (was 15,847)`}
            explanation="db.query(User).delete() without a filter generates DELETE FROM users with no WHERE clause. SQLAlchemy doesn't warn you — it does exactly what you wrote. The commit() makes it permanent."
            fix="Always fetch the specific record first, check it exists, then delete it."
            fixCode={`@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)  # Deletes only THIS specific user
    db.commit()
    return {"status": "deleted"}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <AhaMoment
        setup="Why does first() return None instead of raising an exception?"
        reveal="It's a design choice. first() means 'get the first one, or nothing' — it's for situations where you're not sure if a result exists. If you NEED exactly one result, use one() which raises NoResultFound (zero results) or MultipleResultsFound (too many). Think of first() as 'maybe' and one() as 'must'."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="Why does db.query(User).filter(User.id == 5).first() return None instead of raising an exception when the user doesn't exist?"
        options={[
          {
            label: "It's a bug — it should raise NoResultFound",
            correct: false,
            explanation: "It's intentional. first() is designed for 'maybe there's a result' situations."
          },
          {
            label: "first() is designed to return None for empty results",
            correct: true,
            explanation: "Correct. Use one() if you need an exception when no row exists."
          },
          {
            label: "The filter didn't match, so it returns an empty query",
            correct: false,
            explanation: "The filter did its job correctly. first() just returns None when the result set is empty."
          },
        ]}
        hint="Think about what 'first' means when there are zero items."
        answer="first() is designed to return None for empty results — it's like saying 'get the first one, or nothing.' If you want an exception when no row exists, use one() which raises NoResultFound, or first() with an explicit check. The design philosophy: first() is for 'maybe there's a result', one() is for 'there MUST be exactly one result.'"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEPT) */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Repository Pattern</p>
              <p className="text-xs text-muted-foreground">Isolate DB logic in crud.py — keep endpoints in routers</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">model_dump()</p>
              <p className="text-xs text-muted-foreground">Convert Pydantic schemas to dicts for ORM object creation</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Partial Updates</p>
              <p className="text-xs text-muted-foreground">Use exclude_unset=True to only update fields the client sent</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">404 Checks</p>
              <p className="text-xs text-muted-foreground">Always check if the object exists before update or delete</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
