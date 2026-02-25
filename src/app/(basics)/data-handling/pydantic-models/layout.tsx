import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pydantic Models",
  description: "Define data schemas with automatic validation, serialization, and documentation in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
