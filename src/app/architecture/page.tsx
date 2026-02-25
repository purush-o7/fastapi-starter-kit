"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Syringe, Layers, Lightbulb, Globe, Play, Plug } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";
import { ArchitectureHeroViz } from "./_components/architecture-hero-viz";
import { MiddlewarePeeler } from "./_components/middleware-peeler";

const topics = [
  {
    href: "/architecture/api-router",
    label: "APIRouter",
    icon: FolderTree,
    description: "Organize endpoints into modular groups with shared prefixes and tags.",
  },
  {
    href: "/architecture/dependency-injection",
    label: "Dependency Injection",
    icon: Syringe,
    description: "Share logic across endpoints using FastAPI's powerful Depends() system.",
  },
  {
    href: "/architecture/middleware",
    label: "Middleware",
    icon: Layers,
    description: "Process requests and responses globally before they reach your endpoints.",
  },
  {
    href: "/architecture/cors",
    label: "CORS",
    icon: Globe,
    description: "Configure Cross-Origin Resource Sharing for frontend-backend communication.",
  },
  {
    href: "/architecture/lifespan",
    label: "Lifespan Events",
    icon: Plug,
    description: "Run startup and shutdown logic with the modern lifespan context manager.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "request", label: "HTTP Request", description: "A client sends an HTTP request to your FastAPI application.", icon: Globe, color: "purple-500" },
  { id: "middleware", label: "Middleware", description: "The request passes through middleware layers — CORS, logging, auth checks — before reaching any route.", icon: Layers, color: "purple-500" },
  { id: "router", label: "Router Match", description: "FastAPI matches the request path and method to the correct APIRouter and endpoint.", icon: FolderTree, color: "violet-500" },
  { id: "dependencies", label: "Dependencies", description: "Depends() resolves all dependencies — database sessions, current user, permissions — before calling the handler.", icon: Syringe, color: "violet-500" },
  { id: "handler", label: "Handler", description: "Your endpoint function runs with all dependencies injected, processes the request, and returns a response.", icon: Play, color: "purple-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Circular imports with routers",
    subtitle: "Importing the app instance inside router modules",
    wrongCode: `# routers/users.py
from main import app  # Circular!

@app.get("/users")
async def list_users():
    return []`,
    rightCode: `# routers/users.py
from fastapi import APIRouter

router = APIRouter(prefix="/users")

@router.get("/")
async def list_users():
    return []`,
    filename: "routers/users.py",
    explanation: "Never import the app instance into router modules. Instead, create an APIRouter and include it in the main app. This avoids circular imports and keeps modules independent.",
  },
  {
    title: "Not using Depends() for shared logic",
    subtitle: "Duplicating authentication checks across endpoints",
    wrongCode: `@app.get("/items")
async def list_items(token: str):
    user = verify_token(token)
    if not user:
        raise HTTPException(401)
    return get_items(user)

@app.get("/orders")
async def list_orders(token: str):
    user = verify_token(token)  # Duplicated!
    if not user:
        raise HTTPException(401)
    return get_orders(user)`,
    rightCode: `async def get_current_user(
    token: str = Header()
) -> User:
    user = verify_token(token)
    if not user:
        raise HTTPException(401)
    return user

@app.get("/items")
async def list_items(user: User = Depends(get_current_user)):
    return get_items(user)

@app.get("/orders")
async def list_orders(user: User = Depends(get_current_user)):
    return get_orders(user)`,
    filename: "main.py",
    explanation: "Use Depends() to extract shared logic into reusable dependencies. This keeps your endpoints focused on business logic and makes authentication, database sessions, and other cross-cutting concerns easy to manage.",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="max-w-4xl ambient-architecture">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-serif italic">Architecture</h1>
          <Badge variant="secondary">5 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Patterns for structuring and scaling your FastAPI application.
          Routers for organization, dependencies for shared logic, and
          middleware for cross-cutting concerns.
        </p>
      </div>

      {/* Hero Visualization: Building Blocks */}
      <ScrollReveal className="mb-8">
        <ArchitectureHeroViz />
      </ScrollReveal>

      <div className="rounded-lg glass border-purple-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI&apos;s dependency injection system is one of its most
              powerful features. It lets you compose complex behaviors from
              simple, testable functions.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Request Lifecycle */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How a Request Flows Through Your App</h2>
        <AnimatedFlow steps={flowSteps} accentColor="purple" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-purple-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: Middleware Peeler */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: Middleware Layer Peeler</h2>
        <MiddlewarePeeler />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
