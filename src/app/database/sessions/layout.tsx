import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Database Sessions",
  description: "Manage database connections with SQLAlchemy sessions, connection pooling, and proper cleanup in FastAPI.",
  openGraph: {
    title: "Database Sessions",
    description: "Manage database connections with SQLAlchemy sessions, connection pooling, and proper cleanup in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Database Sessions",
          description: "Manage database connections with SQLAlchemy sessions, connection pooling, and proper cleanup in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/database/sessions",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why do I get QueuePool limit reached in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Database sessions are leaking — not being closed after use. Use yield in your get_db dependency with a finally: db.close() block. Without finally, exceptions prevent cleanup and connections leak until the pool is exhausted." } }
          ],
        }}
      />
      {children}
    </>
  );
}
