"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { TestRunnerSim } from "../_components/test-runner-sim";

export default function TestingPage() {
  return (
    <div className="max-w-4xl ambient-testing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Testing</h1>
          <Badge variant="outline">Testing</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          FastAPI makes testing easy with TestClient — simulate real HTTP requests against your app without starting a server. Combine it with pytest for a fast, reliable test suite.
        </TextEffect>
      </div>

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">TestClient Basics</h2>
          <p className="text-muted-foreground mb-4">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">TestClient</code> wraps your FastAPI app and lets you make requests as if you were a real client. Install it with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">pip install httpx</code> (required for TestClient).
          </p>
          <CodeBlock code={`# pip install httpx pytest

from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Create a test client
client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}`} filename="test_main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It Run</h2>
          <p className="text-muted-foreground mb-4">Watch pytest execute tests against your FastAPI app. Try different scenarios to see how pass, fail, and validation results look.</p>
          <TestRunnerSim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Testing GET Endpoints</h2>
          <p className="text-muted-foreground mb-4">Test query parameters, path parameters, and response shapes.</p>
          <CodeBlock code={`from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

items_db = [
    {"id": 1, "name": "Foo"},
    {"id": 2, "name": "Bar"},
]

@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return items_db[skip : skip + limit]

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    for item in items_db:
        if item["id"] == item_id:
            return item
    return {"error": "Not found"}

client = TestClient(app)

def test_list_items():
    response = client.get("/items")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_list_items_with_params():
    response = client.get("/items?skip=1&limit=1")
    assert response.status_code == 200
    assert response.json() == [{"id": 2, "name": "Bar"}]

def test_get_item():
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Foo"`} filename="test_items.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Testing POST with JSON</h2>
          <p className="text-muted-foreground mb-4">Send JSON request bodies and verify the response.</p>
          <CodeBlock code={`from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.testclient import TestClient

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items", status_code=201)
async def create_item(item: Item):
    return {"id": 1, **item.model_dump()}

client = TestClient(app)

def test_create_item():
    response = client.post(
        "/items",
        json={"name": "Widget", "price": 9.99},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
    assert data["price"] == 9.99
    assert "id" in data

def test_create_item_invalid():
    response = client.post(
        "/items",
        json={"name": "Widget"},  # Missing price
    )
    assert response.status_code == 422  # Validation error`} filename="test_items.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Testing Authenticated Endpoints</h2>
          <p className="text-muted-foreground mb-4">
            Pass headers and tokens to test protected routes. For dependency-based auth, you can override the auth dependency with a fake — see the <a href="/architecture/dependency-injection" className="text-emerald-500 hover:underline">Dependency Injection</a> page for details on <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">dependency_overrides</code>.
          </p>
          <CodeBlock code={`from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/protected")
async def protected_route(authorization: str = Header()):
    if authorization != "Bearer valid-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"message": "Access granted"}

client = TestClient(app)

def test_protected_with_valid_token():
    response = client.get(
        "/protected",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Access granted"

def test_protected_without_token():
    response = client.get("/protected")
    assert response.status_code == 422  # Missing required header

def test_protected_with_invalid_token():
    response = client.get(
        "/protected",
        headers={"Authorization": "Bearer wrong-token"},
    )
    assert response.status_code == 401`} filename="test_auth.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Async Test Client</h2>
          <p className="text-muted-foreground mb-4">
            For async endpoints that use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code>, you can use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">httpx.AsyncClient</code> with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">pytest-asyncio</code> for truly async tests.
          </p>
          <CodeBlock code={`# pip install httpx pytest-asyncio

import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI

app = FastAPI()

@app.get("/async-items")
async def list_items():
    # In real code, this might await a database call
    return [{"id": 1, "name": "Async Item"}]

@pytest.mark.anyio
async def test_async_list_items():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/async-items")
    assert response.status_code == 200
    assert response.json()[0]["name"] == "Async Item"`} filename="test_async.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      <ScrollReveal>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Points</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">TestClient</p>
              <p className="text-xs text-muted-foreground">Simulate HTTP requests without running a server</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">response.json()</p>
              <p className="text-xs text-muted-foreground">Parse and assert on JSON response bodies directly</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Status Codes</p>
              <p className="text-xs text-muted-foreground">Always assert status_code to catch unexpected errors</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">422 Validation</p>
              <p className="text-xs text-muted-foreground">Test invalid inputs to verify Pydantic validation works</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">Headers</p>
              <p className="text-xs text-muted-foreground">Pass auth tokens and custom headers in test requests</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">AsyncClient</p>
              <p className="text-xs text-muted-foreground">Use httpx.AsyncClient for truly async test execution</p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
