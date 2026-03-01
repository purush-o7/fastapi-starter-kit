import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Dependency Injection",
  description: "Share database sessions, auth checks, and configuration across endpoints with FastAPI dependency injection.",
  openGraph: {
    title: "Dependency Injection",
    description: "Share database sessions, auth checks, and configuration across endpoints with FastAPI dependency injection.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Dependency Injection",
          description: "Share database sessions, auth checks, and configuration across endpoints with FastAPI dependency injection.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/architecture/dependency-injection",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is dependency injection in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Dependency injection lets you declare shared logic (database sessions, auth checks, configuration) as reusable functions. FastAPI automatically resolves and injects them into your endpoints via Depends()." } },
      { "@type": "Question", name: "Does FastAPI cache dependency results within a request?", acceptedAnswer: { "@type": "Answer", text: "Yes. If two dependencies both depend on get_db, FastAPI creates only one database session per request and reuses it. Dependencies are cached within a single request scope." } }
          ],
        }}
      />
      {children}
    </>
  );
}
