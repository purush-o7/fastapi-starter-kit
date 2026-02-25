import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto-Generated Docs",
  description: "FastAPI's automatic interactive API documentation",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
