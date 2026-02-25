"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban, Settings, Lightbulb, Globe, AlertTriangle, FileOutput } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { ErrorHeroViz } from "./_components/error-hero-viz";
import { StatusCodeExplorer } from "./_components/status-code-explorer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/error-handling/http-exceptions",
    label: "HTTP Exceptions",
    icon: Ban,
    description: "Raise structured error responses with appropriate HTTP status codes.",
  },
  {
    href: "/error-handling/custom-handlers",
    label: "Custom Handlers",
    icon: Settings,
    description: "Register custom exception handlers for consistent error formatting.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "request", label: "Request", description: "A client request arrives at your endpoint.", icon: Globe, color: "orange-500" },
  { id: "error", label: "Error Raised", description: "Something goes wrong: raise HTTPException(status_code=404, detail='Not found').", icon: AlertTriangle, color: "red-500" },
  { id: "handler", label: "Exception Handler", description: "FastAPI catches the exception and routes it to the matching handler (built-in or custom).", icon: Settings, color: "orange-500" },
  { id: "response", label: "Error Response", description: 'A structured JSON error response is returned: {"detail": "Not found"} with status 404.', icon: FileOutput, color: "orange-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Returning errors instead of raising",
    subtitle: "Using return for error responses instead of HTTPException",
    wrongCode: `@app.get("/items/{id}")
async def get_item(id: int):
    item = db.get(id)
    if not item:
        return {"error": "Not found"}  # Wrong!
    return item`,
    rightCode: `from fastapi import HTTPException

@app.get("/items/{id}")
async def get_item(id: int):
    item = db.get(id)
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )
    return item`,
    filename: "main.py",
    explanation: "Returning an error dict gives a 200 status code, confusing clients. Always raise HTTPException to set the correct status code and let FastAPI format the error response properly.",
  },
];

export default function ErrorHandlingPage() {
  return (
    <div className="max-w-4xl ambient-errors">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-serif italic">Error Handling</h1>
          <Badge variant="secondary">2 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Graceful error handling is essential for production APIs. Learn how to
          raise HTTP exceptions and create custom handlers for consistent error
          responses.
        </p>
      </div>

      {/* Hero Visualization: Traffic Control */}
      <ScrollReveal className="mb-8">
        <ErrorHeroViz />
      </ScrollReveal>

      <div className="rounded-lg glass border-orange-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              Always use HTTPException for expected errors (not found, unauthorized).
              Reserve custom exception handlers for unexpected errors and consistent
              error formatting across your entire API.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Error Resolution Chain */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How Errors Flow</h2>
        <AnimatedFlow steps={flowSteps} accentColor="orange" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-orange-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: Status Code Explorer */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Explore: HTTP Status Codes</h2>
        <StatusCodeExplorer />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
