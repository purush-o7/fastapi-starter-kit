"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function CrudOperationsPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">CRUD Operations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          The repository pattern separates database logic from your endpoint handlers. Each function takes a session and returns data — keeping your routes clean, focused, and testable.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Create</h2>
          <p className="text-muted-foreground mb-4">
            Convert a Pydantic schema to an ORM object, add it to the session, commit, and refresh to get the database-generated fields (like <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">id</code>).
          </p>
          <CodeBlock code={`# crud.py
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # Loads the generated id
    return db_user

# main.py
@app.post("/users", response_model=UserOut)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)`} filename="crud.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Read</h2>
          <p className="text-muted-foreground mb-4">
            Fetch a single record by ID, or a paginated list with offset and limit.
          </p>
          <CodeBlock code={`# Single record by ID
def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

# Paginated list
def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()

# Filtered query
def get_active_users(db: Session) -> list[User]:
    return db.query(User).filter(User.is_active == True).all()

# main.py
@app.get("/users/{user_id}", response_model=UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`} filename="crud.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Update</h2>
          <p className="text-muted-foreground mb-4">
            For partial updates, use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">exclude_unset=True</code> to only modify fields the client actually sent — not every field in the schema.
          </p>
          <CodeBlock code={`from schemas import UserUpdate  # Optional fields for partial update

def update_user(
    db: Session,
    user_id: int,
    updates: UserUpdate,
) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    # Only update fields that were explicitly set
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

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Delete</h2>
          <p className="text-muted-foreground mb-4">
            Fetch first, then delete. Return the deleted object or raise 404 if it doesn&apos;t exist.
          </p>
          <CodeBlock code={`def delete_user(db: Session, user_id: int) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    db.delete(db_user)
    db.commit()
    return db_user

    # Alternative: soft delete (mark as inactive instead)
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

      <Separator className="my-8" />

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
