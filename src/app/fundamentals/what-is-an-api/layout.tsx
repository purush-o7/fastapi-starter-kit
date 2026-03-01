import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "What is an API?",
  description: "Learn what APIs are, how HTTP requests work, and understand the request-response cycle that powers every FastAPI application.",
  openGraph: {
    title: "What is an API?",
    description: "Learn what APIs are, how HTTP requests work, and understand the request-response cycle that powers every FastAPI application.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "What is an API?",
          description: "Learn what APIs are, how HTTP requests work, and understand the request-response cycle that powers every FastAPI application.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/fundamentals/what-is-an-api",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is an API?", acceptedAnswer: { "@type": "Answer", text: "An API (Application Programming Interface) is a contract between software systems that defines how they communicate. It specifies what requests you can make, what data to send, and what responses you'll get back." } },
      { "@type": "Question", name: "What is the HTTP request-response cycle?", acceptedAnswer: { "@type": "Answer", text: "A client sends an HTTP request (with a method like GET or POST, a URL path, and optional body/headers) to a server. The server processes it and returns an HTTP response with a status code and data, typically in JSON format." } }
          ],
        }}
      />
      {children}
    </>
  );
}
