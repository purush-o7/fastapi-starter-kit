import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Body",
  description: "Parse and validate JSON request bodies using Pydantic models with automatic type coercion in FastAPI.",
  openGraph: {
    title: "Request Body",
    description: "Parse and validate JSON request bodies using Pydantic models with automatic type coercion in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
