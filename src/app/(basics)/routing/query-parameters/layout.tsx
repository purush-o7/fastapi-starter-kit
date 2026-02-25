import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Query Parameters",
  description: "Handle optional and required query string parameters with defaults in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
