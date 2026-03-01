import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "SQLAlchemy Models",
  description: "Define database tables as Python classes with SQLAlchemy ORM, relationships, and constraints for FastAPI.",
  openGraph: {
    title: "SQLAlchemy Models",
    description: "Define database tables as Python classes with SQLAlchemy ORM, relationships, and constraints for FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "SQLAlchemy Models",
          description: "Define database tables as Python classes with SQLAlchemy ORM, relationships, and constraints for FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/database/sqlalchemy-models",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is the difference between Mapped[str] and Mapped[str | None] in SQLAlchemy?", acceptedAnswer: { "@type": "Answer", text: "Mapped[str] creates a NOT NULL column — the database rejects rows without a value. Mapped[str | None] creates a nullable column where NULL is allowed. SQLAlchemy maps Python type hints directly to SQL constraints." } }
          ],
        }}
      />
      {children}
    </>
  );
}
