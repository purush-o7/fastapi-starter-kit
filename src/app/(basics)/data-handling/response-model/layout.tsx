import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Response Model",
  description: "Control API response shapes, filter sensitive fields, and prevent data leaks with FastAPI response models.",
  openGraph: {
    title: "Response Model",
    description: "Control API response shapes, filter sensitive fields, and prevent data leaks with FastAPI response models.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Response Model",
          description: "Control API response shapes, filter sensitive fields, and prevent data leaks with FastAPI response models.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/data-handling/response-model",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How do I prevent sensitive fields from appearing in FastAPI responses?", acceptedAnswer: { "@type": "Answer", text: "Use response_model to filter the output. Create a response schema without sensitive fields (like hashed_password) and set it as the response_model — FastAPI strips any fields not in the model." } }
          ],
        }}
      />
      {children}
    </>
  );
}
