import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rate Limiting",
  description: "Prevent API abuse with per-IP and per-user rate limiting using SlowAPI middleware in FastAPI.",
  openGraph: {
    title: "Rate Limiting",
    description: "Prevent API abuse with per-IP and per-user rate limiting using SlowAPI middleware in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
