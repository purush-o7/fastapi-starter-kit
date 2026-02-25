import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Path Operations",
  description: "Define GET, POST, PUT, DELETE endpoints using Python decorators in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
