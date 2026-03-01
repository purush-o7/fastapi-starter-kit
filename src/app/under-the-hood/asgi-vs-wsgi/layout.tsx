import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "ASGI vs WSGI",
  description: "Learn the difference between ASGI and WSGI server protocols and why FastAPI requires ASGI.",
  openGraph: {
    title: "ASGI vs WSGI",
    description: "Learn the difference between ASGI and WSGI server protocols and why FastAPI requires ASGI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "ASGI vs WSGI",
          description: "Learn the difference between ASGI and WSGI server protocols and why FastAPI requires ASGI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/under-the-hood/asgi-vs-wsgi",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What is the difference between ASGI and WSGI?", acceptedAnswer: { "@type": "Answer", text: "WSGI handles one request at a time synchronously. ASGI supports async, WebSockets, and concurrent request handling. FastAPI requires ASGI because it's built on async Python. Running FastAPI on a WSGI server breaks async features." } }
          ],
        }}
      />
      {children}
    </>
  );
}
