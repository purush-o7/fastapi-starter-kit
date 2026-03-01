import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "APIRouter",
  description: "Organize FastAPI endpoints into modular routers with shared prefixes, tags, and dependencies.",
  openGraph: {
    title: "APIRouter",
    description: "Organize FastAPI endpoints into modular routers with shared prefixes, tags, and dependencies.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "APIRouter",
          description: "Organize FastAPI endpoints into modular routers with shared prefixes, tags, and dependencies.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/architecture/api-router",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is APIRouter in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "APIRouter lets you organize endpoints into modular groups with shared prefixes, tags, and dependencies. Instead of 47 routes in main.py, you split them into router files and include them with app.include_router()." } }
          ],
        }}
      />
      {children}
    </>
  );
}
