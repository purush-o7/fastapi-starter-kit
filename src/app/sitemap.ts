import type { MetadataRoute } from "next";

const BASE_URL = "https://fastapi101.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes = [
    "/",
    "/fundamentals",
    "/fundamentals/what-is-an-api",
    "/fundamentals/python-setup",
    "/fundamentals/environment-variables",
    "/fundamentals/project-structure",
    "/fundamentals/auto-generated-docs",
    "/routing",
    "/routing/path-operations",
    "/routing/path-parameters",
    "/routing/query-parameters",
    "/data-handling",
    "/data-handling/request-body",
    "/data-handling/pydantic-models",
    "/data-handling/response-model",
    "/data-handling/headers-cookies",
    "/architecture",
    "/architecture/api-router",
    "/architecture/dependency-injection",
    "/architecture/middleware",
    "/architecture/cors",
    "/architecture/lifespan",
    "/error-handling",
    "/error-handling/http-exceptions",
    "/error-handling/custom-handlers",
    "/auth-security",
    "/auth-security/oauth2-jwt",
    "/auth-security/api-keys",
    "/auth-security/rate-limiting",
    "/background-async",
    "/background-async/async-endpoints",
    "/background-async/background-tasks",
    "/background-async/websockets",
    "/database",
    "/database/sqlalchemy-models",
    "/database/sessions",
    "/database/alembic-migrations",
    "/database/crud-operations",
    "/under-the-hood",
    "/under-the-hood/event-loop",
    "/under-the-hood/asgi-vs-wsgi",
    "/under-the-hood/uvicorn-gunicorn",
    "/testing",
    "/testing/pytest",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
