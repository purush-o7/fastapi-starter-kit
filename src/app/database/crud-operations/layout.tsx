import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "CRUD Operations",
  description: "Build Create, Read, Update, Delete functions with SQLAlchemy queries and FastAPI dependency injection.",
  openGraph: {
    title: "CRUD Operations",
    description: "Build Create, Read, Update, Delete functions with SQLAlchemy queries and FastAPI dependency injection.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "CRUD Operations",
          description: "Build Create, Read, Update, Delete functions with SQLAlchemy queries and FastAPI dependency injection.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/database/crud-operations",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why does SQLAlchemy first() return None instead of raising an exception?", acceptedAnswer: { "@type": "Answer", text: "first() is designed for 'maybe there's a result' — it returns None for empty results. Use one() if there MUST be exactly one result — it raises NoResultFound for empty results and MultipleResultsFound for duplicates." } }
          ],
        }}
      />
      {children}
    </>
  );
}
