"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

type TopicLink = { href: string; label: string; section?: string };

const SECTION_ORDER = [
  "Fundamentals",
  "Routing",
  "Data Handling",
  "Architecture",
  "Error Handling",
  "Auth & Security",
  "Background & Async",
  "Database",
  "Under the Hood",
  "Testing",
];

const categoryTopics: { section: string; topics: TopicLink[] }[] = [
  {
    section: "Fundamentals",
    topics: [
      { href: "/fundamentals/what-is-an-api", label: "What is an API?" },
      { href: "/fundamentals/python-setup", label: "Python Setup" },
      { href: "/fundamentals/environment-variables", label: "Environment Variables" },
      { href: "/fundamentals/project-structure", label: "Project Structure" },
      { href: "/fundamentals/auto-generated-docs", label: "Auto-Generated Docs" },
    ],
  },
  {
    section: "Routing",
    topics: [
      { href: "/routing/path-operations", label: "Path Operations" },
      { href: "/routing/path-parameters", label: "Path Parameters" },
      { href: "/routing/query-parameters", label: "Query Parameters" },
    ],
  },
  {
    section: "Data Handling",
    topics: [
      { href: "/data-handling/request-body", label: "Request Body" },
      { href: "/data-handling/pydantic-models", label: "Pydantic Models" },
      { href: "/data-handling/response-model", label: "Response Model" },
      { href: "/data-handling/headers-cookies", label: "Headers & Cookies" },
    ],
  },
  {
    section: "Architecture",
    topics: [
      { href: "/architecture/api-router", label: "APIRouter" },
      { href: "/architecture/dependency-injection", label: "Dependency Injection" },
      { href: "/architecture/middleware", label: "Middleware" },
      { href: "/architecture/cors", label: "CORS" },
      { href: "/architecture/lifespan", label: "Lifespan Events" },
    ],
  },
  {
    section: "Error Handling",
    topics: [
      { href: "/error-handling/http-exceptions", label: "HTTP Exceptions" },
      { href: "/error-handling/custom-handlers", label: "Custom Handlers" },
    ],
  },
  {
    section: "Auth & Security",
    topics: [
      { href: "/auth-security/oauth2-jwt", label: "OAuth2 & JWT" },
      { href: "/auth-security/api-keys", label: "API Keys" },
      { href: "/auth-security/rate-limiting", label: "Rate Limiting" },
    ],
  },
  {
    section: "Background & Async",
    topics: [
      { href: "/background-async/async-endpoints", label: "Async Endpoints" },
      { href: "/background-async/background-tasks", label: "Background Tasks" },
      { href: "/background-async/websockets", label: "WebSockets" },
    ],
  },
  {
    section: "Database",
    topics: [
      { href: "/database/sqlalchemy-models", label: "SQLAlchemy Models" },
      { href: "/database/sessions", label: "Database Sessions" },
      { href: "/database/alembic-migrations", label: "Alembic Migrations" },
      { href: "/database/crud-operations", label: "CRUD Operations" },
    ],
  },
  {
    section: "Under the Hood",
    topics: [
      { href: "/under-the-hood/event-loop", label: "The Event Loop" },
      { href: "/under-the-hood/asgi-vs-wsgi", label: "ASGI vs WSGI" },
      { href: "/under-the-hood/uvicorn-gunicorn", label: "Uvicorn & Gunicorn" },
    ],
  },
  {
    section: "Testing",
    topics: [
      { href: "/testing/pytest", label: "Testing with pytest" },
    ],
  },
];

// Flatten into one continuous learning path
const allTopics: TopicLink[] = categoryTopics.flatMap((cat) =>
  cat.topics.map((t) => ({ ...t, section: cat.section }))
);

function getSectionForHref(href: string): string | undefined {
  for (const cat of categoryTopics) {
    if (cat.topics.some((t) => t.href === href)) return cat.section;
  }
  return undefined;
}

export function TopicNav() {
  const pathname = usePathname();

  const currentIndex = allTopics.findIndex((t) => t.href === pathname);
  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const next = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const currentSection = allTopics[currentIndex].section;
  const prevCrossesSection = prev && prev.section !== currentSection;
  const nextCrossesSection = next && next.section !== currentSection;

  const navRef = useRef<HTMLElement>(null);
  const scrollFired = useRef(false);

  useEffect(() => {
    scrollFired.current = false;
    const el = navRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scrollFired.current) {
          scrollFired.current = true;
          trackEvent("topic_scroll_completed", { path: pathname });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  if (!prev && !next) return null;

  return (
    <nav ref={navRef} className="flex items-center justify-between border-t pt-8 mt-12">
      {prev ? (
        <Link
          href={prev.href}
          onClick={() => trackEvent("topic_nav_clicked", { direction: "previous", destination: prev.href })}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <div className="text-right">
            {prevCrossesSection && (
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{prev.section}</div>
            )}
            <div className="text-xs text-muted-foreground/70">Previous</div>
            <div className="font-medium">{prev.label}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          onClick={() => trackEvent("topic_nav_clicked", { direction: "next", destination: next.href })}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
        >
          <div>
            {nextCrossesSection && (
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">{next.section}</div>
            )}
            <div className="text-xs text-muted-foreground/70">Next</div>
            <div className="font-medium">{next.label}</div>
          </div>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
