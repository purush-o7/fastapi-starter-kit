import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "HTTP Exceptions",
  description: "Raise proper HTTP error responses with status codes, detail messages, and custom headers in FastAPI.",
  openGraph: {
    title: "HTTP Exceptions",
    description: "Raise proper HTTP error responses with status codes, detail messages, and custom headers in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "HTTP Exceptions",
          description: "Raise proper HTTP error responses with status codes, detail messages, and custom headers in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/error-handling/http-exceptions",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is the difference between raise HTTPException and return JSONResponse in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "raise HTTPException stops execution immediately and triggers exception handlers. return JSONResponse is a normal return that bypasses exception handlers. Use raise for errors where you want to bail out." } }
          ],
        }}
      />
      {children}
    </>
  );
}
