import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Pydantic Models",
  description: "Define data schemas with Pydantic for validation, serialization, and automatic API documentation in FastAPI.",
  openGraph: {
    title: "Pydantic Models",
    description: "Define data schemas with Pydantic for validation, serialization, and automatic API documentation in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Pydantic Models",
          description: "Define data schemas with Pydantic for validation, serialization, and automatic API documentation in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/data-handling/pydantic-models",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is the difference between Pydantic models and Python dataclasses?", acceptedAnswer: { "@type": "Answer", text: "Pydantic validates and coerces data at runtime — passing '25' to an int field converts it automatically. Dataclasses just store data with no validation. For APIs, you need Pydantic's runtime validation." } }
          ],
        }}
      />
      {children}
    </>
  );
}
