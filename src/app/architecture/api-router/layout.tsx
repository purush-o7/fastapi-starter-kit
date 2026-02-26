import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APIRouter",
  description: "Organize FastAPI endpoints into modular routers with shared prefixes, tags, and dependencies.",
  openGraph: {
    title: "APIRouter",
    description: "Organize FastAPI endpoints into modular routers with shared prefixes, tags, and dependencies.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
