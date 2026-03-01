import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Project Structure",
  description: "Organize your FastAPI project with modular folders, avoid circular imports, and scale beyond a single main.py file.",
  openGraph: {
    title: "Project Structure",
    description: "Organize your FastAPI project with modular folders, avoid circular imports, and scale beyond a single main.py file.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Project Structure",
          description: "Organize your FastAPI project with modular folders, avoid circular imports, and scale beyond a single main.py file.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/fundamentals/project-structure",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How should I structure a FastAPI project?", acceptedAnswer: { "@type": "Answer", text: "Organize into app/ (main module), routers/ (endpoint files), models/ (SQLAlchemy), schemas/ (Pydantic), and a database module. Keep the DB engine in its own file to avoid circular imports." } },
      { "@type": "Question", name: "What causes circular imports in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Circular imports happen when module A imports from B and B imports from A. Fix this by putting shared dependencies (like the DB engine) in their own module that both can import from." } }
          ],
        }}
      />
      {children}
    </>
  );
}
