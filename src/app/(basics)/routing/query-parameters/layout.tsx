import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Query Parameters",
  description: "Handle optional and required query parameters with defaults, type validation, and automatic documentation.",
  openGraph: {
    title: "Query Parameters",
    description: "Handle optional and required query parameters with defaults, type validation, and automatic documentation.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Query Parameters",
          description: "Handle optional and required query parameters with defaults, type validation, and automatic documentation.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/routing/query-parameters",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is the difference between required and optional query parameters in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "A parameter with no default (limit: int) is required — omitting it returns 422. A parameter with a default (limit: int = 10) is optional. Use limit: int | None = None for truly optional parameters." } }
          ],
        }}
      />
      {children}
    </>
  );
}
