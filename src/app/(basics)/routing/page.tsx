"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Signpost, Variable, HelpCircle, Lightbulb, Globe, Play, ArrowRight } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { RoutingHeroViz } from "./_components/routing-hero-viz";
import { UrlPatternMatcher } from "./_components/url-pattern-matcher";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/routing/path-operations",
    label: "Path Operations",
    icon: Signpost,
    description: "Define GET, POST, PUT, DELETE endpoints using Python decorators.",
  },
  {
    href: "/routing/path-parameters",
    label: "Path Parameters",
    icon: Variable,
    description: "Extract dynamic values from URL paths with automatic type validation.",
  },
  {
    href: "/routing/query-parameters",
    label: "Query Parameters",
    icon: HelpCircle,
    description: "Handle optional and required query string parameters with defaults.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "url", label: "URL Request", description: "Client sends GET /items/42 to the server.", icon: Globe, color: "teal-500" },
  { id: "match", label: "Path Match", description: "FastAPI matches the URL pattern to a path operation decorator.", icon: Signpost, color: "teal-500" },
  { id: "params", label: "Extract Params", description: "Path and query parameters are extracted and type-validated automatically.", icon: Variable, color: "emerald-500" },
  { id: "handler", label: "Run Handler", description: "The matched async function executes with validated parameters.", icon: Play, color: "emerald-500" },
  { id: "response", label: "JSON Response", description: "The return value is serialized to JSON and sent back with status 200.", icon: ArrowRight, color: "teal-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Forgetting the async keyword",
    subtitle: "Using await inside a non-async function",
    wrongCode: `@app.get("/items")
def read_items():
    data = await fetch_from_db()  # Error!
    return data`,
    rightCode: `@app.get("/items")
async def read_items():
    data = await fetch_from_db()
    return data`,
    filename: "main.py",
    explanation: "If you use await inside your path operation function, you must declare it as async def. Otherwise, Python will raise a SyntaxError.",
  },
  {
    title: "Path order matters",
    subtitle: "Static paths should come before dynamic ones",
    wrongCode: `@app.get("/users/{user_id}")
async def get_user(user_id: str):
    return {"user_id": user_id}

@app.get("/users/me")  # Never reached!
async def get_current_user():
    return {"user": "current"}`,
    rightCode: `@app.get("/users/me")
async def get_current_user():
    return {"user": "current"}

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    return {"user_id": user_id}`,
    filename: "main.py",
    explanation: "FastAPI evaluates paths in order. If /users/{user_id} comes first, /users/me will match it with user_id='me'. Always put fixed paths before parameterized ones.",
  },
];

export default function RoutingPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-serif italic">Routing</h1>
          <Badge variant="secondary">3 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          The foundation of every FastAPI application. Learn how to define
          endpoints, extract parameters from URLs, and handle query strings.
        </p>
      </div>

      {/* Hero Visualization: URL Highway */}
      <ScrollReveal className="mb-8">
        <RoutingHeroViz />
      </ScrollReveal>

      <div className="rounded-lg glass border-teal-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-teal-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI uses Python type hints to automatically validate path and
              query parameters. The same types that help your editor also power
              runtime validation.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Request Lifecycle */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How Routing Works</h2>
        <AnimatedFlow steps={flowSteps} accentColor="teal" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-teal-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: URL Pattern Matcher */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: URL Pattern Matcher</h2>
        <UrlPatternMatcher />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
