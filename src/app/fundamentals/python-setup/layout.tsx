import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Python Setup",
  description: "Set up Python virtual environments, install FastAPI and Uvicorn, and configure your development environment correctly.",
  openGraph: {
    title: "Python Setup",
    description: "Set up Python virtual environments, install FastAPI and Uvicorn, and configure your development environment correctly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Python Setup",
          description: "Set up Python virtual environments, install FastAPI and Uvicorn, and configure your development environment correctly.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/fundamentals/python-setup",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why do I get ModuleNotFoundError when running FastAPI?", acceptedAnswer: { "@type": "Answer", text: "You likely installed FastAPI in the wrong Python environment. Always create and activate a virtual environment first with 'python -m venv venv', then install packages inside it." } },
      { "@type": "Question", name: "What is a Python virtual environment?", acceptedAnswer: { "@type": "Answer", text: "A virtual environment is an isolated Python installation with its own packages. It prevents version conflicts between projects — each project gets its own dependencies without affecting others." } }
          ],
        }}
      />
      {children}
    </>
  );
}
