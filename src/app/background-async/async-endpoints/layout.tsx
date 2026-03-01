import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Async Endpoints",
  description: "Write async endpoints correctly in FastAPI — avoid blocking the event loop and maximize concurrency.",
  openGraph: {
    title: "Async Endpoints",
    description: "Write async endpoints correctly in FastAPI — avoid blocking the event loop and maximize concurrency.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Async Endpoints",
          description: "Write async endpoints correctly in FastAPI — avoid blocking the event loop and maximize concurrency.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/background-async/async-endpoints",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Should I use async def or def for FastAPI endpoints?", acceptedAnswer: { "@type": "Answer", text: "Use async def only with async libraries (httpx, asyncpg). For blocking libraries (requests, psycopg2), use regular def — FastAPI runs sync endpoints in a thread pool automatically. async def with blocking calls is worse than sync." } }
          ],
        }}
      />
      {children}
    </>
  );
}
