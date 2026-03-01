import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Protect endpoints with API key authentication, secure comparison, and multiple auth strategies in FastAPI.",
  openGraph: {
    title: "API Keys",
    description: "Protect endpoints with API key authentication, secure comparison, and multiple auth strategies in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "API Keys",
          description: "Protect endpoints with API key authentication, secure comparison, and multiple auth strategies in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/auth-security/api-keys",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why use secrets.compare_digest() instead of == for API key comparison?", acceptedAnswer: { "@type": "Answer", text: "Regular string comparison stops at the first mismatch, leaking timing information. An attacker can measure response times to reconstruct the key character by character. secrets.compare_digest() takes constant time regardless of how many characters match." } }
          ],
        }}
      />
      {children}
    </>
  );
}
