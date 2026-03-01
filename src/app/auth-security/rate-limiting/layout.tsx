import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Rate Limiting",
  description: "Prevent API abuse with per-IP and per-user rate limiting using SlowAPI middleware in FastAPI.",
  openGraph: {
    title: "Rate Limiting",
    description: "Prevent API abuse with per-IP and per-user rate limiting using SlowAPI middleware in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Rate Limiting",
          description: "Prevent API abuse with per-IP and per-user rate limiting using SlowAPI middleware in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/auth-security/rate-limiting",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "How do I add rate limiting to FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Use the SlowAPI library which provides rate limiting middleware. Set limits per endpoint with decorators like @limiter.limit('100/minute'). Combine IP-based and user-based limits for best protection." } }
          ],
        }}
      />
      {children}
    </>
  );
}
