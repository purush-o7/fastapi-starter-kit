import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Middleware",
  description: "Add cross-cutting concerns like logging, timing, and error handling to every request with FastAPI middleware.",
  openGraph: {
    title: "Middleware",
    description: "Add cross-cutting concerns like logging, timing, and error handling to every request with FastAPI middleware.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
