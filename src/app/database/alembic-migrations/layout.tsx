import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Alembic Migrations",
  description: "Track and apply database schema changes with Alembic auto-generated migrations for FastAPI projects.",
  openGraph: {
    title: "Alembic Migrations",
    description: "Track and apply database schema changes with Alembic auto-generated migrations for FastAPI projects.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Alembic Migrations",
          description: "Track and apply database schema changes with Alembic auto-generated migrations for FastAPI projects.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/database/alembic-migrations",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why doesn't my SQLAlchemy model change update the database?", acceptedAnswer: { "@type": "Answer", text: "SQLAlchemy models don't auto-migrate the database. You need Alembic to detect model changes and generate migration scripts. Run 'alembic revision --autogenerate' then 'alembic upgrade head' to apply changes." } }
          ],
        }}
      />
      {children}
    </>
  );
}
