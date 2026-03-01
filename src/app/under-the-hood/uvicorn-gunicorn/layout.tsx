import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Uvicorn & Gunicorn",
  description: "Deploy FastAPI in production with Uvicorn workers, Gunicorn process management, and proper scaling.",
  openGraph: {
    title: "Uvicorn & Gunicorn",
    description: "Deploy FastAPI in production with Uvicorn workers, Gunicorn process management, and proper scaling.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Uvicorn & Gunicorn",
          description: "Deploy FastAPI in production with Uvicorn workers, Gunicorn process management, and proper scaling.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/under-the-hood/uvicorn-gunicorn",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How many Uvicorn workers should I run in production?", acceptedAnswer: { "@type": "Answer", text: "The classic formula is 2 * CPU_CORES + 1 for I/O-bound workloads. For CPU-bound work (ML inference), stick closer to CPU_CORES. Monitor and tune based on your actual workload." } }
          ],
        }}
      />
      {children}
    </>
  );
}
