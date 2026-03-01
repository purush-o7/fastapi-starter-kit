import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "WebSockets",
  description: "Build real-time features like chat and live updates with WebSocket endpoints in FastAPI.",
  openGraph: {
    title: "WebSockets",
    description: "Build real-time features like chat and live updates with WebSocket endpoints in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "WebSockets",
          description: "Build real-time features like chat and live updates with WebSocket endpoints in FastAPI.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/background-async/websockets",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Does FastAPI WebSocket have built-in broadcast?", acceptedAnswer: { "@type": "Answer", text: "No. Each WebSocket connection is independent. To broadcast messages to multiple clients, you need to maintain a connection manager that tracks all connected clients and sends to each one." } }
          ],
        }}
      />
      {children}
    </>
  );
}
