import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dependency Injection",
  description: "Share database sessions, auth checks, and configuration across endpoints with FastAPI dependency injection.",
  openGraph: {
    title: "Dependency Injection",
    description: "Share database sessions, auth checks, and configuration across endpoints with FastAPI dependency injection.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
