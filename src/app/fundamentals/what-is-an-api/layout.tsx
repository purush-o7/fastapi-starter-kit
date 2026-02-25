import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is an API?",
  description: "HTTP, JSON, and the request/response cycle",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
