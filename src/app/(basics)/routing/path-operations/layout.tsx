import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Path Operations",
  description: "Map HTTP methods to Python functions with FastAPI decorators — GET, POST, PUT, DELETE and more.",
  openGraph: {
    title: "Path Operations",
    description: "Map HTTP methods to Python functions with FastAPI decorators — GET, POST, PUT, DELETE and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
