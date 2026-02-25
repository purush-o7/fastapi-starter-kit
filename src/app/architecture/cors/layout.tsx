import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CORS",
  description: "Configure Cross-Origin Resource Sharing middleware in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
