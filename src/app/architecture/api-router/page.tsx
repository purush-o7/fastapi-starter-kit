"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function ApiRouterPage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">APIRouter</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          APIRouter lets you organize your endpoints into separate modules, each with its own prefix, tags, and dependencies. Think of it as a mini FastAPI app that gets mounted on the main app.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Creating a Router</h2>
          <p className="text-muted-foreground mb-4">Define endpoints on a router instance instead of the main app.</p>
          <CodeBlock code={`# routers/items.py
from fastapi import APIRouter

router = APIRouter(
    prefix="/items",
    tags=["items"],
)

@router.get("/")
async def list_items():
    return [{"name": "Foo"}, {"name": "Bar"}]

@router.get("/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id}`} filename="routers/items.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Including Routers</h2>
          <p className="text-muted-foreground mb-4">Mount routers on the main app using app.include_router().</p>
          <CodeBlock code={`# main.py
from fastapi import FastAPI
from routers import items, users

app = FastAPI()

app.include_router(items.router)
app.include_router(users.router)

# items endpoints: /items/, /items/{item_id}
# users endpoints: /users/, /users/{user_id}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Router-Level Dependencies</h2>
          <p className="text-muted-foreground mb-4">Apply dependencies to all routes in a router at once.</p>
          <CodeBlock code={`from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_admin_token)],
)

@router.get("/stats")
async def admin_stats():
    # verify_admin_token runs automatically
    return {"users": 100}`} filename="routers/admin.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Modular Organization</p>
              <p className="text-xs text-muted-foreground">Split endpoints into separate files by domain</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Prefix & Tags</p>
              <p className="text-xs text-muted-foreground">Set URL prefix and OpenAPI tags at the router level</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Shared Dependencies</p>
              <p className="text-xs text-muted-foreground">Apply auth and other checks to all routes in a router</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Nested Routers</p>
              <p className="text-xs text-muted-foreground">Routers can include other routers for deep nesting</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
