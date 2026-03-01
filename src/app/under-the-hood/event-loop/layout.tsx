import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Event Loop",
  description: "Understand how Python asyncio event loop powers FastAPI concurrency and why blocking calls freeze everything.",
  openGraph: {
    title: "Event Loop",
    description: "Understand how Python asyncio event loop powers FastAPI concurrency and why blocking calls freeze everything.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "Event Loop",
          description: "Understand how Python asyncio event loop powers FastAPI concurrency and why blocking calls freeze everything.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/under-the-hood/event-loop",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why does time.sleep() freeze the entire FastAPI application?", acceptedAnswer: { "@type": "Answer", text: "time.sleep() is a blocking call that holds the single-threaded event loop hostage. While it sleeps, no other request can be processed. Use asyncio.sleep() in async code, or run blocking code in a thread pool." } },
      { "@type": "Question", name: "How can FastAPI handle multiple requests with a single-threaded event loop?", acceptedAnswer: { "@type": "Answer", text: "The event loop uses cooperative multitasking. When an async function hits 'await', it pauses and lets another request run. It's like a chef working on multiple dishes — while one is in the oven (waiting for I/O), the chef works on the next." } }
          ],
        }}
      />
      {children}
    </>
  );
}
