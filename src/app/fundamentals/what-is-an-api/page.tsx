"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function WhatIsAnApiPage() {
  return (
    <div className="max-w-4xl ambient-fundamentals">
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
          Understanding APIs, HTTP, JSON, and how clients talk to servers — the foundation everything else builds on.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What Does API Stand For?</h2>
          <p className="text-muted-foreground mb-4">
            API stands for <strong>Application Programming Interface</strong> — a contract between software systems that defines how they communicate. Think of it as a waiter in a restaurant: you (the client) tell the waiter (the API) what you want, and the kitchen (the server) prepares it. You never go into the kitchen yourself — the waiter handles the back-and-forth.
          </p>
          <p className="text-muted-foreground">
            In web development, APIs let your frontend (or any client) send requests to a backend server and receive structured data in return. FastAPI is a framework for building the server side of this equation.
          </p>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">HTTP: The Language of APIs</h2>
          <p className="text-muted-foreground mb-4">
            HTTP (HyperText Transfer Protocol) is how clients and servers communicate. Every API interaction is an HTTP request followed by an HTTP response. A request contains a method (GET, POST, etc.), a URL, headers, and optionally a body. A response contains a status code, headers, and a body with the data.
          </p>
          <CodeBlock
            code={`# Request
GET /api/items/42 HTTP/1.1
Host: example.com
Accept: application/json

# Response
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 42, "name": "Widget", "price": 9.99}`}
            filename="http-example.txt"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">JSON: The Data Format</h2>
          <p className="text-muted-foreground mb-4">
            JSON (JavaScript Object Notation) is the standard data format for APIs. It maps almost directly to Python dictionaries, with a few small differences in syntax.
          </p>
          <CodeBlock
            code={`# Python dictionary
item = {
    "name": "Widget",
    "price": 9.99,
    "tags": ["electronics", "sale"],
    "in_stock": True,    # Python: True
}

# Same data as JSON
# {"name": "Widget", "price": 9.99, "tags": ["electronics", "sale"], "in_stock": true}
# Note: true (lowercase) in JSON, True (capitalized) in Python`}
            filename="json_example.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Status Codes at a Glance</h2>
          <p className="text-muted-foreground mb-6">
            Every HTTP response includes a status code that tells the client what happened. Here are the ones you&apos;ll see most often when building APIs.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Success codes - green themed */}
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

            {/* Client error codes - amber themed */}
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

            {/* Server error codes - red themed */}
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm font-mono font-bold text-red-600 dark:text-red-400">500</p>
              <p className="text-sm font-medium">Internal Server Error</p>
              <p className="text-xs text-muted-foreground">Something broke on the server</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">APIs Are Contracts</p>
              <p className="text-xs text-muted-foreground">They define how software systems communicate without exposing internals</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">HTTP Is the Protocol</p>
              <p className="text-xs text-muted-foreground">Requests and responses flow over HTTP with methods, URLs, headers, and bodies</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">JSON Is the Format</p>
              <p className="text-xs text-muted-foreground">Structured data travels as JSON — nearly identical to Python dicts</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Status Codes Communicate Results</p>
              <p className="text-xs text-muted-foreground">2xx for success, 4xx for client errors, 5xx for server errors</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
