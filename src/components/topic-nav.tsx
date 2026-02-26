"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

type TopicLink = { href: string; label: string };

const categoryTopics: Record<string, TopicLink[]> = {
  "/fundamentals": [
    { href: "/fundamentals/what-is-an-api", label: "What is an API?" },
    { href: "/fundamentals/python-setup", label: "Python Setup" },
    { href: "/fundamentals/environment-variables", label: "Environment Variables" },
    { href: "/fundamentals/project-structure", label: "Project Structure" },
    { href: "/fundamentals/auto-generated-docs", label: "Auto-Generated Docs" },
  ],
  "/routing": [
    { href: "/routing/path-operations", label: "Path Operations" },
    { href: "/routing/path-parameters", label: "Path Parameters" },
    { href: "/routing/query-parameters", label: "Query Parameters" },
  ],
  "/data-handling": [
    { href: "/data-handling/request-body", label: "Request Body" },
    { href: "/data-handling/pydantic-models", label: "Pydantic Models" },
    { href: "/data-handling/response-model", label: "Response Model" },
    { href: "/data-handling/headers-cookies", label: "Headers & Cookies" },
  ],
  "/architecture": [
    { href: "/architecture/api-router", label: "APIRouter" },
    { href: "/architecture/dependency-injection", label: "Dependency Injection" },
    { href: "/architecture/middleware", label: "Middleware" },
    { href: "/architecture/cors", label: "CORS" },
    { href: "/architecture/lifespan", label: "Lifespan Events" },
  ],
  "/error-handling": [
    { href: "/error-handling/http-exceptions", label: "HTTP Exceptions" },
    { href: "/error-handling/custom-handlers", label: "Custom Handlers" },
  ],
  "/auth-security": [
    { href: "/auth-security/oauth2-jwt", label: "OAuth2 & JWT" },
    { href: "/auth-security/api-keys", label: "API Keys" },
    { href: "/auth-security/rate-limiting", label: "Rate Limiting" },
  ],
  "/background-async": [
    { href: "/background-async/async-endpoints", label: "Async Endpoints" },
    { href: "/background-async/background-tasks", label: "Background Tasks" },
    { href: "/background-async/websockets", label: "WebSockets" },
  ],
  "/database": [
    { href: "/database/sqlalchemy-models", label: "SQLAlchemy Models" },
    { href: "/database/sessions", label: "Database Sessions" },
    { href: "/database/alembic-migrations", label: "Alembic Migrations" },
    { href: "/database/crud-operations", label: "CRUD Operations" },
  ],
  "/under-the-hood": [
    { href: "/under-the-hood/event-loop", label: "The Event Loop" },
    { href: "/under-the-hood/asgi-vs-wsgi", label: "ASGI vs WSGI" },
    { href: "/under-the-hood/uvicorn-gunicorn", label: "Uvicorn & Gunicorn" },
  ],
  "/testing": [
    { href: "/testing/pytest", label: "Testing with pytest" },
  ],
};

export function TopicNav() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const categoryPath = "/" + segments[0];
  const topics = categoryTopics[categoryPath];
  if (!topics) return null;

  const currentIndex = topics.findIndex((t) => t.href === pathname);
  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? topics[currentIndex - 1] : null;
  const next = currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null;

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
