import dynamic from "next/dynamic";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, Lightbulb, FileSearch, Send, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { CommonMistakes, type Mistake } from "@/components/common-mistakes";
import { AnimatedFlow, type FlowStep } from "@/components/animated-flow";
const TestingHeroViz = dynamic(
  () => import("./_components/testing-hero-viz").then(m => m.TestingHeroViz),
  { loading: () => <div className="h-64 rounded-lg bg-muted animate-pulse" /> }
);

import { ScrollReveal } from "@/components/scroll-reveal";
import { Separator } from "@/components/ui/separator";

const topics = [
  {
    href: "/testing/pytest",
    label: "Testing with pytest",
    icon: TestTube,
    description: "Write and run tests for your FastAPI endpoints with TestClient and pytest.",
  },
];

const flowSteps: FlowStep[] = [
  { id: "write", label: "Write Test", description: "Define a test function using pytest conventions (def test_*).", icon: <FileSearch className="size-5" />, color: "emerald-500" },
  { id: "client", label: "Create Client", description: "Instantiate TestClient(app) to simulate HTTP requests without running a server.", icon: <Send className="size-5" />, color: "emerald-500" },
  { id: "request", label: "Send Request", description: "Call client.get(), client.post(), etc. to hit your endpoints.", icon: <ArrowRight className="size-5" />, color: "green-500" },
  { id: "assert", label: "Assert Response", description: "Check status codes, JSON body, and headers match your expectations.", icon: <CheckCircle className="size-5" />, color: "green-500" },
  { id: "override", label: "Override Dependencies", description: "Swap real databases and auth for test fakes using dependency_overrides.", icon: <RefreshCw className="size-5" />, color: "emerald-500" },
];

const mistakes: Mistake[] = [
  {
    title: "Testing against a real database",
    subtitle: "Not using dependency overrides for database sessions",
    wrongCode: `def test_create_item():
    client = TestClient(app)
    # Writes to your production database!
    response = client.post("/items", json={"name": "Test"})
    assert response.status_code == 200`,
    rightCode: `def get_test_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = get_test_db

def test_create_item():
    client = TestClient(app)
    response = client.post("/items", json={"name": "Test"})
    assert response.status_code == 200`,
    filename: "test_main.py",
    explanation: "Always override database dependencies in tests. Without this, tests run against your real database — corrupting data, creating flaky tests, and making cleanup a nightmare.",
  },
  {
    title: "Forgetting to clear overrides",
    subtitle: "Dependency overrides leaking between test files",
    wrongCode: `# test_items.py
app.dependency_overrides[get_db] = get_test_db

def test_items():
    ...
# Overrides leak to other test files!`,
    rightCode: `import pytest

@pytest.fixture(autouse=True)
def override_deps():
    app.dependency_overrides[get_db] = get_test_db
    yield
    app.dependency_overrides.clear()

def test_items():
    ...`,
    filename: "test_main.py",
    explanation: "Use a pytest fixture with autouse=True and clear overrides in the teardown (after yield). This ensures each test file starts with a clean slate.",
  },
];

export default function ProductionPage() {
  return (
    <div className="max-w-4xl ambient-testing">
      <div className="h-1 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mb-8" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-serif italic">Testing</h1>
          <Badge variant="secondary">1 topic</Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Before shipping your API, make sure it works. Testing with FastAPI&apos;s
          TestClient lets you simulate real HTTP requests without running a server.
        </p>
      </div>

      {/* Hero Visualization: Test Flow */}
      <ScrollReveal className="mb-8">
        <TestingHeroViz />
      </ScrollReveal>

      <div className="rounded-lg glass border-emerald-500/20 p-4 mb-8">
        <div className="flex gap-3">
          <Lightbulb className="size-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Tip</p>
            <p className="text-sm text-muted-foreground">
              FastAPI&apos;s TestClient is built on httpx. You write tests with
              pytest, call your endpoints just like a real client would, and
              assert on status codes and JSON responses. No server needed.
            </p>
          </div>
        </div>
      </div>

      {/* Animated Flow: Test Lifecycle */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How Testing Works</h2>
        <AnimatedFlow steps={flowSteps} accentColor="emerald" />
      </ScrollReveal>

      <Separator className="my-8" />

      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card className="group h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-emerald-500" />
                  <CardTitle className="text-base">{topic.label}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <CommonMistakes mistakes={mistakes} />
    </div>
  );
}
