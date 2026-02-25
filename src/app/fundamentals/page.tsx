import dynamic from "next/dynamic";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Terminal, FileKey, FolderTree, FileText, Lightbulb } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
const FundamentalsHeroViz = dynamic(
  () => import("./_components/fundamentals-hero-viz").then(m => m.FundamentalsHeroViz),
  { loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
const HttpMethodExplorer = dynamic(
  () => import("./_components/http-method-explorer").then(m => m.HttpMethodExplorer),
  { loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/fundamentals/what-is-an-api",
    label: "What is an API?",
    icon: Globe,
    description: "HTTP, JSON, request/response \u2014 the foundation of every web API.",
  },
  {
    href: "/fundamentals/python-setup",
    label: "Python Setup",
    icon: Terminal,
    description: "Virtual environments, pip, and requirements.txt \u2014 your development toolkit.",
  },
  {
    href: "/fundamentals/environment-variables",
    label: "Environment Variables",
    icon: FileKey,
    description: ".env files, python-dotenv, and pydantic-settings for secure configuration.",
  },
  {
    href: "/fundamentals/project-structure",
    label: "Project Structure",
    icon: FolderTree,
    description: "Organize routers, schemas, models, and config as your app grows.",
  },
  {
    href: "/fundamentals/auto-generated-docs",
    label: "Auto-Generated Docs",
    icon: FileText,
    description: "FastAPI\u2019s /docs and /redoc \u2014 automatic interactive API documentation.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "api", label: "What is an API?", description: "Understand HTTP, JSON, and the request/response cycle that powers every web API.", icon: <Globe className="size-5" />, color: "rose-500" },
  { id: "python", label: "Python Setup", description: "Set up Python, virtual environments, and pip to manage your project dependencies.", icon: <Terminal className="size-5" />, color: "rose-500" },
  { id: "env", label: "Environment Vars", description: "Keep secrets out of code with .env files, python-dotenv, and pydantic-settings.", icon: <FileKey className="size-5" />, color: "pink-500" },
  { id: "structure", label: "Project Structure", description: "Organize your FastAPI app into routers, schemas, models, and config modules.", icon: <FolderTree className="size-5" />, color: "pink-500" },
  { id: "docs", label: "Auto Docs", description: "Explore FastAPI\u2019s built-in /docs and /redoc for automatic interactive API documentation.", icon: <FileText className="size-5" />, color: "rose-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Not using a virtual environment",
    subtitle: "Installing packages globally leads to version conflicts",
    wrongCode: `pip install fastapi
pip install uvicorn
# Installed globally \u2014 conflicts with other projects!`,
    rightCode: `python -m venv .venv
.venv\\Scripts\\activate  # Windows
source .venv/bin/activate  # Mac/Linux
pip install fastapi uvicorn`,
    filename: "terminal",
    explanation: "Always create a virtual environment for each project. This isolates dependencies and prevents version conflicts between projects.",
  },
];

export default function FundamentalsPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-serif italic">Fundamentals</h1>
          <Badge variant="secondary">5 topics</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Before writing your first endpoint, learn the essentials &mdash; what
          APIs are, how to set up Python, manage environment variables, and
          structure your project.
        </p>
      </div>

      {/* Hero Visualization: The HTTP Conversation */}
      <ScrollReveal className="mb-8">
        <FundamentalsHeroViz />
      </ScrollReveal>

      <div className="rounded-lg glass border-rose-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI is built on standard Python and HTTP. Understanding these
              fundamentals will make every other concept click instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Learning Progression */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Learning Progression</h2>
        <AnimatedFlow steps={flowSteps} accentColor="rose" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-rose-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interactive: HTTP Method Explorer */}
      <ScrollReveal className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Explore: HTTP Methods</h2>
        <HttpMethodExplorer />
      </ScrollReveal>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
