import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lifespan Events",
  description: "Run startup and shutdown logic — load ML models, connect databases, clean up resources with FastAPI lifespan.",
  openGraph: {
    title: "Lifespan Events",
    description: "Run startup and shutdown logic — load ML models, connect databases, clean up resources with FastAPI lifespan.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
