import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Query Parameters",
  description: "Handle optional and required query parameters with defaults, type validation, and automatic documentation.",
  openGraph: {
    title: "Query Parameters",
    description: "Handle optional and required query parameters with defaults, type validation, and automatic documentation.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
