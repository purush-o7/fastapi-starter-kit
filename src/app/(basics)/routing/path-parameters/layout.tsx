import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Path Parameters",
  description: "Extract and validate path parameters from URLs with automatic type conversion and error handling in FastAPI.",
  openGraph: {
    title: "Path Parameters",
    description: "Extract and validate path parameters from URLs with automatic type conversion and error handling in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
