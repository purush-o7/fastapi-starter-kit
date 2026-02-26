import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pydantic Models",
  description: "Define data schemas with Pydantic for validation, serialization, and automatic API documentation in FastAPI.",
  openGraph: {
    title: "Pydantic Models",
    description: "Define data schemas with Pydantic for validation, serialization, and automatic API documentation in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
