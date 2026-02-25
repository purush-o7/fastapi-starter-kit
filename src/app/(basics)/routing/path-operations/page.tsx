"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";

export default function PathOperationsPage() {
  return (
    <div className="max-w-4xl ambient-routing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Path Operations</h1>
          <Badge variant="outline">Core Concept</Badge>
        </div>
        <TextEffect
          preset="fade-in-blur"
          per="word"
          delay={0.1}
          className="text-lg text-muted-foreground max-w-2xl"
        >
          Path operations are the core building blocks of FastAPI. Each one maps an HTTP method and URL path to a Python function.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">What is a Path Operation?</h2>
          <p className="text-muted-foreground mb-4">
            In FastAPI, a &quot;path operation&quot; is a combination of an HTTP method (GET, POST, PUT, DELETE) and a URL path. You create them using decorator syntax on your FastAPI app instance.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/items")
async def create_item():
    return {"item": "created"}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">HTTP Methods</h2>
          <p className="text-muted-foreground mb-4">
            FastAPI provides decorators for all standard HTTP methods. Each maps to a specific CRUD operation.
          </p>
          <CodeBlock
            code={`@app.get("/items")        # Read
async def list_items():
    return []

@app.post("/items")       # Create
async def create_item():
    return {"created": True}

@app.put("/items/{id}")   # Update (full)
async def update_item(id: int):
    return {"updated": id}

@app.patch("/items/{id}") # Update (partial)
async def patch_item(id: int):
    return {"patched": id}

@app.delete("/items/{id}") # Delete
async def delete_item(id: int):
    return {"deleted": id}`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Response Status Codes</h2>
          <p className="text-muted-foreground mb-4">
            You can set the default status code for each path operation using the status_code parameter.
          </p>
          <CodeBlock
            code={`from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    return None`}
            filename="main.py"
          />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Decorator Pattern</p>
              <p className="text-xs text-muted-foreground">@app.get(), @app.post() etc. map HTTP methods to functions</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Auto Documentation</p>
              <p className="text-xs text-muted-foreground">Every path operation automatically appears in /docs (Swagger UI)</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Async Support</p>
              <p className="text-xs text-muted-foreground">Use async def for I/O-bound operations, def for CPU-bound</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Status Codes</p>
              <p className="text-xs text-muted-foreground">Set default response codes with the status_code parameter</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
