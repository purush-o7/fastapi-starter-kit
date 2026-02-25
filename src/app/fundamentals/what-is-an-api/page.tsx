"use client";

import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { RoughHighlight } from "@/components/rough-highlight";
import { AutoAnimateGrid } from "@/components/auto-animate-grid";
const ApiRequestBuilder = dynamic(
  () => import("../_components/api-request-builder").then(m => m.ApiRequestBuilder),
  { ssr: false, loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { AhaMoment } from "@/components/aha-moment";

export default function WhatIsAnApiPage() {
  return (
    <div className="max-w-4xl relative">
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">What is an API?</h1>
          <Badge variant="outline">Fundamentals</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Your frontend is talking to your backend. But how? And what happens when the conversation breaks down?
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="You build a frontend, deploy it, and try to fetch data from your backend. The browser console shows a CORS error. Your frontend can see the backend, but the browser blocks every request."
        error={`Access to fetch at 'http://localhost:8000/api' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.`}
        errorType="CORS Error"
        accentColor="rose"
        className="mb-8"
      />

      {/* 2. Bridge from failure to concept */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Why would the browser block a request that clearly works when you test it with curl or Postman?
          The answer is baked into how the web works — and understanding it starts with understanding what an API actually is.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model BEFORE code */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">The Big Picture: How APIs Work</h2>
          <p className="text-muted-foreground mb-4">
            Every API interaction follows the same pattern. Your client sends a request, the server processes it, and sends back a response. That&apos;s it. Everything else is details.
          </p>
          <SimpleFlow
            steps={[
              { label: "Client", detail: "Your browser or app" },
              { label: "HTTP Request", detail: "GET, POST, etc." },
              { label: "Server", detail: "Your FastAPI app" },
              { label: "HTTP Response", detail: "Data + status code" },
              { label: "Client", detail: "Renders the data" },
            ]}
            accentColor="rose"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">So What Does &quot;API&quot; Actually Mean?</h2>
          <p className="text-muted-foreground mb-4">
            API stands for{" "}
            <RoughHighlight type="highlight" color="rgba(244, 63, 94, 0.15)" animationDuration={1200}>
              <strong>Application Programming Interface</strong>
            </RoughHighlight>
            . Think of it as a contract: &quot;Send me data in this shape, and I&apos;ll send you data back in that shape.&quot;
          </p>
          <p className="text-muted-foreground mb-4">
            You never touch the server&apos;s database directly. You never see its internal code. You just talk to the API, and it handles everything behind the scenes.
          </p>
          <ConversationalCallout type="story">
            <p>
              It&apos;s like ordering at a restaurant. You tell the waiter what you want (the API), and the kitchen (the server) makes it. You never walk into the kitchen yourself — the waiter handles the back-and-forth.
            </p>
          </ConversationalCallout>
        </section>
      </ScrollReveal>

      {/* 4. Checkpoint */}
      <WhatYouJustLearned
        points={[
          "An API is a contract between software systems — it defines how they talk to each other",
          "Clients send requests, servers send responses — that's the whole cycle",
          "You never access the server's internals directly — the API is the go-between",
        ]}
        section="APIs 101"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* 5. HTTP walkthrough */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">HTTP: The Language Your API Speaks</h2>
          <p className="text-muted-foreground mb-4">
            HTTP is how clients and servers communicate. Every time you hit an API, you&apos;re sending an HTTP request. Every response you get back? Also HTTP. A request has a{" "}
            <RoughHighlight type="underline" color="rgba(244, 63, 94, 0.6)" strokeWidth={2}>method (GET, POST, etc.)</RoughHighlight>
            , a URL, headers, and optionally a body. A response has a{" "}
            <RoughHighlight type="box" color="rgba(244, 63, 94, 0.5)" strokeWidth={1.5} padding={3}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">status code</code>
            </RoughHighlight>
            , headers, and the data.
          </p>
          <CodeBlock
            code={`# Here's a full HTTP conversation
# Your client sends this:
GET /api/items/42 HTTP/1.1
Host: example.com
Accept: application/json

# The server responds with this:
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 42, "name": "Widget", "price": 9.99}`}
            filename="http-example.txt"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why do we need methods like GET, POST, PUT, DELETE? Can't we just send data and let the server figure it out?"
        reveal="Methods tell the server your intent before it even looks at the data. GET means 'give me something,' POST means 'create something new,' PUT means 'update this,' DELETE means 'remove this.' It's like the difference between asking a question and giving an order — the verb matters."
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">JSON: How Your Data Travels</h2>
          <p className="text-muted-foreground mb-4">
            JSON (JavaScript Object Notation) is the{" "}
            <RoughHighlight type="underline" color="rgba(52, 211, 153, 0.6)" strokeWidth={2}>standard data format for APIs</RoughHighlight>.
            If you know Python dictionaries, you basically already know JSON. There are just a couple of quirks.
          </p>
          <CodeBlock
            code={`# Python dictionary — looks familiar, right?
item = {
    "name": "Widget",
    "price": 9.99,
    "tags": ["electronics", "sale"],
    "in_stock": True,    # Python uses True (capital T)
}

# Same data as JSON (spot the difference!)
# {"name": "Widget", "price": 9.99, "tags": ["electronics", "sale"], "in_stock": true}
# JSON uses true (lowercase t) — that's basically the only gotcha`}
            filename="json_example.py"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "HTTP is the protocol — it carries requests and responses between client and server",
          "Methods (GET, POST, etc.) tell the server what you want to do",
          "JSON is how data travels — it's almost identical to Python dicts",
        ]}
        section="HTTP & JSON"
        className="mb-8"
      />

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Status Codes: What the Server Is Telling You</h2>
          <p className="text-muted-foreground mb-4">
            Ever seen a 404? That&apos;s a status code. Every HTTP response includes one, and it tells you what happened. Here are the ones you&apos;ll run into constantly when building APIs.
          </p>

          <ConversationalCallout type="insight" className="mb-6">
            <p>
              Think of status codes as the server&apos;s one-word answer before the details. 200 = &quot;Sure, here you go.&quot; 404 = &quot;Never heard of it.&quot; 500 = &quot;Something broke and it&apos;s not your fault.&quot;
            </p>
          </ConversationalCallout>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-sm font-mono font-bold text-green-600 dark:text-green-400">200</p>
              <p className="text-sm font-medium">OK</p>
              <p className="text-xs text-muted-foreground">Request succeeded</p>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-sm font-mono font-bold text-green-600 dark:text-green-400">201</p>
              <p className="text-sm font-medium">Created</p>
              <p className="text-xs text-muted-foreground">Resource was created</p>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-sm font-mono font-bold text-green-600 dark:text-green-400">204</p>
              <p className="text-sm font-medium">No Content</p>
              <p className="text-xs text-muted-foreground">Success, no body returned</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">400</p>
              <p className="text-sm font-medium">Bad Request</p>
              <p className="text-xs text-muted-foreground">Malformed request syntax</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">401</p>
              <p className="text-sm font-medium">Unauthorized</p>
              <p className="text-xs text-muted-foreground">Missing or invalid auth</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">404</p>
              <p className="text-sm font-medium">Not Found</p>
              <p className="text-xs text-muted-foreground">Resource does not exist</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">422</p>
              <p className="text-sm font-medium">Validation Error</p>
              <p className="text-xs text-muted-foreground">Data failed validation</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm font-mono font-bold text-red-600 dark:text-red-400">500</p>
              <p className="text-sm font-medium">Internal Server Error</p>
              <p className="text-xs text-muted-foreground">Something broke on the server</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "2xx means success — the server did what you asked",
          "4xx means you messed up — bad request, missing auth, wrong URL",
          "5xx means the server messed up — something crashed on their end",
          "422 is FastAPI's favorite — it means your data didn't pass validation",
        ]}
        section="Status codes"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Interactive: API Request Builder (KEEP as-is) */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Try It: Build a Request</h2>
          <p className="text-muted-foreground mb-4">
            Pick a scenario, hit Send, and watch the full HTTP conversation play out — from request to response.
          </p>
          <ApiRequestBuilder />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If you send a POST request with no body to an endpoint that expects JSON, what status code do you get back?"
        options={[
          { label: "400 Bad Request", correct: false, explanation: "Close! A 400 means the HTTP syntax itself is malformed. But an empty body is syntactically valid HTTP." },
          { label: "404 Not Found", correct: false, explanation: "A 404 means the URL doesn't exist. The endpoint is there — it's the data that's wrong." },
          { label: "422 Unprocessable Entity", correct: true, explanation: "Exactly! The HTTP request is valid, but the data inside doesn't match what FastAPI expects." },
          { label: "500 Internal Server Error", correct: false, explanation: "A 500 would mean something crashed on the server. FastAPI catches validation issues before they cause crashes." },
        ]}
        hint="Think about what FastAPI does with Pydantic models..."
        answer="You'll get a 422 Unprocessable Entity. FastAPI validates the request body against your Pydantic model, and an empty body doesn't match. The 422 tells you the request was syntactically valid HTTP but semantically wrong."
        className="mb-8"
      />

      <Separator className="my-8" />

      <AhaMoment
        setup="Wait — so an API isn't just 'a backend'? What's the actual difference?"
        reveal="A backend is the entire server-side application — database, business logic, file storage, everything. An API is just the door. It's the specific set of URLs and rules that let the outside world interact with your backend. You can have a backend without exposing an API, and you can have multiple APIs talking to the same backend."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEEP existing) */}
      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <AutoAnimateGrid className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">APIs Are Contracts</p>
              <p className="text-xs text-muted-foreground">They define how software systems communicate without exposing internals</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">HTTP Is the Protocol</p>
              <p className="text-xs text-muted-foreground">Requests and responses flow over HTTP with methods, URLs, headers, and bodies</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">JSON Is the Format</p>
              <p className="text-xs text-muted-foreground">Structured data travels as JSON — nearly identical to Python dicts</p>
            </div>
            <div className="rounded-lg border p-4 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5">
              <p className="text-sm font-medium mb-1">Status Codes Communicate Results</p>
              <p className="text-xs text-muted-foreground">2xx for success, 4xx for client errors, 5xx for server errors</p>
            </div>
          </AutoAnimateGrid>
        </section>
      </ScrollReveal>
    </div>
  );
}
