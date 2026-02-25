import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  Braces,
  GitFork,
  AlertTriangle,
  Shield,
  Timer,
  Database,
  ArrowRight,
  BookOpen,
  Sparkles,
  Code,
  Cpu,
  TestTube,
} from "lucide-react";
import { AnimatedHero } from "./_components/animated-hero";
import { ScrollReveal } from "@/components/scroll-reveal";

const highlights = [
  {
    icon: BookOpen,
    title: "Python First",
    description:
      "Every example uses modern Python with type hints. FastAPI leverages Python 3.10+ features like Annotated types and async/await.",
    accent: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Sparkles,
    title: "Interactive Examples",
    description:
      "Each concept comes with real code you can copy and run. See how FastAPI auto-generates docs and validates data in real-time.",
    accent: "text-teal-500 bg-teal-500/10",
  },
  {
    icon: Code,
    title: "Code Playground",
    description:
      "Syntax-highlighted Python code blocks with copy support. Learn by reading real FastAPI patterns, not abstract diagrams.",
    accent: "text-cyan-500 bg-cyan-500/10",
  },
];

const basicsCategories = [
  {
    href: "/routing",
    label: "Routing",
    icon: Route,
    description:
      "Path operations, path parameters, and query parameters — the foundation of every FastAPI endpoint.",
    topicCount: 3,
    accent: "text-teal-500 bg-teal-500/10 border-teal-500/20",
  },
  {
    href: "/data-handling",
    label: "Data Handling",
    icon: Braces,
    description:
      "Request bodies, Pydantic models, and response models — how FastAPI validates and serializes your data.",
    topicCount: 4,
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
];

const coreCategories = [
  {
    href: "/architecture",
    label: "Architecture",
    icon: GitFork,
    description:
      "APIRouter, dependency injection, middleware, CORS, and lifespan events — organize and scale your FastAPI application.",
    topicCount: 5,
    accent: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  {
    href: "/error-handling",
    label: "Error Handling",
    icon: AlertTriangle,
    description:
      "HTTP exceptions and custom exception handlers — graceful error responses for your API.",
    topicCount: 2,
    accent: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
  {
    href: "/under-the-hood",
    label: "Under the Hood",
    icon: Cpu,
    description:
      "Event loop, ASGI servers, and process managers — how FastAPI actually handles your requests.",
    topicCount: 3,
    accent: "text-lime-500 bg-lime-500/10 border-lime-500/20",
  },
];

const advancedCategories = [
  {
    href: "/auth-security",
    label: "Auth & Security",
    icon: Shield,
    description:
      "OAuth2 with JWT tokens, API key authentication, and rate limiting — secure your endpoints.",
    topicCount: 3,
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    href: "/background-async",
    label: "Background & Async",
    icon: Timer,
    description:
      "Async endpoints, background tasks, and WebSockets — handle concurrent requests, deferred work, and real-time communication.",
    topicCount: 3,
    accent: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    href: "/database",
    label: "Database",
    icon: Database,
    description:
      "SQLAlchemy models, database sessions, Alembic migrations, and CRUD operations.",
    topicCount: 4,
    accent: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  },
];

const productionCategories = [
  {
    href: "/testing",
    label: "Testing",
    icon: TestTube,
    description:
      "Testing your FastAPI application — from basic endpoint tests to dependency overrides and async testing.",
    topicCount: 1,
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl grain">
      <AnimatedHero />

      {/* Highlights — asymmetric: first item wider */}
      <section className="mb-12">
        <div className="grid gap-6 sm:grid-cols-[2fr_1fr_1fr]">
          {highlights.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.1}>
              <div className="space-y-2">
                <div
                  className={`inline-flex rounded-lg p-2 ${item.accent}`}
                >
                  <item.icon className="size-4" />
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="my-10 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Fundamentals — full-width featured card with accent border */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-serif">Fundamentals</h2>
          <Badge
            variant="default"
            className="bg-gradient-to-r from-rose-500 to-pink-500 border-0"
          >
            Getting Started
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Before writing your first endpoint, learn the essentials — what APIs
          are, how to set up Python, manage secrets, and structure your project.
        </p>
        <Link href="/fundamentals">
          <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border border-l-2 border-l-rose-500/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-md p-1 text-rose-500 bg-rose-500/10 border-rose-500/20">
                  <BookOpen className="size-4" />
                </div>
                <CardTitle className="text-base">Fundamentals</CardTitle>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  5 topics
                </Badge>
              </div>
              <CardDescription>
                APIs, Python setup, virtual environments, .env files, project
                structure, and auto-generated documentation.
              </CardDescription>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/70 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight className="size-3" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </section>

      <div className="my-10 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Basics — 2 cards with staggered offset */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-serif">Basics</h2>
          <Badge
            variant="default"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 border-0"
          >
            Start Here
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          The essential building blocks of every FastAPI application. Start with
          routing to understand how endpoints work, then learn how FastAPI
          handles data validation and serialization.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {basicsCategories.map((category, index) => (
            <Link key={category.href} href={category.href} className={index === 1 ? "sm:translate-y-3" : ""}>
              <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1 ${category.accent}`}>
                      <category.icon className="size-4" />
                    </div>
                    <CardTitle className="text-base">
                      {category.label}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px]"
                    >
                      {category.topicCount} topics
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {category.description}
                  </CardDescription>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/70 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="size-3" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="my-10 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Core Patterns — 2+1 layout: first two side-by-side, third offset */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-serif">Core Patterns</h2>
          <Badge variant="outline">Architecture</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Patterns for structuring and scaling your FastAPI applications.
          Dependency injection, middleware, and error handling strategies.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {coreCategories.map((category, index) => (
            <Link
              key={category.href}
              href={category.href}
              className={index === 2 ? "sm:max-w-sm" : ""}
            >
              <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <category.icon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {category.label}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px]"
                    >
                      {category.topicCount} topics
                    </Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="my-10 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Advanced — first card spans full width, others below */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-serif">Advanced</h2>
          <Badge variant="secondary">Deep Dive</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Authentication, async patterns, database integration, and file
          handling — everything you need for production-ready APIs.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {advancedCategories.map((category, index) => (
            <Link
              key={category.href}
              href={category.href}
              className={index === 0 ? "sm:col-span-2" : ""}
            >
              <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <category.icon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {category.label}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px]"
                    >
                      {category.topicCount} topics
                    </Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="my-10 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Production — right-aligned with whitespace */}
      <section>
        <div className="flex items-center gap-2 mb-2 sm:justify-end">
          <h2 className="text-xl font-serif">Production</h2>
          <Badge
            variant="default"
            className="bg-gradient-to-r from-emerald-500 to-green-500 border-0"
          >
            Ship It
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-6 sm:text-right">
          Testing and quality assurance — make sure your API works before
          shipping it to production.
        </p>
        <div className="flex sm:justify-end">
          <div className="w-full sm:w-2/3 lg:w-1/2">
            {productionCategories.map((category) => (
              <Link key={category.href} href={category.href}>
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`rounded-md p-1 ${category.accent}`}>
                        <category.icon className="size-4" />
                      </div>
                      <CardTitle className="text-base">
                        {category.label}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[10px]"
                      >
                        {category.topicCount} topics
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {category.description}
                    </CardDescription>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
