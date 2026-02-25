"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type TopicLink = { href: string };

const categoryTopics: Record<string, TopicLink[]> = {
  "/routing": [
    { href: "/routing/path-operations" },
    { href: "/routing/path-parameters" },
    { href: "/routing/query-parameters" },
  ],
  "/data-handling": [
    { href: "/data-handling/request-body" },
    { href: "/data-handling/pydantic-models" },
    { href: "/data-handling/response-model" },
  ],
  "/architecture": [
    { href: "/architecture/api-router" },
    { href: "/architecture/dependency-injection" },
    { href: "/architecture/middleware" },
  ],
  "/error-handling": [
    { href: "/error-handling/http-exceptions" },
    { href: "/error-handling/custom-handlers" },
  ],
  "/auth-security": [
    { href: "/auth-security/oauth2-jwt" },
    { href: "/auth-security/api-keys" },
  ],
  "/background-async": [
    { href: "/background-async/async-endpoints" },
    { href: "/background-async/background-tasks" },
  ],
  "/database": [
    { href: "/database/sqlalchemy-models" },
    { href: "/database/sessions" },
    { href: "/database/alembic-migrations" },
    { href: "/database/crud-operations" },
  ],
};

export function useKeyboardNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const segments = pathname.split("/").filter(Boolean);
      if (segments.length < 2) return;

      const categoryPath = "/" + segments[0];
      const topics = categoryTopics[categoryPath];
      if (!topics) return;

      const currentIndex = topics.findIndex((t) => t.href === pathname);
      if (currentIndex === -1) return;

      if ((e.key === "j" || e.key === "ArrowRight") && !e.metaKey && !e.ctrlKey) {
        if (currentIndex < topics.length - 1) {
          e.preventDefault();
          router.push(topics[currentIndex + 1].href);
        }
      } else if ((e.key === "k" || e.key === "ArrowLeft") && !e.metaKey && !e.ctrlKey) {
        if (currentIndex > 0) {
          e.preventDefault();
          router.push(topics[currentIndex - 1].href);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);
}
