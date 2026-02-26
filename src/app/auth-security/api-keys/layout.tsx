import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Protect endpoints with API key authentication, secure comparison, and multiple auth strategies in FastAPI.",
  openGraph: {
    title: "API Keys",
    description: "Protect endpoints with API key authentication, secure comparison, and multiple auth strategies in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
