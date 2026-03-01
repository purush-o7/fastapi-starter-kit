import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "CORS",
  description: "Configure Cross-Origin Resource Sharing to allow your frontend to communicate with your FastAPI backend.",
  openGraph: {
    title: "CORS",
    description: "Configure Cross-Origin Resource Sharing to allow your frontend to communicate with your FastAPI backend.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "CORS",
          description: "Configure Cross-Origin Resource Sharing to allow your frontend to communicate with your FastAPI backend.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Intermediate",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/architecture/cors",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Why does CORS block my API requests?", acceptedAnswer: { "@type": "Answer", text: "Browsers enforce CORS when your frontend and backend are on different origins (different domain, port, or protocol). The server must include Access-Control-Allow-Origin headers. In FastAPI, use CORSMiddleware with your frontend's origin." } },
      { "@type": "Question", name: "Why can't I use allow_origins=['*'] with allow_credentials=True?", acceptedAnswer: { "@type": "Answer", text: "The CORS specification explicitly forbids wildcard origins when credentials are included. You must list specific origins when using cookies or auth headers." } }
          ],
        }}
      />
      {children}
    </>
  );
}
