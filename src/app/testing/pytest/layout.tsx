import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Testing with Pytest",
  description: "Write reliable API tests with TestClient, dependency overrides, and database fixtures for FastAPI.",
  openGraph: {
    title: "Testing with Pytest",
    description: "Write reliable API tests with TestClient, dependency overrides, and database fixtures for FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Testing with Pytest",
          description: "Write reliable API tests with TestClient, dependency overrides, and database fixtures for FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/testing/pytest",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How do I test FastAPI endpoints with pytest?", acceptedAnswer: { "@type": "Answer", text: "Use FastAPI's TestClient (built on httpx). Create a client with TestClient(app), then call client.get('/items') or client.post('/users', json={...}). It simulates HTTP without a real server." } },
      { "@type": "Question", name: "How do I override dependencies in FastAPI tests?", acceptedAnswer: { "@type": "Answer", text: "Use app.dependency_overrides[original_dep] = mock_dep to replace dependencies in tests. Always clear overrides after each test with app.dependency_overrides = {} to prevent state leaking between tests." } }
          ],
        }}
      />
      {children}
    </>
  );
}
