import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is an API?",
  description: "Learn what APIs are, how HTTP requests work, and understand the request-response cycle that powers every FastAPI application.",
  openGraph: {
    title: "What is an API?",
    description: "Learn what APIs are, how HTTP requests work, and understand the request-response cycle that powers every FastAPI application.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
