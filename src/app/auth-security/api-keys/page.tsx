"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function ApiKeysPage() {
  return (
    <div className="max-w-4xl ambient-auth">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          API keys are the simplest form of authentication. FastAPI supports them through headers, query parameters, or cookies using the Security utilities.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Header-Based API Keys</h2>
          <p className="text-muted-foreground mb-4">The most common pattern — clients send the API key in a custom header.</p>
          <CodeBlock code={`from fastapi import FastAPI, Security, HTTPException
from fastapi.security import APIKeyHeader

app = FastAPI()
api_key_header = APIKeyHeader(name="X-API-Key")

API_KEYS = {"secret-key-1": "user1", "secret-key-2": "user2"}

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key not in API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return API_KEYS[api_key]

@app.get("/data")
async def get_data(user: str = Security(verify_api_key)):
    return {"message": f"Hello {user}", "data": [1, 2, 3]}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Query Parameter API Keys</h2>
          <p className="text-muted-foreground mb-4">For simpler use cases, accept the API key as a query parameter.</p>
          <CodeBlock code={`from fastapi.security import APIKeyQuery

api_key_query = APIKeyQuery(name="api_key")

async def verify_api_key(api_key: str = Security(api_key_query)):
    if api_key not in API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return API_KEYS[api_key]

# Usage: GET /data?api_key=secret-key-1`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Multiple Auth Methods</h2>
          <p className="text-muted-foreground mb-4">Support both header and query parameter authentication.</p>
          <CodeBlock code={`api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_query = APIKeyQuery(name="api_key", auto_error=False)

async def verify_api_key(
    header_key: str | None = Security(api_key_header),
    query_key: str | None = Security(api_key_query),
):
    api_key = header_key or query_key
    if not api_key or api_key not in API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return API_KEYS[api_key]`} filename="main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Simple Auth</p>
              <p className="text-xs text-muted-foreground">API keys are the simplest auth method — no login flow needed</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Header vs Query</p>
              <p className="text-xs text-muted-foreground">Headers are more secure — query params appear in logs and URLs</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">auto_error=False</p>
              <p className="text-xs text-muted-foreground">Disable auto error to support multiple auth methods</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">OpenAPI Docs</p>
              <p className="text-xs text-muted-foreground">Security schemes appear in Swagger UI automatically</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
