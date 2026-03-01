import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Path Operations",
  description: "Map HTTP methods to Python functions with FastAPI decorators — GET, POST, PUT, DELETE and more.",
  openGraph: {
    title: "Path Operations",
    description: "Map HTTP methods to Python functions with FastAPI decorators — GET, POST, PUT, DELETE and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Path Operations",
          description: "Map HTTP methods to Python functions with FastAPI decorators — GET, POST, PUT, DELETE and more.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/routing/path-operations",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is a path operation in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "A path operation maps an HTTP method (GET, POST, PUT, DELETE) and a URL path to a Python function. You define it using decorators like @app.get('/items') or @app.post('/users')." } },
      { "@type": "Question", name: "What happens if I send a PUT request to an endpoint that only has GET and POST?", acceptedAnswer: { "@type": "Answer", text: "FastAPI returns 405 Method Not Allowed. It only allows the exact HTTP methods you've decorated. The 405 tells the client the endpoint exists but not for that method." } }
          ],
        }}
      />
      {children}
    </>
  );
}
