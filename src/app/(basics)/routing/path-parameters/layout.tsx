import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Path Parameters",
  description: "Extract dynamic values from URL paths with automatic type validation in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
