"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Upload, Lightbulb, Globe, Database, Search, GitBranch, XCircle } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
import { DatabaseHeroViz } from "./_components/database-hero-viz";
import { ConnectionPoolViz } from "./_components/connection-pool-viz";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/database-files/database-integration",
    label: "Database Integration",
    icon: HardDrive,
    description: "Connect FastAPI to databases using SQLAlchemy with dependency injection.",
  },
  {
    href: "/database-files/file-uploads",
    label: "File Uploads",
    icon: Upload,
    description: "Handle single and multiple file uploads with validation and storage.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "request", label: "Request", description: "An endpoint receives a request that needs database access.", icon: Globe, color: "cyan-500" },
  { id: "session", label: "Get Session", description: "Depends(get_db) creates a new SQLAlchemy session from the connection pool.", icon: Database, color: "cyan-500" },
  { id: "query", label: "Query", description: "Your handler executes queries through the session: db.query(Item).filter(...).", icon: Search, color: "teal-500" },
  { id: "commit", label: "Commit / Rollback", description: "Changes are committed on success, or rolled back on error — atomically.", icon: GitBranch, color: "teal-500" },
  { id: "close", label: "Close Session", description: "The finally block in get_db() closes the session, returning the connection to the pool.", icon: XCircle, color: "cyan-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Not closing database sessions",
    subtitle: "Creating sessions without proper cleanup",
    wrongCode: `@app.get("/items")
async def list_items():
    db = SessionLocal()
    items = db.query(Item).all()
    # Session never closed!
    return items`,
    rightCode: `def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items")
async def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()`,
    filename: "main.py",
    explanation: "Always use a dependency with yield to manage database sessions. The finally block ensures the session is closed even if an error occurs, preventing connection pool exhaustion.",
  },
];

export default function DatabaseFilesPage() {
  return (
    <div className="max-w-4xl ambient-database">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Database & Files</h1>
          <Badge variant="secondary">2 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Connect your API to databases and handle file uploads. Learn the
          patterns for SQLAlchemy integration and multipart file handling.
        </p>
      </div>

      {/* Hero Visualization: Session Lifecycle */}
      <ScrollReveal className="mb-8">
        <DatabaseHeroViz />
      </ScrollReveal>

      <div className="rounded-lg border bg-cyan-500/5 border-cyan-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-cyan-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI works with any database through SQLAlchemy. Use
              dependency injection to provide database sessions to your
              endpoints, ensuring proper connection lifecycle management.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Database Request Cycle */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How Database Requests Flow</h2>
        <AnimatedFlow steps={flowSteps} accentColor="cyan" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-cyan-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: Connection Pool Monitor */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Try It: Connection Pool Monitor</h2>
        <ConnectionPoolViz />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
