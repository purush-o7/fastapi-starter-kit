import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Path Parameters",
  description: "Extract and validate path parameters from URLs with automatic type conversion and error handling in FastAPI.",
  openGraph: {
    title: "Path Parameters",
    description: "Extract and validate path parameters from URLs with automatic type conversion and error handling in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Path Parameters",
          description: "Extract and validate path parameters from URLs with automatic type conversion and error handling in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/routing/path-parameters",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How does FastAPI validate path parameters?", acceptedAnswer: { "@type": "Answer", text: "FastAPI uses Python type hints to validate path parameters automatically. If you define item_id: int and someone sends /items/abc, FastAPI returns a 422 Unprocessable Entity because 'abc' can't be parsed as an integer." } },
      { "@type": "Question", name: "Does route order matter in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Yes. FastAPI matches routes in order. If /items/{item_id} comes before /items/latest, the string 'latest' gets matched as the item_id parameter. Fixed routes must come before dynamic ones." } }
          ],
        }}
      />
      {children}
    </>
  );
}
