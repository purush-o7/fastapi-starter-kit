import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Middleware",
  description: "Add cross-cutting concerns like logging, timing, and error handling to every request with FastAPI middleware.",
  openGraph: {
    title: "Middleware",
    description: "Add cross-cutting concerns like logging, timing, and error handling to every request with FastAPI middleware.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Middleware",
          description: "Add cross-cutting concerns like logging, timing, and error handling to every request with FastAPI middleware.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/architecture/middleware",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is middleware in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Middleware is code that runs before and after every request. It wraps your endpoints — processing the request on the way in and the response on the way out. Common uses: logging, timing, CORS, authentication." } }
          ],
        }}
      />
      {children}
    </>
  );
}
