"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TopicLink = { href: string; label: string };

const categoryTopics: Record<string, TopicLink[]> = {
  "/routing": [
    { href: "/routing/path-operations", label: "Path Operations" },
    { href: "/routing/path-parameters", label: "Path Parameters" },
    { href: "/routing/query-parameters", label: "Query Parameters" },
  ],
  "/data-handling": [
    { href: "/data-handling/request-body", label: "Request Body" },
    { href: "/data-handling/pydantic-models", label: "Pydantic Models" },
    { href: "/data-handling/response-model", label: "Response Model" },
  ],
  "/architecture": [
    { href: "/architecture/api-router", label: "APIRouter" },
    { href: "/architecture/dependency-injection", label: "Dependency Injection" },
    { href: "/architecture/middleware", label: "Middleware" },
  ],
  "/error-handling": [
    { href: "/error-handling/http-exceptions", label: "HTTP Exceptions" },
    { href: "/error-handling/custom-handlers", label: "Custom Handlers" },
  ],
  "/auth-security": [
    { href: "/auth-security/oauth2-jwt", label: "OAuth2 & JWT" },
    { href: "/auth-security/api-keys", label: "API Keys" },
  ],
  "/background-async": [
    { href: "/background-async/async-endpoints", label: "Async Endpoints" },
    { href: "/background-async/background-tasks", label: "Background Tasks" },
  ],
  "/database-files": [
    { href: "/database-files/database-integration", label: "Database Integration" },
    { href: "/database-files/file-uploads", label: "File Uploads" },
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

  if (!prev && !next) return null;

  return (
    <nav className="flex items-center justify-between border-t pt-8 mt-12">
      {prev ? (
        <Link
          href={prev.href}
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
