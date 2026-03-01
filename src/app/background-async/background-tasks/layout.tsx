import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Background Tasks",
  description: "Run email sending, logging, and other slow operations after returning the response with FastAPI BackgroundTasks.",
  openGraph: {
    title: "Background Tasks",
    description: "Run email sending, logging, and other slow operations after returning the response with FastAPI BackgroundTasks.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Background Tasks",
          description: "Run email sending, logging, and other slow operations after returning the response with FastAPI BackgroundTasks.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/background-async/background-tasks",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "What happens if a FastAPI background task raises an exception?", acceptedAnswer: { "@type": "Answer", text: "The user never sees it — the response was already sent. Background task exceptions only appear in server logs. Always wrap background task code in try/except with logging to avoid silent failures." } }
          ],
        }}
      />
      {children}
    </>
  );
}
