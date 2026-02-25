"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
const ApiKeySim = dynamic(
  () => import("../_components/api-key-sim").then(m => m.ApiKeySim),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { AhaMoment } from "@/components/aha-moment";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FailureDeepDive } from "@/components/failure-deep-dive";
import { SimpleFlow } from "@/components/simple-flow";
import { ShieldCheck } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          API keys are the simplest form of authentication. FastAPI supports them through headers, query parameters, or cookies using the Security utilities.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You protect your admin endpoint with an API key check. You compare key == 'admin-secret-key'. An attacker discovers they can time how long your comparison takes — and extract the key character by character."
        error={`# Your "secure" key check:
def verify_key(api_key: str):
    return api_key == "admin-secret-key-2024"

# The attacker's timing attack:
# "a..." → rejected in 0.2ms (first char wrong)
# "admin..." → rejected in 0.8ms (fails later = more chars matched!)
# "admin-secret-..." → rejected in 1.4ms
# After ~50 requests, they've reconstructed your entire key.`}
        errorType="Timing Attack"
        accentColor="amber"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Wait, how can comparing two strings leak your secret key? It sounds impossible,
          but it&apos;s a real attack vector. The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">==</code> operator
          in Python stops comparing at the first mismatched character. More matching characters = slightly longer response time.
        </p>
        <p>
          Let&apos;s build API key auth the right way — starting with the basics, then hardening it against attacks like this.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model: How API key auth flows */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">How API Key Auth Works</h2>
          <p className="text-muted-foreground mb-4">
            API keys are dead simple compared to OAuth2. There&apos;s no login flow, no token exchange.
            The client just includes the key with every request.
          </p>
          <SimpleFlow
            steps={[
              { label: "Client sends request", detail: "API key in header or query param", status: "neutral" },
              { label: "FastAPI extracts key", detail: "APIKeyHeader / APIKeyQuery", status: "neutral" },
              { label: "Your code validates", detail: "Look up key in database", status: "neutral" },
              { label: "Return data or 403", detail: "Invalid key = Forbidden", status: "success" },
            ]}
            accentColor="amber"
            className="mb-6"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        section="The Basics"
        points={[
          "API keys are sent with every request — no login step needed",
          "FastAPI provides APIKeyHeader and APIKeyQuery to extract keys automatically",
          "Invalid keys should return 403 Forbidden, not 401 Unauthorized",
          "API keys identify the application or user making the request",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 4. Code section: Header-based API keys */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Header-Based API Keys</h2>
          <p className="text-muted-foreground mb-4">
            This is the most common pattern. Clients send the API key in a custom header like{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">X-API-Key</code>.
            It keeps the key out of URLs and server logs.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Security, HTTPException
from fastapi.security import APIKeyHeader
import secrets

app = FastAPI()
api_key_header = APIKeyHeader(name="X-API-Key")

API_KEYS = {"secret-key-1": "user1", "secret-key-2": "user2"}

async def verify_api_key(api_key: str = Security(api_key_header)):
    # Use secrets.compare_digest to prevent timing attacks!
    for stored_key, user in API_KEYS.items():
        if secrets.compare_digest(api_key, stored_key):
            return user
    raise HTTPException(status_code=403, detail="Invalid API key")

@app.get("/data")
async def get_data(user: str = Security(verify_api_key)):
    return {"message": f"Hello {user}", "data": [1, 2, 3]}`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          Notice we&apos;re using <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">secrets.compare_digest()</code> instead
          of <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">==</code>. That one change
          eliminates the entire timing attack from our opening scenario. It&apos;s a single-line fix that makes
          your key comparison constant-time.
        </p>
      </ConversationalCallout>

      <Separator className="my-8" />

      {/* 5. Interactive sim — KEPT as-is */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try API Key Auth</h2>
          <p className="text-muted-foreground mb-4">
            Watch how FastAPI extracts and validates API keys from headers or query parameters.
            Try a valid key, then an invalid one — see the difference in responses.
          </p>
          <ApiKeySim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 6. Query Parameter API Keys */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Query Parameter API Keys</h2>
          <p className="text-muted-foreground mb-4">
            Sometimes you need the key in the URL — maybe for webhook callbacks or simple integrations.
            It works, but there&apos;s a catch.
          </p>
          <CodeBlock code={`from fastapi.security import APIKeyQuery

api_key_query = APIKeyQuery(name="api_key")

async def verify_api_key(api_key: str = Security(api_key_query)):
    for stored_key, user in API_KEYS.items():
        if secrets.compare_digest(api_key, stored_key):
            return user
    raise HTTPException(status_code=403, detail="Invalid API key")

# Usage: GET /data?api_key=secret-key-1`} filename="main.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="insight" className="mb-8">
        <p>
          Query parameter keys end up in server logs, browser history, and referrer headers.
          That&apos;s why headers are preferred for production APIs. Use query params only when
          headers aren&apos;t an option (like generating shareable links).
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        section="Key Locations"
        points={[
          "Header-based keys (X-API-Key) are more secure — they don't appear in URLs",
          "Query parameter keys are convenient but leak through logs and browser history",
          "Always use secrets.compare_digest() for key comparison, never ==",
          "FastAPI auto-generates Swagger UI fields for both header and query keys",
        ]}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 7. Multiple Auth Methods */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Supporting Multiple Auth Methods</h2>
          <p className="text-muted-foreground mb-4">
            What if some clients send the key in a header and others use a query parameter?
            You can support both. The trick is <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">auto_error=False</code> — without it,
            a missing header immediately returns 403 before you can check the query param.
          </p>
          <CodeBlock code={`api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_query = APIKeyQuery(name="api_key", auto_error=False)

async def verify_api_key(
    header_key: str | None = Security(api_key_header),
    query_key: str | None = Security(api_key_query),
):
    # Check header first, fall back to query param
    api_key = header_key or query_key
    if not api_key:
        raise HTTPException(status_code=403, detail="API key required")
    for stored_key, user in API_KEYS.items():
        if secrets.compare_digest(api_key, stored_key):
            return user
    raise HTTPException(status_code=403, detail="Invalid API key")`} filename="main.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why do we need auto_error=False when combining multiple auth methods?"
        reveal="By default, APIKeyHeader raises a 403 immediately if the header is missing. With auto_error=False, it returns None instead, giving your code a chance to check the query parameter next. Without it, header-only checking would block query-param users from ever authenticating."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 8. Go Deeper: The Timing Attack */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: Why Timing Attacks Work</h2>
          <p className="text-muted-foreground mb-4">
            Let&apos;s revisit that opening scenario. Here&apos;s the vulnerable code next to the fix,
            so you can see exactly what changes.
          </p>
          <FailureDeepDive
            title="Timing Attack via String Comparison"
            scenario="An attacker measures response times for different API key guesses. The == operator short-circuits on the first wrong character, leaking how many characters are correct."
            code={`async def verify_api_key(api_key: str = Security(api_key_header)):
    # BUG: == stops at first mismatch
    if api_key == "admin-secret-key-2024":
        return "admin"
    raise HTTPException(status_code=403, detail="Invalid")`}
            error={`# Attacker measures response times:
"a..."       → 0.21ms  (1 char correct)
"ad..."      → 0.23ms  (2 chars correct)
"adm..."     → 0.25ms  (3 chars correct)
# Each correct character adds ~0.02ms
# After 50 carefully timed requests:
"admin-secret-key-2024" → MATCH`}
            explanation="Python's == operator compares strings character by character and stops at the first difference. This means wrong keys with more correct leading characters take slightly longer to reject. An attacker can exploit these tiny timing differences to reconstruct the key one character at a time."
            fix="Use secrets.compare_digest() — it always takes the same amount of time regardless of how many characters match."
            fixCode={`import secrets

async def verify_api_key(api_key: str = Security(api_key_header)):
    # FIXED: constant-time comparison
    if secrets.compare_digest(api_key, "admin-secret-key-2024"):
        return "admin"
    raise HTTPException(status_code=403, detail="Invalid")`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* 9. Mental Model Challenge */}
      <MentalModelChallenge
        question="Why use secrets.compare_digest() instead of == for comparing API keys?"
        options={[
          { label: "It's faster than ==", correct: false, explanation: "It's actually slightly slower — it always checks every byte, even if the first character is wrong." },
          { label: "It prevents timing attacks by taking constant time", correct: true, explanation: "Exactly. It compares every byte regardless of where the mismatch is, so attackers can't measure their way to the answer." },
          { label: "It handles Unicode strings better", correct: false, explanation: "Both == and compare_digest handle Unicode. The difference is about timing, not encoding." },
          { label: "It raises exceptions instead of returning False", correct: false, explanation: "compare_digest returns True/False just like ==. The difference is in HOW it compares, not what it returns." },
        ]}
        hint="Think about what information an attacker can extract from response times."
        answer="Regular string comparison (==) stops at the first mismatched character — so 'aXXX' fails faster than 'admX'. This timing difference leaks information. secrets.compare_digest() always takes the same amount of time regardless of how many characters match. It compares every byte, so an attacker can't measure their way to the answer."
        className="mb-8"
      />

      {/* 10. Aha Moment */}
      <AhaMoment
        setup="API keys seem simpler than OAuth2/JWT. When should you use each?"
        reveal="API keys are great for server-to-server communication where both sides are trusted. They identify the application, not the user. OAuth2/JWT is better when you need to identify individual users, support login/logout, or handle fine-grained permissions. Many APIs use both: API keys for service identity, JWTs for user identity."
        icon={<ShieldCheck className="size-5 text-amber-500" />}
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 11. Key Points grid — KEPT */}
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
