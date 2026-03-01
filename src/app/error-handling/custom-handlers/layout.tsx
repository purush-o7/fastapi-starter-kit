import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Custom Error Handlers",
  description: "Override default error responses with custom exception handlers for consistent API error formats.",
  openGraph: {
    title: "Custom Error Handlers",
    description: "Override default error responses with custom exception handlers for consistent API error formats.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Custom Error Handlers",
          description: "Override default error responses with custom exception handlers for consistent API error formats.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/error-handling/custom-handlers",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How do I customize error response format in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Register custom exception handlers with @app.exception_handler(YourException). This intercepts errors before they reach the client and lets you return any response shape your frontend expects." } }
          ],
        }}
      />
      {children}
    </>
  );
}
