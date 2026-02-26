import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Async Endpoints",
  description: "Write async endpoints correctly in FastAPI — avoid blocking the event loop and maximize concurrency.",
  openGraph: {
    title: "Async Endpoints",
    description: "Write async endpoints correctly in FastAPI — avoid blocking the event loop and maximize concurrency.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
