import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Headers & Cookies",
  description: "Read and set HTTP headers and cookies in FastAPI with automatic validation and security flags.",
  openGraph: {
    title: "Headers & Cookies",
    description: "Read and set HTTP headers and cookies in FastAPI with automatic validation and security flags.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Headers & Cookies",
          description: "Read and set HTTP headers and cookies in FastAPI with automatic validation and security flags.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/data-handling/headers-cookies",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why can't JavaScript read my HttpOnly cookie?", acceptedAnswer: { "@type": "Answer", text: "The httponly=True flag specifically prevents JavaScript access via document.cookie. This is a security feature — the cookie is sent with requests but invisible to client-side scripts, protecting against XSS attacks." } }
          ],
        }}
      />
      {children}
    </>
  );
}
