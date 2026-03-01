import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Request Body",
  description: "Parse and validate JSON request bodies using Pydantic models with automatic type coercion in FastAPI.",
  openGraph: {
    title: "Request Body",
    description: "Parse and validate JSON request bodies using Pydantic models with automatic type coercion in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Request Body",
          description: "Parse and validate JSON request bodies using Pydantic models with automatic type coercion in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/data-handling/request-body",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How does FastAPI validate request bodies?", acceptedAnswer: { "@type": "Answer", text: "FastAPI uses Pydantic models to validate JSON request bodies. Define a class with typed fields, and FastAPI automatically parses the JSON, validates types, and returns 422 for invalid data." } },
      { "@type": "Question", name: "Does FastAPI support type coercion for request bodies?", acceptedAnswer: { "@type": "Answer", text: "Yes. Pydantic performs automatic type coercion — sending price as string '9.99' for a float field works because Pydantic converts it. But 'nine dollars' would fail since it can't be coerced to a float." } }
          ],
        }}
      />
      {children}
    </>
  );
}
