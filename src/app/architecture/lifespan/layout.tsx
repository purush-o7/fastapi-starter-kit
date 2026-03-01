import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Lifespan Events",
  description: "Run startup and shutdown logic — load ML models, connect databases, clean up resources with FastAPI lifespan.",
  openGraph: {
    title: "Lifespan Events",
    description: "Run startup and shutdown logic — load ML models, connect databases, clean up resources with FastAPI lifespan.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Lifespan Events",
          description: "Run startup and shutdown logic — load ML models, connect databases, clean up resources with FastAPI lifespan.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/architecture/lifespan",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What are lifespan events in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Lifespan events run code at application startup (before the first request) and shutdown (when stopping). Use them to load ML models, connect to databases, or initialize caches — avoiding cold-start delays." } }
          ],
        }}
      />
      {children}
    </>
  );
}
