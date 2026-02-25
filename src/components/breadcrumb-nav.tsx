"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const labelMap: Record<string, string> = {
  fundamentals: "Fundamentals",
  "what-is-an-api": "What is an API?",
  "python-setup": "Python Setup",
  "environment-variables": "Environment Variables",
  "project-structure": "Project Structure",
  "auto-generated-docs": "Auto-Generated Docs",
  routing: "Routing",
  "data-handling": "Data Handling",
  architecture: "Architecture",
  "error-handling": "Error Handling",
  "auth-security": "Auth & Security",
  "background-async": "Background & Async",
  database: "Database",
  "path-operations": "Path Operations",
  "path-parameters": "Path Parameters",
  "query-parameters": "Query Parameters",
  "request-body": "Request Body",
  "pydantic-models": "Pydantic Models",
  "response-model": "Response Model",
  "api-router": "APIRouter",
  "dependency-injection": "Dependency Injection",
  middleware: "Middleware",
  "http-exceptions": "HTTP Exceptions",
  "custom-handlers": "Custom Handlers",
  "oauth2-jwt": "OAuth2 & JWT",
  "api-keys": "API Keys",
  "async-endpoints": "Async Endpoints",
  "background-tasks": "Background Tasks",
  "sqlalchemy-models": "SQLAlchemy Models",
  sessions: "Database Sessions",
  "alembic-migrations": "Alembic Migrations",
  "crud-operations": "CRUD Operations",
  "under-the-hood": "Under the Hood",
  "event-loop": "The Event Loop",
  "asgi-vs-wsgi": "ASGI vs WSGI",
  "uvicorn-gunicorn": "Uvicorn & Gunicorn",
  "headers-cookies": "Headers & Cookies",
  cors: "CORS",
  lifespan: "Lifespan Events",
  "rate-limiting": "Rate Limiting",
  websockets: "WebSockets",
  testing: "Testing",
  pytest: "Testing with pytest",
};

export function BreadcrumbNav() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link
        href="/"
        className="hover:text-foreground transition-colors"
      >
        <Home className="size-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = labelMap[segment] || segment.replace(/-/g, " ");

        return (
          <Fragment key={href}>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
