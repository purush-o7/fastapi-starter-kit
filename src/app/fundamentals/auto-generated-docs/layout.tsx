import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Auto-Generated Docs",
  description: "FastAPI automatically generates Swagger UI and ReDoc documentation from your type hints and Pydantic models.",
  openGraph: {
    title: "Auto-Generated Docs",
    description: "FastAPI automatically generates Swagger UI and ReDoc documentation from your type hints and Pydantic models.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Auto-Generated Docs",
          description: "FastAPI automatically generates Swagger UI and ReDoc documentation from your type hints and Pydantic models.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/fundamentals/auto-generated-docs",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How does FastAPI generate API documentation automatically?", acceptedAnswer: { "@type": "Answer", text: "FastAPI reads your Python type hints and Pydantic models to generate an OpenAPI schema, which powers interactive Swagger UI at /docs and ReDoc at /redoc — no manual documentation needed." } },
      { "@type": "Question", name: "Where does Pydantic Field description appear in Swagger UI?", acceptedAnswer: { "@type": "Answer", text: "Field descriptions appear in the Schema section at the bottom of Swagger UI next to the field name, and also in the request body example when you click Try it out." } }
          ],
        }}
      />
      {children}
    </>
  );
}
