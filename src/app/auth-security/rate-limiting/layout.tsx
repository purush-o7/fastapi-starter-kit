import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rate Limiting",
  description: "Protect your FastAPI endpoints from abuse with per-route and global rate limits.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
