import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Environment Variables",
  description: "Secure your secrets with environment variables, .env files, and pydantic-settings in FastAPI applications.",
  openGraph: {
    title: "Environment Variables",
    description: "Secure your secrets with environment variables, .env files, and pydantic-settings in FastAPI applications.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Environment Variables",
          description: "Secure your secrets with environment variables, .env files, and pydantic-settings in FastAPI applications.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Beginner",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/fundamentals/environment-variables",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why should I use environment variables instead of hardcoding secrets?", acceptedAnswer: { "@type": "Answer", text: "Hardcoded secrets in source code get pushed to version control and can be scraped. Environment variables keep secrets outside the code, loaded at runtime from .env files or deployment configuration." } },
      { "@type": "Question", name: "Does python-dotenv override existing environment variables?", acceptedAnswer: { "@type": "Answer", text: "By default, python-dotenv does NOT override existing environment variables. Shell-set values take priority. Use override=True in load_dotenv() if you want .env values to win." } }
          ],
        }}
      />
      {children}
    </>
  );
}
