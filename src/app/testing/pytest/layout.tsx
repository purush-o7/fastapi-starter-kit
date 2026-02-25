import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testing",
  description: "Write and run tests for your FastAPI application using TestClient and pytest.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
