import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lifespan Events",
  description: "Run startup and shutdown logic using the modern lifespan context manager in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
