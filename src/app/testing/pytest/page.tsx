"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextEffect } from "@/components/ui/text-effect";
import { TestRunnerSim } from "../_components/test-runner-sim";
import { WhatCouldGoWrong } from "@/components/what-could-go-wrong";
import { ConversationalCallout } from "@/components/conversational-callout";
import { SimpleFlow } from "@/components/simple-flow";
import { WhatYouJustLearned } from "@/components/what-you-just-learned";
import { AhaMoment } from "@/components/aha-moment";
import { MentalModelChallenge } from "@/components/mental-model-challenge";
import { FailureDeepDive } from "@/components/failure-deep-dive";

export default function TestingPage() {
  return (
    <div className="max-w-4xl ambient-testing">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Testing</h1>
          <Badge variant="outline">Testing</Badge>
        </div>
        <TextEffect preset="fade-in-blur" per="word" delay={0.1} className="text-lg text-muted-foreground max-w-2xl">
          Tests that pass locally but fail in CI aren&apos;t tests &mdash; they&apos;re coincidences. Let&apos;s write tests that actually prove your API works.
        </TextEffect>
      </div>

      {/* 1. Failure hook */}
      <WhatCouldGoWrong
        scenario="Your tests pass locally. CI runs them in a different order. 3 tests fail. They were depending on state from previous tests — a test database that wasn't cleaned up between runs."
        error={`# Locally (tests run in file order):
$ pytest tests/ -v
test_create_user PASSED
test_get_users PASSED  (finds the user created above)
test_delete_user PASSED

# CI (random order with pytest-randomly):
$ pytest tests/ -v -p randomly
test_get_users FAILED  AssertionError: assert [] == [{"id": 1, "name": "Alice"}]
test_delete_user FAILED  404: User not found
test_create_user PASSED

# Tests 2 and 3 depended on test 1 running first.`}
        errorType="Flaky Tests"
        accentColor="emerald"
        className="mb-8"
      />

      {/* 2. Bridge */}
      <ConversationalCallout type="question" className="mb-8">
        <p>
          Ever had a test suite where some tests randomly fail? The problem isn&apos;t randomness
          &mdash; it&apos;s hidden dependencies. test_get_users only passed because test_create_user
          ran first and left a user in the database. Swap the order, and it falls apart.
          The fix: every test sets up its own data and cleans up after itself.
        </p>
      </ConversationalCallout>

      {/* 3. Mental model */}
      <ScrollReveal>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">How FastAPI testing works</h2>
          <p className="text-muted-foreground mb-4">
            TestClient wraps your FastAPI app and simulates HTTP requests without starting a
            real server. No ports, no network &mdash; just direct Python function calls that
            behave exactly like real requests.
          </p>
          <SimpleFlow
            steps={[
              { label: "TestClient", detail: "Wraps your app", status: "neutral" },
              { label: "Fake HTTP", detail: "client.get('/users')", status: "neutral" },
              { label: "Your Endpoint", detail: "Runs normally", status: "neutral" },
              { label: "Response", detail: "Status + JSON", status: "success" },
            ]}
            accentColor="emerald"
            className="mb-4"
          />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "TestClient simulates HTTP without a running server — fast and reliable",
          "Each test should be independent — set up its own data, clean up after",
          "Tests that depend on execution order aren't tests, they're time bombs",
        ]}
        section="Core Concept"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* TestClient Basics */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Your first test</h2>
          <p className="text-muted-foreground mb-4">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">TestClient</code> wraps your FastAPI
            app and lets you make requests as if you were a real client. Install it with
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> pip install httpx</code> (required for TestClient).
          </p>
          <CodeBlock code={`# pip install httpx pytest

from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Create a test client — no server needed
client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
    # That's it. No server startup, no port conflicts.`} filename="test_main.py" />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Interactive Viz (KEPT) */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">See It Run</h2>
          <p className="text-muted-foreground mb-4">
            Watch pytest execute tests against your FastAPI app. Try different scenarios
            to see how pass, fail, and validation results look.
          </p>
          <TestRunnerSim />
        </section>
      </ScrollReveal>

      <Separator className="my-8" />

      {/* Testing GET */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Testing GET endpoints</h2>
          <p className="text-muted-foreground mb-4">
            Test query parameters, path parameters, and response shapes. Notice how you
            test both the happy path and edge cases &mdash; that&apos;s what catches bugs before
            production does.
          </p>
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
    assert len(response.json()) == 2  # Both items returned

def test_list_items_with_params():
    # Test that skip and limit actually work
    response = client.get("/items?skip=1&limit=1")
    assert response.status_code == 200
    assert response.json() == [{"id": 2, "name": "Bar"}]

def test_get_item():
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Foo"`} filename="test_items.py" />
        </section>
      </ScrollReveal>

      <WhatYouJustLearned
        points={[
          "Query parameters go in the URL string: client.get('/items?skip=1')",
          "Path parameters go in the URL path: client.get('/items/1')",
          "response.json() gives you the parsed dict — assert on it directly",
        ]}
        section="GET Testing"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Testing POST */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Testing POST with JSON</h2>
          <p className="text-muted-foreground mb-4">
            Send JSON request bodies and verify the response. The most important test
            here isn&apos;t the happy path &mdash; it&apos;s the validation test. You want to make sure
            invalid data gets rejected with a 422, not silently accepted.
          </p>
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
        json={"name": "Widget", "price": 9.99},  # json= for body
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
    assert data["price"] == 9.99
    assert "id" in data  # Database should generate this

def test_create_item_invalid():
    # Missing required field — should be rejected
    response = client.post(
        "/items",
        json={"name": "Widget"},  # No price!
    )
    assert response.status_code == 422  # Pydantic validation error`} filename="test_items.py" />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why test for 422 on invalid input? Pydantic handles validation automatically."
        reveal="Exactly — and that's why you test it. You want to PROVE that validation works. What if someone changes the schema and makes price optional? Your 422 test catches that regression. Without it, invalid data silently flows into your database. Test the guardrails, not just the happy path."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Testing Auth */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Testing authenticated endpoints</h2>
          <p className="text-muted-foreground mb-4">
            Pass headers and tokens to test protected routes. You should test three cases:
            valid token, no token, and invalid token. Each should return a different status code.
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
    assert response.status_code == 401  # Unauthorized`} filename="test_auth.py" />
        </section>
      </ScrollReveal>

      <ConversationalCallout type="warning" className="mb-8">
        <p>
          For dependency-based auth, you can override the auth dependency with a fake using
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> dependency_overrides</code>.
          But here&apos;s the trap: if you set an override in one test and forget to clear it,
          the next test inherits it. Always clean up overrides after each test.
        </p>
      </ConversationalCallout>

      <WhatYouJustLearned
        points={[
          "Pass headers via the headers= parameter: client.get('/path', headers={...})",
          "Test three auth scenarios: valid token, missing token, invalid token",
          "dependency_overrides lets you swap out auth for testing — but clean up after",
        ]}
        section="Auth Testing"
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Async Testing */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Async test client: when you need it</h2>
          <p className="text-muted-foreground mb-4">
            For async endpoints that use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">async def</code>,
            you can use <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">httpx.AsyncClient</code> with
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"> pytest-asyncio</code> for truly async tests.
            Most of the time TestClient works fine &mdash; but if you&apos;re testing async database
            calls or async dependencies, you need the real async flow.
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

      {/* Go Deeper: FailureDeepDive */}
      <ScrollReveal>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Go Deeper: The leaking override</h2>
          <FailureDeepDive
            title="dependency_overrides not cleaned up"
            scenario="You override get_db in one test to use a test database. You forget to clear the override. The next test file uses the test database too — and finds stale data from the previous test."
            code={`# test_users.py
def test_create_user():
    # Override to use test DB
    app.dependency_overrides[get_db] = get_test_db
    response = client.post("/users", json={"name": "Alice"})
    assert response.status_code == 201
    # Forgot to clear the override!

# test_items.py (runs after test_users.py)
def test_list_items():
    # This test has NOTHING to do with users
    # But it's still using get_test_db from the override above!
    response = client.get("/items")
    # Unexpected behavior because the DB context is wrong`}
            error={`# test_items.py failures:
FAILED test_list_items - assert response.status_code == 200
# Actual: 500 Internal Server Error
# The test DB from test_users.py has no items table
# because it was set up for users only.`}
            explanation="dependency_overrides is a plain dict on the app object. It persists across tests unless you explicitly clear it. Any override you set sticks around for every subsequent test in the session."
            fix="Use a pytest fixture that clears overrides after each test."
            fixCode={`import pytest

@pytest.fixture(autouse=True)
def clean_overrides():
    # Setup: nothing needed
    yield
    # Cleanup: always clear overrides after each test
    app.dependency_overrides = {}

# Now every test starts with a clean slate
def test_create_user():
    app.dependency_overrides[get_db] = get_test_db
    response = client.post("/users", json={"name": "Alice"})
    assert response.status_code == 201
    # Override is automatically cleared after this test`}
            filename="conftest.py"
          />
        </section>
      </ScrollReveal>

      <AhaMoment
        setup="Why does autouse=True matter on that fixture?"
        reveal="Without autouse=True, you'd have to add the fixture as a parameter to every single test function. With autouse=True, the fixture runs automatically for every test in its scope — no opt-in needed. It's like a safety net you can't forget to use."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Mental Model Challenge */}
      <MentalModelChallenge
        question="If you use dependency_overrides in one test function and forget to clear them, what happens to the next test?"
        options={[
          {
            label: "Nothing — dependency_overrides is automatically reset between tests",
            correct: false,
            explanation: "pytest doesn't know about FastAPI internals. The app object persists."
          },
          {
            label: "The override persists and the next test uses it too",
            correct: true,
            explanation: "Correct. dependency_overrides is just a dict on the app object — it doesn't reset itself."
          },
          {
            label: "The next test gets an error saying the dependency is already overridden",
            correct: false,
            explanation: "There's no such error. The override silently persists, which is worse — silent bugs."
          },
        ]}
        hint="Think about what dependency_overrides actually is — it's just a Python dict on the app object."
        answer="The override persists! FastAPI's dependency_overrides is a dict on the app object — it's not reset between tests automatically. The next test function will still use the override, which can cause confusing failures. Always use a fixture that clears overrides after each test: app.dependency_overrides = {} in cleanup."
        className="mb-8"
      />

      <Separator className="my-8" />

      {/* Key Points grid (KEPT) */}
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
